import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_URL = "https://open.tiktokapis.com/v2/user/info/";

const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.publish",
  "video.upload",
];

function redirect(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

// ─── TikTok OAuth 2.0 Callback ─────────────────────────────────────

export const handleTikTokCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("APP_URL environment variable must be configured");

  const designUrl = (workspaceId: string | null, params: string) => {
    if (workspaceId) {
      return `${appUrl}/design?workspace=${workspaceId}&${params}`;
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

    const secret = process.env.TIKTOK_CLIENT_SECRET;
    if (!secret) throw new Error("TIKTOK_CLIENT_SECRET not configured");

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

    // Constant-time HMAC comparison to prevent timing attacks
    const sigA = new TextEncoder().encode(receivedSig);
    const sigB = new TextEncoder().encode(expectedSig);
    if (sigA.length !== sigB.length) throw new Error("Invalid state signature");
    let diff = 0;
    for (let i = 0; i < sigA.length; i++) diff |= sigA[i] ^ sigB[i];
    if (diff !== 0) throw new Error("Invalid state signature");

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

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    return redirect(
      designUrl(state.workspaceId, `social_error=TikTok+OAuth+not+configured`)
    );
  }

  try {
    // ─── Step 1: Exchange code for tokens ────────────────────────────
    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
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
    const expiresIn = tokenData.expires_in || 86400;
    const tokenExpiresAt = Date.now() + expiresIn * 1000;
    const openId = tokenData.open_id;

    // ─── Step 2: Fetch user profile ─────────────────────────────────
    let displayName = "TikTok User";
    let avatarUrl: string | undefined;

    try {
      const userRes = await fetch(
        `${TIKTOK_USER_URL}?fields=open_id,display_name,avatar_url`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const userData = await userRes.json();
      console.log("TikTok user info response:", JSON.stringify(userData));

      if (userRes.ok && userData.data?.user) {
        displayName = userData.data.user.display_name || displayName;
        avatarUrl = userData.data.user.avatar_url;
      }
    } catch (e) {
      console.error("TikTok user info fetch failed, using defaults:", e);
    }

    // ─── Step 3: Store account ──────────────────────────────────────
    await ctx.runMutation(internal.socialAccounts.connect, {
      userId: state.userId as never,
      workspaceId: state.workspaceId as never,
      provider: "tiktok",
      providerUserId: openId || user?.open_id,
      providerAccountId: openId || user?.open_id,
      providerAccountName: displayName,
      providerAccountImage: avatarUrl,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      scopes: TIKTOK_SCOPES,
      canPublishPosts: true,
      canPublishStories: false,
      canPublishReels: true,
      canReadInsights: false,
    });

    const accountLabel = displayName;
    const successMsg = `Connected: TikTok ${accountLabel}`;
    return redirect(
      designUrl(state.workspaceId, `social_success=${encodeURIComponent(successMsg)}`)
    );
  } catch (err) {
    console.error("TikTok OAuth callback error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return redirect(
      designUrl(state.workspaceId, `social_error=${encodeURIComponent(message)}`)
    );
  }
});
