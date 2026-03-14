import { NextRequest, NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { handleGenerationError } from "./_shared";
import { generate as generateWild } from "./engines/wild";
import { generate as generateClassic } from "./engines/classic";
import { generate as generateAppstoreGuided } from "./engines/appstore-guided";
import { requireAuth } from "@/lib/auth/api-auth";
import { aiRateLimiter } from "@/lib/security/rate-limit";

/**
 * Engine Router
 *
 * version=4 → Wild (W)              — minimal prompt, mood variations
 * version=5 → Classic (C)           — production-proven prompt
 * version=7 → App Store Guided (AG) — template-based, AI fills content
 *
 * Each engine has its own file in ./engines/ — fully independent.
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const rateLimitResponse = aiRateLimiter.check(req, authResult.user._id);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Verify authentication and active subscription
    const token = await convexAuthNextjsToken();
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const subscription = await fetchQuery(
      api.subscriptions.getActive,
      {},
      { token }
    );

    if (!subscription) {
      return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
    }

    if (subscription.aiTokensUsed >= subscription.aiTokensLimit) {
      return NextResponse.json({ error: "AI token limit reached for current billing period" }, { status: 403 });
    }

    const body = await req.json();
    const { prompt, version = 7 } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Issue 28: Validate prompt size to prevent abuse
    if (typeof prompt === "string" && prompt.length > 5000) {
      return NextResponse.json({ error: "Prompt exceeds maximum length of 5000 characters" }, { status: 400 });
    }

    const engineReq = {
      prompt: body.prompt,
      context: body.context,
      count: body.count,
      targetRatio: body.targetRatio,
      referenceImages: body.referenceImages,
      model: body.model,
      contextPosts: body.contextPosts,
      contextAssets: body.contextAssets,
    };

    switch (Number(version)) {
      case 4:
        return generateWild(engineReq);
      case 5:
        return generateClassic(engineReq);
      case 7:
        return generateAppstoreGuided(engineReq);
      default:
        return generateAppstoreGuided(engineReq);
    }
  } catch (error) {
    return handleGenerationError(error);
  }
}
