import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { parseAIResponse } from "@/lib/ai/clean-code";
import type { GenerationContext } from "@/lib/ai/types";

// ─── Types ───────────────────────────────────────────────────────
export interface ContextAsset {
  url: string;
  type: string;
  label?: string;
  description?: string;
  aiAnalysis?: string;
}

export interface GenerateRequest {
  prompt: string;
  context?: GenerationContext;
  count?: number;
  targetRatio?: string;
  referenceImages?: { base64: string; mimeType: string }[];
  model?: string;
  contextPosts?: string[];
  contextAssets?: ContextAsset[];
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
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
];
const DEFAULT_MODEL = "gemini-3.1-flash-lite-preview";

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
    return NextResponse.json({ error: "AI service is not properly configured." }, { status: 500 });
  }
  if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("resource_exhausted") || lower.includes("429")) {
    return NextResponse.json({ error: "AI service is temporarily unavailable. Please try again in a moment. If this persists, contact support." }, { status: 429 });
  }
  if (lower.includes("safety") || lower.includes("blocked") || lower.includes("content_filter")) {
    return NextResponse.json({ error: "Your prompt was blocked by safety filters. Try rephrasing your description." }, { status: 400 });
  }
  if (lower.includes("too large") || lower.includes("token") || lower.includes("length") || lower.includes("size")) {
    return NextResponse.json({ error: "Prompt too large — try selecting fewer context posts or using a shorter prompt." }, { status: 400 });
  }
  if (lower.includes("not found") || lower.includes("model")) {
    return NextResponse.json({ error: "AI model configuration error. Please contact support." }, { status: 400 });
  }
  return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
}

// ─── Helpers ─────────────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Build a section showing actual hex values of theme colors so the AI
 * can see which are dark/light and choose contrasting pairs itself.
 */
