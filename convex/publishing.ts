import { action, internalAction, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { auth } from "./auth";

// ─── Publish a single image post ─────────────────────────────────────
export const publishToSocial = action({
  args: {
    storageId: v.id("_storage"),
    socialAccountId: v.id("socialAccounts"),
    caption: v.string(),
    contentType: v.union(
      v.literal("image"),
      v.literal("carousel"),
      v.literal("reel"),
      v.literal("story"),
    ),
    postId: v.optional(v.id("posts")),
    workspaceId: v.id("workspaces"),
    // For carousel: array of storage IDs
    additionalStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    // Verify authentication and workspace ownership
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const workspace = await ctx.runQuery(internal.publishing.getWorkspace, { id: args.workspaceId });
    if (!workspace || workspace.userId !== userId) throw new Error("Workspace not found");

    // Get the social account with tokens
    const account = await ctx.runQuery(internal.socialAccounts.getWithTokens, {
      id: args.socialAccountId,
    });
    if (!account) throw new Error("Social account not found");
    if (account.status !== "active") throw new Error("Social account is not active");
    if (account.workspaceId !== args.workspaceId) throw new Error("Account does not belong to this workspace");

    // Check token expiry
    if (account.tokenExpiresAt && account.tokenExpiresAt < Date.now()) {
      throw new Error("Access token has expired. Please reconnect the account.");
    }

    // Validate caption length
    if (args.caption.length > 2200) {
      throw new Error("Caption exceeds 2200 character limit");
    }

    // Get public URL for the media
    const mediaUrl = await ctx.storage.getUrl(args.storageId);
    if (!mediaUrl) throw new Error("Media file not found in storage");

    let result: { postId: string; postUrl?: string };

    if (account.provider === "instagram") {
      result = await publishToInstagram({
        accessToken: account.accessToken,
        igUserId: account.providerAccountId!,
        mediaUrl,
        caption: args.caption,
        contentType: args.contentType,
        additionalUrls: args.additionalStorageIds
          ? await Promise.all(
              args.additionalStorageIds.map(async (id) => {
                const url = await ctx.storage.getUrl(id);
                if (!url) throw new Error("Media file not found");
                return url;
              })
            )
          : undefined,
      });
    } else if (account.provider === "facebook") {
      result = await publishToFacebook({
        accessToken: account.accessToken,
        pageId: account.providerPageId!,
        mediaUrl,
        caption: args.caption,
        contentType: args.contentType,
      });
    } else {
      throw new Error(`Publishing to ${account.provider} is not yet supported`);
    }

    // Store in publish history
    await ctx.runMutation(internal.publishing.recordPublish, {
      workspaceId: args.workspaceId,
      userId: account.userId,
      socialAccountId: args.socialAccountId,
      postId: args.postId,
      provider: account.provider,
      contentType: args.contentType,
      providerPostId: result.postId,
      providerPostUrl: result.postUrl,
    });

    // Update lastUsedAt
    await ctx.runMutation(internal.socialAccounts.touchLastUsed, {
      id: args.socialAccountId,
    });

    return result;
  },
});

// ─── Instagram Publishing ────────────────────────────────────────────

async function publishToInstagram(params: {
  accessToken: string;
  igUserId: string;
  mediaUrl: string;
  caption: string;
  contentType: string;
  additionalUrls?: string[];
}): Promise<{ postId: string; postUrl?: string }> {
  const { accessToken, igUserId, mediaUrl, caption, contentType, additionalUrls } = params;
  const baseUrl = "https://graph.facebook.com/v21.0";

  if (contentType === "carousel" && additionalUrls?.length) {
    // Instagram requires 2-10 items for carousels
    const allUrls = [mediaUrl, ...additionalUrls];
    if (allUrls.length < 2) {
      throw new Error("Instagram carousels require at least 2 images");
    }
    if (allUrls.length > 10) {
      throw new Error("Instagram carousels support at most 10 images");
    }

    // Step 1: Create child containers for each image
    const childIds: string[] = [];

    for (const url of allUrls) {
      const res = await fetch(`${baseUrl}/${igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          is_carousel_item: true,
          access_token: accessToken,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(`Instagram API error: ${data.error.message}`);
      childIds.push(data.id);
    }

    // Step 2: Create carousel container
    const containerRes = await fetch(`${baseUrl}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption,
        access_token: accessToken,
      }),
    });
    const containerData = await containerRes.json();
    if (containerData.error) throw new Error(`Instagram API error: ${containerData.error.message}`);

    // Step 3: Wait and publish
    const containerId = containerData.id;
    await waitForContainer(baseUrl, containerId, accessToken);

    const publishRes = await fetch(`${baseUrl}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken,
      }),
    });
    const publishData = await publishRes.json();
    if (publishData.error) throw new Error(`Instagram API error: ${publishData.error.message}`);

    // Fetch permalink (media_publish returns numeric ID, not a shortcode)
    const postUrl = await fetchPermalink(baseUrl, publishData.id, accessToken);

    return {
      postId: publishData.id,
      postUrl,
    };
  }

  // Single image, reel, or story
  const mediaPayload: Record<string, string | boolean> = {
    access_token: accessToken,
  };

  // Stories don't support captions
  if (contentType !== "story") {
    mediaPayload.caption = caption;
  }

  if (contentType === "reel") {
    mediaPayload.media_type = "REELS";
    mediaPayload.video_url = mediaUrl;
  } else if (contentType === "story") {
    mediaPayload.media_type = "STORIES";
    // Stories can be image or video — detect by contentType context
    // For now we use image_url; video stories would use video_url
    mediaPayload.image_url = mediaUrl;
  } else {
    mediaPayload.image_url = mediaUrl;
  }

  // Step 1: Create container
  const containerRes = await fetch(`${baseUrl}/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mediaPayload),
  });
  const containerData = await containerRes.json();
  if (containerData.error) throw new Error(`Instagram API error: ${containerData.error.message}`);

  const containerId = containerData.id;

  // Step 2: Poll until ready
  await waitForContainer(baseUrl, containerId, accessToken);

  // Step 3: Publish
  const publishRes = await fetch(`${baseUrl}/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`Instagram API error: ${publishData.error.message}`);

  // Fetch permalink (media_publish returns numeric ID, not a shortcode)
  const postUrl = await fetchPermalink(baseUrl, publishData.id, accessToken);

  return {
    postId: publishData.id,
    postUrl,
  };
}

async function waitForContainer(baseUrl: string, containerId: string, accessToken: string) {
  const maxAttempts = 60; // 5 minutes at 5s intervals
  for (let i = 0; i < maxAttempts; i++) {
    const statusRes = await fetch(
      `${baseUrl}/${containerId}?fields=status_code&access_token=${accessToken}`
    );
    const statusData = await statusRes.json();

    if (statusData.status_code === "FINISHED") return;
    if (statusData.status_code === "ERROR") {
      throw new Error("Instagram container processing failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("Instagram container processing timed out");
}

async function fetchPermalink(
  baseUrl: string,
  mediaId: string,
  accessToken: string
): Promise<string | undefined> {
  try {
    const res = await fetch(
      `${baseUrl}/${mediaId}?fields=permalink&access_token=${accessToken}`
    );
    const data = await res.json();
    return data.permalink || undefined;
  } catch {
    return undefined;
  }
}

// ─── Facebook Publishing ─────────────────────────────────────────────

async function publishToFacebook(params: {
  accessToken: string;
  pageId: string;
  mediaUrl: string;
  caption: string;
  contentType: string;
}): Promise<{ postId: string; postUrl?: string }> {
  const { accessToken, pageId, mediaUrl, caption, contentType } = params;
  const baseUrl = "https://graph.facebook.com/v21.0";

  if (contentType === "image") {
    const res = await fetch(`${baseUrl}/${pageId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: mediaUrl,
        message: caption,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(`Facebook API error: ${data.error.message}`);

    return {
      postId: data.id || data.post_id,
      postUrl: `https://www.facebook.com/${data.post_id || data.id}`,
    };
  }

  if (contentType === "reel") {
    const res = await fetch(`${baseUrl}/${pageId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: mediaUrl,
        description: caption,
        access_token: accessToken,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(`Facebook API error: ${data.error.message}`);

    return { postId: data.id };
  }

  throw new Error(`Facebook ${contentType} publishing not yet supported`);
}

// ─── Internal helpers ────────────────────────────────────────────────

export const recordPublish = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    socialAccountId: v.id("socialAccounts"),
    postId: v.optional(v.id("posts")),
    scheduledPostId: v.optional(v.id("scheduledPosts")),
    provider: v.union(
      v.literal("facebook"),
      v.literal("instagram"),
      v.literal("tiktok"),
      v.literal("twitter"),
    ),
    contentType: v.string(),
    providerPostId: v.string(),
    providerPostUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("publishHistory", {
      ...args,
      status: "published",
      publishedAt: Date.now(),
    });
  },
});

// ─── Scheduled Posts CRUD ────────────────────────────────────────────

export const schedule = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    postId: v.id("posts"),
    socialAccountId: v.id("socialAccounts"),
    contentType: v.union(
      v.literal("image"),
      v.literal("carousel"),
      v.literal("reel"),
      v.literal("story"),
    ),
    caption: v.string(),
    hashtags: v.optional(v.array(v.string())),
    mediaFileIds: v.array(v.id("_storage")),
    scheduledFor: v.number(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify workspace ownership
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) throw new Error("Workspace not found");

    // Validate caption length
    if (args.caption.length > 2200) throw new Error("Caption exceeds 2200 character limit");

    // Validate scheduledFor is in the future
    if (args.scheduledFor <= Date.now()) throw new Error("Scheduled time must be in the future");

    const now = Date.now();
    return await ctx.db.insert("scheduledPosts", {
      ...args,
      userId,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const cancelScheduled = mutation({
  args: { id: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.id);
    if (!post || post.userId !== userId) throw new Error("Not found");
    if (post.status !== "scheduled") throw new Error("Can only cancel scheduled posts");

    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });
  },
});

export const listScheduled = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Verify workspace ownership
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return [];

    return await ctx.db
      .query("scheduledPosts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const listHistory = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Verify workspace ownership
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.userId !== userId) return [];

    return await ctx.db
      .query("publishHistory")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

// ─── Process scheduled posts (called by cron) ───────────────────────

export const processScheduledPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find due posts
    const duePosts = await ctx.runQuery(internal.publishing.findDuePosts, {
      now,
    });

    for (const post of duePosts) {
      try {
        // Atomically mark as publishing — claimScheduledPost returns false
        // if the post was already claimed by another cron instance
        const claimed = await ctx.runMutation(internal.publishing.claimScheduledPost, {
          id: post._id,
        });
        if (!claimed) continue;

        // Get media URLs
        const mediaUrls: string[] = [];
        for (const fileId of post.mediaFileIds) {
          const url = await ctx.storage.getUrl(fileId);
          if (url) mediaUrls.push(url);
        }

        if (mediaUrls.length === 0) {
          throw new Error("No media files found");
        }

        // Get social account
        const account = await ctx.runQuery(internal.socialAccounts.getWithTokens, {
          id: post.socialAccountId,
        });
        if (!account || account.status !== "active") {
          throw new Error("Social account not available");
        }

        let result: { postId: string; postUrl?: string };

        if (account.provider === "instagram") {
          result = await publishToInstagram({
            accessToken: account.accessToken,
            igUserId: account.providerAccountId!,
            mediaUrl: mediaUrls[0],
            caption: post.caption,
            contentType: post.contentType,
            additionalUrls: mediaUrls.length > 1 ? mediaUrls.slice(1) : undefined,
          });
        } else if (account.provider === "facebook") {
          result = await publishToFacebook({
            accessToken: account.accessToken,
            pageId: account.providerPageId!,
            mediaUrl: mediaUrls[0],
            caption: post.caption,
            contentType: post.contentType,
          });
        } else {
          throw new Error(`Provider ${account.provider} not supported`);
        }

        // Mark as published
        await ctx.runMutation(internal.publishing.updateScheduledStatus, {
          id: post._id,
          status: "published",
          providerPostId: result.postId,
          providerPostUrl: result.postUrl,
        });

        // Record in history
        await ctx.runMutation(internal.publishing.recordPublish, {
          workspaceId: post.workspaceId,
          userId: post.userId,
          socialAccountId: post.socialAccountId,
          postId: post.postId,
          scheduledPostId: post._id,
          provider: account.provider,
          contentType: post.contentType,
          providerPostId: result.postId,
          providerPostUrl: result.postUrl,
        });

        await ctx.runMutation(internal.socialAccounts.touchLastUsed, {
          id: post.socialAccountId,
        });
      } catch (error) {
        const retryCount = (post.retryCount ?? 0) + 1;
        await ctx.runMutation(internal.publishing.updateScheduledStatus, {
          id: post._id,
          status: retryCount >= 3 ? "failed" : "scheduled",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          retryCount,
        });
      }
    }
  },
});

export const getWorkspace = internalQuery({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const findDuePosts = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduledPosts")
      .withIndex("by_status_scheduled", (q) =>
        q.eq("status", "scheduled").lte("scheduledFor", args.now)
      )
      .take(50);
  },
});

// Atomically claim a scheduled post for processing (prevents duplicate publishing)
export const claimScheduledPost = internalMutation({
  args: { id: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    // Only claim if still in "scheduled" status
    if (!post || post.status !== "scheduled") return false;
    await ctx.db.patch(args.id, {
      status: "publishing",
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const updateScheduledStatus = internalMutation({
  args: {
    id: v.id("scheduledPosts"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    providerPostId: v.optional(v.string()),
    providerPostUrl: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const patch: Record<string, unknown> = {
      ...updates,
      updatedAt: Date.now(),
    };
    if (args.status === "published") {
      patch.publishedAt = Date.now();
    }
    await ctx.db.patch(id, patch);
  },
});
