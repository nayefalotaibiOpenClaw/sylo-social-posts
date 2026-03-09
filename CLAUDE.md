# Sylo Social Posts

AI-powered social media post generator and design editor. Built with Next.js 16, Convex, Tailwind CSS v4, and Google Gemini.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Backend**: Convex (real-time DB, file storage, auth)
- **Auth**: Convex Auth with Google OAuth
- **AI**: Google Gemini (`gemini-3.1-flash-lite-preview`) for post generation + website analysis
- **Styling**: Tailwind CSS v4, CSS-only visuals (no image generation)
- **Icons**: `lucide-react` only
- **Export**: `html-to-image` + `jszip` for PNG/ZIP downloads
- **Runtime rendering**: `sucrase` for live TSX → JS transpilation

## Project Structure

```
app/
├── (marketing)/page.tsx         # Marketing landing page (/)
├── (auth)/login/page.tsx        # Google OAuth login (/login)
├── (dashboard)/
│   ├── workspaces/page.tsx      # Workspace CRUD (/workspaces)
│   └── design/page.tsx          # Main post editor (/design)
├── sylo-posts/page.tsx          # Static Sylo brand post gallery
├── seasons/page.tsx             # Static Seasons brand post gallery
├── layout.tsx                   # Root layout (fonts, ConvexAuth provider)
├── globals.css                  # Tailwind v4 styles
├── api/
│   ├── generate/route.ts        # Thin AI handler → delegates to lib/ai/
│   └── fetch-website/route.ts   # Thin handler → delegates to lib/website/
├── components/                  # Re-exports (backward compat for existing imports)
│   ├── EditableText.tsx         # → features/posts/editor/
│   ├── EditContext.tsx          # → contexts/EditContext.tsx
│   ├── ThemeContext.tsx         # → contexts/ThemeContext.tsx
│   ├── DraggableWrapper.tsx     # → features/posts/editor/
│   ├── DynamicPost.tsx          # → features/posts/editor/
│   ├── PostWrapper.tsx          # → features/posts/editor/
│   ├── Providers.tsx            # ConvexAuth + Theme providers
│   ├── shared/                  # Shared post building blocks
│   ├── [SyloPost].tsx           # → features/posts/templates/sylo/
│   └── [SeasonsPost].tsx        # → features/posts/templates/seasons/

features/                        # Feature modules
├── posts/
│   ├── templates/
│   │   ├── sylo/                # ~40 Sylo brand posts + index.ts barrel
│   │   └── seasons/             # ~27 Seasons brand posts + index.ts barrel
│   ├── editor/                  # EditableText, DraggableWrapper, DynamicPost, PostWrapper
│   ├── shared/                  # PostHeader, PostFooter, FloatingCard, device mockups
│   └── registries/types.ts      # PostRegistryEntry type
├── design-editor/
│   ├── components/              # Sidebar, SettingsPanel, ThemePanel, AssetsPanel, GeneratePanel, PostGrid, DownloadBar
│   └── constants/               # FONTS, PALETTES arrays
└── workspace/
    └── components/              # WorkspaceCard, WorkspaceForm, WorkspaceStats

lib/                             # Shared business logic (non-UI)
├── ai/
│   ├── prompts/                 # system-prompt, examples, copy-angles, layout-blueprints
│   ├── build-prompt.ts          # buildDynamicPrompt() + buildExamplesSection()
│   ├── clean-code.ts            # cleanCode() utility
│   └── types.ts                 # AssetInfo, WebsiteInfo, GenerationContext
├── website/
│   └── extract-text.ts          # extractBodyText() from HTML
└── export/
    └── download.ts              # downloadPostsAsZip() shared utility

contexts/                        # React contexts (cross-feature)
├── EditContext.tsx               # Edit mode, aspect ratio, selected ID
└── ThemeContext.tsx              # Theme colors + font

convex/
├── schema.ts                   # Full DB schema (10 tables)
├── auth.ts / auth.config.ts    # Convex Auth setup
├── http.ts                     # HTTP router for auth
├── users.ts                    # User queries/mutations
├── workspaces.ts               # Workspace CRUD + website info
├── branding.ts                 # Brand colors/fonts/logos
├── assets.ts                   # File upload + AI analysis
├── collections.ts              # Post collection management
├── posts.ts                    # Post CRUD + reordering
├── generations.ts              # AI generation history
└── seedAll.ts                  # Seed script

middleware.ts                   # Convex Auth middleware
```

