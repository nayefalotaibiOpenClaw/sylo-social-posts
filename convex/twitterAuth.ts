import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const TWITTER_API_URL = "https://api.x.com/2";

const TWITTER_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "media.write",
  "offline.access",
];

function redirect(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

// ─── Twitter OAuth 2.0 Callback ─────────────────────────────────────

export const handleTwitterCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("APP_URL environment variable must be configured");

  // Helper to build redirect URL back to the design page channels tab
  const designUrl = (workspaceId: string | null, params: string) => {
    if (workspaceId) {
      return `${appUrl}/design?workspaceId=${workspaceId}&${params}`;
    }
    return `${appUrl}/channels?${params}`;
  };

  if (error) {
    const errorDesc = url.searchParams.get("error_description") || error;
    return redirect(
      designUrl(null, `social_error=${encodeURIComponent(errorDesc)}`)
    );
  }

  if (!code || !stateParam) {
    return redirect(
      designUrl(null, `social_error=Missing+code+or+state`)
    );
  }

  // ─── Verify HMAC-signed state ─────────────────────────────────────
  let state: {
    userId: string;
    workspaceId: string;
    provider: string;
    ts: number;
    codeVerifier: string;
  };

  try {
    const dotIndex = stateParam.indexOf(".");
    if (dotIndex === -1) throw new Error("Missing signature");

    const receivedSig = stateParam.substring(0, dotIndex);
    const statePayload = stateParam.substring(dotIndex + 1);

    const secret = process.env.TWITTER_CLIENT_SECRET;
    if (!secret) throw new Error("TWITTER_CLIENT_SECRET not configured");

    // Verify HMAC-SHA256 signature using Web Crypto API (Convex runtime)
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
    return redirect(
      designUrl(null, `social_error=Invalid+state`)
    );
  }

  // Check 15-minute expiry
  if (Date.now() - state.ts > 15 * 60 * 1000) {
    return redirect(
      designUrl(state.workspaceId, `social_error=Session+expired`)
    );
  }

  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return redirect(
      designUrl(state.workspaceId, `social_error=Twitter+OAuth+not+configured`)
    );
  }

  try {
    // ─── Step 1: Exchange code for tokens IMMEDIATELY (30s expiry!) ──
    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    const tokenRes = await fetch(`${TWITTER_API_URL}/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: state.codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error || "Token exchange failed");
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 7200;
    const tokenExpiresAt = Date.now() + expiresIn * 1000;

    // ─── Step 2: Fetch user profile ─────────────────────────────────
    const userRes = await fetch(
      `${TWITTER_API_URL}/users/me?user.fields=id,name,username,profile_image_url`,
      {
        headers: { "Authorization": `Bearer ${accessToken}` },
      }
    );

    const userData = await userRes.json();
    if (!userRes.ok || userData.errors) {
      throw new Error(userData.errors?.[0]?.message || "Failed to fetch user profile");
    }

    const user = userData.data;

    // ─── Step 3: Store account ──────────────────────────────────────
    await ctx.runMutation(internal.socialAccounts.connect, {
      userId: state.userId as never,
      workspaceId: state.workspaceId as never,
      provider: "twitter",
      providerUserId: user.id,
      providerAccountId: user.id,
      providerAccountName: `@${user.username}`,
      providerAccountImage: user.profile_image_url,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      scopes: TWITTER_SCOPES,
      canPublishPosts: true,
      canPublishStories: false,
      canPublishReels: false,
      canReadInsights: false,
    });

    const successMsg = `Connected: X @${user.username}`;
    return redirect(
      designUrl(state.workspaceId, `social_success=${encodeURIComponent(successMsg)}`)
    );
  } catch (err) {
    console.error("Twitter OAuth callback error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return redirect(
      designUrl(state.workspaceId, `social_error=${encodeURIComponent(message)}`)
    );
  }
});
