/**
 * Engine V2: Creative (Cr)
 * Copy angle hint only — AI picks its own layout.
 * Uses SYSTEM_PROMPT + buildDynamicPrompt.
 */
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { COPY_ANGLES } from "@/lib/ai/prompts/copy-angles";
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
    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);

    const dynamicSection = context ? buildDynamicPrompt(context as GenerationContext) : "";
    const systemPrompt = dynamicSection
      ? `${SYSTEM_PROMPT}\n\n${dynamicSection}`
      : SYSTEM_PROMPT;

    const shuffledAngles = shuffle(COPY_ANGLES);

    return await runGeneration(
      postCount,
      () => systemPrompt,
      (i) => {
        const angle = shuffledAngles[i % shuffledAngles.length];
        const postLabel = postCount > 1 ? ` (Post ${i + 1}/${postCount})` : '';

        return `Generate a social media post for: ${prompt}${postLabel}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Choose your own layout, decorations, and visual approach. Be creative and original — you are NOT restricted to any specific layout template. Use mockups, cards, typography, images, or any combination that best fits the prompt. Match the quality of the reference examples.${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
      model,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
