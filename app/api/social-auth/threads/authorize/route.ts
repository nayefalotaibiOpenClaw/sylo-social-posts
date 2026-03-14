import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { requireAuth } from "@/lib/auth/api-auth";

const THREADS_SCOPES = [
  "threads_basic",
  "threads_content_publish",
  "threads_manage_insights",
  "threads_manage_replies",
];

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

  const clientId = process.env.THREADS_APP_ID || process.env.META_APP_ID;
  const redirectUri = process.env.THREADS_REDIRECT_URI;
  const hmacSecret = process.env.THREADS_APP_SECRET || process.env.META_APP_SECRET;

  if (!clientId || !redirectUri || !hmacSecret) {
    return NextResponse.json(
      { error: "Threads OAuth not configured" },
      { status: 500 }
    );
  }

  const payload = Buffer.from(
    JSON.stringify({
      userId,
      workspaceId,
      provider: "threads",
      ts: Date.now(),
    })
  ).toString("base64");

  const signature = createHmac("sha256", hmacSecret).update(payload).digest("base64url");
  const state = `${signature}.${payload}`;

  const url = new URL("https://threads.net/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", THREADS_SCOPES.join(","));
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
