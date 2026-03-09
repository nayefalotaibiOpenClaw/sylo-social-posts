import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Create a pending payment record before redirecting to UPayments
export const createPending = mutation({
  args: {
    plan: v.union(v.literal("starter"), v.literal("pro")),
    billingPeriod: v.union(v.literal("monthly"), v.literal("yearly")),
    orderId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check for duplicate orderId
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existing) throw new Error("A payment with this orderId already exists");

    const now = Date.now();
    return await ctx.db.insert("payments", {
      userId,
      orderId: args.orderId,
      plan: args.plan,
      billingPeriod: args.billingPeriod,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mark payment as paid — internal only (called from webhook handler, not client)
export const markPaid = internalMutation({
  args: {
    orderId: v.string(),
    upaymentTransactionId: v.optional(v.string()),
    upaymentTrackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) throw new Error(`Payment not found: ${args.orderId}`);
    if (payment.status === "paid") return payment._id;

    await ctx.db.patch(payment._id, {
      status: "paid",
      upaymentTransactionId: args.upaymentTransactionId,
      upaymentTrackId: args.upaymentTrackId,
      updatedAt: Date.now(),
    });

    return payment._id;
  },
});

// Mark payment as paid — authenticated user version (user must own the payment)
export const markPaidByUser = mutation({
  args: {
    orderId: v.string(),
    upaymentTransactionId: v.optional(v.string()),
    upaymentTrackId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) throw new Error(`Payment not found: ${args.orderId}`);
    if (payment.userId !== userId) throw new Error("Payment does not belong to this user");
    if (payment.status === "paid") return payment._id;

    await ctx.db.patch(payment._id, {
      status: "paid",
      upaymentTransactionId: args.upaymentTransactionId,
      upaymentTrackId: args.upaymentTrackId,
      updatedAt: Date.now(),
    });

    return payment._id;
  },
});

// Mark payment as failed — internal only (called from webhook handler, not client)
export const markFailed = internalMutation({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment) return;

    // Don't allow flipping a "paid" payment to "failed"
    if (payment.status === "paid") return;

    await ctx.db.patch(payment._id, {
      status: "failed",
      updatedAt: Date.now(),
    });
  },
});

// Get payment by order ID — only return if it belongs to the current user
export const getByOrderId = query({
  args: { orderId: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (!payment || payment.userId !== userId) return null;

    return payment;
  },
});

// List user payments
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("payments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});
