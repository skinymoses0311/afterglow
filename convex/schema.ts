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
  })
    // Enforces one signup per address, and backs the duplicate check.
    .index("by_email", ["email"])
    .index("by_unsubscribe_token", ["unsubscribeToken"]),

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
