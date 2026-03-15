/**
 * Engine V7: App Store Guided (AG)
 * Template-based engine — AI returns content JSON, we handle all layout.
 * AI controls: headline, subtitle, background, badges, creative copy
 * Templates control: positioning, flex structure, z-index, overflow
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { GenerationContext } from "@/lib/ai/types";
import {
  type GenerateRequest,
  type GenerateResponse,
  getModel,
  buildRefImageParts,
  handleGenerationError,
  shuffle,
  buildRatioNote,
  buildContextPostsSection,
  buildContextPostsSummary,
  buildContextAssetsSection,
} from "../_shared";

/* ── AI Content Schema ─────────────────────────────────────────── */

interface AIContent {
  headline: string;
  subtitle?: string;
  background: string;
  badges?: { label: string; value: string }[];
  caption: string;
  imageKeywords: string[];
}

/* ── Background Presets ────────────────────────────────────────── */

const BACKGROUNDS: Record<string, string> = {
  'gradient-dark': `
      <div className="absolute inset-0 z-0" style={{ background: \`linear-gradient(160deg, \${t.primaryDark}, \${t.primary})\` }} />`,
  'gradient-accent': `
      <div className="absolute inset-0 z-0" style={{ background: \`linear-gradient(160deg, \${t.primary}, \${t.accent}40)\` }} />`,
  'glow': `
      <div className="absolute top-0 right-0 w-[80%] h-[80%] rounded-full blur-[100px] opacity-20 z-0" style={{ backgroundColor: t.accent }} />`,
  'glow-bottom': `
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] rounded-full blur-[100px] opacity-15 z-0" style={{ backgroundColor: t.accentLime }} />`,
  'dots': `
      <div className="absolute inset-0 opacity-[0.04] z-0" style={{ backgroundImage: \`radial-gradient(\${t.primaryLight} 1px, transparent 1px)\`, backgroundSize: '24px 24px' }} />`,
  'cinematic': `
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />`,
  'minimal': '',
  'duotone': `
      <div className="absolute inset-0 z-0" style={{ background: \`linear-gradient(180deg, \${t.primary} 0%, \${t.primaryDark} 100%)\` }} />
      <div className="absolute top-0 left-0 w-1/2 h-full opacity-10 z-0" style={{ backgroundColor: t.accent }} />`,
};

/* ── Badge Builder ─────────────────────────────────────────────── */

function buildBadges(badges?: { label: string; value: string }[]): string {
  if (!badges || badges.length === 0) return '';
  const positions = [
    'absolute -left-3 top-[15%] -rotate-3',
    'absolute -right-3 top-[40%] rotate-2',
  ];
  return badges.slice(0, 2).map((b, i) =>
    `          <FloatingCard id="badge-${i}" label="${esc(b.label)}" value="${esc(b.value)}" variant="glass" animation="animate-float${i === 1 ? '-slow' : ''}" className="${positions[i]}" />`
  ).join('\n');
}

function esc(s: string): string {
  return s.replace(/"/g, '\\"').replace(/\n/g, ' ');
}

/* ── Template Functions ────────────────────────────────────────── */

type TemplateFn = (c: AIContent, screenshotUrl: string, screenshotUrl2?: string) => string;

const IMPORTS = `import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { MockupFrame, FloatingCard } from './shared';`;

const HOOKS = `  const t = useTheme();
  const ratio = useAspectRatio();
  const isTall = ratio === '9:16' || ratio === '3:4';
  const isWide = ratio === '16:9' || ratio === '4:3';`;

// Template A: Text Top-Left + Phone Bottom Bleed
const templateA: TemplateFn = (c, src) => `${IMPORTS}

export default function AppStorePreview() {
${HOOKS}

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      ${BACKGROUNDS[c.background] || ''}

      <div className="relative z-10 w-full h-full flex flex-col"
           style={{ padding: isTall ? '1.5rem' : '1.25rem' }}>

        <DraggableWrapper id="headline" className="shrink-0 flex flex-col items-start text-left mb-3">
          <EditableText as="h2" className="font-bold leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: t.primaryLight }}>
            ${esc(c.headline)}
          </EditableText>${c.subtitle ? `
          <EditableText as="p" className="mt-2 opacity-70 leading-tight"
            style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: t.primaryLight }}>
            ${esc(c.subtitle)}
          </EditableText>` : ''}
        </DraggableWrapper>

        <DraggableWrapper id="mockup-area"
          className="flex-1 min-h-0 relative flex items-end justify-center">
          <div className="translate-y-[15%]">
            <MockupFrame id="mockup" src="${src}" />
          </div>
${buildBadges(c.badges)}
        </DraggableWrapper>

      </div>
    </div>
  );
}`;

