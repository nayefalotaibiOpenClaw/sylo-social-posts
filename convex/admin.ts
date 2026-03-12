import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

const ADMIN_EMAILS = ["nayefralotaibi@gmail.com"];

async function assertAdmin(ctx: { db: any; auth: any }) {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  if (!ADMIN_EMAILS.includes(user.email ?? "") && user.role !== "admin") {
    throw new Error("Not admin");
  }
  return user;
}

// ── Queries ──────────────────────────────────────────

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email ?? "") || user.role === "admin";
  },
});

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    const newUsersLast7d = allUsers.filter(
      (u: any) => u.createdAt && u.createdAt >= sevenDaysAgo
    ).length;

    const allSubs = await ctx.db.query("subscriptions").collect();
    const activeSubs = allSubs.filter(
      (s: any) => s.status === "active" && s.expiresAt >= now
    );
    const activeSubCount = activeSubs.length;

    let mrr = 0;
    for (const sub of activeSubs) {
      if (sub.plan === "trial") continue;
      if (sub.billingPeriod === "yearly") {
        mrr += sub.amountPaid / 12;
      } else {
        mrr += sub.amountPaid;
      }
    }
    mrr = Math.round(mrr * 100) / 100;

    const recentLogs = await ctx.db
      .query("aiUsageLogs")
      .withIndex("by_created")
      .order("desc")
      .collect();

    let aiCost30d = 0;
    let totalAiTokens30d = 0;
    for (const log of recentLogs) {
      if (log.createdAt < thirtyDaysAgo) break;
      aiCost30d += log.estimatedCostUsd;
      totalAiTokens30d += log.totalTokens;
    }
    aiCost30d = Math.round(aiCost30d * 10000) / 10000;

    const allPayments = await ctx.db.query("payments").collect();
    let totalRevenue = 0;
    for (const p of allPayments) {
      if (p.status === "paid") totalRevenue += p.amount;
    }
    totalRevenue = Math.round(totalRevenue * 100) / 100;

    // Total workspaces
    const allWorkspaces = await ctx.db.query("workspaces").collect();
    const totalWorkspaces = allWorkspaces.length;

    // Total posts
    const allPosts = await ctx.db.query("posts").collect();
    const totalPosts = allPosts.length;

    return {
      totalUsers,
      activeSubCount,
      mrr,
      aiCost30d,
      totalAiTokens30d,
      totalRevenue,
      newUsersLast7d,
      totalWorkspaces,
      totalPosts,
    };
  },
});

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const users = await ctx.db.query("users").order("desc").collect();

    return await Promise.all(
      users.map(async (u: any) => {
        // Get active or most recent subscription
        const activeSub = await ctx.db
          .query("subscriptions")
          .withIndex("by_user_status", (q: any) =>
            q.eq("userId", u._id).eq("status", "active")
          )
          .first();

        // If no active, get the most recent one
        const sub = activeSub || await ctx.db
          .query("subscriptions")
          .withIndex("by_user", (q: any) => q.eq("userId", u._id))
          .order("desc")
          .first();

        // Count workspaces
        const workspaces = await ctx.db
          .query("workspaces")
          .withIndex("by_user", (q: any) => q.eq("userId", u._id))
          .collect();

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          image: u.image,
          plan: u.plan,
          role: u.role,
          createdAt: u.createdAt,
          workspaceCount: workspaces.length,
          subscription: sub
            ? {
                _id: sub._id,
                plan: sub.plan,
                billingPeriod: sub.billingPeriod,
                status: sub.status,
                aiTokensUsed: sub.aiTokensUsed,
                aiTokensLimit: sub.aiTokensLimit,
                postsUsed: sub.postsUsed,
                postsLimit: sub.postsLimit,
                amountPaid: sub.amountPaid,
                expiresAt: sub.expiresAt,
                startsAt: sub.startsAt,
                createdAt: sub.createdAt,
              }
            : null,
        };
      })
    );
  },
});

