// Meta (Facebook + Instagram) OAuth and API utilities

const META_API_VERSION = "v21.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const IG_GRAPH_URL = `https://graph.instagram.com/${META_API_VERSION}`;

// ─── Facebook OAuth Scopes ──────────────────────────────────────────
export const FACEBOOK_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "public_profile",
  "email",
];

// ─── Instagram Business Login Scopes ────────────────────────────────
export const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
];

// Legacy combined scopes (kept for backward compat with existing connected accounts)
export const META_SCOPES = [
  ...FACEBOOK_SCOPES,
  ...INSTAGRAM_SCOPES,
];

// ─── Facebook OAuth ─────────────────────────────────────────────────

export function getFacebookAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", FACEBOOK_SCOPES.join(","));
  url.searchParams.set("state", params.state);
  url.searchParams.set("response_type", "code");
  return url.toString();
}

// ─── Instagram Business Login OAuth ─────────────────────────────────

export function getInstagramAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", INSTAGRAM_SCOPES.join(","));
  url.searchParams.set("state", params.state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("enable_fb_login", "0");
  url.searchParams.set("force_authentication", "1");
  return url.toString();
}

// Legacy: combined auth URL (Facebook login that also requests IG permissions)
export function getMetaAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  return getFacebookAuthUrl(params);
}

// ─── Token Exchange ─────────────────────────────────────────────────

export async function exchangeCodeForToken(params: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${META_GRAPH_URL}/oauth/access_token`);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("client_secret", params.clientSecret);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("code", params.code);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta OAuth error: ${data.error.message}`);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

// Exchange Instagram short-lived token for long-lived token
export async function exchangeInstagramToken(params: {
  shortLivedToken: string;
  clientSecret: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${IG_GRAPH_URL}/access_token`);
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", params.clientSecret);
  url.searchParams.set("access_token", params.shortLivedToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new Error(`Instagram token exchange error: ${data.error.message}`);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000, // ~60 days default
  };
}

// Refresh Instagram long-lived token
export async function refreshInstagramToken(params: {
  accessToken: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${IG_GRAPH_URL}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", params.accessToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new Error(`Instagram token refresh error: ${data.error.message}`);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000,
  };
}

export async function exchangeForLongLivedToken(params: {
  shortLivedToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL(`${META_GRAPH_URL}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("client_secret", params.clientSecret);
  url.searchParams.set("fb_exchange_token", params.shortLivedToken);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta token exchange error: ${data.error.message}`);
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000,
  };
}

export async function refreshLongLivedToken(params: {
  accessToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  return exchangeForLongLivedToken({
    shortLivedToken: params.accessToken,
    clientId: params.clientId,
    clientSecret: params.clientSecret,
  });
}

// ─── API Helpers ────────────────────────────────────────────────────

export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
  picture?: { data?: { url?: string } };
}

export async function getUserPages(accessToken: string): Promise<MetaPage[]> {
  const res = await fetch(
    `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,picture&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API error: ${data.error.message}`);
  }

  return data.data || [];
}

export async function getInstagramAccount(
  pageId: string,
  pageAccessToken: string
): Promise<{ id: string; name: string; profilePicture?: string } | null> {
  const res = await fetch(
    `${META_GRAPH_URL}/${pageId}?fields=instagram_business_account{id,name,profile_picture_url}&access_token=${pageAccessToken}`
  );
  const data = await res.json();

  if (data.error || !data.instagram_business_account) {
    return null;
  }

  return {
    id: data.instagram_business_account.id,
    name: data.instagram_business_account.name || "",
    profilePicture: data.instagram_business_account.profile_picture_url,
  };
}

// Get Instagram user info via Instagram Graph API (for Business Login)
export async function getInstagramUserInfo(accessToken: string): Promise<{
  id: string;
  username: string;
  name?: string;
  profilePicture?: string;
}> {
  const res = await fetch(
    `${IG_GRAPH_URL}/me?fields=id,username,name,profile_picture_url&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(`Instagram API error: ${data.error.message}`);
  }

  return {
    id: data.id,
    username: data.username,
    name: data.name,
    profilePicture: data.profile_picture_url,
  };
}

export async function getUserInfo(accessToken: string): Promise<{ id: string; name: string }> {
  const res = await fetch(
    `${META_GRAPH_URL}/me?fields=id,name&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API error: ${data.error.message}`);
  }

  return { id: data.id, name: data.name };
}

export async function revokeToken(accessToken: string): Promise<void> {
  await fetch(`${META_GRAPH_URL}/me/permissions`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: accessToken }),
  });
}
