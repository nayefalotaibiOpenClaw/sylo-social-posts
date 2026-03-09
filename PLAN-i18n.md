# i18n Implementation Plan — oDesigns Studio

## Approach: Cookie-based React Context (No URL changes)

**Why this approach:**
- App is live — no URL restructuring needed (`/pricing` stays `/pricing`, not `/en/pricing`)
- All pages are `"use client"` — server-side i18n libraries lose their advantage
- Only 2 languages (EN/AR) — a lightweight custom solution beats adding a dependency
- Zero impact on Convex Auth redirects or existing bookmarks

## Architecture

```
lib/i18n/
  locales/
    en.json          # ~75 English strings (flat key-value)
    ar.json          # ~75 Arabic strings
  types.ts           # Type-safe keys derived from en.json
  context.tsx        # LocaleProvider + useTranslation() hook
  utils.ts           # Cookie read/write, browser language detection
```

- **`LocaleProvider`** wraps the app, provides `{ locale, setLocale, dir, t }`
- **`t("pricing.title")`** returns the translated string
- **Cookie** persists choice, read server-side in layout for no-flash `lang`/`dir` on `<html>`
- **`LanguageSwitcher`** component in nav bars (EN/AR toggle)

## Implementation Steps

### Step 1: Create `lib/i18n/` module
- **New files:** `lib/i18n/locales/en.json`, `lib/i18n/locales/ar.json`, `lib/i18n/types.ts`, `lib/i18n/context.tsx`, `lib/i18n/utils.ts`
- Flat key-value JSON: `"pricing.title": "Choose your plan"`
- `types.ts`: derive `TranslationKey` from en.json keys for compile-time safety
- `context.tsx`: `LocaleProvider` + `useLocale()` hook returning `{ locale, setLocale, dir, t }`
- `utils.ts`: cookie helpers (`getLocaleCookie`, `setLocaleCookie`), browser language detection
- **Effort:** Medium

### Step 2: Wire `LocaleProvider` into Providers.tsx
- **File:** `app/components/Providers.tsx`
- Wrap children with `<LocaleProvider>` alongside existing ConvexAuth provider
- **Effort:** Tiny

### Step 3: Update root layout for server-side `lang`/`dir`
- **File:** `app/layout.tsx`
- Read `locale` cookie using `cookies()` from `next/headers`
- Set `<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>` to prevent flash
- **Effort:** Small

### Step 4: Update middleware for language detection
- **File:** `middleware.ts`
- Chain locale detection with existing Convex Auth middleware
- On first visit (no cookie): check `Accept-Language` header for Arabic preference
- Set `locale` cookie on response — no URL redirects
- **Effort:** Small

### Step 5: Create `LanguageSwitcher` component
- **New file:** `lib/i18n/LanguageSwitcher.tsx` (or `app/components/LanguageSwitcher.tsx`)
- Small toggle button: "EN" / "عربي"
- Calls `setLocale()` which updates state + cookie + `document.documentElement.lang/dir`
- Calls `router.refresh()` to re-run server layout with new cookie
- Place in nav bar of each page
- **Effort:** Small

### Step 6: Translate login page (~8 strings)
- **File:** `app/(auth)/login/page.tsx`
- Strings: "Welcome back", "Log in or join for free", "Continue with Google", "Signing in...", "Back to Home", terms text
- Validates the entire approach works end-to-end
- **Effort:** Small

### Step 7: Translate pricing page (~20 strings)
- **File:** `app/(dashboard)/pricing/page.tsx`
- Strings: "Choose your plan", plan names/descriptions, feature list items, billing labels, "Get Started", "Current Plan", "Most Popular", "Save 20%", toast messages
- Use `toLocaleString(locale)` for number formatting
- **Effort:** Medium

### Step 8: Translate workspaces page + components (~15 strings)
- **Files:** `app/(dashboard)/workspaces/page.tsx`, `features/workspace/components/WorkspaceCard.tsx`, `features/workspace/components/WorkspaceForm.tsx`
- Strings: page title, subtitle, "Create workspace", form labels, empty state, action buttons, delete confirmation
- **Effort:** Medium

### Step 9: Translate marketing/landing page (~30 strings)
- **File:** `app/(marketing)/page.tsx`
- Strings: hero title/subtitle, tab labels, section headings, feature descriptions, CTA buttons, footer, nav items
- Post label names ("Analytics", "Loyalty") can stay in English as product names
- **Effort:** Large (biggest page)

### Step 10: RTL CSS pass
- **Files:** All translated pages
- Replace directional utilities with logical ones:
  - `ml-*`/`mr-*` → `ms-*`/`me-*`
  - `pl-*`/`pr-*` → `ps-*`/`pe-*`
  - `text-left`/`text-right` → `text-start`/`text-end`
  - `left-*`/`right-*` → `start-*`/`end-*`
- Add `rtl:rotate-180` on arrow icons (ArrowLeft, ChevronRight)
- Add global CSS: `[dir="rtl"] { font-family: var(--font-cairo), 'Cairo', sans-serif; }`
- Cairo font is already loaded with Arabic subset
- **Effort:** Medium

## Key Design Decisions

- **UI language ≠ post content language** — workspace `defaultLanguage` controls AI-generated content, i18n controls the app UI
- **No SEO concern** — dashboard pages are behind auth
- **No flash of wrong direction** — server layout reads cookie for initial `dir="rtl"`
- **~75 total strings** across all 4 pages
- **No external dependency** — custom solution for 2 languages is simpler than next-intl

## RTL-Specific Notes

- Tailwind v4 supports `rtl:` variant natively (activates when `dir="rtl"` on `<html>`)
- Flexbox and grid respect `dir` automatically — most layouts "just work"
- The floating nav `left-1/2 -translate-x-1/2` centering works in both directions
- Decorative transforms/rotations are fine as-is

## Potential Challenges

| Challenge | Mitigation |
|-----------|------------|
| Flash of untranslated content | Read cookie in server layout for initial `lang`/`dir`; JSON imports are synchronous |
| Convex Auth redirect URLs | No impact — URLs don't change |
| Post content vs UI language | Keep them separate; don't conflate |
| Arabic SEO | Low priority for SaaS dashboard; can add `hreflang` later if needed |
