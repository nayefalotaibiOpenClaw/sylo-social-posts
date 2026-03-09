import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Plan definitions — single source of truth
export const PLANS = {
  trial: {
    name: "Free Trial",
    monthly: { price: 0, postsLimit: 6, aiTokensLimit: 30_000 },
    yearly: { price: 0, postsLimit: 6, aiTokensLimit: 30_000 },
    currency: "USD",
  },
  starter: {
    name: "Starter",
    monthly: { price: 40, postsLimit: 100, aiTokensLimit: 500_000 },
    yearly: { price: 384, postsLimit: 1_200, aiTokensLimit: 6_000_000 }, // 20% off
    currency: "USD",
  },
  pro: {
    name: "Pro",
    monthly: { price: 100, postsLimit: 250, aiTokensLimit: 1_250_000 },
    yearly: { price: 960, postsLimit: 3_000, aiTokensLimit: 15_000_000 }, // 20% off
    currency: "USD",
  },
} as const;

// Helper to get plan config for a billing period
function getPlanConfig(plan: "trial" | "starter" | "pro", period: "monthly" | "yearly" = "monthly") {
  return PLANS[plan][period];
}

// Duration in ms for each billing period
const BILLING_DURATION = {
  monthly: 30 * 24 * 60 * 60 * 1000,
  yearly: 365 * 24 * 60 * 60 * 1000,
} as const;

// Get user's active subscription
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (!sub) return null;
    if (sub.expiresAt < Date.now()) return null;

    return sub;
  },
});

// Get user's usage stats + expiry info
export const getUsage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    const now = Date.now();

    // Expired subscription
    if (sub && sub.expiresAt < now) {
      return {
        plan: sub.plan,
        status: "expired" as const,
        postsUsed: sub.postsUsed,
        postsLimit: sub.postsLimit,
        aiTokensUsed: sub.aiTokensUsed,
        aiTokensLimit: sub.aiTokensLimit,
        canGenerate: false,
        expiresAt: sub.expiresAt,
        daysLeft: 0,
        isExpired: true,
        isExpiringSoon: false,
      };
    }

    // No subscription at all
    if (!sub) {
      return {
        plan: null,
        status: "none" as const,
        postsUsed: 0,
        postsLimit: 0,
        aiTokensUsed: 0,
        aiTokensLimit: 0,
        canGenerate: false,
        expiresAt: null,
        daysLeft: 0,
        isExpired: false,
        isExpiringSoon: false,
      };
    }

    // Active subscription
    const daysLeft = Math.ceil((sub.expiresAt - now) / (24 * 60 * 60 * 1000));
    const isExpiringSoon = daysLeft <= 5;

    return {
      plan: sub.plan,
      status: "active" as const,
      postsUsed: sub.postsUsed,
      postsLimit: sub.postsLimit,
      aiTokensUsed: sub.aiTokensUsed,
      aiTokensLimit: sub.aiTokensLimit,
      canGenerate: sub.postsUsed < sub.postsLimit && sub.aiTokensUsed < sub.aiTokensLimit,
      expiresAt: sub.expiresAt,
      daysLeft,
      isExpired: false,
      isExpiringSoon,
    };
  },
});

// Increment usage after a generation
export const incrementUsage = mutation({
  args: {
    tokensUsed: v.number(),
    postsGenerated: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Sanitize: reject negative values
    const tokensUsed = Math.max(0, args.tokensUsed);
    const postsGenerated = Math.max(0, args.postsGenerated);

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (!sub) throw new Error("No active subscription");

    // Check expiry
    if (sub.expiresAt < Date.now()) throw new Error("Subscription expired");

    // Enforce limits — don't allow exceeding them
    const newTokens = sub.aiTokensUsed + tokensUsed;
    const newPosts = sub.postsUsed + postsGenerated;

    if (newPosts > sub.postsLimit) {
      throw new Error(`Post limit exceeded (${sub.postsUsed}/${sub.postsLimit})`);
    }
    if (newTokens > sub.aiTokensLimit) {
      throw new Error(`AI token limit exceeded (${sub.aiTokensUsed}/${sub.aiTokensLimit})`);
    }

    await ctx.db.patch(sub._id, {
      aiTokensUsed: newTokens,
      postsUsed: newPosts,
    });
  },
});

// Check if user can generate (used before generation)
export const canGenerate = query({
  args: { postsCount: v.number() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { allowed: false, reason: "Not authenticated" };

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (!sub || sub.expiresAt < Date.now()) {
      return { allowed: false, reason: "No active plan. Please subscribe to continue generating." };
    }

    if (sub.postsUsed + args.postsCount > sub.postsLimit) {
      const msg = sub.plan === "trial"
        ? `Free trial limit reached (${sub.postsUsed}/${sub.postsLimit}). Upgrade to keep generating.`
        : `Post limit reached (${sub.postsUsed}/${sub.postsLimit}). Please upgrade your plan.`;
      return { allowed: false, reason: msg };
    }

    if (sub.aiTokensUsed >= sub.aiTokensLimit) {
      return { allowed: false, reason: "AI token limit reached. Please upgrade your plan." };
    }

    return { allowed: true, reason: null };
  },
});

