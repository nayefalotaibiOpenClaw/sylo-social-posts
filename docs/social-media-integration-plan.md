# Social Media Publishing Integration Plan

## Overview

Enable users to connect their social media accounts (Instagram, Facebook — later TikTok, X/Twitter), grant publishing permissions, and publish/schedule posts directly from Sylo.

Posts are TSX components rendered in the browser. To publish, they must be exported as PNG/MP4, uploaded to Convex storage for a public URL, then sent to the platform's API.

## Architecture

```
+---------------------------------------------------+
|                    Sylo App                        |
+--------------------------+------------------------+
|  OAuth Layer             |  Publishing Layer      |
|  /api/social-auth/[provider] | /api/publish/[provider] |
|  Token management        |  Content upload        |
|  Permission checks       |  Scheduling queue      |
+--------------------------+------------------------+
|            Provider Adapters (pluggable)           |
|  +------+ +---------+ +------+ +---------+        |
|  | Meta | |Instagram| |TikTok| |X/Twitter |        |
|  +------+ +---------+ +------+ +---------+        |
+--------------------------+------------------------+
|               Convex Backend                       |
|  socialAccounts | scheduledPosts | publishHistory  |
+---------------------------------------------------+
```

## Media Pipeline

Posts are TSX components rendered client-side. Publishing requires converting them to publicly accessible media:

```
Browser render -> html-to-image toPng() -> Blob -> Upload to Convex _storage -> Public URL -> Meta API
```

### Step-by-step:

1. User clicks "Publish" or "Schedule" on a post
2. Client: `toPng(ref, { pixelRatio: 2 })` captures the rendered post as data URL
3. Client: Convert data URL to Blob
4. Client: Call `generateUploadUrl` mutation (Convex storage)
5. Client: `fetch(uploadUrl, { method: "POST", body: blob })` returns storageId
6. Client: Call Convex action `publishing.publishToSocial` with `{ storageId, socialAccountId, caption, contentType }`
7. Server (Convex action):
   - Get public URL: `ctx.storage.getUrl(storageId)`
   - Call Meta API with that URL
   - For Instagram: create container -> poll status -> publish
   - Store result in `publishHistory`

### Carousels

- Capture each post in collection as separate PNG blob
- Upload all to Convex storage
- Instagram: create child containers for each -> parent carousel container -> publish

### Reels/Stories (video)

- Use existing mp4-muxer export -> MP4 blob
- Upload to Convex storage
- Instagram: `media_type=REELS` or `STORIES` with `video_url`

## Phase 1: Database Schema (Convex)

### New Tables

```ts
socialAccounts: defineTable({
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

  status: v.union(
    v.literal("active"),
    v.literal("expired"),
    v.literal("revoked"),
  ),
  connectedAt: v.number(),
  lastUsedAt: v.optional(v.number()),
})
.index("by_user", ["userId"])
.index("by_workspace", ["workspaceId"])
.index("by_workspace_provider", ["workspaceId", "provider"])
.index("by_provider_account", ["provider", "providerAccountId"])

scheduledPosts: defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
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
  mediaUrls: v.optional(v.array(v.string())),

  scheduledFor: v.number(),
  timezone: v.string(),

  status: v.union(
    v.literal("scheduled"),
    v.literal("publishing"),
    v.literal("published"),
    v.literal("failed"),
    v.literal("cancelled"),
  ),
  publishedAt: v.optional(v.number()),
  providerPostId: v.optional(v.string()),
  providerPostUrl: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  retryCount: v.optional(v.number()),

  createdAt: v.number(),
  updatedAt: v.number(),
})
.index("by_workspace", ["workspaceId"])
.index("by_status_scheduled", ["status", "scheduledFor"])
.index("by_social_account", ["socialAccountId"])
.index("by_post", ["postId"])

publishHistory: defineTable({
  workspaceId: v.id("workspaces"),
  userId: v.id("users"),
  socialAccountId: v.id("socialAccounts"),
  scheduledPostId: v.optional(v.id("scheduledPosts")),
  postId: v.optional(v.id("posts")),

  provider: v.union(
    v.literal("facebook"),
    v.literal("instagram"),
    v.literal("tiktok"),
    v.literal("twitter"),
  ),
  contentType: v.string(),
  providerPostId: v.string(),
  providerPostUrl: v.optional(v.string()),

  status: v.union(
    v.literal("published"),
    v.literal("deleted"),
    v.literal("failed"),
  ),
  publishedAt: v.number(),

  metrics: v.optional(v.object({
    likes: v.optional(v.number()),
    comments: v.optional(v.number()),
    shares: v.optional(v.number()),
    reach: v.optional(v.number()),
    impressions: v.optional(v.number()),
    fetchedAt: v.number(),
  })),
})
.index("by_workspace", ["workspaceId"])
.index("by_social_account", ["socialAccountId"])
.index("by_provider_post", ["provider", "providerPostId"])
```

