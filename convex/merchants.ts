import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const apply = mutation({
  args: {
    businessName: v.string(),
    category: v.optional(v.string()),
    contactName: v.string(),
    role: v.optional(v.string()),
    email: v.string(),
    locations: v.number(),
    message: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Unlike the waitlist, repeat applications are kept rather than merged —
    // a second enquiry from the same business is worth seeing on its own.
    const id = await ctx.db.insert("merchantApplications", {
      ...args,
      email: args.email.trim().toLowerCase(),
    });
    // Atomic with the insert: if the row commits, the notification attempt is
    // guaranteed to run. A merchant lead is worth more than a contact enquiry
    // and the site promises a reply within 48 hours.
    await ctx.scheduler.runAfter(0, internal.notify.merchantApplication, { id, attempt: 0 });
    // Separate schedule: the applicant's acknowledgement and the team's alert
    // fail independently, and the page promises a 48-hour reply either way.
    await ctx.scheduler.runAfter(0, internal.notify.merchantConfirm, { id, attempt: 0 });
    return null;
  },
});
