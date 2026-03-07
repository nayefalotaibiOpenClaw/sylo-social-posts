# Generate Social Media Posts

You are a social media post designer. Generate creative Instagram post designs as React/TSX components for this project.

## Instructions

1. **Read the user's input** which should include:
   - App name, description, and features
   - Website URL (fetch it with WebFetch to extract info and features)
   - Screenshot filenames (in /public folder)
   - Logo filename (in /public folder)
   - Language preference (Arabic or English)
   - Number of posts to generate

2. **If a website URL is provided**, fetch it and extract:
   - Product name and description
   - Key features and selling points
   - Pricing info if available
   - Target audience

3. **If screenshots are referenced**, look at them in the /public folder using the Read tool to understand the app's UI and features.

4. **Read existing posts** for reference. Look at 2-3 posts in `app/components/` to match the exact style, structure, and patterns. Key examples:
   - `MobileDashboardPost.tsx` — dark bg with iPhone mockup
   - `StaffManagementPost.tsx` — light bg with iPhone mockup + feature cards
   - `InventoryPost.tsx` — light bg with CSS-only cards (no mockup)
   - `AccountingPost.tsx` — dark bg with CSS-only visual

5. **Generate posts** following these STRICT rules:

### Shared Components — USE THESE

Import from `./shared` or `./shared/IPhoneMockup` etc:

#### `<IPhoneMockup src="/screenshot.jpg" />`
Renders a complete iPhone frame (bezels, buttons, notch, glass reflections). Fills its parent container — wrap in a sized div:
```tsx
import { IPhoneMockup } from './shared';
// In post:
<div className={isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}>
  <IPhoneMockup src="/1.jpg" />
</div>
```
Props: `src` (required), `alt`, `notch` ("pill" | "notch"), `className`
- Upload button appears automatically when parent DraggableWrapper is selected

#### `<IPadMockup src="/screenshot.jpg" />`
Renders a complete iPad frame (bezels, buttons, camera, home indicator). Fills its parent container — wrap in a sized div:
```tsx
import { IPadMockup } from './shared';
// Landscape (default):
<div className={isTall ? 'w-full h-[300px]' : 'w-[320px] h-[220px]'}>
  <IPadMockup src="/pos-screen.jpg" />
</div>
// Portrait:
<div className={isTall ? 'w-[260px] h-[360px]' : 'w-[200px] h-[280px]'}>
  <IPadMockup src="/pos-screen.jpg" orientation="portrait" />
</div>
```
Props: `src` (required), `alt`, `orientation` ("landscape" | "portrait"), `className`
- Upload button appears automatically when parent DraggableWrapper is selected

#### `<DesktopMockup src="/screenshot.jpg" />`
Renders a macOS browser window (traffic lights, address bar, stand). Fills its parent container — wrap in a sized div:
```tsx
import { DesktopMockup } from './shared';
<div className={isTall ? 'w-full h-[350px]' : 'w-[360px] h-[240px]'}>
  <DesktopMockup src="/pos-screen.jpg" url="app.sylo.com" />
</div>
```
Props: `src` (required), `alt`, `trafficLights` (boolean, default true), `url` (string for address bar), `className`
- Upload button appears automatically when parent DraggableWrapper is selected

#### `<PostHeader id="mypost" subtitle="ANALYTICS" badge={...} />`
Renders the SYLO logo + subtitle + optional badge:
```tsx
import { PostHeader } from './shared';
// Dark background post:
<PostHeader id="mypost" subtitle="ANALYTICS" badge={<><TrendingUp size={12}/> LIVE</>} variant="dark" />
// Light background post:
<PostHeader id="mypost" subtitle="TEAM HUB" badge={<><Sparkles size={12}/> AI</>} variant="light" />
```
Props: `id` (required), `title`, `subtitle`, `badge`, `variant` ("dark" | "light")

#### `<FloatingCard id="stat" icon={...} label="Growth" value="+24%" />`
Floating stat card near mockups:
```tsx
import { FloatingCard } from './shared';
<FloatingCard
  id="stat-mypost"
  icon={<BarChart size={16} />}
  label="Growth"
  value="+24%"
  rotate={3}
  className="absolute -right-8 top-16"
/>
```
Props: `id`, `icon`, `label`, `value`, `className`, `rotate`, `animation`, `borderColor`

#### `<PostFooter id="mypost" label="SYLO BUSINESS" text="تابع مشروعك" icon={...} />`
Footer with brand label + text + optional icon:
```tsx
import { PostFooter } from './shared';
<PostFooter id="mypost" label="SYLO INTELLIGENCE" text="تابع مشروعك من أي مكان" icon={<Smartphone size={24}/>} variant="dark" />
```
Props: `id`, `label`, `text`, `icon`, `variant` ("dark" | "light")

