import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt";
import { WILD_SYSTEM_PROMPT } from "@/lib/ai/prompts/system-prompt-wild";
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
    const { prompt, context, count = 1, version = 1 } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const postCount = Math.min(Math.max(1, Number(count) || 1), 4);
    const engineVersion = Math.min(Math.max(1, Number(version) || 1), 4);

    // V4 (Wild) builds per-post system prompts with shuffled assets
    // Other versions share a single system prompt
    function buildWildSystemPrompt(postIndex: number): string {
      const wildContext: string[] = [];
      if (context) {
        const ctx = context as GenerationContext;
        if (ctx.brandName) wildContext.push(`Brand: ${ctx.brandName}`);
        if (ctx.language) wildContext.push(`Language: ${ctx.language === 'ar' ? 'Arabic (use dir="rtl" on DraggableWrapper, text-right on text)' : 'English'}`);
        if (ctx.assets && ctx.assets.length > 0) {
          // Shuffle assets differently for each post so AI picks different images
          const shuffledAssets = [...ctx.assets].sort(() => Math.random() - 0.5);
          // Mark the first asset as "featured" to encourage variety
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

    let systemPrompt: string;
    if (engineVersion === 4) {
      // Built per-post in buildWildSystemPrompt — use placeholder here
      systemPrompt = WILD_SYSTEM_PROMPT;
    } else {
      const dynamicSection = context
        ? buildDynamicPrompt(context as GenerationContext)
        : "";
      systemPrompt = dynamicSection
        ? `${SYSTEM_PROMPT}\n\n${dynamicSection}`
        : SYSTEM_PROMPT;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const shuffledAngles = [...COPY_ANGLES].sort(() => Math.random() - 0.5);
    const shuffledLayouts = [...LAYOUT_BLUEPRINTS].sort(() => Math.random() - 0.5);

    // Wild mode variation cues — give each post a unique creative direction
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
    const shuffledMoods = [...WILD_MOODS].sort(() => Math.random() - 0.5);

    let totalTokensUsed = 0;

    // Build the user prompt based on engine version:
    // V1 = Guided: assigned layout + copy angle
    // V2 = Creative: copy angle hint only, AI picks its own layout
    // V3 = Freestyle: no layout, no angle, pure AI creativity
    // V4 = Wild: minimal system prompt, just the topic + be different
    function buildUserPrompt(i: number): string {
      const angle = shuffledAngles[i % shuffledAngles.length];
      const layout = shuffledLayouts[i % shuffledLayouts.length];
      const postLabel = postCount > 1 ? ` (Post ${i + 1}/${postCount})` : '';
      const distinctNote = postCount > 1
        ? `\nThis is post ${i + 1} of ${postCount}. Make it COMPLETELY different from the others — different layout structure, different visual style, different mood.`
        : '';

      if (engineVersion === 1) {
        return `Generate a social media post for: ${prompt}${postLabel}

## YOUR CREATIVE DIRECTION
Layout: "${layout.name}" — ${layout.structure}
Decorations: ${layout.decorations}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Create something stunning and original. Match the quality of the reference examples.${distinctNote}`;
      }

      if (engineVersion === 2) {
        return `Generate a social media post for: ${prompt}${postLabel}

## YOUR COPY ANGLE: ${angle.angle}
${angle.instruction}

Choose your own layout, decorations, and visual approach. Be creative and original — you are NOT restricted to any specific layout template. Use mockups, cards, typography, images, or any combination that best fits the prompt. Match the quality of the reference examples.${distinctNote}`;
      }

      if (engineVersion === 3) {
        // Smart Free mode: assign each post a featured asset based on its metadata
        const ctx = context as GenerationContext | undefined;
        const availableAssets = ctx?.assets?.filter(a => a.type !== 'logo') || [];

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

You have complete creative freedom for layout, decorations, and visual approach. The only rules are the component structure and theme system.${distinctNote}`;
        }

        return `Generate a social media post for: ${prompt}${postLabel}

You have complete creative freedom. Choose your own layout, decorations, copy angle, and visual approach. Surprise me with something stunning and original. The only rules are the component structure and theme system from the instructions above.${distinctNote}`;
      }

      // V4: Wild — minimal instructions, maximum creativity + mood variation
      const mood = shuffledMoods[i % shuffledMoods.length];
      const ctx = context as GenerationContext | undefined;
      const availableAssets = ctx?.assets?.filter(a => a.type !== 'logo') || [];

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

Write UNIQUE headline text and copy — do NOT reuse generic phrases. Invent a fresh, specific headline that fits the topic and mood above. Every post must have completely different text content.${distinctNote}`;
    }

    if (postCount === 1) {
      const sysPrompt = engineVersion === 4 ? buildWildSystemPrompt(0) : systemPrompt;
      const result = await model.generateContent([
        { text: sysPrompt },
        { text: buildUserPrompt(0) },
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
      const sysPrompt = engineVersion === 4 ? buildWildSystemPrompt(i) : systemPrompt;
      return model.generateContent([
        { text: sysPrompt },
        { text: buildUserPrompt(i) },
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
