import { NextRequest, NextResponse } from "next/server";
import { handleGenerationError } from "./_shared";
import { generate as generateGuided } from "./engines/guided";
import { generate as generateCreative } from "./engines/creative";
import { generate as generateFree } from "./engines/free";
import { generate as generateWild } from "./engines/wild";
import { generate as generateClassic } from "./engines/classic";
import { generate as generateAppstore } from "./engines/appstore";

/**
 * Engine Router
 *
 * version=1 → Guided (G)     — layout blueprint + copy angle
 * version=2 → Creative (Cr)  — copy angle only, AI picks layout
 * version=3 → Free (F)       — asset-driven, complete freedom
 * version=4 → Wild (W)       — minimal prompt, mood variations
 * version=5 → Classic (C)    — production-proven prompt
 * version=6 → App Store (A)  — forced MockupFrame + screenshot
 *
 * Each engine has its own file in ./engines/ — fully independent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, version = 1, allLayouts = false } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const engineVersion = allLayouts ? 1 : Math.min(Math.max(1, Number(version) || 1), 6);

    const engineReq = {
      prompt: body.prompt,
      context: body.context,
      count: body.count,
      targetRatio: body.targetRatio,
      referenceImages: body.referenceImages,
      model: body.model,
    };

    switch (engineVersion) {
      case 1:
        return generateGuided({ ...engineReq, allLayouts });
      case 2:
        return generateCreative(engineReq);
      case 3:
        return generateFree(engineReq);
      case 4:
        return generateWild(engineReq);
      case 5:
        return generateClassic(engineReq);
      case 6:
        return generateAppstore(engineReq);
      default:
        return generateClassic(engineReq);
    }
  } catch (error) {
    return handleGenerationError(error);
  }
}
