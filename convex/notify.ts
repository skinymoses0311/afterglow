import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Contact-enquiry notifications.
 *
 * Deliberately hand-rolled rather than using @convex-dev/resend. The component's
 * selling point is durable delivery, but its default cover is about 7.5 minutes
 * before a terminal failure, and its failure callback only fires from the Resend
 * webhook path — so a batch that exhausts retries dies silently in a component
 * table with nothing to alert on. Here the send outcome is a field on the
 * enquiry row itself, which is both longer-lived and actually visible.
 *
 * The enquiry is never at risk either way: the row is committed before any of
 * this runs, and scheduling from the mutation is atomic with the insert.
 */

/** HTTP statuses no amount of retrying will fix. 429 and 5xx deliberately absent. */
const PERMANENT = new Set([400, 401, 403, 404, 422]);

/**
 * 1m, 5m, 15m, 1h, 6h — roughly 7.3 hours of cover, comfortably inside Resend's
 * 24h idempotency window so a retry can never produce a duplicate email.
 */
const BACKOFF_MS = [60_000, 300_000, 900_000, 3_600_000, 21_600_000];

/** The hourly sweep stops re-firing an enquiry after this many total attempts. */
const ATTEMPT_CEILING = 24;

/**
 * The contact form is public and unauthenticated, and these values end up in a
 * subject line and a Reply-To, so strip anything that could inject a header.
 */
const oneLine = (value: string, max = 200) => value.replace(/[\r\n]+/g, " ").trim().slice(0, max);

export const getEnquiry = internalQuery({
  args: { id: v.id("contactEnquiries") },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const recordResult = internalMutation({
  args: {
    id: v.id("contactEnquiries"),
    notified: v.boolean(),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    await ctx.db.patch(args.id, {
      notifyAttempts: (row.notifyAttempts ?? 0) + 1,
      // Patching to undefined removes the field, which is what we want on failure.
      notifiedAt: args.notified ? Date.now() : undefined,
      notifyError: args.error,
    });
    return null;
  },
});

export const contactEnquiry = internalAction({
  args: { id: v.id("contactEnquiries"), attempt: v.number() },
  returns: v.null(),
  handler: async (ctx, { id, attempt }) => {
    const enquiry = await ctx.runQuery(internal.notify.getEnquiry, { id });
    if (!enquiry) return null;
    if (enquiry.notifiedAt) return null; // already sent — makes re-firing safe

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    const to = process.env.CONTACT_NOTIFY_TO;

    if (!apiKey || !from || !to) {
      // A deliberate, visible no-op until the sending domain is verified. The
      // enquiry is safe, and the hourly sweep picks it up once the vars are set.
      await ctx.runMutation(internal.notify.recordResult, {
        id,
        notified: false,
        error: "email not configured",
      });
      return null;
    }

    const text = [
      `Name:    ${enquiry.name}`,
      `Email:   ${enquiry.email}`,
      `Type:    ${enquiry.enquiryType}`,
      "",
      enquiry.message,
      "",
      "--",
      `Enquiry ${id} — afterglowcredit.online contact form`,
    ].join("\n");

    let status = 0;
    let detail = "";
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Resend dedupes on this for 24h, so a retry after a timeout that had
          // actually delivered will not produce a second email.
          "Idempotency-Key": `contact-${id}`,
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: [enquiry.email], // hitting reply answers the enquirer
          subject: `[${oneLine(enquiry.enquiryType, 40)}] New enquiry from ${oneLine(enquiry.name, 120)}`,
          text,
          headers: { "X-Entity-Ref-ID": id }, // stops Gmail threading separate enquiries together
        }),
      });
      status = res.status;
      if (!res.ok) detail = (await res.text()).slice(0, 400);
    } catch (err) {
      detail = String(err).slice(0, 400);
    }

    if (status >= 200 && status < 300) {
      await ctx.runMutation(internal.notify.recordResult, { id, notified: true });
      return null;
    }

    const next = BACKOFF_MS[attempt];
    const giveUp = PERMANENT.has(status) || next === undefined;
    await ctx.runMutation(internal.notify.recordResult, {
      id,
      notified: false,
      error: `${giveUp ? "gave up" : "retrying"} after HTTP ${status}: ${detail}`,
    });
    if (!giveUp) {
      await ctx.scheduler.runAfter(next, internal.notify.contactEnquiry, { id, attempt: attempt + 1 });
    }
    return null;
  },
});

/**
 * Safety net for the one hole self-rescheduling leaves: an action killed before
 * it could schedule its own retry. Also drains anything that queued up while the
 * sending domain was still unverified.
 */
export const sweepUnnotified = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rows = await ctx.db
      .query("contactEnquiries")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect();

    for (const row of rows) {
      if (row.notifiedAt) continue;
      if (Date.now() - row._creationTime < 15 * 60 * 1000) continue;
      if ((row.notifyAttempts ?? 0) >= ATTEMPT_CEILING) continue;
      await ctx.scheduler.runAfter(0, internal.notify.contactEnquiry, { id: row._id, attempt: 0 });
    }
    return null;
  },
});
