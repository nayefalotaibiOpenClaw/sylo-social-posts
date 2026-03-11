import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { cleanCode } from "@/lib/ai/clean-code";

const ADAPT_SYSTEM_PROMPT = `You are a social media post layout adapter. You will receive an existing React/TSX post component and a target aspect ratio. Your job is to REWRITE the component so it looks perfect at the target ratio.

## RULES
1. Keep the EXACT SAME content — same text, same headlines, same copy, same images, same branding
2. Keep the same visual style, colors, and theme usage (useTheme, t.primary, etc.)
3. Keep ALL EditableText and DraggableWrapper wrappers
4. Keep the same imports and component structure
5. ONLY change layout, spacing, sizing, and element arrangement to fit the target ratio
6. The useAspectRatio() hook will return the target ratio — use it

## WHAT TO ADAPT
- **1:1 (540×540)**: Compact layout. Reduce to 1 headline + 1 subtitle + 1 image max. Use smaller padding (p-6). Remove extra cards/sections that won't fit.
- **9:16 (540×960)**: Tall story. Spread content vertically. Add generous spacing. Images can be larger. More sections can fit.
- **3:4 (540×720)**: Moderate height. Balance between 1:1 and 9:16.
- **4:3 (720×540)**: Slightly wide. Favor horizontal layouts, side-by-side elements.
- **16:9 (960×540)**: Wide landscape. Horizontal layouts, wide images, short text.

## OUTPUT
Return ONLY the raw component code. No markdown fences, no backticks, no explanation. Start with imports.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { code, targetRatio } = await req.json();
    if (!code || !targetRatio) {
      return NextResponse.json({ error: "code and targetRatio are required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const result = await model.generateContent([
      { text: ADAPT_SYSTEM_PROMPT },
      { text: `Here is the existing post component code:\n\n${code}\n\nRewrite this component to look perfect at ${targetRatio} aspect ratio. Keep the EXACT same content and messaging. Only restructure the layout.` },
    ]);

    const adaptedCode = cleanCode(result.response.text());

    return NextResponse.json({
      code: adaptedCode,
      usage: {
        totalTokens: result.response.usageMetadata?.totalTokenCount ?? 0,
      },
    });
  } catch (error: unknown) {
    console.error("Adapt ratio error:", error);
    return NextResponse.json({ error: "Adaptation failed" }, { status: 500 });
  }
}