export const listRecentUsage = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const logs = await ctx.db
      .query("aiUsageLogs")
      .withIndex("by_created")
      .order("desc")
      .take(50);

    const userIdSet = new Set<string>();
    for (const l of logs) userIdSet.add(l.userId as string);
    const usersMap = new Map<string, { name?: string; email?: string }>();
    for (const uid of userIdSet) {
      const u: any = await ctx.db.get(uid as any);
      if (u) usersMap.set(uid, { name: u.name, email: u.email });
    }

    return logs.map((log: any) => ({
      ...log,
      user: usersMap.get(log.userId) || { name: "Unknown", email: "" },
    }));
  },
});

// ── Admin Mutations (all protected by assertAdmin) ──

// Update a user's plan field directly
export const updateUserPlan = mutation({
  args: {
    targetUserId: v.id("users"),
    plan: v.union(v.literal("trial"), v.literal("starter"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const user = await ctx.db.get(args.targetUserId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.targetUserId, { plan: args.plan });
    return { success: true };
  },
});

// Update a user's role
export const updateUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const user = await ctx.db.get(args.targetUserId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.targetUserId, { role: args.role });
    return { success: true };
  },
});

// Grant or modify a subscription for a user
export const grantSubscription = mutation({
  args: {
    targetUserId: v.id("users"),
    plan: v.union(v.literal("trial"), v.literal("starter"), v.literal("pro")),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    durationDays: v.number(),
    aiTokensLimit: v.number(),
    postsLimit: v.number(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const user = await ctx.db.get(args.targetUserId);
    if (!user) throw new Error("User not found");

    // Expire existing active subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q: any) =>
        q.eq("userId", args.targetUserId).eq("status", "active")
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { status: "expired" });
    }

    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    const subId = await ctx.db.insert("subscriptions", {
      userId: args.targetUserId,
      plan: args.plan,
      billingPeriod: args.billingPeriod,
      status: "active",
      aiTokensLimit: args.aiTokensLimit,
      aiTokensUsed: 0,
      postsLimit: args.postsLimit,
      postsUsed: 0,
      amountPaid: 0,
      currency: "USD",
      startsAt: now,
      expiresAt: now + args.durationDays * msPerDay,
      createdAt: now,
    });

    await ctx.db.patch(args.targetUserId, { plan: args.plan });

    return { subscriptionId: subId };
  },
});

// Update subscription limits (tokens, posts)
export const updateSubscriptionLimits = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    aiTokensLimit: v.optional(v.number()),
    postsLimit: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");

    const patch: Record<string, any> = {};
    if (args.aiTokensLimit !== undefined) patch.aiTokensLimit = args.aiTokensLimit;
    if (args.postsLimit !== undefined) patch.postsLimit = args.postsLimit;
    if (args.expiresAt !== undefined) patch.expiresAt = args.expiresAt;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.subscriptionId, patch);
    }

    return { success: true };
  },
});

// Reset AI usage counters on a subscription
export const resetSubscriptionUsage = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    resetTokens: v.optional(v.boolean()),
    resetPosts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");

    const patch: Record<string, any> = {};
    if (args.resetTokens) patch.aiTokensUsed = 0;
    if (args.resetPosts) patch.postsUsed = 0;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.subscriptionId, patch);
    }

    return { success: true };
  },
});

// Extend subscription expiry
export const extendSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    additionalDays: v.number(),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");

    const msPerDay = 24 * 60 * 60 * 1000;
    const newExpiry = Math.max(sub.expiresAt, Date.now()) + args.additionalDays * msPerDay;

    await ctx.db.patch(args.subscriptionId, {
      expiresAt: newExpiry,
      status: "active",
    });

    return { newExpiresAt: newExpiry };
  },
});

// Cancel a subscription
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) throw new Error("Subscription not found");

    await ctx.db.patch(args.subscriptionId, { status: "cancelled" });
    await ctx.db.patch(sub.userId, { plan: "trial" });

    return { success: true };
  },
});