// Template B: Text Top-Center Bold + Phone Bottom Bleed
const templateB: TemplateFn = (c, src) => `${IMPORTS}

export default function AppStorePreview() {
${HOOKS}

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      ${BACKGROUNDS[c.background] || ''}

      <div className="relative z-10 w-full h-full flex flex-col items-center"
           style={{ padding: isTall ? '1.5rem' : '1.25rem' }}>

        <DraggableWrapper id="headline" className="shrink-0 flex flex-col items-center text-center mb-3">
          <EditableText as="h2" className="font-black leading-[0.85] uppercase tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: t.primaryLight }}>
            ${esc(c.headline)}
          </EditableText>${c.subtitle ? `
          <EditableText as="p" className="mt-3 opacity-70 leading-tight"
            style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: t.primaryLight }}>
            ${esc(c.subtitle)}
          </EditableText>` : ''}
        </DraggableWrapper>

        <DraggableWrapper id="mockup-area"
          className="flex-1 min-h-0 relative flex items-end justify-center">
          <div className="translate-y-[12%]">
            <MockupFrame id="mockup" src="${src}" />
          </div>
${buildBadges(c.badges)}
        </DraggableWrapper>

      </div>
    </div>
  );
}`;

// Template C: Phone Top + Text Bottom
const templateC: TemplateFn = (c, src) => `${IMPORTS}

export default function AppStorePreview() {
${HOOKS}

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      ${BACKGROUNDS[c.background] || ''}

      <div className="relative z-10 w-full h-full flex flex-col"
           style={{ padding: isTall ? '1.5rem' : '1.25rem' }}>

        <DraggableWrapper id="mockup-area"
          className="flex-1 min-h-0 relative flex items-center justify-center">
          <div className="-translate-y-[5%]">
            <MockupFrame id="mockup" src="${src}" />
          </div>
${buildBadges(c.badges)}
        </DraggableWrapper>

        <DraggableWrapper id="headline" className="shrink-0 flex flex-col items-start text-left mt-3">
          <EditableText as="h2" className="font-black leading-[0.9]"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: t.primaryLight }}>
            ${esc(c.headline)}
          </EditableText>${c.subtitle ? `
          <EditableText as="p" className="mt-2 opacity-70 leading-tight"
            style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: t.primaryLight }}>
            ${esc(c.subtitle)}
          </EditableText>` : ''}
        </DraggableWrapper>

      </div>
    </div>
  );
}`;

// Template D: Side Split — Text Left, Phone Right
const templateD: TemplateFn = (c, src) => `${IMPORTS}

export default function AppStorePreview() {
${HOOKS}

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      ${BACKGROUNDS[c.background] || ''}

      <div className={\`relative z-10 w-full h-full flex \${isTall ? 'flex-col' : 'flex-row'}\`}
           style={{ padding: isTall ? '1.5rem' : '1.25rem' }}>

        <DraggableWrapper id="headline"
          className={\`\${isTall ? 'shrink-0 mb-3' : 'w-[42%] shrink-0 pr-3'} flex flex-col items-start text-left justify-center\`}>
          <EditableText as="h2" className="font-bold leading-[0.95]"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 3.2rem)', color: t.primaryLight }}>
            ${esc(c.headline)}
          </EditableText>${c.subtitle ? `
          <EditableText as="p" className="mt-2 opacity-70 leading-tight"
            style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)', color: t.primaryLight }}>
            ${esc(c.subtitle)}
          </EditableText>` : ''}
        </DraggableWrapper>

        <DraggableWrapper id="mockup-area"
          className="flex-1 min-h-0 relative flex items-center justify-center">
          <div className={isTall ? 'translate-y-[10%]' : 'translate-x-[15%]'}>
            <MockupFrame id="mockup" src="${src}" />
          </div>
${buildBadges(c.badges)}
        </DraggableWrapper>

      </div>
    </div>
  );
}`;

