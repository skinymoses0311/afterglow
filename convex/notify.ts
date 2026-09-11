import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import type { FunctionReference } from "convex/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Inbound-enquiry notifications: contact form messages and merchant partnership
 * applications. Both are things a human has to answer, so both get emailed.
 * Waitlist signups deliberately do not — they are bulk, and per-signup mail
 * would be noise.
 *
 * Deliberately hand-rolled rather than using @convex-dev/resend. The component's
 * selling point is durable delivery, but its default cover is about 7.5 minutes
 * before a terminal failure, and its failure callback only fires from the Resend
 * webhook path — so a batch that exhausts retries dies silently in a component
 * table with nothing to alert on. Here the send outcome is a field on the row
 * itself, which is both longer-lived and actually visible.
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

/** The hourly sweep stops re-firing a row after this many total attempts. */
const ATTEMPT_CEILING = 24;

/** Rows older than this are left alone by the sweep. */
const SWEEP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** Give a first attempt time to finish before the sweep considers it stalled. */
const STALLED_AFTER_MS = 15 * 60 * 1000;

type NotifiableId = Id<"contactEnquiries"> | Id<"merchantApplications">;

/**
 * Both forms are public and unauthenticated, and these values end up in a
 * subject line and a Reply-To, so strip anything that could inject a header.
 */
const oneLine = (value: string, max = 200) => value.replace(/[\r\n]+/g, " ").trim().slice(0, max);

interface SendResult {
  status: number;
  detail: string;
}

/** The one place that actually talks to Resend. Never throws. */
async function sendViaResend(args: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}): Promise<SendResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
        // Resend dedupes on this for 24h, so a retry after a timeout that had
        // actually delivered will not produce a second email.
        "Idempotency-Key": args.idempotencyKey,
      },
      body: JSON.stringify({
        from: args.from,
        to: [args.to],
        reply_to: [args.replyTo], // hitting reply answers the enquirer
        subject: args.subject,
        text: args.text,
        headers: { "X-Entity-Ref-ID": args.idempotencyKey }, // stops Gmail threading separate enquiries
      }),
    });
    return { status: res.status, detail: res.ok ? "" : (await res.text()).slice(0, 400) };
  } catch (err) {
    return { status: 0, detail: String(err).slice(0, 400) };
  }
}

/* ------------------------------------------------------------------ shared */

