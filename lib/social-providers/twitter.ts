// X (Twitter) OAuth 2.0 with PKCE and API utilities

import { randomBytes, createHash } from "crypto";

const TWITTER_API_URL = "https://api.x.com/2";

// ─── Scopes ─────────────────────────────────────────────────────────
export const TWITTER_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "media.write",
  "offline.access",
];

// ─── PKCE Helpers ───────────────────────────────────────────────────

export function generateCodeVerifier(): string {
  return randomBytes(48).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

// ─── OAuth URL Builder ──────────────────────────────────────────────

export function getTwitterAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const url = new URL("https://x.com/i/oauth2/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", TWITTER_SCOPES.join(" "));
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

// ─── Token Exchange ─────────────────────────────────────────────────

function basicAuth(clientId: string, clientSecret: string): string {
  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const res = await fetch(`${TWITTER_API_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth(params.clientId, params.clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(`Twitter token exchange error: ${data.error_description || data.error || res.statusText}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 7200,
  };
}

// ─── Token Refresh ──────────────────────────────────────────────────

export async function refreshAccessToken(params: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const res = await fetch(`${TWITTER_API_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth(params.clientId, params.clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: params.refreshToken,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(`Twitter token refresh error: ${data.error_description || data.error || res.statusText}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 7200,
  };
}

// ─── API Helpers ────────────────────────────────────────────────────

export async function getTwitterUser(accessToken: string): Promise<{
  id: string;
  name: string;
  username: string;
  profileImageUrl?: string;
}> {
  const res = await fetch(
    `${TWITTER_API_URL}/users/me?user.fields=id,name,username,profile_image_url`,
    {
      headers: { "Authorization": `Bearer ${accessToken}` },
    }
  );

  const data = await res.json();

  if (!res.ok || data.errors) {
    throw new Error(`Twitter API error: ${data.errors?.[0]?.message || data.detail || res.statusText}`);
  }

  return {
    id: data.data.id,
    name: data.data.name,
    username: data.data.username,
    profileImageUrl: data.data.profile_image_url,
  };
}

// ─── Create Tweet ───────────────────────────────────────────────────

export async function createTweet(params: {
  accessToken: string;
  text: string;
  mediaIds?: string[];
}): Promise<{ id: string; text: string }> {
  if (params.text.length > 280) {
    throw new Error("Tweet exceeds 280 character limit");
  }

  const body: Record<string, unknown> = { text: params.text };
  if (params.mediaIds && params.mediaIds.length > 0) {
    body.media = { media_ids: params.mediaIds };
  }

  const res = await fetch(`${TWITTER_API_URL}/tweets`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.errors) {
    throw new Error(`Twitter tweet creation failed: ${data.errors?.[0]?.message || data.detail || res.statusText}`);
  }

  return {
    id: data.data.id,
    text: data.data.text,
  };
}

// ─── Token Revocation ───────────────────────────────────────────────

export async function revokeToken(params: {
  token: string;
  clientId: string;
  clientSecret: string;
}): Promise<void> {
  await fetch(`${TWITTER_API_URL}/oauth2/revoke`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth(params.clientId, params.clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token: params.token,
      token_type_hint: "access_token",
    }),
  });
}
