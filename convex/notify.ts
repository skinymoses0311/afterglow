import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { contactConfirmation, merchantConfirmation, waitlistConfirmation } from "./mailTemplates";

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
 *
 * Two kinds of mail leave this file. The *notifications* above go to the team.
 * The *confirmations* further down go back to whoever submitted, and every form
 * gets one — including the waitlist, which sends the team nothing. They share
 * the send path, the backoff and the sweep, but track their outcome in their
 * own fields: a customer acknowledgement failing tells you something different
 * from the team never being told, so one must not overwrite the other.
 */

interface SendResult {
  status: number;
  detail: string;
}

/** HTTP statuses no amount of retrying will fix. 429 and 5xx deliberately absent. */
const PERMANENT = new Set([400, 401, 403, 404, 422]);

/**
 * Resend answers 403 until the sending domain's DNS is live. That is a property
 * of the deployment, not of this row, so it must not spend the row's retry
 * budget: an hourly sweep against a 24-attempt ceiling is exactly 24 hours of
 * cover, and without this every enquiry taken more than a day before the domain
 * verifies would be permanently dead by the time it was fixed — which is the
 * opposite of what the sweep is for. Not counting the attempt leaves the row
 * eligible forever, and the sweep drains the whole backlog once DNS lands.
 */
const isNotReady = (r: SendResult) => r.status === 403 && /not verified|domain/i.test(r.detail);

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

/**
 * Both forms are public and unauthenticated, and these values end up in a
 * subject line and a Reply-To, so strip anything that could inject a header.
 */
const oneLine = (value: string, max = 200) => value.replace(/[\r\n]+/g, " ").trim().slice(0, max);

/** The one place that actually talks to Resend. Never throws. */
async function sendViaResend(args: {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  /** Optional: confirmations are branded, team notifications stay plain. */
  html?: string;
  /**
   * A URL for List-Unsubscribe. Deliberately no List-Unsubscribe-Post: RFC 8058
   * one-click needs an endpoint that accepts POST, and /unsubscribe is a page.
   * Claiming it without honouring it is worse than not claiming it.
   */
  unsubscribeUrl?: string;
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
        ...(args.html ? { html: args.html } : {}),
        headers: {
          "X-Entity-Ref-ID": args.idempotencyKey, // stops Gmail threading separate enquiries
          ...(args.unsubscribeUrl ? { "List-Unsubscribe": `<${args.unsubscribeUrl}>` } : {}),
        },
      }),
    });
    return { status: res.status, detail: res.ok ? "" : (await res.text()).slice(0, 400) };
  } catch (err) {
    return { status: 0, detail: String(err).slice(0, 400) };
  }
}

/* ------------------------------------------------------------------ shared */

const anyRowId = v.union(
  v.id("contactEnquiries"),
  v.id("merchantApplications"),
  v.id("waitlistSignups"),
);

export const getRow = internalQuery({
  args: { id: anyRowId },
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

export const recordResult = internalMutation({
  args: {
    id: v.union(v.id("contactEnquiries"), v.id("merchantApplications")),
    notified: v.boolean(),
    error: v.optional(v.string()),
    /** False when nothing was actually tried — see isNotReady. */
    spendAttempt: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    await ctx.db.patch(args.id, {
      notifyAttempts: (row.notifyAttempts ?? 0) + (args.spendAttempt === false ? 0 : 1),
      // Patching to undefined removes the field, which is what we want on failure.
      notifiedAt: args.notified ? Date.now() : undefined,
      notifyError: args.error,
    });
    return null;
  },
});

/**
 * Shared tail: record the outcome and, where it is worth retrying, schedule the
 * next attempt. Takes callbacks rather than function references so notification
 * and confirmation sends — which record to different fields and retry through
 * different actions with different arguments — share one copy of the policy.
 */
async function settle(opts: {
    attempt: number;
    result: SendResult;
    record: (notified: boolean, error?: string, spendAttempt?: boolean) => Promise<unknown>;
    reschedule: (delayMs: number, nextAttempt: number) => Promise<unknown>;
}): Promise<void> {
  const { attempt, result, record, reschedule } = opts;

  if (result.status >= 200 && result.status < 300) {
    await record(true);
    return;
  }

  // Not ready is not a failure of this row: leave the budget alone, do not
  // back off, and let the hourly sweep keep it queued until the domain verifies.
  if (isNotReady(result)) {
    await record(false, `waiting on sending domain: ${result.detail}`, false);
    return;
  }

  const next = BACKOFF_MS[attempt];
  const giveUp = PERMANENT.has(result.status) || next === undefined;
  await record(false, `${giveUp ? "gave up" : "retrying"} after HTTP ${result.status}: ${result.detail}`);
  if (!giveUp) await reschedule(next, attempt + 1);
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
        spendAttempt: false, // nothing was tried
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

    await settle({
      attempt,
      result,
      record: (notified, error, spendAttempt) =>
        ctx.runMutation(internal.notify.recordResult, { id, notified, error, spendAttempt }),
      reschedule: (ms, next) =>
        ctx.scheduler.runAfter(ms, internal.notify.contactEnquiry, { id, attempt: next }),
    });
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
        spendAttempt: false, // nothing was tried
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

    await settle({
      attempt,
      result,
      record: (notified, error, spendAttempt) =>
        ctx.runMutation(internal.notify.recordResult, { id, notified, error, spendAttempt }),
      reschedule: (ms, next) =>
        ctx.scheduler.runAfter(ms, internal.notify.merchantApplication, { id, attempt: next }),
    });
    return null;
  },
});


