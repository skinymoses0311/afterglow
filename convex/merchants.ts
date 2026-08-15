import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
    await ctx.db.insert("merchantApplications", {
      ...args,
      email: args.email.trim().toLowerCase(),
    });
    return null;
  },
});
