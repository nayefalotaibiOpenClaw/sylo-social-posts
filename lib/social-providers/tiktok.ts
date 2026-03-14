// TikTok Login Kit v2 OAuth 2.0 with PKCE

import { randomBytes, createHash } from "crypto";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_URL = "https://open.tiktokapis.com/v2/user/info/";

// ─── Scopes ─────────────────────────────────────────────────────────
export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.publish",
  "video.upload",
];

// ─── PKCE Helpers ───────────────────────────────────────────────────

export function generateCodeVerifier(): string {
  return randomBytes(48).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

// ─── OAuth URL Builder ──────────────────────────────────────────────

export function getTikTokAuthUrl(params: {
  clientKey: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL(TIKTOK_AUTH_URL);
  url.searchParams.set("client_key", params.clientKey);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", TIKTOK_SCOPES.join(","));
  url.searchParams.set("state", params.state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

// ─── Token Exchange ─────────────────────────────────────────────────

export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientKey: string;
  clientSecret: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  openId: string;
}> {
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: params.clientKey,
      client_secret: params.clientSecret,
      code: params.code,
      grant_type: "authorization_code",
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      `TikTok token exchange error: ${data.error_description || data.error || res.statusText}`
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 86400,
    refreshExpiresIn: data.refresh_expires_in || 31536000,
    openId: data.open_id,
  };
}

// ─── Token Refresh ──────────────────────────────────────────────────

export async function refreshAccessToken(params: {
  refreshToken: string;
  clientKey: string;
  clientSecret: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  openId: string;
}> {
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: params.clientKey,
      client_secret: params.clientSecret,
      grant_type: "refresh_token",
      refresh_token: params.refreshToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(
      `TikTok token refresh error: ${data.error_description || data.error || res.statusText}`
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 86400,
    refreshExpiresIn: data.refresh_expires_in || 31536000,
    openId: data.open_id,
  };
}

// ─── API Helpers ────────────────────────────────────────────────────

export async function getTikTokUser(accessToken: string): Promise<{
  openId: string;
  displayName: string;
  avatarUrl?: string;
  username?: string;
}> {
  const res = await fetch(
    `${TIKTOK_USER_URL}?fields=open_id,display_name,avatar_url`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await res.json();

  if (!res.ok || data.error?.code) {
    throw new Error(
      `TikTok API error: ${data.error?.message || res.statusText}`
    );
  }

  const user = data.data?.user;
  if (!user) throw new Error("TikTok user data not found in response");

  return {
    openId: user.open_id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    username: user.username,
  };
}

// ─── Publish Photo (TikTok Photo Mode) ─────────────────────────────

export async function publishPhotoToTikTok(params: {
  accessToken: string;
  imageData: Uint8Array;
  contentType: string;
  caption: string;
}): Promise<{ publishId: string }> {
  const { accessToken, imageData, contentType, caption } = params;

  if (imageData.length > 20 * 1024 * 1024) {
    throw new Error("Image exceeds 20MB limit for TikTok");
  }

  // Step 1: Initialize photo upload
  const initRes = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/content/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: caption.slice(0, 150),
          privacy_level: "SELF_ONLY",
        },
        source_info: {
          source: "FILE_UPLOAD",
          photo_upload_params: {
            photo_count: 1,
          },
        },
        post_mode: "DIRECT_POST",
        media_type: "PHOTO",
      }),
    }
  );

  const initData = await initRes.json();

  if (!initRes.ok || initData.error?.code) {
    throw new Error(
      `TikTok publish error: ${initData.error?.message || initRes.statusText}`
    );
  }

  const uploadUrl = initData.data?.photo_upload_urls?.[0];
  if (!uploadUrl) throw new Error("TikTok did not return an upload URL");

  // Step 2: Upload image file
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(imageData.length),
    },
    body: imageData,
  });

  if (!uploadRes.ok) {
    throw new Error(`TikTok image upload failed: ${await uploadRes.text()}`);
  }

  return {
    publishId: initData.data?.publish_id || "unknown",
  };
}

// ─── Token Revocation ───────────────────────────────────────────────

export async function revokeToken(params: {
  accessToken: string;
  clientKey: string;
  clientSecret: string;
}): Promise<void> {
  await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: params.clientKey,
      client_secret: params.clientSecret,
      token: params.accessToken,
    }),
  });
}
