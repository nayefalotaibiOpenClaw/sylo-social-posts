import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    prompt: v.string(),
    type: v.union(
      v.literal("new"),
      v.literal("variant_language"),
      v.literal("variant_device"),
      v.literal("variant_size")
    ),
    sourcePostId: v.optional(v.id("posts")),
    config: v.object({
      features: v.optional(v.array(v.string())),
      style: v.optional(v.string()),
      targetLanguage: v.optional(v.string()),
      targetDevice: v.optional(v.string()),
      assetsIncluded: v.array(v.id("assets")),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("generations", {
      ...args,
      userId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const markCompleted = internalMutation({
  args: {
    id: v.id("generations"),
    resultPostId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      resultPostId: args.resultPostId,
    });
  },
});

export const markFailed = internalMutation({
  args: { id: v.id("generations") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "failed" });
  },
});

export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return [];
    return await ctx.db
      .query("generations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(50);
  },
});