// Template E: Badge Top + Headline + Subtitle + Phone Bottom
const templateE: TemplateFn = (c, src) => `${IMPORTS}

export default function AppStorePreview() {
${HOOKS}

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      ${BACKGROUNDS[c.background] || ''}

      <div className="relative z-10 w-full h-full flex flex-col"
           style={{ padding: isTall ? '1.5rem' : '1.25rem' }}>

        <DraggableWrapper id="headline" className="shrink-0 flex flex-col items-start text-left mb-3">${c.badges && c.badges[0] ? `
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ backgroundColor: t.accent + '20', color: t.accentLight }}>
            ${esc(c.badges[0].label)}
          </span>` : ''}
          <EditableText as="h2" className="font-bold leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: t.primaryLight }}>
            ${esc(c.headline)}
          </EditableText>${c.subtitle ? `
          <EditableText as="p" className="mt-2 opacity-60 leading-snug max-w-[85%]"
            style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', color: t.primaryLight }}>
            ${esc(c.subtitle)}
          </EditableText>` : ''}
        </DraggableWrapper>

        <DraggableWrapper id="mockup-area"
          className="flex-1 min-h-0 relative flex items-end justify-center">
          <div className="translate-y-[15%]">
            <MockupFrame id="mockup" src="${src}" />
          </div>
        </DraggableWrapper>

      </div>
    </div>
  );
}`;

// Template F: Social Proof / No Mockup
const templateF: TemplateFn = (c, src) => `${IMPORTS}

export default function AppStorePreview() {
${HOOKS}

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      ${BACKGROUNDS[c.background] || ''}

      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center"
           style={{ padding: isTall ? '2.5rem' : '2rem' }}>

        <DraggableWrapper id="headline" className="flex flex-col items-center gap-4">
          <EditableText as="h2" className="font-black leading-[0.85] uppercase tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: t.primaryLight }}>
            ${esc(c.headline)}
          </EditableText>${c.subtitle ? `
          <EditableText as="p" className="opacity-70 leading-relaxed max-w-[80%]"
            style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: t.primaryLight }}>
            ${esc(c.subtitle)}
          </EditableText>` : ''}${c.badges && c.badges.length > 0 ? `
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            ${c.badges.map((b, i) => `<span key="${i}" className="px-4 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: t.accent + '20', color: t.accentLight }}>${esc(b.value)}</span>`).join('\n            ')}
          </div>` : ''}
        </DraggableWrapper>

      </div>
    </div>
  );
}`;

// Template G: Two Mockups — Phone Top + Phone Bottom, Text in Middle
const templateG: TemplateFn = (c, src, src2) => `${IMPORTS}

export default function AppStorePreview() {
${HOOKS}

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      ${BACKGROUNDS[c.background] || ''}

      <div className="relative z-10 w-full h-full flex flex-col">

        <DraggableWrapper id="mockup-top"
          className="shrink-0 relative flex items-end justify-center overflow-hidden"
          style={{ height: isTall ? '30%' : '28%' }}>
          <MockupFrame id="mockup-1" src="${src}" />
        </DraggableWrapper>

        <DraggableWrapper id="headline" className="shrink-0 flex flex-col items-center text-center relative z-20"
          style={{ padding: isTall ? '1rem 1.5rem' : '0.75rem 1.25rem' }}>
          <EditableText as="h2" className="font-black leading-[0.85] uppercase tracking-tight"
            style={{ fontSize: 'clamp(2rem, 7vw, 4.5rem)', color: t.primaryLight }}>
            ${esc(c.headline)}
          </EditableText>${c.subtitle ? `
          <EditableText as="p" className="mt-2 opacity-70 leading-tight"
            style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', color: t.primaryLight }}>
            ${esc(c.subtitle)}
          </EditableText>` : ''}
        </DraggableWrapper>

        <DraggableWrapper id="mockup-bottom"
          className="flex-1 min-h-0 relative flex items-start justify-center">
          <div className="translate-y-[10%]">
            <MockupFrame id="mockup-2" src="${src2 || src}" />
          </div>
${buildBadges(c.badges)}
        </DraggableWrapper>

      </div>
    </div>
  );
}`;

/* ── Template Registry ─────────────────────────────────────────── */

interface TemplateInfo {
  name: string;
  description: string;
  fn: TemplateFn;
  hasMockup: boolean;
}

