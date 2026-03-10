import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    type: v.union(
      v.literal("daily"),
      v.literal("every_x_days"),
      v.literal("weekly"),
      v.literal("custom"),
    ),
    config: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    return await ctx.db.insert("schedulePatterns", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
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
      .query("schedulePatterns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("schedulePatterns") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const pattern = await ctx.db.get(args.id);
    if (!pattern || pattern.userId !== userId) throw new Error("Not authorized");
    await ctx.db.delete(args.id);
  },
});
