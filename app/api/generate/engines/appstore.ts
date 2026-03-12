/**
 * Engine V6: App Store Preview (A)
 * Creative-first engine with MockupFrame as the only hard requirement.
 * Gives the AI rendering environment + tools, then lets it design freely.
 */
import { NextResponse } from "next/server";
import type { GenerationContext } from "@/lib/ai/types";
import {
  type GenerateRequest,
  runGeneration,
  handleGenerationError,
  shuffle,
  buildRatioNote,
  buildDistinctNote,
} from "../_shared";

const MOODS = [
  'Premium & clean — Apple-style, minimal, let the app speak',
  'Bold & dramatic — big typography, strong contrast, powerful statement',
  'Warm & emotional — soft tones, personal touch, heartfelt message',
  'Editorial & sophisticated — magazine-style, refined, structured',
  'Energetic & vibrant — bright accents, dynamic, playful',
  'Cinematic — near-black bg, glowing elements, movie-poster energy',
  'Minimal & elegant — whitespace, delicate typography, understated luxury',
  'Modern & geometric — clean shapes, asymmetric, contemporary',
];

const SYSTEM_PROMPT = `You are a world-class social media designer. Create a stunning React/TSX post component.

## RENDERING ENVIRONMENT
Your component renders inside a container that changes size:
- 1:1 → 540×540px (square Instagram post)
- 9:16 → 540×960px (tall story/reel)
- 3:4 → 540×720px, 4:3 → 720×540px
- 16:9 → 960×540px (wide)
Your design MUST look great at ALL sizes.

## YOUR TOOLKIT
\`\`\`tsx
// REQUIRED — always import these
import React from 'react';
import EditableText from './EditableText';       // Wrap ALL visible text
import DraggableWrapper from './DraggableWrapper'; // Wrap ALL content sections (props: id, className, style, dir)
import { useAspectRatio } from './EditContext';   // Returns '1:1' | '9:16' | '16:9' | '3:4' | '4:3'
import { useTheme } from './ThemeContext';         // Theme colors + font

// OPTIONAL — use what you need
import { MockupFrame, PostHeader, PostFooter, FloatingCard } from './shared';
// import { IconName } from 'lucide-react';
\`\`\`

## THEME — never hardcode colors
\`\`\`tsx
const t = useTheme();
// t.primary, t.primaryDark, t.primaryLight
// t.accent, t.accentLight, t.accentLime, t.accentGold, t.accentOrange
// t.border, t.font
// Use via style={{ backgroundColor: t.primary, color: t.accentLime, fontFamily: t.font }}
\`\`\`

## RESPONSIVE
\`\`\`tsx
const ratio = useAspectRatio();
const isTall = ratio === '9:16' || ratio === '3:4';
const isWide = ratio === '16:9' || ratio === '4:3';
\`\`\`

## AVAILABLE COMPONENTS

**<MockupFrame>** — Device mockup that auto-sizes. Props: id (string), src (image URL), device ("phone"|"tablet"|"desktop", auto-detected if omitted).
Place inside a flex container — it handles its own sizing. Example:
\`\`\`tsx
<div className="flex-1 min-h-0 flex items-center justify-center relative">
  <MockupFrame id="mockup" src={imageUrl} />
</div>
\`\`\`

**<PostHeader>** — Brand header. Props: id, title, subtitle, badge (JSX), variant ("dark"|"light"), logoUrl.

**<PostFooter>** — Brand footer. Props: id, label, text, icon (JSX), variant ("dark"|"light").

**<FloatingCard>** — Annotation card. Props: id, icon (JSX), label, value, className, rotate (number), borderColor, variant ("default"|"glass"|"pill"|"glow"|"dark"|"outline"|"gradient"), animation ("animate-float"|"animate-float-slow"|"none").

**<EditableText>** — Props: as ("h2"|"p"|"span"|"h3"), className, style. Wrap ALL visible text.

**<DraggableWrapper>** — Props: id (unique string), className, style, dir ("rtl" for Arabic). Wrap ALL content sections.

## COMPONENT SKELETON
\`\`\`tsx
export default function PostName() {
  const t = useTheme();
  const ratio = useAspectRatio();
  const isTall = ratio === '9:16' || ratio === '3:4';
  const isWide = ratio === '16:9' || ratio === '4:3';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background / decorations — your choice */}
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden"
           style={{ padding: isTall ? '2rem' : '1.5rem' }}>
        {/* Your design — complete creative freedom */}
      </div>
    </div>
  );
}
\`\`\`

## RULES
1. \`useTheme()\` and \`useAspectRatio()\` must be the first lines in your component
2. ALL colors via theme — never hardcode hex values
3. ALL visible text wrapped in \`<EditableText>\`
4. ALL content sections wrapped in \`<DraggableWrapper id="unique-id">\`
5. Use \`flex-1 min-h-0\` on flexible content areas to prevent overflow
6. Export exactly one component: \`export default function PostName() { ... }\`

## OUTPUT FORMAT
Return a JSON object:
\`\`\`json
{
  "code": "// Full TSX component code",
  "caption": "Social media caption with emojis and hashtags",
  "imageKeywords": ["keyword1", "keyword2", "keyword3"]
}
\`\`\`
Return ONLY the JSON. No wrapping, no explanation.`;

