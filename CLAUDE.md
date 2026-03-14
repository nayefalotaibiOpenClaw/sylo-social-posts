# Sylo Social Posts

AI-powered social media post generator and design editor. Built with Next.js 16, Convex, Tailwind CSS v4, and Google Gemini.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Backend**: Convex (real-time DB, file storage, auth)
- **Auth**: Convex Auth with Google OAuth
- **AI**: Google Gemini (`gemini-3.1-flash-lite-preview` default, also `gemini-3-flash-preview`, `gemini-3.1-pro-preview`)
- **Styling**: Tailwind CSS v4, CSS-only visuals (no image generation)
- **Icons**: `lucide-react` only
- **Payments**: UPayments (webhook-verified)
- **Social**: Meta (Instagram/Facebook), Twitter/X, Threads OAuth
- **Export**: `html-to-image` + `jszip` for PNG/ZIP downloads
- **Runtime rendering**: `sucrase` for live TSX transpilation

## Project Structure

```
app/
├── (marketing)/             # Landing, blogs, contact, privacy, terms
├── (auth)/login/            # Google OAuth login
├── (dashboard)/             # Auth-guarded layout (auto-redirects to /login)
│   ├── workspaces/          # Workspace CRUD
│   ├── design/              # Main post editor
│   ├── channels/            # Social account connections
│   ├── publish/             # Scheduled publishing
│   ├── pricing/             # Plan selection + payment
│   └── billing/             # Subscription management
├── (admin)/admin/           # Admin dashboard (assertAdmin guard)
├── api/
│   ├── generate/            # AI generation (3 engines: wild, classic, appstore-guided)
│   ├── payments/            # create, verify, webhook
│   ├── social-auth/         # OAuth flows (meta, facebook, instagram, twitter, threads)
│   ├── proxy-image/         # SSRF-protected image proxy
│   ├── fetch-website/       # Website text extraction
│   ├── crawl-website/       # Full site crawl + product discovery
│   ├── adapt-ratio/         # AI aspect ratio adaptation
│   └── unsplash/            # Image search proxy

features/
├── posts/
│   ├── templates/           # sylo/, seasons/, appstore/, fooddrink/, showcase/, odesigns/
│   ├── editor/              # EditableText, DraggableWrapper, DynamicPost, PostWrapper
│   └── shared/              # PostHeader, PostFooter, FloatingCard, device mockups
├── design-editor/components/ # Sidebar, PostGrid, GeneratePanel, ThemePanel, etc.
├── publishing/components/   # CalendarView, BulkScheduleModal, ScheduledPostCard
└── workspace/components/    # WorkspaceCard, WorkspaceForm, WorkspaceStats

lib/
├── auth/api-auth.ts         # requireAuth() for API routes
├── security/                # rate-limit.ts, url-validation.ts, code-validation.ts
├── ai/                      # Prompt building, code cleaning, types
├── social-providers/        # Meta + Twitter API helpers
├── website/                 # crawl.ts, extract-text.ts, classify.ts
├── i18n/                    # Localization (ar/en)
└── export/download.ts       # Client-side PNG/ZIP export

convex/
├── schema.ts                # Full DB schema
├── auth.ts, http.ts         # Auth setup + HTTP router
├── workspaces.ts            # Workspace CRUD (cascading delete)
├── posts.ts, collections.ts # Post/collection CRUD
├── branding.ts              # Brand colors/fonts/logos
├── assets.ts                # File upload (auth + MIME/size validation)
├── payments.ts              # Payment lifecycle (webhook-verified)
├── subscriptions.ts         # Plan management + usage tracking
├── publishing.ts            # Social publishing + scheduling
├── socialAccounts.ts        # OAuth account storage (encrypted tokens)
├── socialAuth.ts, threadsAuth.ts, twitterAuth.ts  # OAuth callbacks
├── admin.ts                 # Admin queries/mutations (assertAdmin)
├── lib/encryption.ts        # AES-256-GCM token encryption
└── webhooks.ts              # Payment webhook (server-verified)
```

## Security Rules (MUST follow)

### Authentication
- Every Convex mutation/query MUST call `auth.getUserId(ctx)` and verify ownership
- Every API route MUST call `requireAuth()` from `lib/auth/api-auth.ts` as first line
- NEVER accept `userId` from client args — always derive from session
- Dashboard layout handles auth redirect; child pages don't need their own

### Input Validation
- Validate all string inputs for length (prompts: 5000 chars max)
- Use typed validators (`v.string()`, `v.id()`) — never `v.any()` unless allowlisted
- `branding.updateField` uses `ALLOWED_BRANDING_FIELDS` allowlist
- File uploads: validate MIME type + 10MB size limit server-side in `assets.create`

### SSRF Protection
- `lib/security/url-validation.ts` — `validateExternalUrl()` resolves DNS + blocks private IPs
- `proxy-image` uses `validateProxyUrl()` with domain allowlist + Content-Type check
- Unsplash download URL must start with `https://api.unsplash.com/`