export const getRow = internalQuery({
  args: { id: v.union(v.id("contactEnquiries"), v.id("merchantApplications")) },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const recordResult = internalMutation({
  args: {
    id: v.union(v.id("contactEnquiries"), v.id("merchantApplications")),
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

/**
 * Shared tail: record the outcome and, where it is worth retrying, schedule the
 * next attempt. Returns nothing — the caller is done either way.
 */
async function settle<TId extends NotifiableId>(
  ctx: ActionCtx,
  opts: {
    id: TId;
    attempt: number;
    result: SendResult;
    /** The action to re-run; generic so each caller keeps its own id type. */
    retryRef: FunctionReference<"action", "internal", { id: TId; attempt: number }>;
  },
): Promise<void> {
  const { id, attempt, result, retryRef } = opts;

  if (result.status >= 200 && result.status < 300) {
    await ctx.runMutation(internal.notify.recordResult, { id, notified: true });
    return;
  }

  const next = BACKOFF_MS[attempt];
  const giveUp = PERMANENT.has(result.status) || next === undefined;
  await ctx.runMutation(internal.notify.recordResult, {
    id,
    notified: false,
    error: `${giveUp ? "gave up" : "retrying"} after HTTP ${result.status}: ${result.detail}`,
  });
  if (!giveUp) await ctx.scheduler.runAfter(next, retryRef, { id, attempt: attempt + 1 });
}

/** Reads the mail configuration, or explains which part is missing. */
function mailConfig(recipientVar: "CONTACT_NOTIFY_TO" | "MERCHANT_NOTIFY_TO") {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  // Merchant mail falls back to the general inbox rather than going nowhere.
  const to = process.env[recipientVar] ?? process.env.CONTACT_NOTIFY_TO;
  if (!apiKey || !from || !to) return null;
  return { apiKey, from, to };
}

/* ----------------------------------------------------------------- contact */

export const contactEnquiry = internalAction({
  args: { id: v.id("contactEnquiries"), attempt: v.number() },
  returns: v.null(),
  handler: async (ctx, { id, attempt }) => {
    const row = await ctx.runQuery(internal.notify.getRow, { id });
    if (!row || !("enquiryType" in row)) return null;
    if (row.notifiedAt) return null; // already sent — makes re-firing safe

    const config = mailConfig("CONTACT_NOTIFY_TO");
    if (!config) {
      // A deliberate, visible no-op until the sending domain is verified. The
      // enquiry is safe, and the hourly sweep picks it up once the vars are set.
      await ctx.runMutation(internal.notify.recordResult, {
        id,
        notified: false,
        error: "email not configured",
      });
      return null;
    }

    const result = await sendViaResend({
      ...config,
      replyTo: row.email,
      subject: `[${oneLine(row.enquiryType, 40)}] New enquiry from ${oneLine(row.name, 120)}`,
      text: [
        `Name:    ${row.name}`,
        `Email:   ${row.email}`,
        `Type:    ${row.enquiryType}`,
        "",
        row.message,
        "",
        "--",
        `Enquiry ${id} — afterglowcredit.online contact form`,
      ].join("\n"),
      idempotencyKey: `contact-${id}`,
    });

    await settle(ctx, { id, attempt, result, retryRef: internal.notify.contactEnquiry });
    return null;
  },
});

/* ---------------------------------------------------------------- merchant */

export const merchantApplication = internalAction({
  args: { id: v.id("merchantApplications"), attempt: v.number() },
  returns: v.null(),
  handler: async (ctx, { id, attempt }) => {
    const row = await ctx.runQuery(internal.notify.getRow, { id });
    if (!row || !("businessName" in row)) return null;
    if (row.notifiedAt) return null;

    const config = mailConfig("MERCHANT_NOTIFY_TO");
    if (!config) {
      await ctx.runMutation(internal.notify.recordResult, {
        id,
        notified: false,
        error: "email not configured",
      });
      return null;
    }

    const result = await sendViaResend({
      ...config,
      replyTo: row.email,
      // The merchants page promises a reply within 48 hours, so the subject
      // leads with that rather than burying it.
      subject: `[Merchant] ${oneLine(row.businessName, 120)} — partnership application`,
      text: [
        `Business:  ${row.businessName}`,
        `Category:  ${row.category ?? "not given"}`,
        `Contact:   ${row.contactName}${row.role ? ` (${row.role})` : ""}`,
        `Email:     ${row.email}`,
        `Locations: ${row.locations}`,
        "",
        row.message ?? "(no message)",
        "",
        "--",
        `Application ${id} — afterglowcredit.online merchant form`,
        "The site promises a reply within 48 hours.",
      ].join("\n"),
      idempotencyKey: `merchant-${id}`,
    });

    await settle(ctx, { id, attempt, result, retryRef: internal.notify.merchantApplication });
    return null;
  },
});

/* -------------------------------------------------------------------- sweep */

/**
 * Safety net for the one hole self-rescheduling leaves: an action killed before
 * it could schedule its own retry. Also drains anything that queued up while the
 * sending domain was still unverified.
 */
export const sweepUnnotified = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const since = Date.now() - SWEEP_WINDOW_MS;
    const stalled = (row: { notifiedAt?: number; notifyAttempts?: number; _creationTime: number }) =>
      !row.notifiedAt &&
      Date.now() - row._creationTime >= STALLED_AFTER_MS &&
      (row.notifyAttempts ?? 0) < ATTEMPT_CEILING;

    for (const row of await ctx.db
      .query("contactEnquiries")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect()) {
      if (stalled(row)) {
        await ctx.scheduler.runAfter(0, internal.notify.contactEnquiry, { id: row._id, attempt: 0 });
      }
    }

    for (const row of await ctx.db
      .query("merchantApplications")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect()) {
      if (stalled(row)) {
        await ctx.scheduler.runAfter(0, internal.notify.merchantApplication, { id: row._id, attempt: 0 });
      }
    }

    return null;
  },
});
