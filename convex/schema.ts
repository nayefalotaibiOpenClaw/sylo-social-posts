import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Auth tables (managed by Convex Auth) ────────────
  ...authTables,

  // ─── Users (extends auth's users table) ──────────────
  users: defineTable({
    // Fields managed by Convex Auth:
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields:
    plan: v.optional(v.union(v.literal("trial"), v.literal("starter"), v.literal("pro"))),
    createdAt: v.optional(v.number()),
  })
    .index("email", ["email"]),

  // ─── Workspaces ──────────────────────────────────────
  workspaces: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    defaultLanguage: v.union(v.literal("en"), v.literal("ar")),
    websiteInfo: v.optional(v.object({
      companyName: v.optional(v.string()),
      description: v.optional(v.string()),
      industry: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      targetAudience: v.optional(v.string()),
      tone: v.optional(v.string()),
      contact: v.optional(v.object({
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        address: v.optional(v.string()),
        socialMedia: v.optional(v.array(v.string())),
      })),
      ogImage: v.optional(v.string()),
      rawContent: v.optional(v.string()),
      // Legacy fields from older format
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      fetchedAt: v.optional(v.number()),
    })),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  // ─── Branding ────────────────────────────────────────
  branding: defineTable({
    workspaceId: v.id("workspaces"),
    brandName: v.string(),
    tagline: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    logoDark: v.optional(v.id("_storage")),
    colors: v.object({
      primary: v.string(),
      primaryLight: v.string(),
      primaryDark: v.string(),
      accent: v.string(),
      accentLight: v.string(),
      accentLime: v.string(),
      accentGold: v.string(),
      accentOrange: v.string(),
      border: v.string(),
    }),
    fonts: v.object({
      heading: v.string(),
      body: v.string(),
    }),
    savedPalettes: v.array(
      v.object({
        name: v.string(),
        colors: v.object({
          primary: v.string(),
          primaryLight: v.string(),
          primaryDark: v.string(),
          accent: v.string(),
          accentLight: v.string(),
          accentLime: v.string(),
          accentGold: v.string(),
          accentOrange: v.string(),
          border: v.string(),
        }),
      })
    ),
  }).index("by_workspace", ["workspaceId"]),

  // ─── Assets ──────────────────────────────────────────
  // Assets can be global (account-level) or workspace-specific.
  // Global assets: workspaceId is undefined, visible across all workspaces.
  // Workspace assets: tied to a specific workspace.
  assets: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    userId: v.id("users"),
    scope: v.union(v.literal("global"), v.literal("workspace")),
    fileId: v.id("_storage"),
    fileName: v.string(),
    type: v.union(
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
    ),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    aiAnalysis: v.optional(v.string()),
    analyzingStatus: v.optional(v.union(v.literal("pending"), v.literal("done"), v.literal("failed"))),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_type", ["workspaceId", "type"])
    .index("by_user", ["userId"])
    .index("by_user_scope", ["userId", "scope"]),

  // ─── Collections ─────────────────────────────────────
  collections: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
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
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_mode", ["workspaceId", "mode"])
    .index("by_source", ["sourceCollectionId"]),

  // ─── Posts ───────────────────────────────────────────
  posts: defineTable({
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
    row: v.optional(v.number()),
    col: v.optional(v.number()),
    sourcePostId: v.optional(v.id("posts")),
    assetsUsed: v.array(v.id("assets")),
    tags: v.optional(v.array(v.string())),
    configOverrides: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("final")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_collection_order", ["collectionId", "order"])
    .index("by_workspace", ["workspaceId"])
    .index("by_source_post", ["sourcePostId"]),

  // ─── Variant Groups ─────────────────────────────────
  variantGroups: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    sourcePostId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_source_post", ["sourcePostId"]),

  // ─── Variant Links ──────────────────────────────────
  variantLinks: defineTable({
    variantGroupId: v.id("variantGroups"),
    postId: v.id("posts"),
    changes: v.array(
      v.union(
        v.literal("language"),
        v.literal("device"),
        v.literal("size")
      )
    ),
  })
    .index("by_group", ["variantGroupId"])
    .index("by_post", ["postId"]),

  // ─── Subscriptions ──────────────────────────────────
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(v.literal("trial"), v.literal("starter"), v.literal("pro")),
    billingPeriod: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    aiTokensLimit: v.number(),
    aiTokensUsed: v.number(),
    postsLimit: v.number(),
    postsUsed: v.number(),
    amountPaid: v.number(),
    currency: v.string(),
    paymentId: v.optional(v.string()),
    upaymentOrderId: v.optional(v.string()),
    startsAt: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_payment", ["upaymentOrderId"]),

  // ─── Payments ──────────────────────────────────────
  payments: defineTable({
    userId: v.id("users"),
    orderId: v.string(),
    plan: v.union(v.literal("starter"), v.literal("pro")),
    billingPeriod: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    upaymentTransactionId: v.optional(v.string()),
    upaymentTrackId: v.optional(v.string()),
    subscriptionId: v.optional(v.id("subscriptions")),
    metadata: v.optional(v.string()),        // JSON string for extra data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_order", ["orderId"])
    .index("by_status", ["userId", "status"]),

  // ─── Generations ─────────────────────────────────────
  generations: defineTable({
    workspaceId: v.id("workspaces"),
    collectionId: v.optional(v.id("collections")),
    userId: v.id("users"),
    prompt: v.string(),
    type: v.union(
      v.literal("new"),
      v.literal("variant_language"),
      v.literal("variant_device"),
      v.literal("variant_size")
    ),
    sourcePostId: v.optional(v.id("posts")),
    config: v.object({
      features: v.optional(v.array(v.string())),
      style: v.optional(v.string()),
      targetLanguage: v.optional(v.string()),
      targetDevice: v.optional(v.string()),
      assetsIncluded: v.array(v.id("assets")),
    }),
    resultPostId: v.optional(v.id("posts")),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
});
