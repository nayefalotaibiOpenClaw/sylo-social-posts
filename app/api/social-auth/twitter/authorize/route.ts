import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  getTwitterAuthUrl,
} from "@/lib/social-providers/twitter";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const workspaceId = searchParams.get("workspaceId");
  const userId = searchParams.get("userId");

  if (!workspaceId || !userId) {
    return NextResponse.json(
      { error: "Missing workspaceId or userId" },
      { status: 400 }
    );
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Twitter OAuth not configured" },
      { status: 500 }
    );
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Embed codeVerifier in HMAC-signed state to avoid needing temporary DB storage
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "twitter",
      ts: Date.now(),
      codeVerifier,
    })
  ).toString("base64");

  const signature = createHmac("sha256", clientSecret).update(payload).digest("base64url");
  const state = `${signature}.${payload}`;

  const authUrl = getTwitterAuthUrl({ clientId, redirectUri, state, codeChallenge });

  return NextResponse.redirect(authUrl);
}