## Phase 2: Meta OAuth Flow

### Strategy

Use Facebook Login for both Facebook + Instagram access in one OAuth flow. Instagram requires a Business/Creator account linked to a Facebook Page.

### Required Scopes

```ts
const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "read_insights",
  "instagram_manage_insights",
];
```

### API Routes

```
app/api/social-auth/
  meta/
    authorize/route.ts      -- Redirect to FB OAuth
    callback/route.ts       -- Handle code -> tokens -> store
    disconnect/route.ts     -- Revoke + delete
  tiktok/                   -- Future
  twitter/                  -- Future
  refresh/route.ts          -- Token refresh endpoint
```

### OAuth Flow

1. User clicks "Connect Instagram/Facebook"
2. `GET /api/social-auth/meta/authorize`
   -> Redirect to `https://www.facebook.com/v21.0/dialog/oauth`
   with `client_id`, `redirect_uri`, `scope`, `state` (encrypted: userId, workspaceId, csrf)
3. User grants permissions on Facebook
4. `GET /api/social-auth/meta/callback?code=XXX&state=YYY`
   a. Verify state (CSRF)
   b. Exchange code -> short-lived token
   c. Exchange short -> long-lived user token (~60 days)
   d. `GET /me/accounts` -> list Facebook Pages
   e. For each Page: get never-expiring Page token
   f. `GET /{page-id}?fields=instagram_business_account` -> get IG account
   g. Store `socialAccount` records in Convex
   h. Redirect to workspace settings with success

### Token Lifetimes

| Token Type              | Lifetime        | How to Get                                |
|-------------------------|-----------------|-------------------------------------------|
| Short-lived user token  | ~1-2 hours      | Code exchange                             |
| Long-lived user token   | ~60 days        | Exchange short-lived token                |
| Long-lived page token   | Never expires   | `GET /{user-id}/accounts` with long-lived |

### Token Refresh (Convex Cron)

Daily cron job finds tokens expiring within 7 days and refreshes them. If refresh fails, mark account as `expired` and notify user.

## Phase 3: Publishing Pipeline

### Instagram Publishing (2-step container model)

1. `POST /{ig-user-id}/media` with `image_url` (public URL) + `caption` -> container_id
2. Poll `GET /{container_id}?fields=status_code` every 5s until `FINISHED` (max 5min)
3. `POST /{ig-user-id}/media_publish` with `creation_id` -> published post ID
4. Store in `publishHistory`

### Content Type Support

| Type     | Instagram               | Facebook              | TikTok (future) | X (future)   |
|----------|-------------------------|-----------------------|-----------------|--------------|
| Image    | `image_url`             | `/{page}/photos`      | Video API       | Media upload |
| Carousel | `CAROUSEL` (2-10 items) | Multi-photo post      | N/A             | Multi-image  |
| Reel     | `REELS` + `video_url`   | `/{page}/videos`      | Video upload    | Video upload |
| Story    | `STORIES`               | Stories API           | N/A             | N/A          |

### Rate Limits