### Payment Security
- Payments verified server-side via UPayments status API (never trust client)
- `markPaid` is `internalMutation` only — no client-callable payment confirmation
- `subscriptions.activate` reads `amountPaid` from payment record, not client args
- Checkout URLs validated against UPayments domain allowlist before redirect

### OAuth Security
- All authorize endpoints derive userId from authenticated session, not query params
- HMAC state signatures use constant-time XOR comparison (not `!==`)
- `APP_URL` must be set — no localhost fallbacks in production
- Social tokens encrypted at rest with AES-256-GCM (`convex/lib/encryption.ts`)

### Code Execution Safety
- `DynamicPost.tsx` validates code against dangerous patterns before execution
- Dangerous globals (window, document, fetch, eval) are shadowed in Function scope
- `lib/security/code-validation.ts` provides `validateComponentCode()`

### Rate Limiting
- `lib/security/rate-limit.ts` — AI routes: 20 req/min, website routes: 30 req/min
- API routes check subscription limits server-side before calling AI

### General
- No `alert()` — use in-app toast components
- Use `router.replace()` for navigation, not `window.location.href`
- Error responses return generic messages; log details server-side only
- Seed mutations (`seedAll`, `blogs.seed`) are `internalMutation` only
- `scheduleBulk` validates socialAccountId ownership per workspace
- Queries use `.take(N)` limits — no unbounded `.collect()` in user-facing queries

## AI Generation Engines

Route: `POST /api/generate` — `version` param selects engine (default: 7).

| Version | Engine | How it works |
|---------|--------|-------------|
| `4` | **Wild** | Single Gemini call generates all posts. AI has full creative freedom — writes complete TSX. Uses 8 mood presets (bold, minimal, energetic, etc.) for variety. Returns JSON array of `{code, caption, imageKeywords}`. |
| `5` | **Classic** | Parallel Gemini calls (1 per post). Uses `CLASSIC_SYSTEM_PROMPT` + `buildDynamicPrompt()` for brand context. Each post gets a random copy angle + layout blueprint for diversity. AI writes complete TSX. |
| `7` | **App Store Guided** | Template-based. AI returns JSON content (`headline`, `subtitle`, `background`, `badges`), code assembles it into pre-built TSX templates. 7 templates (A–G) with 8 background presets. |

### Shared infrastructure (`_shared.ts`)
- `getModel(id?)` — returns Gemini client. Allowed: `gemini-3.1-flash-lite-preview` (default), `gemini-3-flash-preview`, `gemini-3.1-pro-preview`
- `runGeneration()` — parallel post generation with token tracking
- `buildContextPostsSection()` — injects user-selected reference posts (max 5, 15K chars)
- `buildContextAssetsSection()` — injects user-selected assets with usage hints
- `buildRatioNote()` — adds aspect-ratio-specific layout instructions
- `handleGenerationError()` — maps all errors to generic user-facing messages
- Max 8 posts per request, max 4 reference images

### App Store Guided Templates (V7)
- **A**: Headline top-left, phone bleeds from bottom
- **B**: Bold centered headline, phone bleeds from bottom
- **C**: Phone top center, headline at bottom
- **D**: Side split — text left, phone right
- **E**: Badge + headline + subtitle top, phone bottom
- **F**: Social proof / big text only, no device mockup
- **G**: Two phones — one top, headline in middle, one bottom

Background presets: `gradient-dark`, `gradient-accent`, `glow`, `glow-bottom`, `dots`, `cinematic`, `minimal`, `duotone`

## Theme System

```tsx
const t = useTheme();
// t.primary, t.primaryLight, t.primaryDark
// t.accent, t.accentLight, t.accentLime, t.accentGold, t.accentOrange
// t.border, t.font
// Apply via style={{ backgroundColor: t.primary }}
// NEVER use Tailwind color classes like bg-[#1B4332]
```

## Post Component Conventions

1. Root div: `className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"` with `style={{ backgroundColor: t.primary, fontFamily: t.font }}`
2. Self-contained: one file per post
3. All visible text wrapped in `<EditableText>`
4. All content sections wrapped in `<DraggableWrapper>`
5. Use `useTheme()` for all colors — never hardcode hex values
6. Use `useAspectRatio()` for responsive sizing
7. Icons only from `lucide-react`
8. No external images unless explicitly provided
9. CSS-only visuals for mockups, charts, decorations

## Custom Commands

- `/generate-posts` — AI generates new post components from config, URL, screenshots, and features

## Environment Variables

- `CONVEX_DEPLOYMENT` / `NEXT_PUBLIC_CONVEX_URL` — Convex URLs
- `GOOGLE_AI_API_KEY` — Gemini API key (server-side only)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth
- `UPAYMENTS_API_KEY` / `UPAYMENTS_BASE_URL` — Payment gateway
- `META_APP_ID` / `META_APP_SECRET` — Meta OAuth
- `THREADS_APP_ID` / `THREADS_APP_SECRET` — Threads OAuth
- `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` — Twitter OAuth
- `TOKEN_ENCRYPTION_KEY` — AES-256 key for social token encryption
- `APP_URL` — Production URL (required, no localhost fallback)

## Dev Commands

```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex dev (run alongside)
npm run build        # Production build
npm run lint         # ESLint
```
