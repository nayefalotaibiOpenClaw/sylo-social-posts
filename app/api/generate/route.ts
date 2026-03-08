import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// ─── V1: Freestyle (AI builds everything from scratch) ──────────────────────

const STATIC_PROMPT_V1 = `You are an expert React component generator for social media posts. Generate a SINGLE visually stunning, UNIQUE React component. Be wildly creative — every post must look completely different.

## IMPORTS
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
// Only import device mockups if you have matching assets:
// import { IPhoneMockup, IPadMockup, DesktopMockup } from './shared';
// Import only the lucide-react icons you use:
// import { Heart, Star, Flower2, Gift, Truck } from 'lucide-react';

## THEME (MANDATORY - never hardcode colors)
const t = useTheme();
t.primary (dark), t.primaryLight (light bg), t.primaryDark (darkest), t.accent (medium), t.accentLight, t.accentLime (bright), t.accentGold, t.accentOrange, t.border, t.font (font family)
Apply via style props ONLY: style={{ backgroundColor: t.primary, color: t.primaryLight }}
NEVER use Tailwind color classes like bg-[#1B4332]. NEVER hardcode hex colors.

## ASPECT RATIO (MANDATORY)
const ratio = useAspectRatio();
const isTall = ratio === '9:16' || ratio === '3:4';

## CORE COMPONENTS

**<EditableText>** — MANDATORY: wrap ALL visible text. Props: as ("h2"|"p"|"span"|"h3"), className, style. Default renders as span.
**<DraggableWrapper>** — MANDATORY: wrap every content block so user can reposition. Props: id (unique string), className, variant ("mockup" for devices), dir ("rtl" for Arabic)

## DEVICE MOCKUPS (only when matching assets exist)
Import from './shared'. Always wrap in a sized div:

**<IPhoneMockup>** — src (image URL), alt, notch ("pill"|"notch")
Size: isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'

**<IPadMockup>** — src, alt, orientation ("landscape"|"portrait")
Size landscape: isTall ? 'w-[420px] h-[300px]' : 'w-[320px] h-[220px]'
Size portrait: isTall ? 'w-[260px] h-[360px]' : 'w-[200px] h-[280px]'

**<DesktopMockup>** — src, alt, url (shown in browser bar), trafficLights (boolean)
Size: isTall ? 'w-[420px] h-[280px]' : 'w-[360px] h-[240px]'

## SIZING REFERENCE
Root: className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}
Content: className="relative z-10 w-full h-full flex flex-col" with padding p-6 to p-10
Headings: text-3xl to text-6xl font-black
Subtext: text-base to text-xl
Small labels: text-[10px] to text-xs uppercase tracking-widest font-bold
Icons: size={14} to size={28}
Stat cards: min-w-[100px] p-3 rounded-xl
Logo images: w-8 h-8 to w-12 h-12 object-contain rounded-lg

## ASSET TYPE RULES (CRITICAL)
- **background** → <img src={url} className="absolute inset-0 w-full h-full object-cover" /> + overlay. NEVER in mockups.
- **screenshot/iphone** → ONLY inside <IPhoneMockup>. NEVER as background.
- **screenshot/ipad** → ONLY inside <IPadMockup>. NEVER as background.
- **screenshot/desktop** → ONLY inside <DesktopMockup>. NEVER as background.
- **product** → <img src={url} className="w-48 h-48 to w-72 h-72 object-contain drop-shadow-2xl" />
- **logo** → <img src={url} className="w-10 h-10 object-contain rounded-lg" /> in your header area
- NEVER put background images in mockups.

## DESIGN APPROACH
Build everything from scratch with Tailwind + inline styles. Create your own:
- Headers (brand logo + name + tagline)
- Stat cards, badges, tags
- Decorative elements (shapes, gradients, patterns, glows)
- Creative layouts (grids, splits, overlaps, diagonals)

Design families to pick from (vary each time!):
A) Hero Image — full-bleed photo, bold text overlay, cinematic feel
B) Device Showcase — mockup centered, stats floating around
C) Split — half photo/half text, or diagonal split
D) Bold Typography — massive text, no images, pattern bg, icon accents
E) Card Grid — 2-4 feature cards with icons
F) Product Hero — product image floating with badges
G) Magazine Cover — photo dominant, text bar at bottom
H) Minimal White — light bg, tons of whitespace, one color pop
I) Angular/Geometric — clip-path shapes, overlapping colored sections
J) Quote/Testimonial — oversized decorative quote marks, centered text

Vary: dark vs light bg, text alignment, element count, icon choices, spacing, decorative patterns.

## CONTENT WRITING RULES (CRITICAL)
- The workspace/company info is for INSPIRATION ONLY — understand the brand, then write ORIGINAL creative copy
- NEVER copy text directly from workspace info or features list
- Write catchy, creative marketing headlines — think like a copywriter, not a data displayer
- Each post should have a unique angle/message even for the same brand
- Use metaphors, power words, emotional language
- Keep it short and punchy — social media style

## OUTPUT
Return ONLY the raw component code. No markdown fences, no backticks, no explanation. Start with imports.`;

