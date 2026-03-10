import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Convert ratio string like "16:9" to valid Convex key like "r16_9"
function ratioToKey(ratio: string): string {
  return "r" + ratio.replace(":", "_");
}

export const create = mutation({
  args: {
    collectionId: v.id("collections"),
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    title: v.string(),
    componentCode: v.string(),
    language: v.union(v.literal("en"), v.literal("ar")),
    device: v.union(
      v.literal("iphone"),
      v.literal("android"),
      v.literal("ipad"),
      v.literal("android_tablet"),
      v.literal("desktop"),
      v.literal("none")
    ),
    order: v.number(),
    sourcePostId: v.optional(v.id("posts")),
    assetsUsed: v.optional(v.array(v.id("assets"))),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("posts", {
      ...args,
      assetsUsed: args.assetsUsed ?? [],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all posts in a collection, ordered by position
export const listByCollection = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_collection_order", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .collect();
  },
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all variants of a source post
export const getVariants = query({
  args: { sourcePostId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_source_post", (q) =>
        q.eq("sourcePostId", args.sourcePostId)
      )
      .collect();
  },
});

// Update post code (the main editing action)
export const updateCode = mutation({
  args: {
    id: v.id("posts"),
    componentCode: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      componentCode: args.componentCode,
      updatedAt: Date.now(),
    });
  },
});

// Update post metadata
export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    device: v.optional(
      v.union(
        v.literal("iphone"),
        v.literal("android"),
        v.literal("ipad"),
        v.literal("android_tablet"),
        v.literal("desktop"),
        v.literal("none")
      )
    ),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("draft"), v.literal("final"))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

// Reorder posts within a collection (drag and drop)
export const reorder = mutation({
  args: {
    posts: v.array(
      v.object({
        id: v.id("posts"),
        order: v.number(),
        row: v.optional(v.number()),
        col: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const post of args.posts) {
      const updates: Record<string, unknown> = { order: post.order };
      if (post.row !== undefined) updates.row = post.row;
      if (post.col !== undefined) updates.col = post.col;
      await ctx.db.patch(post.id, updates);
    }
  },
});

// Update post code for a specific aspect ratio
export const updateCodeForRatio = mutation({
  args: {
    id: v.id("posts"),
    ratio: v.string(),
    componentCode: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");

    if (args.ratio === "1:1") {
      await ctx.db.patch(args.id, { componentCode: args.componentCode, updatedAt: Date.now() });
    } else {
      const overrides = post.ratioOverrides || {};
      const key = ratioToKey(args.ratio);
      await ctx.db.patch(args.id, {
        ratioOverrides: { ...overrides, [key]: args.componentCode },
        updatedAt: Date.now(),
      });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