- Instagram: 100 API-published posts per 24h rolling window
- Containers expire after 24h if not published
- Facebook scheduling: must be 10min-30days in the future

## Phase 4: Scheduling System

### For Instagram (no native scheduling API)

- Store `scheduledPost` with `scheduledFor` timestamp
- Convex cron runs every minute, finds due posts, triggers publish action

### For Facebook (native scheduling)

- Use `published=false` + `scheduled_publish_time` parameter
- Or use our own scheduler for consistency

### Convex Cron

```ts
crons.interval("process-scheduled-posts", { minutes: 1 }, async (ctx) => {
  // Find posts where status=scheduled AND scheduledFor <= now
  // Trigger internal.publishing.publishPost for each
});
```

## Phase 5: Provider Adapter Pattern

Pluggable interface for adding new platforms:

```ts
interface SocialProvider {
  id: string;
  name: string;
  getAuthUrl(params: AuthParams): string;
  exchangeCode(code: string): Promise<TokenSet>;
  refreshToken(token: string): Promise<TokenSet>;
  publishImage(account: SocialAccount, media: MediaPayload): Promise<PublishResult>;
  publishCarousel(account: SocialAccount, media: MediaPayload[]): Promise<PublishResult>;
  publishVideo(account: SocialAccount, media: MediaPayload): Promise<PublishResult>;
  publishStory(account: SocialAccount, media: MediaPayload): Promise<PublishResult>;
  getPostMetrics(account: SocialAccount, postId: string): Promise<Metrics>;
}
```

Implementations:
- `lib/social-providers/meta.ts` -- Facebook + Instagram
- `lib/social-providers/tiktok.ts` -- future
- `lib/social-providers/twitter.ts` -- future

## Phase 6: UI Components

```
app/components/social/
  ConnectAccountButton.tsx    -- "Connect Instagram" / "Connect Facebook"
  ConnectedAccountsList.tsx   -- Show linked accounts with status
  PublishDialog.tsx           -- Select account, write caption, publish/schedule
  ScheduleCalendar.tsx        -- Calendar view of scheduled posts
  PublishHistoryFeed.tsx      -- Timeline of published posts with metrics
  AccountPermissions.tsx      -- Show granted scopes, re-request if needed
```

## Phase 7: Environment Variables

```env
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=https://yourdomain.com/api/social-auth/meta/callback
TIKTOK_CLIENT_KEY=       # future
TIKTOK_CLIENT_SECRET=    # future
TWITTER_CLIENT_ID=       # future
TWITTER_CLIENT_SECRET=   # future
```

## Implementation Order

| Step | What                                          | Size   |
|------|-----------------------------------------------|--------|
| 1    | Add new tables to convex/schema.ts            | Small  |
| 2    | Meta OAuth routes (authorize + callback)      | Medium |
| 3    | socialAccounts.ts Convex CRUD                 | Small  |
| 4    | Token refresh cron                            | Small  |
| 5    | ConnectAccountButton + ConnectedAccountsList  | Medium |
| 6    | Instagram single image publishing             | Medium |
| 7    | PublishDialog UI (caption, account, publish)  | Medium |
| 8    | Carousel + Reel + Story publishing            | Medium |
| 9    | Facebook Page publishing                      | Small  |
| 10   | Scheduling system (DB + cron + UI)            | Medium |
| 11   | Publish history + metrics fetching            | Small  |
| 12   | Provider adapter refactor                     | Medium |
| 13   | TikTok integration                            | Medium |
| 14   | X/Twitter integration                         | Medium |

## Meta App Review Notes

- **Dev Mode**: Build and test with team (Admin/Developer/Tester roles) without approval
- **Approval timeline**: ~1 week per submission, 2-4 weeks realistic total
- **Requirements**: Working app, screen recordings per permission, unique justifications, Privacy Policy, 1024x1024 icon, Business Verification
- **Key**: Only request permissions you use, invest in clear screen recordings with captions
- **Instagram requires**: Business/Creator account linked to a Facebook Page
