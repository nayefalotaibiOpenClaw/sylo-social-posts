# Sylo Social Posts — Convex Database & Auth Plan

## Auth: Clerk + Convex

- Clerk handles authentication (Google, email sign-in)
- Convex `users` table synced via Clerk webhook
- All queries/mutations check auth via `ctx.auth.getUserIdentity()`

---

## Core Concept: Generate Once, Adapt Many

A post's **content** (what you're saying) is separated from its **presentation** (device, language, size).

**Flow:**
1. User creates a post (the "source" — content + layout logic)
2. One click → generate variants: different languages, different device mockups, different sizes
3. Each variant lives in the right collection automatically

```
Post (source)
  ├── Variant: iPhone + Arabic + 1:1
  ├── Variant: iPhone + English + 1:1
  ├── Variant: Android + Arabic + 16:9
  ├── Variant: iPad + English + 4:3
  └── Variant: Desktop + English + 16:9
```

---

## Database Schema

### `users`

| Field     | Type   | Description              |
|-----------|--------|--------------------------|
| clerkId   | string | Clerk user ID (unique)   |
| name      | string | Display name             |
| email     | string | Email address            |
| avatarUrl | string | Profile image URL (optional) |
| plan      | string | `"free"` or `"pro"`      |
| createdAt | number | Timestamp                |

---

### `workspaces`

Top-level container. One user can have multiple workspaces (one per brand/client).

| Field           | Type            | Description                          |
|-----------------|-----------------|--------------------------------------|
| userId          | Id\<"users"\>   | Owner                                |
| name            | string          | e.g. "Odesign Studio"               |
| slug            | string          | URL-safe identifier                  |
| industry        | string?         | "restaurant", "saas", "retail", etc. |
| website         | string?         | Brand website URL                    |
| defaultLanguage | string          | `"en"` or `"ar"`                     |
| createdAt       | number          | Timestamp                            |

---

### `branding`

One per workspace. All brand identity settings.

| Field         | Type               | Description                            |
|---------------|--------------------|----------------------------------------|
| workspaceId   | Id\<"workspaces"\> | Parent workspace                       |
| brandName     | string             | e.g. "Sylo"                            |
| tagline       | string?            | Brand tagline                          |
| logo          | Id\<"_storage"\>?  | Light logo file                        |
| logoDark      | Id\<"_storage"\>?  | Dark logo file                         |
| colors        | object             | `{ primary, primaryLight, primaryDark, accent, accentLight, accentLime, accentGold, accentOrange, border }` |
| fonts         | object             | `{ heading: string, body: string }`    |
| savedPalettes | array              | `[{ name: string, colors: object }]`   |

---

### `assets`

Upload library. Categorized images for AI to use during generation.

| Field       | Type               | Description                                      |
|-------------|--------------------|--------------------------------------------------|
| workspaceId | Id\<"workspaces"\> | Parent workspace                                 |
| userId      | Id\<"users"\>      | Who uploaded                                     |
| fileId      | Id\<"_storage"\>   | Convex storage file                              |
| fileName    | string             | Original filename                                |
| type        | string             | `"iphone"` \| `"ipad"` \| `"desktop"` \| `"android_phone"` \| `"android_tablet"` \| `"product"` \| `"background"` \| `"logo"` \| `"screenshot"` \| `"icon"` \| `"other"` |
| label       | string?            | Human description, e.g. "dashboard screen"       |
| width       | number?            | Image width in px                                |
| height      | number?            | Image height in px                               |
| createdAt   | number             | Timestamp                                        |

---

### `collections`

A group of posts displayed together. Each collection has a mode that determines layout.

| Field       | Type               | Description                                      |
|-------------|--------------------|--------------------------------------------------|
| workspaceId | Id\<"workspaces"\> | Parent workspace                                 |
| userId      | Id\<"users"\>      | Creator                                          |
| name        | string             | e.g. "Instagram Grid - Arabic"                   |
| mode        | string             | `"social_grid"` \| `"social_story"` \| `"appstore_preview"` |
| platform    | string?            | `"instagram"` \| `"twitter"` \| `"linkedin"` \| `"appstore"` \| `"playstore"` |
| device      | string?            | `"iphone"` \| `"android"` \| `"ipad"` \| `"android_tablet"` \| `"desktop"` |
| language    | string             | `"en"` \| `"ar"`                                 |
| aspectRatio | string             | `"1:1"` \| `"4:5"` \| `"9:16"` \| `"16:9"` \| `"4:3"` |
| sourceCollectionId | Id\<"collections"\>? | If this was generated from another collection |
| createdAt   | number             | Timestamp                                        |

