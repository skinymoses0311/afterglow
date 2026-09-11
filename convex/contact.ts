import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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
    const id = await ctx.db.insert("contactEnquiries", {
      ...args,
      email: args.email.trim().toLowerCase(),
    });
    // Scheduling from the mutation is atomic with the insert: if the row
    // commits, the notification attempt is guaranteed to be invoked.
    await ctx.scheduler.runAfter(0, internal.notify.contactEnquiry, { id, attempt: 0 });
    return null;
  },
});