// ─── V2: Structured (uses shared components like the skill prompt) ──────────

const STATIC_PROMPT_V2 = `You are an expert social media post designer. Generate a SINGLE visually stunning React/TSX component. Each post should highlight ONE feature or message with a creative visual metaphor.

## Required Imports
\`\`\`tsx
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, IPadMockup, DesktopMockup, PostHeader, PostFooter, FloatingCard } from './shared';
// Import only the lucide-react icons you use
\`\`\`

## Theme System (MANDATORY — never hardcode colors)
\`\`\`tsx
const t = useTheme();
// t.primary (dark), t.primaryLight (light bg), t.primaryDark (darkest)
// t.accent (medium), t.accentLight, t.accentLime (bright), t.accentGold, t.accentOrange
// t.border, t.font (font family string)
\`\`\`
Apply via inline style props: style={{ backgroundColor: t.primary, color: t.primaryLight }}
NEVER use Tailwind color classes like bg-[#1B4332].

## Aspect Ratio (MANDATORY)
\`\`\`tsx
const ratio = useAspectRatio();
const isTall = ratio === '9:16' || ratio === '3:4';
\`\`\`

## Shared Components

### <PostHeader> — Top bar with brand logo + subtitle + badge
\`\`\`tsx
<PostHeader id="mypost" title="BrandName" subtitle="FLOWERS" badge={<><Star size={12}/> PREMIUM</>} variant="dark" logoUrl="/logo.png" />
\`\`\`
Props: id (required), title (brand name), subtitle, badge (JSX), variant ("dark"|"light"), logoUrl

### <PostFooter> — Bottom bar with brand label + text + icon
\`\`\`tsx
<PostFooter id="mypost" label="BRAND FLOWERS" text="وصف قصير" icon={<Heart size={24}/>} variant="dark" />
\`\`\`
Props: id, label (use actual brand name — NEVER "SYLO"), text, icon (JSX), variant ("dark"|"light")

### <FloatingCard> — Floating stat card with animation
\`\`\`tsx
<FloatingCard id="stat1" icon={<BarChart size={16}/>} label="Growth" value="+24%" className="absolute -right-8 top-16" rotate={3} borderColor={t.accentLime} animation="float" />
\`\`\`
Props: id, icon, label, value, className, rotate (number), borderColor, animation ("float"|"float-slow"|"none")

### <IPhoneMockup> — iPhone device frame
Wrap in sized div: \`className={isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}\`
Props: src (required), alt, notch ("pill"|"notch")

### <IPadMockup> — iPad device frame
Landscape: \`className={isTall ? 'w-[420px] h-[300px]' : 'w-[320px] h-[220px]'}\`
Portrait: \`className={isTall ? 'w-[260px] h-[360px]' : 'w-[200px] h-[280px]'}\`
Props: src (required), alt, orientation ("landscape"|"portrait")

### <DesktopMockup> — Browser window frame
Size: \`className={isTall ? 'w-[420px] h-[280px]' : 'w-[360px] h-[240px]'}\`
Props: src (required), alt, url (address bar text), trafficLights (boolean)

## Mandatory Wrappers
**<EditableText>** — Wrap ALL visible text. Props: as ("h2"|"p"|"span"|"h3"), className, style
**<DraggableWrapper>** — Wrap ALL moveable sections. Props: id (unique), className, variant ("mockup" for devices), dir ("rtl" for Arabic)

## Asset Type Rules (CRITICAL)
- **background** → Full-bleed: \`<img src={url} className="absolute inset-0 w-full h-full object-cover" />\` + overlay. NEVER in mockups.
- **screenshot/iphone** → ONLY inside <IPhoneMockup>
- **screenshot/ipad** → ONLY inside <IPadMockup>
- **screenshot/desktop** → ONLY inside <DesktopMockup>
- **product** → Hero image: \`<img src={url} className="w-64 h-64 object-contain drop-shadow-2xl" />\`
- **logo** → Pass to PostHeader via logoUrl prop
- NEVER put background images in device mockups.

## Background Decorations (pick 1-2 per post, vary them!)
\`\`\`tsx
// Gradient (dark posts)
<div className="absolute inset-0" style={{ background: \\\`linear-gradient(to bottom right, \\\${t.primary}, \\\${t.primaryDark})\\\` }} />
// Glow circle
<div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-[0.15] blur-[120px] rounded-full" style={{ backgroundColor: t.accentLime }} />
// Grid pattern
<div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: \\\`linear-gradient(\\\${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, \\\${t.primaryLight} 0.5px, transparent 0.5px)\\\`, backgroundSize: '30px 30px'}} />
// Dot pattern
<div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: \\\`radial-gradient(\\\${t.primary} 1px, transparent 1px)\\\`, backgroundSize: '20px 20px'}} />
\`\`\`

## Design Rules
- Root div: \`className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"\` with \`style={{ backgroundColor: t.primary, fontFamily: t.font }}\`
- Content wrapper: \`className="relative z-10 w-full h-full flex flex-col p-8"\`
- Alternate dark bg (t.primary) and light bg (t.primaryLight)
- Each post highlights ONE feature with a creative visual metaphor
- Icons only from lucide-react
- Use CSS-only visuals (gradients, blur, patterns) for decoration

## Layout Variety (pick different ones!)
- Dark bg + iPhone mockup + floating stat cards
- Light bg + iPad mockup + feature list cards
- Dark bg + Desktop mockup + gradient overlay
- Light bg + CSS-only cards (no mockup) + icon grid
- Dark bg + bold typography + pattern background
- Split layout: half image, half text
- Magazine: large photo bg + text panel at bottom

## CONTENT WRITING RULES (CRITICAL)
- The workspace/company info is for INSPIRATION ONLY
- NEVER copy text directly from workspace info or features list
- Write ORIGINAL creative marketing copy — catchy, punchy, social media style
- Each post = unique angle, unique message
- Think like a copywriter, not a data displayer

## OUTPUT
Return ONLY the complete component code. No markdown fences, no backticks, no explanation. Start with import statements.`;

