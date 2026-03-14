import dns from "dns/promises";

/**
 * Domains allowed for the image proxy.
 * Covers Unsplash CDN, Convex storage, and common image CDNs.
 */
const ALLOWED_PROXY_DOMAINS = [
  "images.unsplash.com",
  "plus.unsplash.com",
  "upload.wikimedia.org",
  "cdn.pixabay.com",
];

const ALLOWED_PROXY_DOMAIN_SUFFIXES = [
  ".unsplash.com",
  ".convex.cloud",
  ".convex.site",
];

export function isAllowedProxyDomain(hostname: string): boolean {
  if (ALLOWED_PROXY_DOMAINS.includes(hostname)) return true;
  return ALLOWED_PROXY_DOMAIN_SUFFIXES.some((suffix) =>
    hostname.endsWith(suffix)
  );
}

/**
 * Check if an IP address is in a private/reserved range.
 */
function isPrivateIPAddress(ip: string): boolean {
  // IPv4 private/reserved ranges
  const parts = ip.split(".").map(Number);
  if (parts.length === 4) {
    if (parts[0] === 127) return true; // 127.0.0.0/8
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16 (cloud metadata)
    if (parts[0] === 0) return true; // 0.0.0.0/8
  }

  // IPv6 private ranges
  if (ip === "::1") return true;
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true; // fc00::/7
  if (ip.startsWith("fe80")) return true; // link-local

  return false;
}

/**
 * Resolve hostname and check if any resolved IP is private.
 */
async function resolvesToPrivateIP(hostname: string): Promise<boolean> {
  try {
    const addresses = await dns.resolve4(hostname);
    return addresses.some(isPrivateIPAddress);
  } catch {
    // If DNS resolution fails, block it to be safe
    return true;
  }
}

/**
 * Check if a URL resolves to a private/internal IP (SSRF protection).
 * Unlike validateProxyUrl, this does NOT enforce a domain allowlist —
 * suitable for endpoints that legitimately fetch arbitrary external URLs.
 */
export async function validateExternalUrl(
  rawUrl: string
): Promise<UrlValidationResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: "Invalid URL" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { allowed: false, reason: "Only HTTP/HTTPS URLs are allowed" };
  }

  if (await resolvesToPrivateIP(parsed.hostname)) {
    return { allowed: false, reason: "URL resolves to a private/internal IP" };
  }

  return { allowed: true };
}

export interface UrlValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validate a URL for the image proxy.
 * Checks protocol, domain allowlist, and private IP ranges.
 */
export async function validateProxyUrl(
  rawUrl: string
): Promise<UrlValidationResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: "Invalid URL" };
  }

  // Only allow HTTPS
  if (parsed.protocol !== "https:") {
    return { allowed: false, reason: "Only HTTPS URLs are allowed" };
  }

  // Check domain allowlist
  if (!isAllowedProxyDomain(parsed.hostname)) {
    return {
      allowed: false,
      reason: "Domain not in allowlist",
    };
  }

  // Check for private/internal IPs
  if (await resolvesToPrivateIP(parsed.hostname)) {
    return { allowed: false, reason: "URL resolves to private IP" };
  }

  return { allowed: true };
}