### Other Required Imports

```tsx
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
```

### Theme System — MANDATORY

Every post MUST use the theme system. Never hardcode colors.

```tsx
const t = useTheme();
// Colors available:
// t.primary      - dark color (headings, dark backgrounds)
// t.primaryLight  - light background color
// t.primaryDark   - darkest shade
// t.accent        - medium accent (subtitles, secondary)
// t.accentLight   - lighter accent (highlights)
// t.accentLime    - bright accent (badges, glow effects)
// t.accentGold    - golden accent
// t.accentOrange  - orange accent
// t.border        - border/hardware color
// t.font          - font family string
```

Apply colors via inline `style` props, NOT Tailwind color classes:
```tsx
// CORRECT:
<div style={{ backgroundColor: t.primary, color: t.primaryLight }}>
<span style={{ color: t.accent }}>
<div style={{ borderColor: t.primary + '1a' }}> // with opacity

// WRONG - never do this:
<div className="bg-[#1B4332] text-[#EAF4EE]">
```

### Aspect Ratio Support — MANDATORY

Every post with a phone mockup MUST handle 1:1 and tall (9:16, 3:4) ratios:

```tsx
const ratio = useAspectRatio();
const isTall = ratio === '9:16' || ratio === '3:4';

// Mockup sizing:
<div className={isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}>
  <IPhoneMockup src="/screenshot.jpg" />
</div>
```

### DraggableWrapper — MANDATORY

Wrap ALL moveable elements (headers, headlines, mockups, cards, footers) with DraggableWrapper:
```tsx
<DraggableWrapper id="unique-id" className="..." dir="rtl">
  {/* content */}
</DraggableWrapper>
```

### EditableText — MANDATORY

Wrap ALL visible text with EditableText:
```tsx
<EditableText>أرقامك</EditableText>
<EditableText as="h2" className="text-5xl font-black">عنوان</EditableText>
<EditableText as="p" className="text-lg" style={{ color: t.accent }}>وصف</EditableText>
```

### Design Rules

- Root div: `className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"`
- Apply font: `style={{ fontFamily: t.font }}`
- Content wrapper: `className="relative z-10 w-full h-full flex flex-col p-8"`
- Use only CSS for visuals (gradients, blur circles, grid patterns)
- Each post highlights ONE feature with a creative visual metaphor
- Use lucide-react for icons only
- No external images except provided screenshots/logo in /public

### Layout Variety

Alternate between these patterns:
- **Dark bg**: `style={{ backgroundColor: t.primary }}` with gradient overlay to `t.primaryDark`
- **Light bg**: `style={{ backgroundColor: t.primaryLight }}` with subtle pattern
- **Mixed**: light bg with dark card section

### Background Decorations (pick from these)

```tsx
// Grid pattern
<div className="absolute inset-0 opacity-[0.05]"
  style={{backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px'}} />

// Dot pattern
<div className="absolute inset-0 opacity-[0.05]"
  style={{backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '30px 30px'}} />

// Blur circle
<div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-[0.1] blur-[100px] rounded-full"
  style={{ backgroundColor: t.accentLime }} />

// Gradient overlay (dark posts)
<div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }} />
```

### Component Template

```tsx
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { Sparkles } from 'lucide-react';

export default function FeatureNamePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="feature" subtitle="FEATURE" badge={<><Sparkles size={12}/> BADGE</>} variant="dark" />

        <DraggableWrapper id="headline-feature" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>عنوان رئيسي</EditableText>
          </h2>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-feature" className={`relative z-20 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
            <IPhoneMockup src="/screenshot.jpg" />
          </DraggableWrapper>
          <FloatingCard id="stat-feature" icon={<Sparkles size={16}/>} label="Stat" value="+99%" className="absolute -right-8 top-16" rotate={3} />
        </div>

        <PostFooter id="feature" label="SYLO FEATURE" text="وصف قصير" variant="dark" />
      </div>
    </div>
  );
}
```

6. **After generating all components**, update `app/page.tsx`:
   - Add imports for each new component
   - Wrap each in `<PostWrapper aspectRatio={aspectRatio} filename="feature-name"><FeatureNamePost /></PostWrapper>`
   - Add them to the grid inside the providers

7. **Verify** the font is loaded in `app/layout.tsx`.

## Example Usage

User says: `/generate-posts`

Then provide details like:
```
App: Sylo - Restaurant management system
URL: https://sylo.app
Screenshots: 1.jpg, 2.jpg, 3.jpg, 4.jpg
Language: Arabic
Posts: 4
Features: POS, Inventory, Staff Management, Analytics, Online Orders
```

$ARGUMENTS