// ─── DYNAMIC CONTEXT BUILDER (shared by both versions) ──────────────────────

interface AssetInfo {
  id: string;
  url: string;
  type: string;
  label?: string;
  description?: string;
  aiAnalysis?: string;
}

interface WebsiteInfo {
  companyName?: string;
  description?: string;
  industry?: string;
  features?: string[];
  targetAudience?: string;
  tone?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    socialMedia?: string[];
  };
  content?: string;
}

interface GenerationContext {
  brandName?: string;
  tagline?: string;
  website?: string;
  industry?: string;
  language: "en" | "ar";
  logoUrl?: string;
  websiteInfo?: WebsiteInfo;
  assets: AssetInfo[];
}

function buildDynamicPrompt(context: GenerationContext, version: number): string {
  const {
    brandName = "Brand",
    tagline,
    website,
    industry,
    language,
    logoUrl,
    websiteInfo,
    assets,
  } = context;

  const isArabic = language === "ar";
  const sections: string[] = [];

  // ── Brand context ──
  const brandLines: string[] = [`- Brand name: ${brandName}`];
  if (tagline) brandLines.push(`- Tagline: ${tagline}`);
  if (industry) brandLines.push(`- Industry: ${industry}`);
  if (website) brandLines.push(`- Website: ${website}`);
  brandLines.push(
    `- Language: ${
      isArabic
        ? "Arabic for ALL text (headings, body, labels). English only for numbers/stats."
        : "English for all text"
    }`
  );

  sections.push(`## BRAND\n${brandLines.join("\n")}`);

  // ── Logo ──
  if (logoUrl) {
    if (version === 2) {
      sections.push(
        `## LOGO (MANDATORY)\nURL: ${logoUrl}\nPass to PostHeader: <PostHeader id="..." title="${brandName}" logoUrl="${logoUrl}" ... />`
      );
    } else {
      sections.push(
        `## LOGO\nURL: ${logoUrl}\nDisplay in your header: <img src="${logoUrl}" alt="${brandName}" className="w-10 h-10 object-contain rounded-lg" />`
      );
    }
  }

  // ── Available assets — grouped by type ──
  if (assets && assets.length > 0) {
    const grouped: Record<string, AssetInfo[]> = {};
    for (const a of assets) {
      const key = a.type || "other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
    }

    const assetSections: string[] = [];

    for (const [type, items] of Object.entries(grouped)) {
      const lines = items.map((a) => {
        let line = `  - URL: ${a.url}`;
        if (a.label) line += `\n    Label: ${a.label}`;
        if (a.description) line += `\n    Description: ${a.description}`;
        if (a.aiAnalysis) line += `\n    AI Analysis: ${a.aiAnalysis}`;
        return line;
      }).join("\n");

      let usage = "";
      switch (type) {
        case "background":
          usage = "USE AS: Full-bleed <img> with overlay on top. NEVER in device mockups.";
          break;
        case "iphone":
        case "screenshot":
          usage = "USE AS: Inside <IPhoneMockup src={url} /> only.";
          break;
        case "ipad":
          usage = "USE AS: Inside <IPadMockup src={url} /> only.";
          break;
        case "desktop":
          usage = "USE AS: Inside <DesktopMockup src={url} /> only.";
          break;
        case "product":
          usage = "USE AS: Hero product <img> with drop-shadow, positioned creatively.";
          break;
        case "logo":
          usage = version === 2
            ? "USE AS: Pass to PostHeader via logoUrl prop."
            : "USE AS: Brand logo <img> in header area.";
          break;
        default:
          usage = "USE AS: Best placement based on the analysis.";
      }

      assetSections.push(`### ${type.toUpperCase()} (${items.length}):\n${usage}\n${lines}`);
    }

    sections.push(
      `## ASSETS (use these — NEVER use /1.jpg or hardcoded paths)\n${assetSections.join("\n\n")}`
    );
  } else {
    sections.push(
      `## ASSETS\nNone uploaded. Create CSS-only visuals — gradients, shapes, icons, patterns. No device mockups.`
    );
  }

  // ── Company info — INSPIRATION ONLY ──
  if (websiteInfo) {
    const infoLines: string[] = [];
    if (websiteInfo.companyName) infoLines.push(`Company: ${websiteInfo.companyName}`);
    if (websiteInfo.description) infoLines.push(`What they do: ${websiteInfo.description}`);
    if (websiteInfo.industry) infoLines.push(`Industry: ${websiteInfo.industry}`);
    if (websiteInfo.features && websiteInfo.features.length > 0) {
      infoLines.push(`Their features/services: ${websiteInfo.features.join(", ")}`);
    }
    if (websiteInfo.targetAudience) infoLines.push(`Audience: ${websiteInfo.targetAudience}`);
    if (websiteInfo.tone) infoLines.push(`Brand tone: ${websiteInfo.tone}`);
    if (infoLines.length > 0) {
      sections.push(
        `## COMPANY CONTEXT (INSPIRATION ONLY — do NOT copy this text)\nUse this to understand the brand, then write your OWN creative copy. Never repeat these words verbatim.\n${infoLines.join("\n")}`
      );
    }
  }

  // ── Layout rules ──
  const dirAttr = isArabic ? ' dir="rtl"' : "";
  const textAlign = isArabic ? "text-right" : "text-left";

  const conventionLines = [`- Brand name in header: "${brandName}"`];
  if (version === 2) {
    conventionLines.push(`- PostHeader: title="${brandName}"${logoUrl ? ` logoUrl="${logoUrl}"` : ""}`);
    conventionLines.push(`- PostFooter: label="${brandName.toUpperCase()}" — NEVER use "SYLO"`);
  }
  if (isArabic) {
    conventionLines.push(`- dir="rtl" on DraggableWrapper elements`);
    conventionLines.push(`- Text: className="${textAlign}"`);
  }
  conventionLines.push(`- Use ${dirAttr ? `dir="rtl" and ` : ""}className="${textAlign}" on text containers`);
  conventionLines.push(`- Write ORIGINAL creative copy — catchy headlines, not feature lists`);

  sections.push(`## LAYOUT RULES\n${conventionLines.join("\n")}\n\nNow create something stunning and original.`);

  return sections.join("\n\n");
}

