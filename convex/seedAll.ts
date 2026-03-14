import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Seed workspace, branding, collection, and posts for a specific user.
// Run via: npx convex run seedAll:run '{"userId":"...", "posts":[...]}'
export const run = internalMutation({
  args: {
    userId: v.id("users"),
    posts: v.array(
      v.object({
        title: v.string(),
        componentCode: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = args.userId;

    // Check if workspace already exists for this user
    let workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const workspaceId =
      workspace?._id ??
      (await ctx.db.insert("workspaces", {
        userId,
        name: "Sylo",
        slug: "sylo",
        industry: "restaurant",
        website: "https://sylo.app",
        defaultLanguage: "ar",
        createdAt: now,
      }));

    // Create branding if not exists
    const existingBranding = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .first();

    if (!existingBranding) {
      await ctx.db.insert("branding", {
        workspaceId,
        brandName: "Sylo",
        tagline: "Restaurant Management System",
        colors: {
          primary: "#1B4332",
          primaryLight: "#EAF4EE",
          primaryDark: "#0D241C",
          accent: "#40916C",
          accentLight: "#52B788",
          accentLime: "#B7FF5B",
          accentGold: "#FCD34D",
          accentOrange: "#F4A261",
          border: "#254d3c",
        },
        fonts: { heading: "Cairo", body: "Cairo" },
        savedPalettes: [],
      });
    }

    // Create collection if not exists
    let collection = await ctx.db
      .query("collections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .first();

    const collectionId =
      collection?._id ??
      (await ctx.db.insert("collections", {
        workspaceId,
        userId,
        name: "Instagram Grid - Arabic",
        mode: "social_grid",
        platform: "instagram",
        device: "iphone",
        language: "ar",
        aspectRatio: "1:1",
        createdAt: now,
      }));

    // Check if posts already exist
    const existingPost = await ctx.db
      .query("posts")
      .withIndex("by_collection", (q) => q.eq("collectionId", collectionId))
      .first();

    if (existingPost) {
      return {
        message: "Already seeded",
        userId,
        workspaceId,
        collectionId,
        postsCount: 0,
      };
    }

    // Insert all posts
    for (const post of args.posts) {
      await ctx.db.insert("posts", {
        collectionId,
        workspaceId,
        userId,
        title: post.title,
        componentCode: post.componentCode,
        language: "ar",
        device: "iphone",
        order: post.order,
        assetsUsed: [],
        tags: ["feature"],
        status: "final",
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      message: `Seeded ${args.posts.length} posts`,
      userId,
      workspaceId,
      collectionId,
      postsCount: args.posts.length,
    };
  },
});
