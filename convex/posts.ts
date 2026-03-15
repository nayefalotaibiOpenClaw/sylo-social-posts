import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Convert ratio string like "16:9" to valid Convex key like "r16_9"
function ratioToKey(ratio: string): string {
  return "r" + ratio.replace(":", "_");
}

export const create = mutation({
  args: {
    collectionId: v.id("collections"),
    workspaceId: v.id("workspaces"),
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
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    const now = Date.now();
    return await ctx.db.insert("posts", {
      ...args,
      userId,
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
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("posts")
      .withIndex("by_collection_order", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .take(500);
  },
});

// Paginated: 18 posts per page, cursor-based
export const listByCollectionPaginated = query({
  args: {
    collectionId: v.id("collections"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "" };
    }
    return await ctx.db
      .query("posts")
      .withIndex("by_collection_order", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .paginate(args.paginationOpts);
  },
});

// Count posts in a collection (lightweight)
export const countByCollection = query({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return 0;
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_collection_order", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .take(10000);
    return posts.length;
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
      .query("posts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(500);
  },
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) return null;
    return post;
  },
});

// Get all variants of a source post
export const getVariants = query({
  args: { sourcePostId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    // Verify ownership of the source post
    const source = await ctx.db.get(args.sourcePostId);
    if (!source || source.userId !== userId) return [];
    return await ctx.db
      .query("posts")
      .withIndex("by_source_post", (q) =>
        q.eq("sourcePostId", args.sourcePostId)
      )
      .take(100);
  },
});

// Update post code (the main editing action)
export const updateCode = mutation({
  args: {
    id: v.id("posts"),
    componentCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) throw new Error("Not authorized");
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
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) throw new Error("Not authorized");
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
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    for (const post of args.posts) {
      const existing = await ctx.db.get(post.id);
      if (!existing || existing.userId !== userId) throw new Error("Not authorized");
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
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) throw new Error("Not authorized");

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

// Create multiple posts at the TOP of a collection (order 0..N-1),
// shifting all existing posts' order up by N so newest are always first.
export const createBatch = mutation({
  args: {
    collectionId: v.id("collections"),
    workspaceId: v.id("workspaces"),
    language: v.union(v.literal("en"), v.literal("ar")),
    posts: v.array(
      v.object({
        title: v.string(),
        componentCode: v.string(),
        device: v.union(
          v.literal("iphone"),
          v.literal("android"),
          v.literal("ipad"),
          v.literal("android_tablet"),
          v.literal("desktop"),
          v.literal("none")
        ),
        caption: v.optional(v.string()),
        imageKeywords: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    const newCount = args.posts.length;

    // Shift all existing posts' order up by newCount
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_collection_order", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .collect();
    for (const post of existing) {
      await ctx.db.patch(post._id, { order: post.order + newCount });
    }

    // Insert new posts at order 0..N-1
    const now = Date.now();
    const ids = [];
    for (let i = 0; i < newCount; i++) {
      const id = await ctx.db.insert("posts", {
        collectionId: args.collectionId,
        workspaceId: args.workspaceId,
        userId,
        title: args.posts[i].title,
        componentCode: args.posts[i].componentCode,
        caption: args.posts[i].caption,
        imageKeywords: args.posts[i].imageKeywords,
        language: args.language,
        device: args.posts[i].device,
        order: i,
        assetsUsed: [],
        status: "draft",
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) throw new Error("Not authorized");
    await ctx.db.delete(args.id);
  },
});

export const removeBatch = mutation({
  args: { ids: v.array(v.id("posts")) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    for (const id of args.ids) {
      const post = await ctx.db.get(id);
      if (!post || post.userId !== userId) throw new Error("Not authorized");
      await ctx.db.delete(id);
    }
  },
});