// ─── API ROUTE ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { prompt, context, count = 1, version = 1 } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);
    const promptVersion = version === 2 ? 2 : 1;

    const staticPrompt = promptVersion === 2 ? STATIC_PROMPT_V2 : STATIC_PROMPT_V1;
    const dynamicSection = context
      ? buildDynamicPrompt(context as GenerationContext, promptVersion)
      : "";
    const systemPrompt = dynamicSection
      ? `${staticPrompt}\n\n${dynamicSection}`
      : staticPrompt;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    function cleanCode(raw: string): string {
      return raw.replace(/^```(?:tsx?|jsx?|javascript|typescript)?\n?/gm, '').replace(/```$/gm, '').trim();
    }

    if (postCount === 1) {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post for: ${prompt}\n\nBe creative. Unique layout. Original copy.` },
      ]);
      const code = cleanCode(result.response.text());
      return NextResponse.json({ code, codes: [code] });
    }

    const layoutHints = promptVersion === 2
      ? [
          "Dark bg + iPhone mockup + floating stat cards",
          "Light bg + bold typography + CSS pattern, no device mockups",
          "Dark bg + gradient overlay + card grid with icons",
          "Light bg + split layout: half image, half text with stats",
        ]
      : [
          "Use a Hero Image or Magazine layout — photo-dominant with bold text overlay",
          "Use Bold Typography or Minimal layout — no mockups, oversized text, icons, whitespace",
          "Use Card Grid or Angular layout — geometric, structured, multiple info sections",
          "Use Split or Product Hero layout — half image half text, or centered product",
        ];

    const promises = Array.from({ length: postCount }, (_, i) =>
      model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post for: ${prompt}\n\n${layoutHints[i % layoutHints.length]}\n\nPost ${i + 1}/${postCount} — MUST be visually distinct. Different layout, different copy angle.` },
      ]).then(r => cleanCode(r.response.text()))
        .catch(err => {
          console.error(`Generation ${i + 1} failed:`, err);
          return null;
        })
    );

    const results = await Promise.all(promises);
    const codes = results.filter((c): c is string => c !== null);

    if (codes.length === 0) {
      return NextResponse.json({ error: "All generations failed" }, { status: 500 });
    }

    return NextResponse.json({ code: codes[0], codes });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
