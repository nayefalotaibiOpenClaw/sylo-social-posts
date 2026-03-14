import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getFacebookAuthUrl } from "@/lib/social-providers/meta";
import { requireAuth } from "@/lib/auth/api-auth";

// Legacy route — use /api/social-auth/instagram/authorize or /api/social-auth/facebook/authorize
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { searchParams } = request.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const userId = authResult.user._id;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Missing workspaceId" },
      { status: 400 }
    );
  }

  const clientId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;
  const appSecret = process.env.META_APP_SECRET;

  if (!clientId || !redirectUri || !appSecret) {
    return NextResponse.json(
      { error: "Meta OAuth not configured" },
      { status: 500 }
    );
  }

  const payload = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "facebook",
      ts: Date.now(),
    })
  ).toString("base64");

  const signature = createHmac("sha256", appSecret).update(payload).digest("base64url");
  const state = `${signature}.${payload}`;

  const authUrl = getFacebookAuthUrl({ clientId, redirectUri, state });

  return NextResponse.redirect(authUrl);
}