// Start free trial for a new user
export const startTrial = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has any subscription (trial or paid)
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) throw new Error("Trial already used or subscription exists");

    const trialConfig = getPlanConfig("trial");
    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    const subId = await ctx.db.insert("subscriptions", {
      userId,
      plan: "trial",
      billingPeriod: "monthly",
      status: "active",
      aiTokensLimit: trialConfig.aiTokensLimit,
      aiTokensUsed: 0,
      postsLimit: trialConfig.postsLimit,
      postsUsed: 0,
      amountPaid: 0,
      currency: "USD",
      startsAt: now,
      expiresAt: now + ninetyDays,
      createdAt: now,
    });

    await ctx.db.patch(userId, { plan: "trial" });

    return subId;
  },
});

// Activate subscription after successful payment (authenticated user)
export const activate = mutation({
  args: {
    plan: v.union(v.literal("starter"), v.literal("pro")),
    orderId: v.string(),
    paymentId: v.optional(v.string()),
    amountPaid: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify the payment exists and belongs to this user
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) throw new Error("Payment record not found");
    if (payment.userId !== userId) throw new Error("Payment does not belong to this user");
    if (payment.status !== "paid") throw new Error("Payment has not been completed");

    // Idempotency guard: if subscription already exists for this orderId, return it
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_payment", (q) => q.eq("upaymentOrderId", args.orderId))
      .first();
    if (existingSub) return existingSub._id;

    const billingPeriod = payment.billingPeriod || "monthly";
    const planConfig = getPlanConfig(args.plan, billingPeriod);
    const now = Date.now();
    const duration = BILLING_DURATION[billingPeriod];

    // Expire any existing active subscriptions (including trial)
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    for (const sub of existing) {
      await ctx.db.patch(sub._id, { status: "expired" });
    }

    // Create new subscription
    const subId = await ctx.db.insert("subscriptions", {
      userId,
      plan: args.plan,
      billingPeriod,
      status: "active",
      aiTokensLimit: planConfig.aiTokensLimit,
      aiTokensUsed: 0,
      postsLimit: planConfig.postsLimit,
      postsUsed: 0,
      amountPaid: args.amountPaid,
      currency: args.currency,
      paymentId: args.paymentId,
      upaymentOrderId: args.orderId,
      startsAt: now,
      expiresAt: now + duration,
      createdAt: now,
    });

    // Link subscription back to payment
    await ctx.db.patch(payment._id, { subscriptionId: subId });
    await ctx.db.patch(userId, { plan: args.plan });

    return subId;
  },
});

// Activate subscription from webhook (server-side only, uses orderId to find user)
export const activateByOrderId = internalMutation({
  args: {
    orderId: v.string(),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) throw new Error(`Payment not found: ${args.orderId}`);
    if (payment.status !== "pending" && payment.status !== "paid") return null;

    // Idempotency guard: check if a subscription with this orderId already exists
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_payment", (q) => q.eq("upaymentOrderId", args.orderId))
      .first();

    if (existingSub) return existingSub._id;

    const userId = payment.userId;
    const billingPeriod = payment.billingPeriod || "monthly";
    const planConfig = getPlanConfig(payment.plan, billingPeriod);
    const now = Date.now();
    const duration = BILLING_DURATION[billingPeriod];

    // Expire any existing active subscriptions
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    for (const sub of existing) {
      await ctx.db.patch(sub._id, { status: "expired" });
    }

    const subId = await ctx.db.insert("subscriptions", {
      userId,
      plan: payment.plan,
      billingPeriod,
      status: "active",
      aiTokensLimit: planConfig.aiTokensLimit,
      aiTokensUsed: 0,
      postsLimit: planConfig.postsLimit,
      postsUsed: 0,
      amountPaid: payment.amount,
      currency: payment.currency,
      paymentId: args.paymentId,
      upaymentOrderId: args.orderId,
      startsAt: now,
      expiresAt: now + duration,
      createdAt: now,
    });

    // Link subscription back to payment
    await ctx.db.patch(payment._id, { subscriptionId: subId });
    await ctx.db.patch(userId, { plan: payment.plan });

    return subId;
  },
});

// Cron job: expire stale subscriptions (called every hour)
export const expireStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find all "active" subscriptions that have passed their expiresAt
    const activeSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .take(100); // process in batches

    for (const sub of activeSubs) {
      await ctx.db.patch(sub._id, { status: "expired" });

      // Update user plan to reflect expiry
      const user = await ctx.db.get(sub.userId);
      if (user && user.plan === sub.plan) {
        await ctx.db.patch(sub.userId, { plan: "trial" });
      }
    }

    if (activeSubs.length > 0) {
      console.log(`Expired ${activeSubs.length} stale subscriptions`);
    }
  },
});

// List user's subscription history
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});
