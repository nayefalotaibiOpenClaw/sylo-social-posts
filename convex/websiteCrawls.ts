import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// ─── Shared validators ──────────────────────────────────────────────

const sectionValidator = v.object({
  type: v.string(),
  name: v.string(),
  nameAr: v.optional(v.string()),
  url: v.string(),
  imageUrl: v.optional(v.string()),
  productCount: v.optional(v.number()),
  fetched: v.boolean(),
  fetchedAt: v.optional(v.number()),
  productsFetched: v.optional(v.number()),
});

const productValidator = v.object({
  name: v.string(),
  price: v.optional(v.string()),
  currency: v.optional(v.string()),
  originalPrice: v.optional(v.string()),
  discount: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  sourceUrl: v.string(),
  brand: v.optional(v.string()),
  description: v.optional(v.string()),
  section: v.optional(v.string()),
  savedAsAssetId: v.optional(v.id("assets")),
});

const businessInfoValidator = v.object({
  companyName: v.optional(v.string()),
  description: v.optional(v.string()),
  industry: v.optional(v.string()),
  tone: v.optional(v.string()),
  targetAudience: v.optional(v.string()),
});

// ─── Queries ─────────────────────────────────────────────────────────

export const getByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return null;
    return await ctx.db
      .query("websiteCrawls")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
  },
});

// ─── Mutations ───────────────────────────────────────────────────────

// Create or replace a crawl (called when user starts discovery)
export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    url: v.string(),
    status: v.union(
      v.literal("discovering"),
      v.literal("ready"),
      v.literal("failed")
    ),
    businessInfo: v.optional(businessInfoValidator),
    sections: v.array(sectionValidator),
    discoveredProducts: v.array(productValidator),
    totalProductsFound: v.number(),
    totalProductsFetched: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    // Check for existing crawl for this workspace
    const existing = await ctx.db
      .query("websiteCrawls")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.replace(existing._id, {
        ...args,
        userId,
        lastCrawledAt: now,
        createdAt: existing.createdAt,
      });
      return existing._id;
    }

    return await ctx.db.insert("websiteCrawls", {
      ...args,
      userId,
      lastCrawledAt: now,
      createdAt: now,
    });
  },
});

// Update status
export const updateStatus = mutation({
  args: {
    id: v.id("websiteCrawls"),
    status: v.union(
      v.literal("discovering"),
      v.literal("ready"),
      v.literal("failed")
    ),
    businessInfo: v.optional(businessInfoValidator),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const crawl = await ctx.db.get(args.id);
    if (!crawl || crawl.userId !== userId) throw new Error("Not authorized");
    const updates: Record<string, unknown> = {
      status: args.status,
      lastCrawledAt: Date.now(),
    };
    if (args.businessInfo !== undefined) {
      updates.businessInfo = args.businessInfo;
    }
    await ctx.db.patch(args.id, updates);
  },
});

// Update sections after discovery
export const updateSections = mutation({
  args: {
    id: v.id("websiteCrawls"),
    sections: v.array(sectionValidator),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const crawl = await ctx.db.get(args.id);
    if (!crawl || crawl.userId !== userId) throw new Error("Not authorized");
    await ctx.db.patch(args.id, {
      sections: args.sections,
      lastCrawledAt: Date.now(),
    });
  },
});

// Mark a section as fetched + add discovered products
export const addProducts = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    sectionUrl: v.string(),
    products: v.array(productValidator),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const crawl = await ctx.db
      .query("websiteCrawls")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!crawl) {
      throw new Error("No crawl found for this workspace");
    }

    // Update the matching section
    const updatedSections = crawl.sections.map((section) => {
      if (section.url === args.sectionUrl) {
        return {
          ...section,
          fetched: true,
          fetchedAt: Date.now(),
          productsFetched: args.products.length,
        };
      }
      return section;
    });

    // Append new products to existing list
    const updatedProducts = [...crawl.discoveredProducts, ...args.products];

    // Recalculate totals
    const totalProductsFound = updatedProducts.length;
    const totalProductsFetched = updatedSections.filter((s) => s.fetched).length;

    await ctx.db.patch(crawl._id, {
      sections: updatedSections,
      discoveredProducts: updatedProducts,
      totalProductsFound,
      totalProductsFetched,
      lastCrawledAt: Date.now(),
    });
  },
});

// Mark a product as saved (link to asset ID)
export const markProductSaved = mutation({
  args: {
    crawlId: v.id("websiteCrawls"),
    productSourceUrl: v.string(),
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const crawl = await ctx.db.get(args.crawlId);
    if (!crawl || crawl.userId !== userId) throw new Error("Not authorized");

    const updatedProducts = crawl.discoveredProducts.map((product) => {
      if (product.sourceUrl === args.productSourceUrl) {
        return { ...product, savedAsAssetId: args.assetId };
      }
      return product;
    });

    await ctx.db.patch(args.crawlId, {
      discoveredProducts: updatedProducts,
    });
  },
});

// Remove a product from crawl (dismiss before saving)
export const removeProduct = mutation({
  args: {
    crawlId: v.id("websiteCrawls"),
    productSourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const crawl = await ctx.db.get(args.crawlId);
    if (!crawl || crawl.userId !== userId) throw new Error("Not authorized");

    const updatedProducts = crawl.discoveredProducts.filter(
      (p) => p.sourceUrl !== args.productSourceUrl
    );

    await ctx.db.patch(args.crawlId, {
      discoveredProducts: updatedProducts,
      totalProductsFound: updatedProducts.length,
    });
  },
});

// Remove a crawl
export const remove = mutation({
  args: { id: v.id("websiteCrawls") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const crawl = await ctx.db.get(args.id);
    if (!crawl || crawl.userId !== userId) throw new Error("Not authorized");
    await ctx.db.delete(args.id);
  },
});