const TEMPLATES: TemplateInfo[] = [
  { name: 'A', description: 'Headline top-left, phone bleeds from bottom', fn: templateA, hasMockup: true },
  { name: 'B', description: 'Bold centered headline, phone bleeds from bottom', fn: templateB, hasMockup: true },
  { name: 'C', description: 'Phone top center, headline at bottom', fn: templateC, hasMockup: true },
  { name: 'D', description: 'Text left side, phone right side (side-by-side)', fn: templateD, hasMockup: true },
  { name: 'E', description: 'Badge + headline + subtitle top, phone bottom', fn: templateE, hasMockup: true },
  { name: 'F', description: 'Social proof / big text only, no device mockup', fn: templateF, hasMockup: false },
  { name: 'G', description: 'Two phones — one top (bleeding off top), headline in middle, one bottom (bleeding off bottom)', fn: templateG, hasMockup: true },
];

/* ── Moods ─────────────────────────────────────────────────────── */

const MOODS = [
  'Premium & clean',
  'Bold & dramatic',
  'Warm & inviting',
  'Cinematic & dark',
  'Minimal & elegant',
  'Modern & vibrant',
];

/* ── System Prompt ─────────────────────────────────────────────── */

function buildSystemPrompt(template: TemplateInfo): string {
  return `You are an App Store screenshot copywriter. Generate creative content for a pre-built template.

You do NOT write code. You return JSON content that fills a template.

## ASSIGNED TEMPLATE: ${template.name}
${template.description}
${template.hasMockup ? 'This template includes a device mockup showing the app screenshot.' : 'This template has NO device mockup — it is text/social-proof only.'}

## YOUR JOB
Write compelling, short creative copy. The template handles all layout and positioning.

## RETURN FORMAT
Return ONLY this JSON:
\`\`\`json
{
  "headline": "2-5 words, bold, punchy",
  "subtitle": "Optional 1 short line or null",
  "background": "gradient-dark|gradient-accent|glow|glow-bottom|dots|cinematic|minimal|duotone",
  "badges": [{"label": "MAX 12 CHARS", "value": "MAX 16 CHARS"}],
  "caption": "Social media caption with emojis and hashtags",
  "imageKeywords": ["keyword1", "keyword2", "keyword3"]
}
\`\`\`

## CONTENT RULES
- headline: MAX 5 words, MAX 2 lines. Bold. Punchy. Like real App Store screenshots.
- subtitle: MAX 10 words. Optional — set to null if not needed.
- background: Pick ONE from the list above.
- badges: 0-2 badges. Each label max 12 chars, each value max 16 chars. ${template.hasMockup ? 'These float next to the mockup.' : 'These render as pill tags.'}
- caption: 2-3 sentences, emojis, 3-5 hashtags.
- imageKeywords: 3-5 English keywords for Unsplash.

Return ONLY the JSON. No explanation, no code.`;
}

/* ── Parse AI Response ─────────────────────────────────────────── */

function parseContent(text: string): AIContent | null {
  try {
    // Strip markdown fences if present
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }
    const parsed = JSON.parse(clean);
    if (!parsed.headline || !parsed.caption) return null;
    return {
      headline: String(parsed.headline).slice(0, 60),
      subtitle: parsed.subtitle ? String(parsed.subtitle).slice(0, 80) : undefined,
      background: parsed.background || 'minimal',
      badges: Array.isArray(parsed.badges) ? parsed.badges.slice(0, 2).map((b: { label?: string; value?: string }) => ({
        label: String(b.label || '').slice(0, 12),
        value: String(b.value || '').slice(0, 16),
      })) : undefined,
      caption: String(parsed.caption),
      imageKeywords: Array.isArray(parsed.imageKeywords) ? parsed.imageKeywords.map(String) : [],
    };
  } catch {
    console.error('Failed to parse AI content:', text.slice(0, 200));
    return null;
  }
}

/* ── Generate ──────────────────────────────────────────────────── */