export async function generate(req: GenerateRequest): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages, model } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);

    const shuffledMoods = shuffle(MOODS);

    // Get screenshot assets for MockupFrame
    const screenshotAssets = context?.assets?.filter(a =>
      ['screenshot', 'iphone', 'ipad', 'desktop'].includes(a.type)
    ) || [];
    const allUsableAssets = screenshotAssets.length > 0
      ? screenshotAssets
      : (context?.assets?.filter(a => a.type !== 'logo') || []);

    function buildSystemPrompt(): string {
      const sections: string[] = [];
      if (context) {
        const ctx = context as GenerationContext;
        if (ctx.brandName) sections.push(`Brand: ${ctx.brandName}`);
        if (ctx.language) sections.push(`Language: ${ctx.language === 'ar' ? 'Arabic (use dir="rtl" on DraggableWrapper, text-right on text)' : 'English'}`);
        if (ctx.logoUrl) sections.push(`Logo URL: ${ctx.logoUrl}`);

        if (ctx.assets && ctx.assets.length > 0) {
          const assetLines = ctx.assets.map(a => {
            let line = `- ${a.type}: ${a.url}`;
            if (a.label) line += ` | ${a.label}`;
            if (a.description) line += ` | ${a.description}`;
            if (a.aiAnalysis) line += `\n  AI Analysis: ${a.aiAnalysis}`;
            return line;
          }).join('\n');
          sections.push(`Assets:\n${assetLines}`);
        }

        if (ctx.websiteInfo) {
          const wi = ctx.websiteInfo;
          const infoLines: string[] = [];
          if (wi.companyName) infoLines.push(`Company: ${wi.companyName}`);
          if (wi.description) infoLines.push(`About: ${wi.description}`);
          if (wi.features && wi.features.length > 0) infoLines.push(`Features: ${wi.features.join(', ')}`);
          if (wi.targetAudience) infoLines.push(`Audience: ${wi.targetAudience}`);
          if (infoLines.length > 0) sections.push(`Brand info (for inspiration):\n${infoLines.join('\n')}`);
        }
      }

      const contextBlock = sections.length > 0
        ? `\n\n## BRAND CONTEXT\n${sections.join('\n')}`
        : '';

      return `${SYSTEM_PROMPT}${contextBlock}`;
    }

    return await runGeneration(
      postCount,
      () => buildSystemPrompt(),
      (i) => {
        const mood = shuffledMoods[i % shuffledMoods.length];
        const asset = allUsableAssets.length > 0
          ? allUsableAssets[i % allUsableAssets.length]
          : null;
        const screenshotUrl = asset?.url || '';

        const assetHint = asset ? `\n\nScreenshot to feature: ${screenshotUrl}${asset.aiAnalysis ? `\nWhat it shows: ${asset.aiAnalysis}` : ''}
Use <MockupFrame id="mockup" src="${screenshotUrl}" /> to display it in a device frame.` : '';

        return `Design a social media post for: ${prompt}

Creative mood: ${mood}${assetHint}

You have complete creative freedom. Design something original and stunning that fits this brand.${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
      model,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
