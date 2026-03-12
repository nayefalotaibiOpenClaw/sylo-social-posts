import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// List connected accounts for a workspace
export const listByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Verify workspace ownership
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return [];

    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Strip tokens from client response
    return accounts.map(({ accessToken, refreshToken, ...rest }) => rest);
  },
});

// Get a single account (without tokens)
export const get = query({
  args: { id: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) return null;

    const { accessToken, refreshToken, ...rest } = account;
    return rest;
  },
});

// Internal: get account with tokens (for publishing actions)
export const getWithTokens = internalQuery({
  args: { id: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Store a connected social account (called from OAuth callback)
export const connect = internalMutation({
  args: {
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    provider: v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("twitter"),
    ),
    providerUserId: v.string(),
    providerPageId: v.optional(v.string()),
    providerAccountId: v.optional(v.string()),
    providerAccountName: v.string(),
    providerAccountImage: v.optional(v.string()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    scopes: v.array(v.string()),
    canPublishPosts: v.boolean(),
    canPublishStories: v.boolean(),
    canPublishReels: v.boolean(),
    canReadInsights: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if account already exists for this workspace+provider+account
    const existing = args.providerAccountId
      ? await ctx.db
          .query("socialAccounts")
          .withIndex("by_provider_account", (q) =>
            q.eq("provider", args.provider).eq("providerAccountId", args.providerAccountId)
          )
          .first()
      : null;

    if (existing && existing.workspaceId === args.workspaceId) {
      // Update existing account
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        tokenExpiresAt: args.tokenExpiresAt,
        scopes: args.scopes,
        canPublishPosts: args.canPublishPosts,
        canPublishStories: args.canPublishStories,
        canPublishReels: args.canPublishReels,
        canReadInsights: args.canReadInsights,
        status: "active",
        providerAccountName: args.providerAccountName,
        providerAccountImage: args.providerAccountImage,
      });
      return existing._id;
    }

    return await ctx.db.insert("socialAccounts", {
      ...args,
      status: "active",
      connectedAt: Date.now(),
    });
  },
});

// Disconnect (revoke) a social account
export const disconnect = mutation({
  args: { id: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(args.id, { status: "revoked" });
  },
});

// Delete a social account entirely
export const remove = mutation({
  args: { id: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) {
      throw new Error("Account not found");
    }

    await ctx.db.delete(args.id);
  },
});

// Internal: update token after refresh
export const updateToken = internalMutation({
  args: {
    id: v.id("socialAccounts"),
    accessToken: v.string(),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      accessToken: args.accessToken,
      tokenExpiresAt: args.tokenExpiresAt,
    });
  },
});

// Internal: update token with refresh token (for providers like X that rotate refresh tokens)
export const updateTokenWithRefresh = internalMutation({
  args: {
    id: v.id("socialAccounts"),
    accessToken: v.string(),
    refreshToken: v.string(),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      tokenExpiresAt: args.tokenExpiresAt,
    });
  },
});

// Internal: mark account as expired
export const markExpired = internalMutation({
  args: { id: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "expired" });
  },
});

// Update lastUsedAt timestamp
export const touchLastUsed = internalMutation({
  args: { id: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastUsedAt: Date.now() });
  },
});

// Internal: find accounts with tokens expiring soon (for cron refresh)
// Uses 7-day window for Meta tokens and 3-hour window for X tokens.
// Since this runs hourly, we use the larger window to catch both.
export const findExpiringSoon = internalQuery({
  args: {},
  handler: async (ctx) => {
    const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // Get all active accounts and filter those expiring within 7 days (covers both Meta 60-day and X 2-hour tokens)
    const accounts = await ctx.db
      .query("socialAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.neq(q.field("tokenExpiresAt"), undefined),
          q.lt(q.field("tokenExpiresAt"), sevenDaysFromNow)
        )
      )
      .take(100);

    return accounts;
  },
});

// Internal: revoke all accounts for a provider user (deauthorize callback)
export const revokeByProviderUser = internalMutation({
  args: { providerUserId: v.string() },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("socialAccounts")
      .filter((q) => q.eq(q.field("providerUserId"), args.providerUserId))
      .collect();

    for (const account of accounts) {
      await ctx.db.patch(account._id, { status: "revoked" });
    }
  },
});

// Internal: delete all accounts for a provider user (data deletion callback)
export const deleteByProviderUser = internalMutation({
  args: { providerUserId: v.string() },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("socialAccounts")
      .filter((q) => q.eq(q.field("providerUserId"), args.providerUserId))
      .collect();

    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }
  },
});