export async function generate(req: GenerateRequest): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages, model, contextPosts, contextAssets } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 8);

    const { client: gemini, modelId: resolvedModel } = getModel(model);
    const refImageParts = buildRefImageParts(referenceImages);

    const shuffledMoods = shuffle(MOODS);
    const shuffledTemplates = shuffle(TEMPLATES);

    // When user selected specific assets, use those; otherwise pick from all
    const hasSelectedAssets = contextAssets && contextAssets.length > 0;
    let allUsableAssets: { url: string; type: string; aiAnalysis?: string }[];
    if (hasSelectedAssets) {
      allUsableAssets = contextAssets;
    } else {
      const screenshotAssets = context?.assets?.filter(a =>
        ['screenshot', 'iphone', 'ipad', 'desktop', 'android_phone', 'android_tablet', 'product'].includes(a.type)
      ) || [];
      allUsableAssets = screenshotAssets.length > 0
        ? screenshotAssets
        : (context?.assets?.filter(a => a.type !== 'logo' && a.type !== 'background') || []);
    }

    // Build brand context
    const brandSections: string[] = [];
    if (context) {
      const ctx = context as GenerationContext;
      if (ctx.brandName) brandSections.push(`Brand: ${ctx.brandName}`);
      if (ctx.language) brandSections.push(`Language: ${ctx.language === 'ar' ? 'Arabic' : 'English'}`);
      if (ctx.websiteInfo) {
        const wi = ctx.websiteInfo;
        if (wi.companyName) brandSections.push(`Company: ${wi.companyName}`);
        if (wi.description) brandSections.push(`About: ${wi.description}`);
        if (wi.features?.length) brandSections.push(`Features: ${wi.features.join(', ')}`);
      }
    }
    const brandContext = brandSections.length > 0
      ? `\n\nBrand context:\n${brandSections.join('\n')}`
      : '';

    let totalTokens = 0;
    let totalPrompt = 0;
    let totalCompletion = 0;

    const contextPostsSection = buildContextPostsSummary(contextPosts) + buildContextPostsSection(contextPosts);
    const contextAssetsSection = buildContextAssetsSection(contextAssets);

    const promises = Array.from({ length: postCount }, async (_, i) => {
      const template = shuffledTemplates[i % shuffledTemplates.length];
      const mood = shuffledMoods[i % shuffledMoods.length];
      const asset = allUsableAssets.length > 0
        ? allUsableAssets[i % allUsableAssets.length]
        : null;
      const asset2 = allUsableAssets.length > 1
        ? allUsableAssets[(i + 1) % allUsableAssets.length]
        : null;
      const screenshotUrl = asset?.url || '';
      const screenshotUrl2 = asset2?.url || '';

      const hasContext = contextPosts && contextPosts.length > 0;
      const systemPrompt = buildSystemPrompt(template) + brandContext + contextPostsSection + contextAssetsSection;
      const userPrompt = hasContext
        ? `Create App Store preview content for: ${prompt}

CRITICAL: The user selected reference posts they love. Match the SAME headline style, copy tone, and mood. Study the reference posts above and generate content that feels like it belongs in the same series.${asset?.aiAnalysis ? `\nThe app screenshot shows: ${asset.aiAnalysis}` : ''}${buildRatioNote(targetRatio)}`
        : `Create App Store preview content for: ${prompt}

Creative mood: ${mood}${asset?.aiAnalysis ? `\nThe app screenshot shows: ${asset.aiAnalysis}` : ''}${buildRatioNote(targetRatio)}`;

      try {
        const result = await gemini.generateContent([
          { text: systemPrompt },
          ...refImageParts,
          { text: userPrompt },
        ]);

        const usage = result.response.usageMetadata;
        totalTokens += usage?.totalTokenCount ?? 0;
        totalPrompt += usage?.promptTokenCount ?? 0;
        totalCompletion += usage?.candidatesTokenCount ?? 0;

        const content = parseContent(result.response.text());
        if (!content) return null;

        // Assemble template + content → final TSX code
        const code = template.fn(content, screenshotUrl, screenshotUrl2);

        return {
          code,
          caption: content.caption,
          imageKeywords: content.imageKeywords,
        };
      } catch (err) {
        console.error(`AG generation ${i + 1} failed:`, err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const parsed = results.filter((r): r is NonNullable<typeof r> => r !== null);

    if (parsed.length === 0) {
      return NextResponse.json({ error: 'All generations failed' }, { status: 500 });
    }

    return NextResponse.json({
      code: parsed[0].code,
      codes: parsed.map(p => p.code),
      captions: parsed.map(p => p.caption),
      imageKeywords: parsed.map(p => p.imageKeywords),
      usage: {
        totalTokens,
        promptTokens: totalPrompt,
        completionTokens: totalCompletion,
        model: resolvedModel,
        postsGenerated: parsed.length,
      },
    } satisfies GenerateResponse);
  } catch (error) {
    return handleGenerationError(error);
  }
}