/* --------------------------------------------------- confirmations to sender */

/**
 * Confirmation mail differs from notification mail in two ways: it is branded,
 * and Reply-To has to point at a monitored AfterGlow inbox rather than at the
 * customer's own address. Reusing the NOTIFY_TO variables for that is
 * deliberate — a reply to a confirmation lands in the same place as the
 * notification about it, so both halves of a conversation stay together.
 */
function confirmConfig(replyToVar: "CONTACT_NOTIFY_TO" | "MERCHANT_NOTIFY_TO") {
  const apiKey = process.env.RESEND_API_KEY;
  // Lets the customer-facing identity be nicer than the internal one without
  // having to change both.
  const from = process.env.RESEND_CONFIRM_FROM ?? process.env.RESEND_FROM;
  const replyTo = process.env[replyToVar] ?? process.env.CONTACT_NOTIFY_TO;
  if (!apiKey || !from || !replyTo) return null;
  return { apiKey, from, replyTo };
}

export const recordConfirmResult = internalMutation({
  args: {
    id: anyRowId,
    sent: v.boolean(),
    error: v.optional(v.string()),
    /** False when nothing was actually tried — see isNotReady. */
    spendAttempt: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    await ctx.db.patch(args.id, {
      confirmAttempts: (row.confirmAttempts ?? 0) + (args.spendAttempt === false ? 0 : 1),
      // Patching to undefined removes the field, which is what we want on failure.
      confirmedAt: args.sent ? Date.now() : undefined,
      confirmError: args.error,
    });
    return null;
  },
});

/** Records "we cannot send yet" without burning a retry budget silently. */
async function notConfigured(ctx: ActionCtx, id: Id<"contactEnquiries"> | Id<"merchantApplications"> | Id<"waitlistSignups">) {
  await ctx.runMutation(internal.notify.recordConfirmResult, {
    id,
    sent: false,
    error: "email not configured",
    spendAttempt: false, // nothing was tried
  });
}

export const waitlistConfirm = internalAction({
  args: {
    id: v.id("waitlistSignups"),
    attempt: v.number(),
    /** Already on the list — changes the wording, not the fact of sending. */
    returning: v.boolean(),
    /**
     * The confirmSends counter at the moment this was queued. It is what makes
     * the idempotency key unique per submission rather than per row, so a
     * retry dedupes but a genuine second signup does not.
     */
    send: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { id, attempt, returning, send }) => {
    const row = await ctx.runQuery(internal.notify.getRow, { id });
    if (!row || !("unsubscribeToken" in row)) return null;
    // A later submission has already superseded this one.
    if ((row.confirmSends ?? 0) > send) return null;
    if (row.confirmedAt) return null;
    // Someone who opted out between submitting and this running does not get mail.
    if (row.unsubscribedAt !== undefined) return null;

    const config = confirmConfig("CONTACT_NOTIFY_TO");
    const origin = process.env.SITE_ORIGIN;
    if (!config || !origin) {
      await notConfigured(ctx, id);
      return null;
    }

    const mail = waitlistConfirmation({
      name: row.name,
      city: row.city,
      treatments: row.treatments,
      returning,
      unsubscribeUrl: `${origin}/unsubscribe?token=${row.unsubscribeToken}`,
    });

    const result = await sendViaResend({
      ...config,
      to: row.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      unsubscribeUrl: `${origin}/unsubscribe?token=${row.unsubscribeToken}`,
      idempotencyKey: `waitlist-confirm-${id}-${send}`,
    });

    await settle({
      attempt,
      result,
      record: (sent, error, spendAttempt) =>
        ctx.runMutation(internal.notify.recordConfirmResult, { id, sent, error, spendAttempt }),
      reschedule: (ms, next) =>
        ctx.scheduler.runAfter(ms, internal.notify.waitlistConfirm, { id, attempt: next, returning, send }),
    });
    return null;
  },
});

