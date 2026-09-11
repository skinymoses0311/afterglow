import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    enquiryType: v.string(),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Every enquiry is kept, including repeats from the same address — unlike
    // the waitlist, a second message is a second thing to answer.
    await ctx.db.insert("contactEnquiries", {
      ...args,
      email: args.email.trim().toLowerCase(),
    });
    return null;
  },
});
