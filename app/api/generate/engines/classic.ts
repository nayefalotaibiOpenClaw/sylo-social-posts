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
} from "../_shared";

export async function generate(req: GenerateRequest): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages, model } = req;
    const postCount = Math.min(Math.max(1, Number(count) || 1), 8);

    // System prompt: classic + dynamic brand context
    const dynamicSection = context ? buildDynamicPrompt(context as GenerationContext) : "";
    const systemPrompt = dynamicSection
      ? `${CLASSIC_SYSTEM_PROMPT}\n\n${dynamicSection}`
      : CLASSIC_SYSTEM_PROMPT;

    const shuffledAngles = shuffle(COPY_ANGLES);
    const shuffledLayouts = shuffle(LAYOUT_BLUEPRINTS);

    return await runGeneration(
      postCount,
      () => systemPrompt,
      (i) => {
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
