import { mutation, internalMutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { auth } from "./auth";

// ── Model pricing (per 1M tokens, paid tier, prompts <= 200k) ──
const MODEL_COSTS: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  "gemini-3.1-pro-preview":            { inputPer1M: 2.00, outputPer1M: 12.00 },
  "gemini-3.1-flash-preview":          { inputPer1M: 0.50, outputPer1M: 3.00 },
  "gemini-3.1-flash-lite-preview":     { inputPer1M: 0.25, outputPer1M: 1.50 },
  "gemini-3.1-flash-image-preview":    { inputPer1M: 0.50, outputPer1M: 60.00 },
};

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  const costs = MODEL_COSTS[model] || MODEL_COSTS["gemini-3.1-flash-lite-preview"];
  return (promptTokens / 1_000_000) * costs.inputPer1M + (completionTokens / 1_000_000) * costs.outputPer1M;
}

const categoryValidator = v.union(
  v.literal("generation"),
  v.literal("adaptation"),
  v.literal("website_analysis"),
  v.literal("image_analysis"),
  v.literal("crawl"),
  v.literal("classification"),
  v.literal("product_extraction"),
  v.literal("blog_generation"),
  v.literal("background_removal")
);

// Helper to find user's usable subscription
async function findUsableSub(ctx: { db: QueryCtx["db"] | MutationCtx["db"] }, userId: Id<"users">) {
  const activeSub = await ctx.db
    .query("subscriptions")
    .withIndex("by_user_status", (q) =>
      q.eq("userId", userId).eq("status", "active")
    )
    .first();

  if (activeSub && activeSub.expiresAt >= Date.now()) return activeSub;

  const cancelledSub = await ctx.db
    .query("subscriptions")
    .withIndex("by_user_status", (q) =>
      q.eq("userId", userId).eq("status", "cancelled")
    )
    .first();

  if (cancelledSub && cancelledSub.expiresAt >= Date.now()) return cancelledSub;

  return null;
}

// Log usage + increment subscription tokens (replaces incrementUsage for AI calls)
export const logAndIncrement = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    category: categoryValidator,
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    endpoint: v.string(),
    metadata: v.optional(v.string()),
    // For generation: also increment posts count
    postsGenerated: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const promptTokens = Math.max(0, args.promptTokens);
    const completionTokens = Math.max(0, args.completionTokens);
    const totalTokens = Math.max(0, args.totalTokens);
    const cost = estimateCost(args.model, promptTokens, completionTokens);

    // Log the usage
    await ctx.db.insert("aiUsageLogs", {
      userId,
      workspaceId: args.workspaceId,
      category: args.category,
      model: args.model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: cost,
      endpoint: args.endpoint,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    // Increment subscription usage
    const sub = await findUsableSub(ctx, userId);
    if (!sub) throw new Error("No active subscription");
    if (sub.status === "cancelled") throw new Error("Subscription is cancelled. Cannot generate.");
    if (sub.expiresAt < Date.now()) throw new Error("Subscription expired");

    const postsGenerated = Math.max(0, args.postsGenerated || 0);
    const newTokens = sub.aiTokensUsed + totalTokens;
    const newPosts = sub.postsUsed + postsGenerated;

    await ctx.db.patch(sub._id, {
      aiTokensUsed: newTokens,
      postsUsed: newPosts,
    });

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

// One-time migration: recalculate estimatedCostUsd for all logs using correct model pricing
export const recalculateCosts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("aiUsageLogs").collect();
    let updated = 0;
    for (const log of logs) {
      const correctCost = estimateCost(log.model, log.promptTokens, log.completionTokens);
      if (Math.abs(correctCost - log.estimatedCostUsd) > 0.000001) {
        await ctx.db.patch(log._id, { estimatedCostUsd: correctCost });
        updated++;
      }
    }
    // Count by model
    const byModel: Record<string, number> = {};
    for (const log of logs) {
      byModel[log.model] = (byModel[log.model] || 0) + 1;
    }
    return { total: logs.length, updated, byModel };
  },
});

// Internal mutation for logging from Convex actions (e.g. analyzeImage)
export const logUsageInternal = internalMutation({
  args: {
    userId: v.id("users"),
    workspaceId: v.optional(v.id("workspaces")),
    category: categoryValidator,
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    endpoint: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const promptTokens = Math.max(0, args.promptTokens);
    const completionTokens = Math.max(0, args.completionTokens);
    const totalTokens = Math.max(0, args.totalTokens);
    const cost = estimateCost(args.model, promptTokens, completionTokens);

    await ctx.db.insert("aiUsageLogs", {
      userId: args.userId,
      workspaceId: args.workspaceId,
      category: args.category,
      model: args.model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd: cost,
      endpoint: args.endpoint,
      metadata: args.metadata,
      createdAt: Date.now(),
    });

    // Also increment subscription token usage
    const sub = await findUsableSub(ctx, args.userId);
    if (sub && sub.expiresAt >= Date.now() && sub.status !== "cancelled") {
      await ctx.db.patch(sub._id, {
        aiTokensUsed: sub.aiTokensUsed + totalTokens,
      });
    }
  },
});
