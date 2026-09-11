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
  })
    // Enforces one signup per address, and backs the duplicate check.
    .index("by_email", ["email"])
    .index("by_unsubscribe_token", ["unsubscribeToken"]),

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
  }).index("by_email", ["email"]),

  merchantApplications: defineTable({
    businessName: v.string(),
    category: v.optional(v.string()),
    contactName: v.string(),
    role: v.optional(v.string()),
    email: v.string(),
    locations: v.number(),
    message: v.optional(v.string()),
  }).index("by_email", ["email"]),
});
