/**
 * Engine V3: Free (F)
 * Asset-driven — AI reads metadata and builds around each asset.
 * Uses SYSTEM_PROMPT + buildDynamicPrompt.
 */
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { buildDynamicPrompt } from "@/lib/ai/build-prompt";
import type { GenerationContext } from "@/lib/ai/types";
import {
  type GenerateRequest,
  runGeneration,
  handleGenerationError,
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

    const availableAssets = context?.assets?.filter(a => a.type !== 'logo') || [];

    return await runGeneration(
      postCount,
      () => systemPrompt,
      (i) => {
        const postLabel = postCount > 1 ? ` (Post ${i + 1}/${postCount})` : '';

        if (availableAssets.length > 0) {
          const asset = availableAssets[i % availableAssets.length];
          const assetInfo: string[] = [`Type: ${asset.type}`, `URL: ${asset.url}`];
          if (asset.label) assetInfo.push(`Label: ${asset.label}`);
          if (asset.description) assetInfo.push(`Description: ${asset.description}`);
          if (asset.aiAnalysis) assetInfo.push(`AI Analysis: ${asset.aiAnalysis}`);

          return `Generate a social media post for: ${prompt}${postLabel}

## FEATURED ASSET — build this post around this image
${assetInfo.join('\n')}

Read the asset metadata above carefully. Use it to craft a post that highlights what this image shows. Write headlines and copy that connect the image content to the brand's message. Choose a layout that makes this image the hero element.

You have complete creative freedom for layout, decorations, and visual approach. The only rules are the component structure and theme system.${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
        }

        return `Generate a social media post for: ${prompt}${postLabel}

You have complete creative freedom. Choose your own layout, decorations, copy angle, and visual approach. Surprise me with something stunning and original. The only rules are the component structure and theme system from the instructions above.${buildDistinctNote(i, postCount)}${buildRatioNote(targetRatio)}`;
      },
      referenceImages,
      model,
    );
  } catch (error) {
    return handleGenerationError(error);
  }
}
