import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * How long after a successful confirmation we decline to send another. The
 * success screen means a repeat submission needs a deliberate reload, but
 * "updated my city twice" should not put two emails in someone's inbox.
 */
const RECONFIRM_COOLDOWN_MS = 60 * 60 * 1000;

/** URL-safe random token for unsubscribe links. */
function newUnsubscribeToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const signUp = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.string(),
    city: v.optional(v.string()),
    treatments: v.array(v.string()),
    /** Absent means the form never asked — not the same as a declined tick. */
    marketingConsent: v.optional(v.boolean()),
  },
  returns: v.object({ duplicate: v.boolean() }),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();

    const existing = await ctx.db
      .query("waitlistSignups")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      // Someone re-submitting is almost always updating their preferences, and
      // re-subscribing if they had previously opted out.
      //
      // Treatments are only overwritten when the new submission actually names
      // some. The homepage CTA captures an email and nothing else, so without
      // this guard a quick signup there would wipe preferences the same person
      // had already chosen on /waitlist.
      const confirmedRecently =
        existing.confirmedAt !== undefined && Date.now() - existing.confirmedAt < RECONFIRM_COOLDOWN_MS;
      const send = (existing.confirmSends ?? 0) + 1;

      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        city: args.city ?? existing.city,
        treatments: args.treatments.length > 0 ? args.treatments : existing.treatments,
        unsubscribedAt: undefined,
        // Only touched when the form actually offered the choice, so the
        // homepage capture cannot silently revoke a consent given on /waitlist.
        ...(args.marketingConsent === undefined
          ? {}
          : { marketingConsent: args.marketingConsent, marketingConsentAt: Date.now() }),
        ...(confirmedRecently
          ? {}
          : {
              confirmSends: send,
              confirmQueuedAt: Date.now(),
              confirmReturning: true,
              // Clear the previous outcome so the row reads as "this send is
              // outstanding" rather than carrying a stale success.
              confirmedAt: undefined,
              confirmAttempts: 0,
            }),
      });

      if (!confirmedRecently) {
        await ctx.scheduler.runAfter(0, internal.notify.waitlistConfirm, {
          id: existing._id,
          attempt: 0,
          returning: true,
          send,
        });
      }
      return { duplicate: true };
    }

    const id = await ctx.db.insert("waitlistSignups", {
      name: args.name,
      email,
      city: args.city,
      treatments: args.treatments,
      unsubscribeToken: newUnsubscribeToken(),
      confirmSends: 1,
      confirmQueuedAt: Date.now(),
      confirmReturning: false,
      ...(args.marketingConsent === undefined
        ? {}
        : { marketingConsent: args.marketingConsent, marketingConsentAt: Date.now() }),
    });

    // Atomic with the insert, like the enquiry forms: if the signup commits,
    // the acknowledgement is guaranteed to be attempted.
    await ctx.scheduler.runAfter(0, internal.notify.waitlistConfirm, {
      id,
      attempt: 0,
      returning: false,
      send: 1,
    });

    return { duplicate: false };
  },
});
