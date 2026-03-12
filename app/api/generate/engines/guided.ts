/**
 * Engine V1: Guided (G)
 * Assigned layout blueprint + copy angle for each post.
 * Uses SYSTEM_PROMPT + buildDynamicPrompt.
 */
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
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

export async function generate(req: GenerateRequest & { allLayouts?: boolean }): Promise<NextResponse> {
  try {
    const { prompt, context, count = 1, targetRatio, referenceImages, allLayouts, model } = req;

    // allLayouts mode: one post per layout blueprint
    const postCount = allLayouts
      ? LAYOUT_BLUEPRINTS.length
      : Math.min(Math.max(1, Number(count) || 1), 4);

    const dynamicSection = context ? buildDynamicPrompt(context as GenerationContext) : "";
    const systemPrompt = dynamicSection
      ? `${SYSTEM_PROMPT}\n\n${dynamicSection}`
      : SYSTEM_PROMPT;

    const shuffledAngles = shuffle(COPY_ANGLES);
    const shuffledLayouts = allLayouts ? [...LAYOUT_BLUEPRINTS] : shuffle(LAYOUT_BLUEPRINTS);

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

Create something stunning and original. Match the quality of the reference examples.${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
      model,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