#### Mode Reference

| Mode               | Default Aspect Ratio | Layout                         | Example Use                        |
|--------------------|----------------------|--------------------------------|------------------------------------|
| `social_grid`      | 1:1                  | 3-column Instagram grid        | Sylo Arabic feature posts          |
| `social_story`     | 9:16                 | Vertical story cards           | Instagram/TikTok stories           |
| `appstore_preview` | device-sized         | Horizontal scroll, 5-10 slides | App Store/Play Store screenshots   |

#### App Store Preview Sizes

| Device           | Size (px)   | Aspect Ratio |
|------------------|-------------|--------------|
| iPhone 6.7"      | 1290 × 2796 | ~9:19.5      |
| iPhone 6.5"      | 1284 × 2778 | ~9:19.5      |
| iPhone 5.5"      | 1242 × 2208 | 9:16         |
| iPad 12.9"       | 2048 × 2732 | 3:4          |
| Android Phone    | 1080 × 1920 | 9:16         |
| Android Tablet   | 1200 × 1920 | 5:8          |
| Desktop/Mac      | 2880 × 1800 | 16:10        |

---

### `posts`

The **source content** — the editable design. Language-neutral content structure.

| Field          | Type                  | Description                              |
|----------------|-----------------------|------------------------------------------|
| collectionId   | Id\<"collections"\>   | Parent collection                        |
| workspaceId    | Id\<"workspaces"\>    | Parent workspace (denormalized)          |
| userId         | Id\<"users"\>         | Creator                                  |
| title          | string                | e.g. "Smart Menu", "Analytics Dashboard" |
| componentCode  | string                | Editable TSX source code                 |
| language       | string                | `"en"` \| `"ar"`                         |
| device         | string                | `"iphone"` \| `"android"` \| `"ipad"` \| `"android_tablet"` \| `"desktop"` \| `"none"` |
| order          | number                | Position in grid/scroll (0, 1, 2...)     |
| row            | number?               | Grid row (0 = top)                       |
| col            | number?               | Grid column (0 = left)                   |
| sourcePostId   | Id\<"posts"\>?        | If this was generated as a variant of another post |
| assetsUsed     | array                 | `Id<"assets">[]` — referenced images    |
| tags           | array?                | `string[]` — "promo", "feature", etc.   |
| status         | string                | `"draft"` \| `"final"`                   |
| createdAt      | number                | Timestamp                                |
| updatedAt      | number                | Timestamp                                |

#### Variant Generation Flow

```
User clicks "Generate Android version" on an iPhone post:

1. AI reads sourcePost.componentCode (iPhone mockup, English)
2. AI regenerates with:
   - Same content/messaging
   - Android device frame instead of iPhone
   - Same screenshots (or swaps to Android screenshots from assets)
3. New post created with:
   - sourcePostId = original post ID
   - device = "android"
   - Everything else adapted

User clicks "Generate Arabic version":
1. AI reads sourcePost.componentCode
2. AI regenerates with:
   - Translated text (Arabic)
   - RTL layout
   - Same visual structure
3. New post created with:
   - sourcePostId = original post ID
   - language = "ar"
```

---

### `variantGroups`

Links posts that are variants of each other (same content, different presentation).

| Field       | Type               | Description                                      |
|-------------|--------------------|--------------------------------------------------|
| workspaceId | Id\<"workspaces"\> | Parent workspace                                 |
| name        | string             | Auto-generated, e.g. "Smart Menu variants"       |
| sourcePostId| Id\<"posts"\>      | The original post                                |
| createdAt   | number             | Timestamp                                        |

---

### `variantLinks`

Maps each variant post to its group. Tracks what changed.

| Field          | Type                    | Description                           |
|----------------|-------------------------|---------------------------------------|
| variantGroupId | Id\<"variantGroups"\>   | Parent group                          |
| postId         | Id\<"posts"\>           | The variant post                      |
| changes        | array                   | `string[]` — what was adapted: `["language", "device", "size"]` |

