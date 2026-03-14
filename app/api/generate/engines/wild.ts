/**
 * Engine V4: Wild (W)
 * Copy-first creative engine — single API call for all posts.
 * AI generates a cohesive series with full creative freedom.
 */
import { NextResponse } from "next/server";
import { WILD_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt-wild";
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
} from "../_shared";

const WILD_MOODS = [
  'Bold & dramatic — big typography, strong contrast, dark background, powerful single statement',
  'Minimal & elegant — lots of white space, light background, delicate typography, understated luxury',
  'Energetic & vibrant — bright accent colors, dynamic angles, playful layout, movement and energy',
  'Editorial & sophisticated — magazine-style layout, refined typography, structured grid, premium feel',
  'Warm & emotional — soft gradients, warm tones, personal touch, heartfelt message',
  'Modern & geometric — clean shapes, asymmetric layout, tech-inspired, contemporary design',
  'Organic & natural — flowing shapes, soft curves, nature-inspired decorations, calming mood',
  'Retro & bold — chunky text, strong borders, nostalgic feel, eye-catching patterns',
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
      if (ctx.logoUrl) brandContext.push(`Logo URL: ${ctx.logoUrl}`);
    }

    const contextPostsSection = buildContextPostsSection(contextPosts);
    const contextAssetsSection = buildContextAssetsSection(contextAssets);
    const systemPrompt = [
      WILD_SYSTEM_PROMPT,
      brandContext.length > 0 ? `## BRAND CONTEXT\n${brandContext.join('\n')}` : '',
      contextPostsSection,
      contextAssetsSection,
    ].filter(Boolean).join('\n\n');

    // Build asset list — skip when user selected specific assets
    const hasSelectedAssets = contextAssets && contextAssets.length > 0;
    let assetSection = '';
    if (!hasSelectedAssets) {
      const allAssets = context?.assets || [];
      const assetLines: string[] = [];
      for (const a of shuffle(allAssets.filter(a => a.type !== 'logo'))) {
        const typeLabel = ['iphone', 'ipad', 'desktop', 'screenshot'].includes(a.type)
          ? 'screenshot' : a.type;
        assetLines.push(`- ${typeLabel}: ${a.url}${a.aiAnalysis ? ` — ${a.aiAnalysis}` : ''}`);
      }
      assetSection = assetLines.length > 0
        ? `\n\nAvailable images (use different ones across posts — each post should pick ONE):\n${assetLines.join('\n')}`
        : '';
    }

    const hasContext = contextPosts && contextPosts.length > 0;

    // When context posts are provided, skip random moods — follow the reference style instead
    const moods = hasContext ? [] : shuffle(WILD_MOODS).slice(0, postCount);
    const moodList = moods.map((m, i) => `Post ${i + 1}: ${m}`).join('\n');

    // Single user prompt for all posts
    const userPrompt = hasContext
      ? `Generate ${postCount} social media posts for: ${prompt}

## CRITICAL: FOLLOW THE REFERENCE POSTS
The user selected reference posts above. You MUST closely replicate their EXACT style:
- Same layout structure (image placement, text positioning, spacing)
- Same visual mood (colors, background treatment, border style)
- Same typography approach (font size, weight, case, tracking)
- Same content pattern (short elegant headlines, minimal text, image-forward)
- Same component usage (if they use <img> with borders, you use <img> with borders)

Create ${postCount} NEW posts that look like they belong in the SAME series as the reference posts. Vary the headlines and images, but keep the design language IDENTICAL.${assetSection}${buildRatioNote(targetRatio)}`
      : `Generate ${postCount} social media posts for: ${prompt}

## CREATIVE MOODS (one per post)
${moodList}

Write original copy for each post — bold headlines and supporting messages that tell stories and sell visions. Each post should have a COMPLETELY different design, layout, copy angle, and asset choice. They should work together as a cohesive brand series.

Do NOT just list features. Think like a creative agency.${assetSection}${buildRatioNote(targetRatio)}`;

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
    // Strip markdown fences if present
    let clean = text;
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(clean);

    // Handle both array and single object
    const arr = Array.isArray(data) ? data : [data];

    return arr
      .filter((p: Record<string, unknown>) => p && typeof p.code === 'string' && p.code.length > 50)
      .map((p: Record<string, unknown>) => ({
        code: String(p.code),
        caption: String(p.caption || ''),
        imageKeywords: Array.isArray(p.imageKeywords) ? p.imageKeywords.map(String) : [],
      }));
  } catch {
    console.error('Failed to parse posts array:', text.slice(0, 300));

    // Fallback: try to extract individual JSON objects from the response
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
