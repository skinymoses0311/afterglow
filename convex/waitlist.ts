import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        city: args.city ?? existing.city,
        treatments: args.treatments.length > 0 ? args.treatments : existing.treatments,
        unsubscribedAt: undefined,
      });
      return { duplicate: true };
    }

    await ctx.db.insert("waitlistSignups", {
      name: args.name,
      email,
      city: args.city,
      treatments: args.treatments,
      unsubscribeToken: newUnsubscribeToken(),
    });

    return { duplicate: false };
  },
});
