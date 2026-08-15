import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Backs the /unsubscribe page. The token is the only credential, so it is
 * deliberately opaque and never derived from the address.
 */
export const lookupUnsubscribeToken = query({
  args: { token: v.string() },
  returns: v.union(
    v.object({ status: v.literal("valid"), email: v.string() }),
    v.object({ status: v.literal("already") }),
    v.object({ status: v.literal("invalid"), message: v.string() }),
  ),
  handler: async (ctx, args) => {
    if (!args.token) {
      return { status: "invalid" as const, message: "Missing unsubscribe token." };
    }

    const signup = await ctx.db
      .query("waitlistSignups")
      .withIndex("by_unsubscribe_token", (q) => q.eq("unsubscribeToken", args.token))
      .unique();

    if (!signup) {
      return { status: "invalid" as const, message: "This unsubscribe link is invalid or expired." };
    }
    if (signup.unsubscribedAt !== undefined) {
      return { status: "already" as const };
    }
    return { status: "valid" as const, email: signup.email };
  },
});

export const unsubscribe = mutation({
  args: { token: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const signup = await ctx.db
      .query("waitlistSignups")
      .withIndex("by_unsubscribe_token", (q) => q.eq("unsubscribeToken", args.token))
      .unique();

    if (!signup) return { ok: false };

    if (signup.unsubscribedAt === undefined) {
      await ctx.db.patch(signup._id, { unsubscribedAt: Date.now() });
    }
    return { ok: true };
  },
});