## Database Tables (Convex)

- **users** — Auth-managed, extended with `plan`, `createdAt`
- **workspaces** — Per-brand containers (name, slug, industry, website, websiteInfo, language)
- **branding** — Colors, fonts, logos per workspace
- **assets** — Uploaded images with type classification (iphone/ipad/desktop/product/background/logo)
- **collections** — Post groups (social_grid, social_story, appstore_preview)
- **posts** — Component code + metadata (language, device, order, status)
- **variantGroups / variantLinks** — Track post variants (language/device/size swaps)
- **generations** — AI generation audit trail

## Key Architectural Patterns

### Post Component System
- Posts are self-contained TSX components that render inside a themed, aspect-ratio-aware container
- All visible text uses `<EditableText>` for inline editing
- All content sections use `<DraggableWrapper>` for repositioning
- Shared building blocks: `PostHeader`, `PostFooter`, `FloatingCard`, device mockups
- Theme applied via `useTheme()` hook — NEVER hardcode colors

### Dynamic Post Rendering
- `DynamicPost.tsx` transpiles raw TSX strings at runtime using `sucrase`
- Posts stored as `componentCode` in Convex, rendered live in the editor
- Scope includes all shared components, lucide icons, React hooks

### AI Generation Pipeline
1. `api/generate/route.ts` builds a system prompt with few-shot examples
2. Selects random creative angles (emotional, provocative, aspirational, etc.)
3. Selects random layout blueprints (device showcase, hero image, typography, etc.)
4. Sends to Gemini with brand context, assets, and website info
5. Returns clean TSX code (markdown fences stripped)

### Theme System
```tsx
const t = useTheme();
// t.primary, t.primaryLight, t.primaryDark
// t.accent, t.accentLight, t.accentLime, t.accentGold, t.accentOrange
// t.border, t.font
// Apply via style={{ backgroundColor: t.primary }}
// NEVER use Tailwind color classes like bg-[#1B4332]
```

### Aspect Ratio System
```tsx
const ratio = useAspectRatio(); // '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
const isTall = ratio === '9:16' || ratio === '3:4';
// Use isTall to conditionally size mockups and spacing
```

## Post Component Conventions

Every post component MUST follow these rules:

1. Root div: `className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"` with `style={{ backgroundColor: t.primary, fontFamily: t.font }}`
2. Self-contained: one file per post
3. All visible text wrapped in `<EditableText>`
4. All content sections wrapped in `<DraggableWrapper>`
5. Use `useTheme()` for all colors — never hardcode hex values
6. Use `useAspectRatio()` for responsive sizing
7. Icons only from `lucide-react`
8. No external images unless explicitly provided
9. CSS-only visuals for mockups, charts, decorations

## Brand Post Categories

- **Sylo posts** (prefix: none) — Restaurant POS/management features (CloudPOS, Analytics, Inventory, etc.)
- **Seasons posts** (prefix: `Seasons`) — Flower/gift shop brand (Hero, Gift, Subscription, Romance, etc.)

## Custom Commands

- `/generate-posts` — AI generates new post components from config, URL, screenshots, and features

## Environment Variables

- `CONVEX_DEPLOYMENT` — Convex deployment URL
- `NEXT_PUBLIC_CONVEX_URL` — Convex public URL (client-side)
- `GOOGLE_AI_API_KEY` — Gemini API key (server-side only)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials

## Dev Commands

```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex dev (run alongside)
npm run build        # Production build
npm run lint         # ESLint
```
