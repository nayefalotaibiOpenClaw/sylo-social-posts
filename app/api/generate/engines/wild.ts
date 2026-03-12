/**
 * Engine V4: Wild (W)
 * Minimal system prompt, mood variations, maximum creativity.
 * Per-post system prompts with shuffled assets.
 */
import { NextResponse } from "next/server";
import { WILD_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt-wild";
import type { GenerationContext } from "@/lib/ai/types";
import {
  type GenerateRequest,
  runGeneration,
  handleGenerationError,
  shuffle,
  buildRatioNote,
  buildDistinctNote,
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
    const { prompt, context, count = 1, targetRatio, referenceImages, model } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);

    const shuffledMoods = shuffle(WILD_MOODS);
    const availableAssets = context?.assets?.filter(a => a.type !== 'logo') || [];

    // Build per-post system prompt with shuffled assets
    function buildWildSystemPrompt(postIndex: number): string {
      const wildContext: string[] = [];
      if (context) {
        const ctx = context as GenerationContext;
        if (ctx.brandName) wildContext.push(`Brand: ${ctx.brandName}`);
        if (ctx.language) wildContext.push(`Language: ${ctx.language === 'ar' ? 'Arabic (use dir="rtl" on DraggableWrapper, text-right on text)' : 'English'}`);
        if (ctx.assets && ctx.assets.length > 0) {
          const shuffledAssets = shuffle(ctx.assets);
          const assetLines = shuffledAssets.map((a, idx) => {
            let line = `- ${a.type}: ${a.url}`;
            if (idx === 0 && postCount > 1) line += ' ⭐ (USE THIS as the primary/featured image)';
            if (a.label) line += `\n  Label: ${a.label}`;
            if (a.description) line += `\n  Description: ${a.description}`;
            if (a.aiAnalysis) line += `\n  AI Analysis: ${a.aiAnalysis}`;
            return line;
          }).join('\n');
          wildContext.push(`Available images (use with <img>):\n${assetLines}`);
        }
        if (ctx.logoUrl) wildContext.push(`Logo URL: ${ctx.logoUrl}`);
      }
      return wildContext.length > 0
        ? `${WILD_SYSTEM_PROMPT}\n\n## CONTEXT\n${wildContext.join('\n')}`
        : WILD_SYSTEM_PROMPT;
    }

    return await runGeneration(
      postCount,
      (i) => buildWildSystemPrompt(i),
      (i) => {
        const mood = shuffledMoods[i % shuffledMoods.length];

        let featuredAssetHint = '';
        if (availableAssets.length > 0) {
          const asset = availableAssets[i % availableAssets.length];
          const details: string[] = [`Image: ${asset.url} (${asset.type})`];
          if (asset.label) details.push(`What it shows: ${asset.label}`);
          if (asset.description) details.push(`Details: ${asset.description}`);
          if (asset.aiAnalysis) details.push(`Analysis: ${asset.aiAnalysis}`);
          featuredAssetHint = `\n\nFeatured image for this post — make it the hero:\n${details.join('\n')}\nRead the metadata and craft content that connects to what this image shows.`;
        }

        return `Topic: ${prompt}

Creative direction: ${mood}${featuredAssetHint}

Write UNIQUE headline text and copy — do NOT reuse generic phrases. Invent a fresh, specific headline that fits the topic and mood above. Every post must have completely different text content.${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
      model,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
