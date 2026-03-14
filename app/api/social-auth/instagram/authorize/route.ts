import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getInstagramAuthUrl } from "@/lib/social-providers/meta";
import { requireAuth } from "@/lib/auth/api-auth";

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
      { error: "Instagram OAuth not configured" },
      { status: 500 }
    );
  }

  const payload = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "instagram",
      ts: Date.now(),
    })
  ).toString("base64");

  const signature = createHmac("sha256", appSecret).update(payload).digest("base64url");
  const state = `${signature}.${payload}`;

  const authUrl = getInstagramAuthUrl({ clientId, redirectUri, state });

  return NextResponse.redirect(authUrl);
}
