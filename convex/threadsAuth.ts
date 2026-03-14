import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const THREADS_API_URL = "https://graph.threads.net/v1.0";

function redirect(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

export const handleThreadsCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("APP_URL environment variable must be configured");

  const designUrl = (workspaceId: string | null, params: string) => {
    if (workspaceId) {
      return `${appUrl}/design?workspaceId=${workspaceId}&${params}`;
    }
    return `${appUrl}/channels?${params}`;
  };

  if (error) {
    const errorDesc = url.searchParams.get("error_description") || "Unknown error";
    return redirect(designUrl(null, `social_error=${encodeURIComponent(errorDesc)}`));
  }

  if (!code || !stateParam) {
    return redirect(designUrl(null, `social_error=Missing+code+or+state`));
  }

  // Verify state signature
  let state: { userId: string; workspaceId: string; provider?: string; ts: number };
  try {
    const dotIndex = stateParam.indexOf(".");
    if (dotIndex === -1) throw new Error("Missing signature");

    const receivedSig = stateParam.substring(0, dotIndex);
    const statePayload = stateParam.substring(dotIndex + 1);

    const secret = process.env.THREADS_APP_SECRET || process.env.META_APP_SECRET;
    if (!secret) throw new Error("THREADS_APP_SECRET not configured");

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(statePayload));
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (receivedSig !== expectedSig) throw new Error("Invalid state signature");
    state = JSON.parse(atob(statePayload));
  } catch {
    return redirect(designUrl(null, `social_error=Invalid+state`));
  }

  if (Date.now() - state.ts > 15 * 60 * 1000) {
    return redirect(designUrl(state.workspaceId, `social_error=Session+expired`));
  }

  const clientId = process.env.THREADS_APP_ID || process.env.META_APP_ID;
  const clientSecret = process.env.THREADS_APP_SECRET || process.env.META_APP_SECRET;
  const redirectUri = process.env.THREADS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return redirect(designUrl(state.workspaceId, `social_error=Threads+OAuth+not+configured`));
  }

  try {
    // Step 1: Exchange code for short-lived token
    const tokenRes = await fetch(`${THREADS_API_URL}/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_message || tokenData.error.message || "Threads OAuth error");
    }

    const shortToken = tokenData.access_token;
    const threadsUserId = String(tokenData.user_id);

    // Step 2: Exchange for long-lived token (~60 days)
    const longRes = await fetch(
      `${THREADS_API_URL}/access_token?grant_type=th_exchange_token&client_secret=${clientSecret}&access_token=${shortToken}`
    );
    const longData = await longRes.json();
    if (longData.error) throw new Error(longData.error.message);

    const longToken = longData.access_token;
    const expiresIn = longData.expires_in || 5184000;
    const tokenExpiresAt = Date.now() + expiresIn * 1000;

    // Step 3: Get user profile
    const userRes = await fetch(
      `${THREADS_API_URL}/me?fields=id,username,threads_profile_picture_url&access_token=${longToken}`
    );
    const userData = await userRes.json();
    if (userData.error) throw new Error(userData.error.message);

    // Step 4: Store in DB
    await ctx.runMutation(internal.socialAccounts.connect, {
      userId: state.userId as any,
      workspaceId: state.workspaceId as any,
      provider: "threads" as any,
      providerUserId: threadsUserId,
      providerAccountId: userData.id || threadsUserId,
      providerAccountName: userData.username || "Threads User",
      providerAccountImage: userData.threads_profile_picture_url,
      accessToken: longToken,
      tokenExpiresAt,
      scopes: [
        "threads_basic",
        "threads_content_publish",
        "threads_manage_insights",
        "threads_manage_replies",
      ],
      canPublishPosts: true,
      canPublishStories: false,
      canPublishReels: false,
      canReadInsights: true,
    });

    const msg = encodeURIComponent(`Connected: Threads: @${userData.username || "user"}`);
    return redirect(designUrl(state.workspaceId, `social_success=${msg}`));
  } catch (e: any) {
    const msg = encodeURIComponent(e.message || "Threads connection failed");
    return redirect(designUrl(state.workspaceId, `social_error=${msg}`));
  }
});
