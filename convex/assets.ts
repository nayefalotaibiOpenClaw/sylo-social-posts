import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const assetTypeValidator = v.union(
  v.literal("iphone"),
  v.literal("ipad"),
  v.literal("desktop"),
  v.literal("android_phone"),
  v.literal("android_tablet"),
  v.literal("product"),
  v.literal("background"),
  v.literal("logo"),
  v.literal("screenshot"),
  v.literal("icon"),
  v.literal("other")
);

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getStorageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Upload asset — either global (account-level) or workspace-specific
export const create = mutation({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    userId: v.id("users"),
    scope: v.union(v.literal("global"), v.literal("workspace")),
    fileId: v.id("_storage"),
    fileName: v.string(),
    type: assetTypeValidator,
    label: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.scope === "workspace" && !args.workspaceId) {
      throw new Error("workspaceId required for workspace-scoped assets");
    }
    return await ctx.db.insert("assets", {
      ...args,
      analyzingStatus: "pending",
      createdAt: Date.now(),
    });
  },
});

// Get all assets available to a workspace (workspace-specific + user's global assets)
export const listForWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Workspace-specific assets
    const workspaceAssets = await ctx.db
      .query("assets")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // User's global assets
    const globalAssets = await ctx.db
      .query("assets")
      .withIndex("by_user_scope", (q) =>
        q.eq("userId", args.userId).eq("scope", "global")
      )
      .collect();

    const all = [...workspaceAssets, ...globalAssets];

    // Deduplicate by _id (in case of overlap)
    const seen = new Set<string>();
    const unique = all.filter((a) => {
      if (seen.has(a._id)) return false;
      seen.add(a._id);
      return true;
    });

    return await Promise.all(
      unique.map(async (asset) => ({
        ...asset,
        url: await ctx.storage.getUrl(asset.fileId),
      }))
    );
  },
});

// Get only global assets for account settings
export const listGlobal = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .withIndex("by_user_scope", (q) =>
        q.eq("userId", args.userId).eq("scope", "global")
      )
      .collect();

    return await Promise.all(
      assets.map(async (asset) => ({
        ...asset,
        url: await ctx.storage.getUrl(asset.fileId),
      }))
    );
  },
});

// Filter by type within a workspace (includes global)
export const listByType = query({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    type: assetTypeValidator,
  },
  handler: async (ctx, args) => {
    // Workspace assets of this type
    const workspaceAssets = await ctx.db
      .query("assets")
      .withIndex("by_workspace_type", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("type", args.type)
      )
      .collect();

    // Global assets of this type
    const globalAssets = (await ctx.db
      .query("assets")
      .withIndex("by_user_scope", (q) =>
        q.eq("userId", args.userId).eq("scope", "global")
      )
      .collect()
    ).filter((a) => a.type === args.type);

    const all = [...workspaceAssets, ...globalAssets];

    return await Promise.all(
      all.map(async (asset) => ({
        ...asset,
        url: await ctx.storage.getUrl(asset.fileId),
      }))
    );
  },
});

export const remove = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.id);
    if (asset) {
      await ctx.storage.delete(asset.fileId);
      await ctx.db.delete(args.id);
    }
  },
});

// Reset analysis status so it can be retried
export const resetAnalysis = mutation({
  args: { id: v.id("assets") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      analyzingStatus: "pending",
      description: undefined,
      aiAnalysis: undefined,
    });
  },
});

// Update asset with AI analysis results
export const updateAnalysis = mutation({
  args: {
    id: v.id("assets"),
    description: v.string(),
    aiAnalysis: v.string(),
    analyzingStatus: v.union(v.literal("done"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      description: args.description,
      aiAnalysis: args.aiAnalysis,
      analyzingStatus: args.analyzingStatus,
    });
  },
});

// Background action: analyze uploaded image with AI vision
export const analyzeImage = action({
  args: {
    assetId: v.id("assets"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    assetType: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      await ctx.runMutation(api.assets.updateAnalysis, {
        id: args.assetId,
        description: "",
        aiAnalysis: "",
        analyzingStatus: "failed",
      });
      return;
    }

    try {
      // Get the image URL from Convex storage
      const imageUrl = await ctx.storage.getUrl(args.storageId);
      if (!imageUrl) throw new Error("Could not get image URL");

      // Fetch the image as base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const uint8Array = new Uint8Array(imageBuffer);
      // Chunk the conversion to avoid stack overflow on large images
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        binary += String.fromCharCode(...uint8Array.slice(i, i + chunkSize));
      }
      const base64Image = btoa(binary);

      const mimeType = imageResponse.headers.get("content-type") || "image/png";

      // Call Gemini Vision API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64Image,
                    },
                  },
                  {
                    text: `You are an AI asset analyzer for a social media design tool. Analyze this image which has been uploaded as type: "${args.assetType}", filename: "${args.fileName}".

Provide two things:

1. **Description** (1-2 sentences): A concise human-readable description of what this image shows.

2. **AI Analysis** (detailed): A structured analysis that will help an AI post generator use this asset effectively. Include:
   - What the image contains (UI elements, products, people, text, colors, layout)
   - If it's a screenshot: what app/screen is shown, key UI elements visible, data displayed
   - If it's a product: what product, its appearance, colors, style
   - If it's a logo/icon: the brand, colors, style
   - If it's a background: mood, colors, patterns, suitable use cases
   - Suggested use cases for social media posts (e.g. "good for feature showcase", "use as hero image")
   - Any text visible in the image (transcribe it)
   - Color palette observed

Respond in this exact JSON format:
{"description": "...", "aiAnalysis": "..."}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        await ctx.runMutation(api.assets.updateAnalysis, {
          id: args.assetId,
          description: parsed.description || "",
          aiAnalysis: parsed.aiAnalysis || "",
          analyzingStatus: "done",
        });
      } else {
        // Fallback: use the raw text as description
        await ctx.runMutation(api.assets.updateAnalysis, {
          id: args.assetId,
          description: text.slice(0, 200),
          aiAnalysis: text,
          analyzingStatus: "done",
        });
      }
    } catch (error) {
      console.error("Failed to analyze image:", error);
      await ctx.runMutation(api.assets.updateAnalysis, {
        id: args.assetId,
        description: "",
        aiAnalysis: "",
        analyzingStatus: "failed",
      });
    }
  },
});
