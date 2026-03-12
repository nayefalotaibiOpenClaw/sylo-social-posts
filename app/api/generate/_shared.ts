import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { parseAIResponse } from "@/lib/ai/clean-code";
import type { GenerationContext } from "@/lib/ai/types";

// ─── Types ───────────────────────────────────────────────────────
export interface GenerateRequest {
  prompt: string;
  context?: GenerationContext;
  count?: number;
  targetRatio?: string;
  referenceImages?: { base64: string; mimeType: string }[];
  model?: string;
}

export interface EngineResult {
  code: string;
  caption: string;
  imageKeywords: string[];
}

export interface GenerateResponse {
  code: string;
  codes: string[];
  captions: string[];
  imageKeywords: string[][];
  usage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    model: string;
    postsGenerated: number;
  };
}

// ─── Gemini Client ───────────────────────────────────────────────
const ALLOWED_MODELS = [
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-flash-preview",
  "gemini-3.1-pro-preview",
];
const DEFAULT_MODEL = "gemini-3.1-pro-preview";

export function getModel(modelId?: string) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("API key not configured");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = modelId && ALLOWED_MODELS.includes(modelId) ? modelId : DEFAULT_MODEL;
  return { client: genAI.getGenerativeModel({ model }), modelId: model };
}

// ─── Reference Images ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildRefImageParts(referenceImages?: { base64: string; mimeType: string }[]): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [];
  if (referenceImages && Array.isArray(referenceImages) && referenceImages.length > 0) {
    parts.push({
      text: "\n\n## REFERENCE IMAGES\nThe user uploaded the following images as visual reference/inspiration. Study the style, layout, colors, typography, and mood of these images and use them as inspiration for the post design. Do NOT reproduce them exactly — use them as creative direction.",
    });
    for (const img of referenceImages.slice(0, 4)) {
      if (img.base64 && img.mimeType) {
        parts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
      }
    }
  }
  return parts;
}

// ─── Run Generation (parallel or single) ─────────────────────────
export async function runGeneration(
  postCount: number,
  buildSystemPrompt: (i: number) => string,
  buildUserPrompt: (i: number) => string,
  referenceImages?: { base64: string; mimeType: string }[],
  modelId?: string,
): Promise<NextResponse> {
  const { client: model, modelId: resolvedModel } = getModel(modelId);
  const refImageParts = buildRefImageParts(referenceImages);

  let totalTokensUsed = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  if (postCount === 1) {
    const result = await model.generateContent([
      { text: buildSystemPrompt(0) },
      ...refImageParts,
      { text: buildUserPrompt(0) },
    ]);
    const usage = result.response.usageMetadata;
    totalTokensUsed = usage?.totalTokenCount ?? 0;

    const parsed = parseAIResponse(result.response.text());
    return NextResponse.json({
      code: parsed.code,
      codes: [parsed.code],
      captions: [parsed.caption],
      imageKeywords: [parsed.imageKeywords],
      usage: {
        totalTokens: totalTokensUsed,
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        model: resolvedModel,
        postsGenerated: 1,
      },
    } satisfies GenerateResponse);
  }

  const promises = Array.from({ length: postCount }, (_, i) =>
    model
      .generateContent([
        { text: buildSystemPrompt(i) },
        ...refImageParts,
        { text: buildUserPrompt(i) },
      ])
      .then((r) => {
        const usage = r.response.usageMetadata;
        totalTokensUsed += usage?.totalTokenCount ?? 0;
        totalPromptTokens += usage?.promptTokenCount ?? 0;
        totalCompletionTokens += usage?.candidatesTokenCount ?? 0;
        return parseAIResponse(r.response.text());
      })
      .catch((err) => {
        console.error(`Generation ${i + 1} failed:`, err);
        return null;
      }),
  );

  const results = await Promise.all(promises);
  const parsed = results.filter((c): c is NonNullable<typeof c> => c !== null);

  if (parsed.length === 0) {
    return NextResponse.json({ error: "All generations failed" }, { status: 500 });
  }

  return NextResponse.json({
    code: parsed[0].code,
    codes: parsed.map((p) => p.code),
    captions: parsed.map((p) => p.caption),
    imageKeywords: parsed.map((p) => p.imageKeywords),
    usage: {
      totalTokens: totalTokensUsed,
      promptTokens: totalPromptTokens,
      completionTokens: totalCompletionTokens,
      model: resolvedModel,
      postsGenerated: parsed.length,
    },
  } satisfies GenerateResponse);
}

// ─── Error Handler ───────────────────────────────────────────────
export function handleGenerationError(error: unknown): NextResponse {
  console.error("Generation error:", error);
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("api key")) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }
  if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("resource_exhausted") || lower.includes("429")) {
    return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again in a moment. If this persists, contact support." }, { status: 429 });
  }
  if (lower.includes("safety") || lower.includes("blocked") || lower.includes("content_filter")) {
    return NextResponse.json({ error: "Your prompt was blocked by safety filters. Try rephrasing your description." }, { status: 400 });
  }
  return NextResponse.json({ error: "Something went wrong while generating. Please try again or contact support." }, { status: 500 });
}

// ─── Helpers ─────────────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function buildRatioNote(targetRatio?: string): string {
  if (!targetRatio) return '';
  return `\n\n## TARGET ASPECT RATIO: ${targetRatio}
Design this post SPECIFICALLY for ${targetRatio}. The useAspectRatio() hook will return '${targetRatio}'.
${targetRatio === '1:1' ? 'This is a SQUARE post (540×540). Keep content minimal — max 1 headline, 1 short subtitle, 1 image. Use compact spacing. Do NOT overflow.' : ''}
${targetRatio === '9:16' ? 'This is a TALL story post (540×960). You have vertical space — use larger imagery, more content sections, and generous spacing.' : ''}
${targetRatio === '3:4' ? 'This is a slightly tall post (540×720). Moderate space — balance content density between square and story.' : ''}
${targetRatio === '4:3' ? 'This is a slightly wide post (720×540). Favor horizontal layouts with side-by-side elements.' : ''}
${targetRatio === '16:9' ? 'This is a WIDE landscape post (960×540). Use horizontal layouts, wide imagery, short text.' : ''}`;
}

export function buildDistinctNote(i: number, total: number): string {
  if (total <= 1) return '';
  return `\nThis is post ${i + 1} of ${total}. Make it COMPLETELY different from the others — different layout structure, different visual style, different mood.`;
}