export function buildThemeColorValues(themeColors?: {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  accentLime: string;
  accentGold: string;
  accentOrange: string;
  border?: string;
}): string {
  if (!themeColors) return '';
  const tc = themeColors;
  return `\n\n## ACTUAL THEME COLOR VALUES
t.primary = ${tc.primary}
t.primaryLight = ${tc.primaryLight}
t.primaryDark = ${tc.primaryDark}
t.accent = ${tc.accent}
t.accentLight = ${tc.accentLight}
t.accentLime = ${tc.accentLime}
t.accentGold = ${tc.accentGold}
t.accentOrange = ${tc.accentOrange}
t.border = ${tc.border || tc.primary}

Use these actual values to ensure text is always readable — pick a LIGHT color for text on dark backgrounds and a DARK color for text on light backgrounds. Never use similar colors for both background and text.`;
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

/** Extract visible text (EditableText content) from TSX code */
function extractVisibleText(code: string): string[] {
  const texts: string[] = [];
  const editablePattern = /<EditableText[^>]*>\s*([\s\S]*?)\s*<\/EditableText>/g;
  let match;
  while ((match = editablePattern.exec(code)) !== null) {
    const text = match[1]
      .replace(/\{[^}]*\}/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    if (text.length > 0) texts.push(text);
  }
  return texts;
}

/** Extract style info from TSX */
function extractStyleInfo(code: string): string[] {
  const info: string[] = [];
  if (/MockupFrame/.test(code)) info.push('Uses device mockup');
  if (/FloatingCard/.test(code)) info.push('Has floating stat cards');
  if (/PostHeader/.test(code)) info.push('Has brand header with logo');
  if (/PostFooter/.test(code)) info.push('Has footer');
  if (/background.*gradient|linear-gradient/i.test(code)) info.push('Gradient background');
  if (/blur-\[/.test(code)) info.push('Blur/glow decorations');
  if (/uppercase/.test(code)) info.push('Uppercase headline style');
  if (/<img\s/.test(code)) info.push('Contains imagery');
  if (/flex-col/.test(code) && /items-center/.test(code)) info.push('Centered vertical layout');
  if (/text-left/.test(code)) info.push('Left-aligned text');
  return info;
}

const MAX_CONTEXT_POSTS = 5;
const MAX_CONTEXT_CHARS = 15000;

export function buildContextPostsSection(contextPosts?: string[]): string {
  if (!contextPosts || contextPosts.length === 0) return '';

  let totalChars = 0;
  const limited = contextPosts.slice(0, MAX_CONTEXT_POSTS).filter(code => {
    if (totalChars + code.length > MAX_CONTEXT_CHARS) return false;
    totalChars += code.length;
    return true;
  });
  if (limited.length === 0) return '';

  const postsSection = limited
    .map((code, i) => `### Reference Post ${i + 1}\n\`\`\`tsx\n${code}\n\`\`\``)
    .join('\n\n');
  return `\n\n## USER-SELECTED REFERENCE POSTS
The user selected these existing posts as reference. You MUST study and closely follow their:
- **Layout structure** (where elements are positioned, spacing, flex direction)
- **Visual style** (background treatment, decorations, typography scale)
- **Copy tone** (headline style — bold/elegant/playful, subtitle style, word choices)
- **Component usage** (mockups, floating cards, headers, imagery)

Generate new posts that match the same STYLE, MOOD, and QUALITY. Use similar layout patterns and copy tone — but with FRESH content and headlines. The user loved these posts and wants MORE LIKE THEM.

${postsSection}`;
}

/** Lighter version for template-based engines (AG) that only need copy/style direction */
export function buildContextPostsSummary(contextPosts?: string[]): string {
  if (!contextPosts || contextPosts.length === 0) return '';

  const limited = contextPosts.slice(0, MAX_CONTEXT_POSTS);
  const summaries = limited.map((code, i) => {
    const texts = extractVisibleText(code);
    const style = extractStyleInfo(code);
    const lines: string[] = [`### Reference Post ${i + 1}`];
    if (texts.length > 0) lines.push(`**Copy:** ${texts.map(t => `"${t}"`).join(' | ')}`);
    if (style.length > 0) lines.push(`**Style:** ${style.join(', ')}`);
    return lines.join('\n');
  });

  return `\n\n## USER-SELECTED REFERENCE POSTS
The user selected existing posts they love and wants MORE LIKE THEM. Match the same headline style, copy tone, mood, and visual approach. Here is what those posts contain:

${summaries.join('\n\n')}

Generate content that captures the SAME creative energy, headline style, and mood as these references.`;
}

// ─── Context Assets ─────────────────────────────────────────────
const MAX_CONTEXT_ASSETS = 8;

export function buildContextAssetsSection(contextAssets?: ContextAsset[]): string {
  if (!contextAssets || contextAssets.length === 0) return '';

  const limited = contextAssets.slice(0, MAX_CONTEXT_ASSETS);

  const assetLines = limited.map((a, i) => {
    const lines: string[] = [`### Priority Asset ${i + 1} (${a.type})`];
    lines.push(`- URL: ${a.url}`);
    if (a.label) lines.push(`- Label: ${a.label}`);
    if (a.description) lines.push(`- Description: ${a.description}`);
    if (a.aiAnalysis) lines.push(`- AI Analysis: ${a.aiAnalysis}`);

    // Usage hint based on type
    switch (a.type) {
      case 'background':
        lines.push('- USE AS: Full-bleed background image with gradient overlay');
        break;
      case 'iphone': case 'screenshot': case 'ipad': case 'desktop':
        lines.push('- USE AS: <MockupFrame id="mockup" src={url} /> — feature prominently');
        break;
      case 'product':
        lines.push('- USE AS: Transparent PNG (background already removed). Use <img> with object-contain and filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))". Make it large and prominent on a solid/gradient background.');
        break;
      case 'logo':
        lines.push('- USE AS: Pass to PostHeader via logoUrl prop');
        break;
      default:
        lines.push('- USE AS: Best placement based on the analysis');
    }
    return lines.join('\n');
  }).join('\n\n');

  return `\n\n## USER-SELECTED ASSETS (MANDATORY)
The user specifically chose these assets. You MUST use ONLY these assets in the generated post.
- Do NOT use any other assets from the ASSETS section above — ignore them completely.
- Every asset listed below MUST appear in the post.
- Use the correct component/approach for each asset type.

${assetLines}`;
}
