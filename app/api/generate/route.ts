import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { COPY_ANGLES } from "@/lib/ai/prompts/copy-angles";
import { LAYOUT_BLUEPRINTS } from "@/lib/ai/prompts/layout-blueprints";
import { buildDynamicPrompt } from "@/lib/ai/build-prompt";
import { cleanCode } from "@/lib/ai/clean-code";
import type { GenerationContext } from "@/lib/ai/types";

// Note: This route is called from authenticated pages only.
// Full auth validation happens at the Convex layer when saving generated posts.
export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { prompt, context, count = 1 } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);

    const dynamicSection = context
      ? buildDynamicPrompt(context as GenerationContext)
      : "";
    const systemPrompt = dynamicSection
      ? `${SYSTEM_PROMPT}\n\n${dynamicSection}`
      : SYSTEM_PROMPT;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    // Select creative angles and layouts for each post
    const shuffledAngles = [...COPY_ANGLES].sort(() => Math.random() - 0.5);
    const shuffledLayouts = [...LAYOUT_BLUEPRINTS].sort(() => Math.random() - 0.5);

    let totalTokensUsed = 0;

    if (postCount === 1) {
      const angle = shuffledAngles[0];
      const layout = shuffledLayouts[0];

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post for: ${prompt}

## YOUR CREATIVE DIRECTION
Layout: "${layout.name}" — ${layout.structure}
Decorations: ${layout.decorations}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Create something stunning and original. Match the quality of the reference examples.` },
      ]);

      const usage = result.response.usageMetadata;
      totalTokensUsed = usage?.totalTokenCount ?? 0;

      const code = cleanCode(result.response.text());
      return NextResponse.json({
        code,
        codes: [code],
        usage: {
          totalTokens: totalTokensUsed,
          promptTokens: usage?.promptTokenCount ?? 0,
          completionTokens: usage?.candidatesTokenCount ?? 0,
          postsGenerated: 1,
        },
      });
    }

    const promises = Array.from({ length: postCount }, (_, i) => {
      const angle = shuffledAngles[i % shuffledAngles.length];
      const layout = shuffledLayouts[i % shuffledLayouts.length];

      return model.generateContent([
        { text: systemPrompt },
        { text: `Generate a social media post for: ${prompt}

## YOUR CREATIVE DIRECTION (Post ${i + 1}/${postCount})
Layout: "${layout.name}" — ${layout.structure}
Decorations: ${layout.decorations}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Post ${i + 1}/${postCount} — MUST be visually distinct from other posts. Different layout, different copy angle, different decorations. Match the quality of the reference examples.` },
      ]).then(r => {
        const usage = r.response.usageMetadata;
        totalTokensUsed += usage?.totalTokenCount ?? 0;
        return cleanCode(r.response.text());
      })
        .catch(err => {
          console.error(`Generation ${i + 1} failed:`, err);
          return null;
        });
    });

    const results = await Promise.all(promises);
    const codes = results.filter((c): c is string => c !== null);

    if (codes.length === 0) {
      return NextResponse.json({ error: "All generations failed" }, { status: 500 });
    }

    return NextResponse.json({
      code: codes[0],
      codes,
      usage: {
        totalTokens: totalTokensUsed,
        postsGenerated: codes.length,
      },
    });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    console.error("Generation error details:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
