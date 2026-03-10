import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const META_API_VERSION = "v21.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const IG_GRAPH_URL = `https://graph.instagram.com/${META_API_VERSION}`;

const FACEBOOK_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "public_profile",
  "email",
];

const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
];

function redirect(url: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url },
  });
}

// ─── Main OAuth Callback (handles both Facebook and Instagram) ──────

export const handleMetaCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (error) {
    const errorDesc = url.searchParams.get("error_description") || "Unknown error";
    return redirect(
      `${appUrl}/workspaces?social_error=${encodeURIComponent(errorDesc)}`
    );
  }

  if (!code || !stateParam) {
    return redirect(
      `${appUrl}/workspaces?social_error=Missing+code+or+state`
    );
  }

  let state: { userId: string; workspaceId: string; provider?: string; ts: number };
  try {
    const dotIndex = stateParam.indexOf(".");
    if (dotIndex === -1) throw new Error("Missing signature");

    const receivedSig = stateParam.substring(0, dotIndex);
    const statePayload = stateParam.substring(dotIndex + 1);

    const secret = process.env.META_APP_SECRET;
    if (!secret) throw new Error("META_APP_SECRET not configured");

    // Verify HMAC-SHA256 signature using Web Crypto API
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
      `${appUrl}/workspaces?social_error=Invalid+state`
    );
  }

  if (Date.now() - state.ts > 15 * 60 * 1000) {
    return redirect(
      `${appUrl}/workspaces?social_error=Session+expired`
    );
  }

  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return redirect(
      `${appUrl}/workspaces?social_error=Meta+OAuth+not+configured`
    );
  }

  try {
    if (state.provider === "instagram") {
      // Instagram Business Login flow
      // Step 1: Exchange code for short-lived token via Instagram API
      const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
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
      if (!tokenRes.ok) throw new Error(`Instagram API returned HTTP ${tokenRes.status}`);
      const tokenData = await tokenRes.json();
      if (tokenData.error_type || tokenData.error_message) {
        throw new Error(tokenData.error_message || "Instagram OAuth error");
      }

      const shortToken = tokenData.access_token;
      const igUserId = String(tokenData.user_id);

      // Step 2: Exchange for long-lived token (~60 days)
      const longRes = await fetch(
        `${IG_GRAPH_URL}/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortToken}`
      );
      if (!longRes.ok) throw new Error(`Instagram API returned HTTP ${longRes.status}`);
      const longData = await longRes.json();
      if (longData.error) throw new Error(longData.error.message);

      const longToken = longData.access_token;
      const expiresIn = longData.expires_in || 5184000;
      const tokenExpiresAt = Date.now() + expiresIn * 1000;

      // Step 3: Get user profile info
      const userRes = await fetch(
        `${IG_GRAPH_URL}/me?fields=id,username,name,profile_picture_url&access_token=${longToken}`
      );
      if (!userRes.ok) throw new Error(`Instagram API returned HTTP ${userRes.status}`);
      const userData = await userRes.json();
      if (userData.error) throw new Error(userData.error.message);

      // Step 4: Store account
      await ctx.runMutation(internal.socialAccounts.connect, {
        userId: state.userId as never,
        workspaceId: state.workspaceId as never,
        provider: "instagram",
        providerUserId: igUserId,
        providerAccountId: userData.id || igUserId,
        providerAccountName: userData.username || userData.name || "Instagram Account",
        providerAccountImage: userData.profile_picture_url,
        accessToken: longToken,
        tokenExpiresAt,
        scopes: INSTAGRAM_SCOPES,
        canPublishPosts: true,
        canPublishStories: true,
        canPublishReels: true,
        canReadInsights: true,
      });

      const successMsg = `Connected: Instagram @${userData.username || "account"}`;
      return redirect(
        `${appUrl}/workspaces?social_success=${encodeURIComponent(successMsg)}`
      );
    }

    // ─── Facebook OAuth flow (default) ────────────────────────────

    // Step 1: Exchange code for short-lived token
    const tokenUrl = new URL(`${META_GRAPH_URL}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    if (!tokenRes.ok) throw new Error(`Meta API returned HTTP ${tokenRes.status}`);
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error.message);

    // Step 2: Exchange for long-lived token (~60 days)
    const longUrl = new URL(`${META_GRAPH_URL}/oauth/access_token`);
    longUrl.searchParams.set("grant_type", "fb_exchange_token");
    longUrl.searchParams.set("client_id", clientId);
    longUrl.searchParams.set("client_secret", clientSecret);
    longUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

    const longRes = await fetch(longUrl.toString());
    if (!longRes.ok) throw new Error(`Meta API returned HTTP ${longRes.status}`);
    const longData = await longRes.json();
    if (longData.error) throw new Error(longData.error.message);

    const longToken = longData.access_token;
    const expiresIn = longData.expires_in || 5184000;
    const tokenExpiresAt = Date.now() + expiresIn * 1000;

    // Step 3: Get user info
    const userRes = await fetch(
      `${META_GRAPH_URL}/me?fields=id,name&access_token=${longToken}`
    );
    if (!userRes.ok) throw new Error(`Meta API returned HTTP ${userRes.status}`);
    const userData = await userRes.json();
    if (userData.error) throw new Error(userData.error.message);

    // Step 4: Get Pages (page tokens obtained via long-lived user token never expire)
    const pagesRes = await fetch(
      `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,picture&access_token=${longToken}`
    );
    if (!pagesRes.ok) throw new Error(`Meta API returned HTTP ${pagesRes.status}`);
    const pagesData = await pagesRes.json();
    if (pagesData.error) throw new Error(pagesData.error.message);

    const pages = pagesData.data || [];
    const connectedAccounts: string[] = [];

    for (const page of pages) {
      // Connect Facebook Page (page tokens never expire)
      await ctx.runMutation(internal.socialAccounts.connect, {
        userId: state.userId as never,
        workspaceId: state.workspaceId as never,
        provider: "facebook",
        providerUserId: userData.id,
        providerPageId: page.id,
        providerAccountId: page.id,
        providerAccountName: page.name,
        providerAccountImage: page.picture?.data?.url,
        accessToken: page.access_token,
        scopes: FACEBOOK_SCOPES,
        canPublishPosts: true,
        canPublishStories: true,
        canPublishReels: true,
        canReadInsights: true,
      });
      connectedAccounts.push(`Facebook: ${page.name}`);
    }

    // If no pages, store user-level connection (this token DOES expire ~60 days)
    if (pages.length === 0) {
      await ctx.runMutation(internal.socialAccounts.connect, {
        userId: state.userId as never,
        workspaceId: state.workspaceId as never,
        provider: "facebook",
        providerUserId: userData.id,
        providerAccountId: userData.id,
        providerAccountName: userData.name,
        accessToken: longToken,
        tokenExpiresAt,
        scopes: FACEBOOK_SCOPES,
        canPublishPosts: false,
        canPublishStories: false,
        canPublishReels: false,
        canReadInsights: false,
      });
    }

    const successMsg = connectedAccounts.length > 0
      ? `Connected: ${connectedAccounts.join(", ")}`
      : "Connected to Facebook (no pages found)";

    return redirect(
      `${appUrl}/workspaces?social_success=${encodeURIComponent(successMsg)}`
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return redirect(
      `${appUrl}/workspaces?social_error=${encodeURIComponent(message)}`
    );
  }
});

// ─── Verify Meta signed_request ─────────────────────────────────────

async function verifySignedRequest(signedRequest: string): Promise<{ user_id: string }> {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) throw new Error("META_APP_SECRET not configured");

  const [encodedSig, payload] = signedRequest.split(".");
  if (!encodedSig || !payload) throw new Error("Invalid signed_request format");

  // Meta uses base64url encoding — convert to standard base64
  const sigBase64 = encodedSig.replace(/-/g, "+").replace(/_/g, "/");
  const sigBytes = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0));

  // Compute expected HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expectedBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const expectedBytes = new Uint8Array(expectedBuffer);

  // Constant-time comparison
  if (sigBytes.length !== expectedBytes.length) throw new Error("Invalid signature");
  let mismatch = 0;
  for (let i = 0; i < sigBytes.length; i++) {
    mismatch |= sigBytes[i] ^ expectedBytes[i];
  }
  if (mismatch !== 0) throw new Error("Invalid signature");

  const decoded = JSON.parse(atob(payload));
  return decoded;
}

// ─── Deauthorize Callback (Meta calls this when user removes app) ───

export const handleDeauthorize = httpAction(async (ctx, request) => {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const signedRequest = params.get("signed_request");

    if (!signedRequest) {
      return new Response(JSON.stringify({ error: "Missing signed_request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify signature and decode payload
    const decoded = await verifySignedRequest(signedRequest);
    const providerUserId = decoded.user_id;

    if (providerUserId) {
      await ctx.runMutation(internal.socialAccounts.revokeByProviderUser, {
        providerUserId,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Deauthorize callback error:", err);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ─── Data Deletion Callback (GDPR compliance) ──────────────────────

export const handleDataDeletion = httpAction(async (ctx, request) => {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const signedRequest = params.get("signed_request");

    if (!signedRequest) {
      return new Response(JSON.stringify({ error: "Missing signed_request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify signature and decode payload
    const decoded = await verifySignedRequest(signedRequest);
    const providerUserId = decoded.user_id;
    const confirmationCode = `del_${providerUserId}_${Date.now()}`;

    if (providerUserId) {
      await ctx.runMutation(internal.socialAccounts.deleteByProviderUser, {
        providerUserId,
      });
    }

    const statusUrl = process.env.APP_URL || "http://localhost:3000";

    return new Response(
      JSON.stringify({
        url: `${statusUrl}/data-deletion?code=${confirmationCode}`,
        confirmation_code: confirmationCode,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Data deletion callback error:", err);
    return new Response(
      JSON.stringify({
        url: "https://odesigns.studio/data-deletion",
        confirmation_code: `del_error_${Date.now()}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