---

### `generations`

AI generation history. Track prompts, configs, and results.

| Field          | Type                   | Description                           |
|----------------|------------------------|---------------------------------------|
| workspaceId    | Id\<"workspaces"\>     | Parent workspace                      |
| collectionId   | Id\<"collections"\>?   | Target collection (optional)          |
| userId         | Id\<"users"\>          | Who triggered                         |
| prompt         | string                 | The prompt sent to AI                 |
| type           | string                 | `"new"` \| `"variant_language"` \| `"variant_device"` \| `"variant_size"` |
| sourcePostId   | Id\<"posts"\>?         | Source post (for variants)            |
| config         | object                 | `{ features?, style?, targetLanguage?, targetDevice?, assetsIncluded: Id<"assets">[] }` |
| resultPostId   | Id\<"posts"\>?         | Created post (if successful)          |
| status         | string                 | `"pending"` \| `"completed"` \| `"failed"` |
| createdAt      | number                 | Timestamp                             |

---

## One-Click Variant Generation — User Flow

### Example: App Store Preview for all devices

```
1. User creates "App Store - iPhone" collection with 5 posts
2. User clicks "Generate for Android" button
3. System:
   a. Creates new collection "App Store - Android" (mode: appstore_preview, device: android)
   b. For each post in iPhone collection:
      - Reads componentCode
      - AI swaps iPhone frame → Android frame
      - AI swaps iPhone screenshots → Android screenshots (from assets)
      - Adjusts dimensions to Android size
      - Creates new post with sourcePostId linking back
      - Creates variantLink
   c. All 5 Android posts appear in new collection
4. User can edit individual Android posts if needed
```

### Example: Generate Arabic version of Instagram grid

```
1. User has "Instagram Grid - EN" with 12 posts
2. User clicks "Generate Arabic"
3. System:
   a. Creates "Instagram Grid - AR" collection (language: ar)
   b. For each post:
      - AI translates text to Arabic
      - Flips layout to RTL
      - Keeps same visual structure and mockups
      - Creates new post linked to source
4. User reviews and tweaks Arabic versions
```

### Quick Actions (per post)
- "Translate to Arabic/English" → single post variant
- "Switch to Android/iPhone/iPad" → single post device swap
- "Resize for Story/Grid/Preview" → single post size change

### Bulk Actions (per collection)
- "Generate [language] version" → entire collection translated
- "Generate [device] version" → entire collection device-swapped
- "Export all as images" → batch download

---

## Implementation Steps

### Phase 1: Auth & Core Schema
1. Install & configure Clerk (`@clerk/nextjs`)
2. Set up Clerk + Convex integration (JWT template, webhook)
3. Create Convex schema (`convex/schema.ts`) with all tables above
4. Create `users` sync mutation (triggered by Clerk webhook)
5. Wrap app with `ClerkProvider` + `ConvexProviderWithClerk`

### Phase 2: Workspaces & Branding
6. CRUD mutations for workspaces
7. CRUD mutations for branding (colors, fonts, logos)
8. Workspace selector UI
9. Migrate ThemeContext to read from Convex branding

### Phase 3: Assets Upload
10. File upload mutations using Convex storage
11. Asset library UI with type categorization (iPhone, Android, iPad, etc.)
12. Asset picker for AI generation

### Phase 4: Collections & Posts
13. CRUD mutations for collections (with mode, device, language)
14. CRUD mutations for posts (with drag-to-reorder, order tracking)
15. Collection view modes: social grid, story, app store preview
16. Post code editor (editable componentCode)

### Phase 5: AI Generation & Variants
17. New post generation connected to Convex
18. Variant generation: language swap (with translation)
19. Variant generation: device swap (with mockup change)
20. Variant generation: size/aspect ratio swap
21. Bulk variant generation (entire collection)
22. Variant group tracking (variantGroups + variantLinks)
23. Generation history UI

### Phase 6: Multi-Language & RTL
24. Language toggle per collection
25. AI prompt templates for Arabic/English
26. RTL layout support for Arabic collections
27. Bidirectional variant linking (navigate between language versions)