export const contactConfirm = internalAction({
  args: { id: v.id("contactEnquiries"), attempt: v.number() },
  returns: v.null(),
  handler: async (ctx, { id, attempt }) => {
    const row = await ctx.runQuery(internal.notify.getRow, { id });
    if (!row || !("enquiryType" in row)) return null;
    if (row.confirmedAt) return null;

    const config = confirmConfig("CONTACT_NOTIFY_TO");
    if (!config) {
      await notConfigured(ctx, id);
      return null;
    }

    const mail = contactConfirmation({
      name: row.name,
      enquiryType: row.enquiryType,
      message: row.message,
    });

    const result = await sendViaResend({
      ...config,
      to: row.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      idempotencyKey: `contact-confirm-${id}`,
    });

    await settle({
      attempt,
      result,
      record: (sent, error, spendAttempt) =>
        ctx.runMutation(internal.notify.recordConfirmResult, { id, sent, error, spendAttempt }),
      reschedule: (ms, next) =>
        ctx.scheduler.runAfter(ms, internal.notify.contactConfirm, { id, attempt: next }),
    });
    return null;
  },
});

export const merchantConfirm = internalAction({
  args: { id: v.id("merchantApplications"), attempt: v.number() },
  returns: v.null(),
  handler: async (ctx, { id, attempt }) => {
    const row = await ctx.runQuery(internal.notify.getRow, { id });
    if (!row || !("businessName" in row)) return null;
    if (row.confirmedAt) return null;

    const config = confirmConfig("MERCHANT_NOTIFY_TO");
    if (!config) {
      await notConfigured(ctx, id);
      return null;
    }

    const mail = merchantConfirmation({
      businessName: row.businessName,
      contactName: row.contactName,
      category: row.category,
      locations: row.locations,
    });

    const result = await sendViaResend({
      ...config,
      to: row.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      idempotencyKey: `merchant-confirm-${id}`,
    });

    await settle({
      attempt,
      result,
      record: (sent, error, spendAttempt) =>
        ctx.runMutation(internal.notify.recordConfirmResult, { id, sent, error, spendAttempt }),
      reschedule: (ms, next) =>
        ctx.scheduler.runAfter(ms, internal.notify.merchantConfirm, { id, attempt: next }),
    });
    return null;
  },
});

/* -------------------------------------------------------------------- sweep */

/**
 * Safety net for the one hole self-rescheduling leaves: an action killed before
 * it could schedule its own retry. Also drains anything that queued up while the
 * sending domain was still unverified — which, until the DNS records are added,
 * is everything.
 */
export const sweepUnnotified = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const since = Date.now() - SWEEP_WINDOW_MS;
    const stalled = (queuedAt: number, at?: number, attempts?: number) =>
      !at && Date.now() - queuedAt >= STALLED_AFTER_MS && (attempts ?? 0) < ATTEMPT_CEILING;

    for (const row of await ctx.db
      .query("contactEnquiries")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect()) {
      if (stalled(row._creationTime, row.notifiedAt, row.notifyAttempts)) {
        await ctx.scheduler.runAfter(0, internal.notify.contactEnquiry, { id: row._id, attempt: 0 });
      }
      if (stalled(row._creationTime, row.confirmedAt, row.confirmAttempts)) {
        await ctx.scheduler.runAfter(0, internal.notify.contactConfirm, { id: row._id, attempt: 0 });
      }
    }

    for (const row of await ctx.db
      .query("merchantApplications")
      .withIndex("by_creation_time", (q) => q.gt("_creationTime", since))
      .collect()) {
      if (stalled(row._creationTime, row.notifiedAt, row.notifyAttempts)) {
        await ctx.scheduler.runAfter(0, internal.notify.merchantApplication, { id: row._id, attempt: 0 });
      }
      if (stalled(row._creationTime, row.confirmedAt, row.confirmAttempts)) {
        await ctx.scheduler.runAfter(0, internal.notify.merchantConfirm, { id: row._id, attempt: 0 });
      }
    }

    // Keyed on when the confirmation was queued rather than _creationTime: a
    // returning signup reuses a row that may be months old. Rows that predate
    // confirmations have no confirmQueuedAt, and undefined sorts below every
    // number, so this range never picks them up — which is correct. Nobody
    // should receive a welcome for something they did before the feature existed.
    for (const row of await ctx.db
      .query("waitlistSignups")
      .withIndex("by_confirm_queued", (q) => q.gt("confirmQueuedAt", since))
      .collect()) {
      if (row.unsubscribedAt !== undefined) continue;
      if (stalled(row.confirmQueuedAt ?? row._creationTime, row.confirmedAt, row.confirmAttempts)) {
        await ctx.scheduler.runAfter(0, internal.notify.waitlistConfirm, {
          id: row._id,
          attempt: 0,
          returning: row.confirmReturning ?? false,
          send: row.confirmSends ?? 1,
        });
      }
    }

    return null;
  },
});
