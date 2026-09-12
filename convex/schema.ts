import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlistSignups: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    city: v.optional(v.string()),
    treatments: v.array(v.string()),
    /** Opaque token used by the /unsubscribe page. */
    unsubscribeToken: v.string(),
    /** Set once the person opts out; absent means still subscribed. */
    unsubscribedAt: v.optional(v.number()),
    /**
     * Marketing consent is separate from being on the waitlist: the waitlist
     * itself runs on legitimate interests, marketing needs opt-in. Optional
     * because the homepage capture has no checkbox — absent means never asked,
     * which is not the same as declined.
     */
    marketingConsent: v.optional(v.boolean()),
    /** When that choice was made. PECR reg 22 wants evidence, not just a flag. */
    marketingConsentAt: v.optional(v.number()),

    /**
     * Confirmation-email state. Separate from the notify* fields the enquiry
     * tables carry: that trio records whether a human was told, this one
     * records whether the person who submitted got their acknowledgement.
     * Both can fail independently.
     */
    confirmedAt: v.optional(v.number()),
    confirmAttempts: v.optional(v.number()),
    confirmError: v.optional(v.string()),
    /**
     * Distinct confirmations queued for this row, not HTTP attempts. Unlike the
     * enquiry tables, a waitlist row is reused when someone re-submits, so
     * there is no per-submission id to key Resend's idempotency on — this
     * counter supplies one, which is what lets a genuine second submission send
     * again while a retry of the same one still dedupes.
     */
    confirmSends: v.optional(v.number()),
    /** When the most recent confirmation was queued. Drives the sweep. */
    confirmQueuedAt: v.optional(v.number()),
  })
    // Enforces one signup per address, and backs the duplicate check.
    .index("by_email", ["email"])
    .index("by_unsubscribe_token", ["unsubscribeToken"])
    // The sweep needs "queued recently and still unconfirmed". _creationTime
    // cannot answer that: a returning signup reuses a row that may be months old.
    .index("by_confirm_queued", ["confirmQueuedAt"]),

  contactEnquiries: defineTable({
    name: v.string(),
    email: v.string(),
    /** Which of the routes on the contact page the sender picked. */
    enquiryType: v.string(),
    message: v.string(),
    /**
     * Notification state. These exist so that "did a human actually get told
     * about this enquiry" is answerable from the same table you already look
     * at — a swallowed send error would otherwise be indistinguishable from
     * success.
     */
    notifiedAt: v.optional(v.number()),
    notifyAttempts: v.optional(v.number()),
    notifyError: v.optional(v.string()),
    /** Acknowledgement sent back to the person who submitted. See the note on
     *  waitlistSignups: this is independent of whether the team was notified. */
    confirmedAt: v.optional(v.number()),
    confirmAttempts: v.optional(v.number()),
    confirmError: v.optional(v.string()),
  }).index("by_email", ["email"]),

  merchantApplications: defineTable({
    businessName: v.string(),
    category: v.optional(v.string()),
    contactName: v.string(),
    role: v.optional(v.string()),
    email: v.string(),
    locations: v.number(),
    message: v.optional(v.string()),
    /** Notification state — see the note on contactEnquiries. */
    notifiedAt: v.optional(v.number()),
    notifyAttempts: v.optional(v.number()),
    notifyError: v.optional(v.string()),
    /** Acknowledgement sent back to the person who submitted. See the note on
     *  waitlistSignups: this is independent of whether the team was notified. */
    confirmedAt: v.optional(v.number()),
    confirmAttempts: v.optional(v.number()),
    confirmError: v.optional(v.string()),
  }).index("by_email", ["email"]),
});
