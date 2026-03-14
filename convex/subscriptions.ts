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

// Helper to find user's usable subscription (active or cancelled but not yet expired)
async function findUsableSub(ctx: { db: any }, userId: any) {
  // Check active first
  const activeSub = await ctx.db
    .query("subscriptions")
    .withIndex("by_user_status", (q: any) =>
      q.eq("userId", userId).eq("status", "active")
    )
    .first();

  if (activeSub && activeSub.expiresAt >= Date.now()) return activeSub;

  // Check cancelled — still usable until expiresAt
  const cancelledSub = await ctx.db
    .query("subscriptions")
    .withIndex("by_user_status", (q: any) =>
      q.eq("userId", userId).eq("status", "cancelled")
    )
    .first();

  if (cancelledSub && cancelledSub.expiresAt >= Date.now()) return cancelledSub;

  return null;
}

// Get user's active subscription
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    return await findUsableSub(ctx, userId);
  },
});

// Get user's usage stats + expiry info
export const getUsage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const sub = await findUsableSub(ctx, userId);

    // Also check for truly expired subs (active ones past expiry, not caught by cron yet)
    if (!sub) {
      const expiredSub = await ctx.db
        .query("subscriptions")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", "active")
        )
        .first();

      if (expiredSub && expiredSub.expiresAt < Date.now()) {
        return {
          plan: expiredSub.plan,
          status: "expired" as const,
          postsUsed: expiredSub.postsUsed,
          postsLimit: expiredSub.postsLimit,
          aiTokensUsed: expiredSub.aiTokensUsed,
          aiTokensLimit: expiredSub.aiTokensLimit,
          canGenerate: false,
          expiresAt: expiredSub.expiresAt,
          daysLeft: 0,
          isExpired: true,
          isExpiringSoon: false,
        };
      }

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

    const now = Date.now();
    const daysLeft = Math.ceil((sub.expiresAt - now) / (24 * 60 * 60 * 1000));
    const isExpiringSoon = daysLeft <= 5;
    const isCancelled = sub.status === "cancelled";

    return {
      plan: sub.plan,
      status: isCancelled ? "cancelled" as const : "active" as const,
      postsUsed: sub.postsUsed,
      postsLimit: sub.postsLimit,
      aiTokensUsed: sub.aiTokensUsed,
      aiTokensLimit: sub.aiTokensLimit,
      canGenerate: !isCancelled && sub.postsUsed < sub.postsLimit && sub.aiTokensUsed < sub.aiTokensLimit,
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

    const sub = await findUsableSub(ctx, userId);

    if (!sub) throw new Error("No active subscription");
    if (sub.status === "cancelled") throw new Error("Subscription is cancelled. Cannot generate.");

    // Check expiry
    if (sub.expiresAt < Date.now()) throw new Error("Subscription expired");

    // Track usage — allow this increment even if it slightly exceeds the limit
    // (tokens are already consumed by the AI). The client will show a warning.
    const newTokens = sub.aiTokensUsed + tokensUsed;
    const newPosts = sub.postsUsed + postsGenerated;

    await ctx.db.patch(sub._id, {
      aiTokensUsed: newTokens,
      postsUsed: newPosts,
    });

    // Return whether limits were exceeded so client can warn the user
    const postsExceeded = newPosts > sub.postsLimit;
    const tokensExceeded = newTokens > sub.aiTokensLimit;

    return {
      limitReached: postsExceeded || tokensExceeded,
      reason: postsExceeded
        ? `Post limit reached (${newPosts}/${sub.postsLimit})`
        : tokensExceeded
          ? `AI token limit reached (${newTokens}/${sub.aiTokensLimit})`
          : null,
    };
  },
});

// Check if user can generate (used before generation)
export const canGenerate = query({
  args: { postsCount: v.number() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { allowed: false, reason: "Not authenticated" };

    const sub = await findUsableSub(ctx, userId);

    if (!sub || sub.expiresAt < Date.now()) {
      return { allowed: false, reason: "No active plan. Please subscribe to continue generating." };
    }

    if (sub.status === "cancelled") {
      return { allowed: false, reason: "Subscription cancelled. Please subscribe to continue generating." };
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
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

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
      expiresAt: now + sevenDays,
      createdAt: now,
    });

    await ctx.db.patch(userId, { plan: "trial" });

    return subId;
  },
});

