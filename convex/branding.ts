import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

const colorsValidator = v.object({
  primary: v.string(),
  primaryLight: v.string(),
  primaryDark: v.string(),
  accent: v.string(),
  accentLight: v.string(),
  accentLime: v.string(),
  accentGold: v.string(),
  accentOrange: v.string(),
  border: v.string(),
});

export const getByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return null;
    return await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    brandName: v.string(),
    tagline: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    logoDark: v.optional(v.id("_storage")),
    colors: colorsValidator,
    fonts: v.object({
      heading: v.string(),
      body: v.string(),
    }),
    savedPalettes: v.optional(
      v.array(v.object({ name: v.string(), colors: colorsValidator }))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    const existing = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    const data = {
      ...args,
      savedPalettes: args.savedPalettes ?? [],
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("branding", data);
  },
});

export const updateField = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    field: v.string(),
    value: v.any(),
    unset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    const branding = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    if (!branding) throw new Error("Branding not found");
    if (args.unset) {
      // Remove the field by replacing the entire document without it
      const { _id, _creationTime, ...rest } = branding;
      const updated = { ...rest };
      delete (updated as Record<string, unknown>)[args.field];
      await ctx.db.replace(_id, updated);
    } else {
      await ctx.db.patch(branding._id, { [args.field]: args.value });
    }
  },
});

export const updateColors = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    colors: colorsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    const branding = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    if (!branding) throw new Error("Branding not found");
    await ctx.db.patch(branding._id, { colors: args.colors });
  },
});

export const savePalette = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    colors: colorsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Not authorized");
    const branding = await ctx.db
      .query("branding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    if (!branding) throw new Error("Branding not found");

    const palettes = [...branding.savedPalettes, { name: args.name, colors: args.colors }];
    await ctx.db.patch(branding._id, { savedPalettes: palettes });
  },
});
