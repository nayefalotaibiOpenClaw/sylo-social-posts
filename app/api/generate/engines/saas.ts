/**
 * Engine V8: SaaS (S)
 * Typography-driven, CSS-only creative engine for SaaS brands.
 * Single API call — all posts generated cohesively.
 * NO images, NO mockups — pure CSS + text design.
 */
import { NextResponse } from "next/server";
import { SAAS_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt-saas";
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
  buildContextAssetsSection,
  buildThemeColorValues,
} from "../_shared";

const SAAS_MOODS = [
  'Product announcement — LIGHT background. Pill badge top, bold headline about a brand feature, polished CSS toggle rows or mini-dashboard below',
  'Data & statistics — DARK background. Pill badge, metric headline, CSS bar chart with one highlighted bar in a bright accent',
  'Feature showcase — WARM ACCENT background (t.accentGold). Headline about a core feature, CSS card-style UI elements below',
  'Bold statement — DARK background. One massive uppercase headline, minimal decoration, brand footer at bottom',
  'Content/Story — LIGHT background. Conversational headline, short subtitle, accent line divider, brand footer',
  'Job posting — WARM ACCENT background (t.accentGold). Hiring pill, large job title, bullet details, arrow CTA →',
  'Comparison/Pricing — LIGHT background. Headline, 2-3 rounded cards with contrasting headers and descriptions',
  'Integration/Tools — DARK background. Pill badge, headline about connecting tools, CSS app icon grid (rounded squares in accent colors)',
];

export async function generate(req: GenerateRequest): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages, model, contextPosts, contextAssets } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 8);

    const { client: gemini, modelId: resolvedModel } = getModel(model);
    const refImageParts = buildRefImageParts(referenceImages);

    // Build system prompt with brand context
    const brandContext: string[] = [];
    if (context) {
      const ctx = context as GenerationContext;
      if (ctx.brandName) brandContext.push(`Brand: ${ctx.brandName}`);
      if (ctx.language) brandContext.push(`Language: ${ctx.language === 'ar' ? 'Arabic (use dir="rtl" on DraggableWrapper, text-right on text)' : 'English'}`);
      if (ctx.websiteInfo) {
        const wi = ctx.websiteInfo;
        if (wi.companyName) brandContext.push(`Company: ${wi.companyName}`);
        if (wi.description) brandContext.push(`About: ${wi.description}`);
        if (wi.features?.length) brandContext.push(`Features: ${wi.features.join(', ')}`);
      }
      if (ctx.logoUrl) brandContext.push(`Logo URL: ${ctx.logoUrl} (do NOT use as <img> — mention brand name in text instead)`);
    }

    // Show AI the actual hex values so it can pick contrasting pairs
    const themeColorSection = buildThemeColorValues((context as GenerationContext)?.themeColors);

    const contextPostsSection = buildContextPostsSection(contextPosts);
    const contextAssetsSection = buildContextAssetsSection(contextAssets);
    const systemPrompt = [
      SAAS_SYSTEM_PROMPT,
      brandContext.length > 0 ? `## BRAND CONTEXT\n${brandContext.join('\n')}` : '',
      themeColorSection,
      contextPostsSection,
      contextAssetsSection,
    ].filter(Boolean).join('\n\n');

    const hasContext = contextPosts && contextPosts.length > 0;

    // When context posts are provided, skip random moods — follow the reference style
    const moods = hasContext ? [] : shuffle(SAAS_MOODS).slice(0, postCount);
    const moodList = moods.map((m, i) => `Post ${i + 1}: ${m}`).join('\n');

    const userPrompt = hasContext
      ? `Generate ${postCount} SaaS-style social media posts for: ${prompt}

## CRITICAL: FOLLOW THE REFERENCE POSTS
The user selected reference posts above. Closely replicate their EXACT style:
- Same layout structure and spacing
- Same visual mood and typography approach
- Same copy tone and headline style
- IMPORTANT: Do NOT add images or mockups — keep it CSS-only like the references.

Create ${postCount} NEW posts that belong in the SAME series. Vary the headlines but keep the design language IDENTICAL.${buildRatioNote(targetRatio)}`
      : `Generate ${postCount} SaaS-style social media posts for: ${prompt}

## CREATIVE MOODS (one per post)
${moodList}

## CRITICAL REMINDERS
- NO <img>, NO <MockupFrame>, NO image URLs. CSS + text only.
- Write ORIGINAL headlines specific to this brand — never reuse example text from the system prompt.
- Every post must have a UNIQUE headline, layout, background color, and CSS visual.
- Each post should sell a different angle of the brand (feature, benefit, stat, story, announcement).${buildRatioNote(targetRatio)}`;

    // Single API call for all posts
    const result = await gemini.generateContent({
      contents: [{ role: 'user', parts: [
        { text: systemPrompt },
        ...refImageParts,
        { text: userPrompt },
      ]}],
      generationConfig: {
        maxOutputTokens: 65536,
      },
    });

    const usage = result.response.usageMetadata;
    const totalTokens = usage?.totalTokenCount ?? 0;
    const promptTokens = usage?.promptTokenCount ?? 0;
    const completionTokens = usage?.candidatesTokenCount ?? 0;

    // Parse the JSON array response
    const responseText = result.response.text().trim();
    const parsed = parsePostsArray(responseText);

    if (parsed.length === 0) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({
      code: parsed[0].code,
      codes: parsed.map(p => p.code),
      captions: parsed.map(p => p.caption),
      imageKeywords: parsed.map(p => p.imageKeywords),
      usage: {
        totalTokens,
        promptTokens,
        completionTokens,
        model: resolvedModel,
        postsGenerated: parsed.length,
      },
    } satisfies GenerateResponse);
  } catch (error) {
    return handleGenerationError(error);
  }
}

/* ── Parse AI response (JSON array of posts) ────────────────────── */

interface ParsedPost {
  code: string;
  caption: string;
  imageKeywords: string[];
}

function parsePostsArray(text: string): ParsedPost[] {
  try {
    let clean = text;
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(clean);
    const arr = Array.isArray(data) ? data : [data];

    return arr
      .filter((p: Record<string, unknown>) => p && typeof p.code === 'string' && p.code.length > 50)
      .map((p: Record<string, unknown>) => ({
        code: String(p.code),
        caption: String(p.caption || ''),
        imageKeywords: Array.isArray(p.imageKeywords) ? p.imageKeywords.map(String) : [],
      }));
  } catch {
    console.error('Failed to parse SaaS posts array:', text.slice(0, 300));

    const posts: ParsedPost[] = [];
    const objectPattern = /\{[^{}]*"code"\s*:\s*"[\s\S]*?"\s*,\s*"caption"\s*:\s*"[\s\S]*?"\s*(?:,\s*"imageKeywords"\s*:\s*\[[\s\S]*?\])?\s*\}/g;
    const matches = text.match(objectPattern);
    if (matches) {
      for (const match of matches) {
        try {
          const obj = JSON.parse(match);
          if (obj.code && obj.code.length > 50) {
            posts.push({
              code: String(obj.code),
              caption: String(obj.caption || ''),
              imageKeywords: Array.isArray(obj.imageKeywords) ? obj.imageKeywords.map(String) : [],
            });
          }
        } catch { /* skip bad objects */ }
      }
    }
    return posts;
  }
}