// Activate subscription after successful payment (authenticated user)
// Issue 8: amountPaid is now read from the server-side payment record, not client args
export const activate = mutation({
  args: {
    plan: v.union(v.literal("starter"), v.literal("pro")),
    orderId: v.string(),
    paymentId: v.optional(v.string()),
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

    // Use server-computed amount from payment record (not client-supplied)
    const amountPaid = payment.amount;

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
      amountPaid,
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
    let expiredCount = 0;

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
      .take(100);

    for (const sub of activeSubs) {
      await ctx.db.patch(sub._id, { status: "expired" });
      expiredCount++;

      const user = await ctx.db.get(sub.userId);
      if (user && user.plan === sub.plan) {
        await ctx.db.patch(sub.userId, { plan: "trial" });
      }
    }

    // Also expire cancelled subscriptions that have passed their expiresAt
    const cancelledSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "cancelled"),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .take(100);

    for (const sub of cancelledSubs) {
      await ctx.db.patch(sub._id, { status: "expired" });
      expiredCount++;
    }

    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} stale subscriptions`);
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

// Compute proration credit for remaining subscription time (exported for use in payments)
export function computeCredit(sub: {
  amountPaid: number;
  billingPeriod?: "monthly" | "yearly";
  startsAt: number;
  expiresAt: number;
}) {
  const now = Date.now();
  const totalDays = sub.billingPeriod === "yearly" ? 365 : 30;
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(0, (sub.expiresAt - now) / msPerDay);
  const dailyRate = sub.amountPaid / totalDays;
  const credit = Math.round(daysRemaining * dailyRate * 100) / 100; // round to 2 decimals
  return { credit, daysRemaining, dailyRate, totalDays };
}

// Cancel active subscription (keeps access until expiresAt in future when auto-renewal is added)
export const cancel = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (!sub) throw new Error("No active subscription to cancel");
    if (sub.plan === "trial") throw new Error("Cannot cancel a free trial");

    await ctx.db.patch(sub._id, { status: "cancelled" });
    // Mark user plan field — subscription still usable until expiresAt
    await ctx.db.patch(userId, { plan: "trial" });

    return { subscriptionId: sub._id, plan: sub.plan };
  },
});

// Calculate proration for plan changes (upgrade or downgrade)
export const calculatePlanChange = query({
  args: {
    newPlan: v.union(v.literal("starter"), v.literal("pro")),
    newBillingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active")
      )
      .first();

    if (!sub || sub.expiresAt < Date.now()) return null;

    // Trial has no credit
    if (sub.plan === "trial") {
      const newConfig = getPlanConfig(args.newPlan, args.newBillingPeriod);
      return {
        type: "upgrade" as const,
        currentPlan: sub.plan,
        newPlan: args.newPlan,
        credit: 0,
        newPlanPrice: newConfig.price,
        amountToCharge: newConfig.price,
        extendedDays: 0,
        daysRemaining: Math.max(0, (sub.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)),
      };
    }

    const { credit, daysRemaining } = computeCredit(sub);
    const newConfig = getPlanConfig(args.newPlan, args.newBillingPeriod);
    const newPlanPrice = newConfig.price;

    // Determine if upgrade or downgrade
    const planRank = { starter: 1, pro: 2 } as const;
    const currentRank = planRank[sub.plan as "starter" | "pro"] || 0;
    const newRank = planRank[args.newPlan];
    const isUpgrade = newRank > currentRank || (newRank === currentRank && newPlanPrice > (sub.amountPaid || 0));

    if (isUpgrade) {
      const amountToCharge = Math.max(1, Math.round((newPlanPrice - credit) * 100) / 100);
      return {
        type: "upgrade" as const,
        currentPlan: sub.plan,
        newPlan: args.newPlan,
        credit,
        newPlanPrice,
        amountToCharge,
        extendedDays: 0,
        daysRemaining,
      };
    } else {
      // Downgrade: credit converts to extended days on cheaper plan
      const newTotalDays = args.newBillingPeriod === "yearly" ? 365 : 30;
      const newDailyRate = newPlanPrice / newTotalDays;
      const extendedDays = newDailyRate > 0 ? Math.floor(credit / newDailyRate) : 0;
      return {
        type: "downgrade" as const,
        currentPlan: sub.plan,
        newPlan: args.newPlan,
        credit,
        newPlanPrice,
        amountToCharge: 0,
        extendedDays,
        daysRemaining,
      };
    }
  },
});

// Downgrade plan — no payment, extends subscription period with credit
export const downgrade = mutation({
  args: {
    newPlan: v.union(v.literal("starter"), v.literal("pro")),
    newBillingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sub = await findUsableSub(ctx, userId);

    if (!sub) throw new Error("No active subscription");
    if (sub.status === "cancelled") throw new Error("Cannot downgrade a cancelled subscription");
    if (sub.plan === "trial") throw new Error("Cannot downgrade a free trial");
    if (sub.expiresAt < Date.now()) throw new Error("Subscription expired");

    // Validate this is actually a downgrade (aligned with calculatePlanChange logic)
    const planRank = { starter: 1, pro: 2 } as const;
    const currentRank = planRank[sub.plan as "starter" | "pro"] || 0;
    const newRank = planRank[args.newPlan];
    const newConfig = getPlanConfig(args.newPlan, args.newBillingPeriod);
    const isDowngrade = newRank < currentRank || (newRank === currentRank && newConfig.price < (sub.amountPaid || 0));
    if (!isDowngrade) throw new Error("This is not a downgrade. Use the upgrade flow instead.");

    const { credit } = computeCredit(sub);
    const newTotalDays = args.newBillingPeriod === "yearly" ? 365 : 30;
    const newDailyRate = newConfig.price / newTotalDays;
    const extendedDays = newDailyRate > 0 ? Math.floor(credit / newDailyRate) : 0;

    // Prevent creating a subscription with 0 or negative days
    if (extendedDays < 1) throw new Error("Insufficient credit for downgrade. No remaining value to convert.");

    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    // Expire old subscription
    await ctx.db.patch(sub._id, { status: "expired" });

    // Create new subscription with extended period
    const subId = await ctx.db.insert("subscriptions", {
      userId,
      plan: args.newPlan,
      billingPeriod: args.newBillingPeriod,
      status: "active",
      aiTokensLimit: newConfig.aiTokensLimit,
      aiTokensUsed: 0,
      postsLimit: newConfig.postsLimit,
      postsUsed: 0,
      amountPaid: 0,
      currency: "USD",
      startsAt: now,
      expiresAt: now + extendedDays * msPerDay,
      createdAt: now,
    });

    await ctx.db.patch(userId, { plan: args.newPlan });

    return { subscriptionId: subId, extendedDays, credit };
  },
});
