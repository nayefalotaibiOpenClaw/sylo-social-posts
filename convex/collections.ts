import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    mode: v.union(
      v.literal("social_grid"),
      v.literal("social_story"),
      v.literal("appstore_preview")
    ),
    platform: v.optional(
      v.union(
        v.literal("instagram"),
        v.literal("twitter"),
        v.literal("linkedin"),
        v.literal("appstore"),
        v.literal("playstore")
      )
    ),
    device: v.optional(
      v.union(
        v.literal("iphone"),
        v.literal("android"),
        v.literal("ipad"),
        v.literal("android_tablet"),
        v.literal("desktop")
      )
    ),
    language: v.union(v.literal("en"), v.literal("ar")),
    aspectRatio: v.union(
      v.literal("1:1"),
      v.literal("4:5"),
      v.literal("9:16"),
      v.literal("16:9"),
      v.literal("4:3")
    ),
    sourceCollectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    return await ctx.db.insert("collections", {
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
      .query("collections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const collection = await ctx.db.get(args.id);
    if (!collection || collection.userId !== userId) return null;
    return collection;
  },
});

export const getVariants = query({
  args: { sourceCollectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    // Verify ownership of the source collection
    const source = await ctx.db.get(args.sourceCollectionId);
    if (!source || source.userId !== userId) return [];
    return await ctx.db
      .query("collections")
      .withIndex("by_source", (q) =>
        q.eq("sourceCollectionId", args.sourceCollectionId)
      )
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("collections"),
    name: v.optional(v.string()),
    mode: v.optional(
      v.union(
        v.literal("social_grid"),
        v.literal("social_story"),
        v.literal("appstore_preview")
      )
    ),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    aspectRatio: v.optional(
      v.union(
        v.literal("1:1"),
        v.literal("4:5"),
        v.literal("9:16"),
        v.literal("16:9"),
        v.literal("4:3")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const collection = await ctx.db.get(args.id);
    if (!collection || collection.userId !== userId) throw new Error("Not authorized");
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const collection = await ctx.db.get(args.id);
    if (!collection || collection.userId !== userId) throw new Error("Not authorized");
    // Delete all posts in this collection first
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.id))
      .collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }
    await ctx.db.delete(args.id);
  },
});
