/**
 * Engine V5: Classic (C)
 * Production-proven prompt — guided with layout + angle.
 * Uses CLASSIC_SYSTEM_PROMPT + buildDynamicPrompt for brand/asset context.
 */
import { NextResponse } from "next/server";
import { CLASSIC_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt-classic";
import { COPY_ANGLES } from "@/lib/ai/prompts/copy-angles";
import { LAYOUT_BLUEPRINTS } from "@/lib/ai/prompts/layout-blueprints";
import { buildDynamicPrompt } from "@/lib/ai/build-prompt";
import type { GenerationContext } from "@/lib/ai/types";
import {
  type GenerateRequest,
  runGeneration,
  handleGenerationError,
  shuffle,
  buildRatioNote,
  buildDistinctNote,
  buildContextPostsSection,
  buildContextAssetsSection,
  buildThemeColorValues,
} from "../_shared";

export async function generate(req: GenerateRequest): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages, model, contextPosts, contextAssets } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 8);

    // System prompt: classic + dynamic brand context + theme colors + reference posts
    const dynamicSection = context ? buildDynamicPrompt(context as GenerationContext) : "";
    const themeColorSection = buildThemeColorValues((context as GenerationContext)?.themeColors);
    const contextPostsSection = buildContextPostsSection(contextPosts);
    const contextAssetsSection = buildContextAssetsSection(contextAssets);
    const systemPrompt = [CLASSIC_SYSTEM_PROMPT, dynamicSection, themeColorSection, contextPostsSection, contextAssetsSection]
      .filter(Boolean)
      .join('\n\n');

    const hasContext = contextPosts && contextPosts.length > 0;
    const shuffledAngles = shuffle(COPY_ANGLES);
    const shuffledLayouts = shuffle(LAYOUT_BLUEPRINTS);

    return await runGeneration(
      postCount,
      () => systemPrompt,
      (i) => {
        if (hasContext) {
          const postLabel = postCount > 1 ? ` (Post ${i + 1}/${postCount})` : '';
          return `Generate a social media post for: ${prompt}${postLabel}

## CRITICAL: FOLLOW THE REFERENCE POSTS
The user selected reference posts in the system prompt above. You MUST closely replicate their EXACT style:
- Same layout structure (image placement, text positioning, spacing, flex direction)
- Same visual mood (colors, background treatment, border style, decorations)
- Same typography approach (font size, weight, case, letter-spacing)
- Same content pattern and copy tone
- Same component usage patterns

Create a NEW post that looks like it belongs in the SAME series. Fresh headline and content, but IDENTICAL design language.${buildRatioNote(targetRatio)}`;
        }

        const angle = shuffledAngles[i % shuffledAngles.length];
        const layout = shuffledLayouts[i % shuffledLayouts.length];
        const postLabel = postCount > 1 ? ` (Post ${i + 1}/${postCount})` : '';

        return `Generate a social media post for: ${prompt}${postLabel}

## YOUR CREATIVE DIRECTION
Layout: "${layout.name}" — ${layout.structure}
Decorations: ${layout.decorations}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Create something stunning and original. Match the quality of the reference examples.${postCount > 1 ? `\nPost ${i + 1}/${postCount} — MUST be visually distinct from other posts. Different layout, different copy angle, different decorations.` : ''}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
      model,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
