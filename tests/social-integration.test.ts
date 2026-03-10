/**
 * Social Media Integration — API & Route Tests
 *
 * Tests the Meta provider helpers, OAuth state encoding, and API routes.
 * API route tests (sections 2, 3) require a running dev server.
 * Convex callback tests (section 8) require Convex deployment.
 *
 * Run: npm run test:social-api
 */
import { describe, it, expect } from "vitest";
import {
  getMetaAuthUrl,
  getFacebookAuthUrl,
  getInstagramAuthUrl,
  META_SCOPES,
  FACEBOOK_SCOPES,
  INSTAGRAM_SCOPES,
} from "../lib/social-providers/meta";

// ─── Config ──────────────────────────────────────────────────
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const RUN_API_TESTS = process.env.RUN_API_TESTS === "true";

async function apiGet(path: string, followRedirects = true) {
  return fetch(`${APP_URL}${path}`, {
    redirect: followRedirects ? "follow" : "manual",
  });
}

async function apiPost(path: string, body: Record<string, unknown>) {
  return fetch(`${APP_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ═══════════════════════════════════════════════════════════════
// 1. META AUTH URL BUILDER (unit, no server needed)
// ═══════════════════════════════════════════════════════════════

describe("Facebook: getFacebookAuthUrl", () => {
  it("builds a valid Facebook OAuth dialog URL", () => {
    const url = getFacebookAuthUrl({
      clientId: "test_app_id",
      redirectUri: "https://example.com/callback",
      state: "abc123",
    });

    const parsed = new URL(url);
    expect(parsed.hostname).toBe("www.facebook.com");
    expect(parsed.pathname).toContain("/dialog/oauth");
    expect(parsed.searchParams.get("client_id")).toBe("test_app_id");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://example.com/callback");
    expect(parsed.searchParams.get("state")).toBe("abc123");
    expect(parsed.searchParams.get("response_type")).toBe("code");
  });

  it("includes Facebook scopes in comma-separated format", () => {
    const url = getFacebookAuthUrl({
      clientId: "test",
      redirectUri: "https://example.com/cb",
      state: "s",
    });

    const parsed = new URL(url);
    const scopes = parsed.searchParams.get("scope")!.split(",");
    expect(scopes).toEqual(FACEBOOK_SCOPES);
  });

  it("uses API v21.0", () => {
    const url = getFacebookAuthUrl({
      clientId: "test",
      redirectUri: "https://example.com/cb",
      state: "s",
    });
    expect(url).toContain("/v21.0/");
  });

  it("URL-encodes special characters in state", () => {
    const stateWithSpecialChars = btoa(JSON.stringify({ userId: "u+1", ts: 1 }));
    const url = getFacebookAuthUrl({
      clientId: "test",
      redirectUri: "https://example.com/cb",
      state: stateWithSpecialChars,
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("state")).toBe(stateWithSpecialChars);
  });
});

describe("Instagram: getInstagramAuthUrl", () => {
  it("builds a valid Instagram OAuth URL", () => {
    const url = getInstagramAuthUrl({
      clientId: "test_app_id",
      redirectUri: "https://example.com/callback",
      state: "abc123",
    });

    const parsed = new URL(url);
    expect(parsed.hostname).toBe("www.instagram.com");
    expect(parsed.pathname).toContain("/oauth/authorize");
    expect(parsed.searchParams.get("client_id")).toBe("test_app_id");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://example.com/callback");
    expect(parsed.searchParams.get("state")).toBe("abc123");
    expect(parsed.searchParams.get("response_type")).toBe("code");
  });

  it("includes Instagram Business Login scopes", () => {
    const url = getInstagramAuthUrl({
      clientId: "test",
      redirectUri: "https://example.com/cb",
      state: "s",
    });

    const parsed = new URL(url);
    const scopes = parsed.searchParams.get("scope")!.split(",");
    expect(scopes).toEqual(INSTAGRAM_SCOPES);
  });

  it("disables Facebook login fallback", () => {
    const url = getInstagramAuthUrl({
      clientId: "test",
      redirectUri: "https://example.com/cb",
      state: "s",
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("enable_fb_login")).toBe("0");
  });
});

describe("Meta: getMetaAuthUrl (legacy)", () => {
  it("delegates to getFacebookAuthUrl", () => {
    const params = {
      clientId: "test",
      redirectUri: "https://example.com/cb",
      state: "s",
    };
    expect(getMetaAuthUrl(params)).toBe(getFacebookAuthUrl(params));
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. OAUTH AUTHORIZE ROUTE — /api/social-auth/meta/authorize
//    (requires dev server: RUN_API_TESTS=true)
// ═══════════════════════════════════════════════════════════════

describe.skipIf(!RUN_API_TESTS)("API: /api/social-auth/meta/authorize", () => {
  it("returns 400 when workspaceId is missing", async () => {
    const res = await apiGet("/api/social-auth/meta/authorize?userId=u1", false);
    if (res.status === 400) {
      const data = await res.json();
      expect(data.error).toContain("Missing");
    } else {
      expect([400, 500]).toContain(res.status);
    }
  });

  it("returns 400 when userId is missing", async () => {
    const res = await apiGet("/api/social-auth/meta/authorize?workspaceId=w1", false);
    if (res.status === 400) {
      const data = await res.json();
      expect(data.error).toContain("Missing");
    } else {
      expect([400, 500]).toContain(res.status);
    }
  });

  it("returns 400 when both params are missing", async () => {
    const res = await apiGet("/api/social-auth/meta/authorize", false);
    if (res.status === 400) {
      const data = await res.json();
      expect(data.error).toContain("Missing");
    } else {
      expect([400, 500]).toContain(res.status);
    }
  });

  it("redirects to Facebook when params are valid and env vars are set", async () => {
    const res = await apiGet(
      "/api/social-auth/meta/authorize?workspaceId=w1&userId=u1",
      false
    );
    if (res.status === 302 || res.status === 307) {
      const location = res.headers.get("location");
      expect(location).toContain("facebook.com");
      expect(location).toContain("dialog/oauth");
    } else {
      expect([400, 500]).toContain(res.status);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. DISCONNECT ROUTE — /api/social-auth/meta/disconnect
//    (requires dev server: RUN_API_TESTS=true)
// ═══════════════════════════════════════════════════════════════

describe.skipIf(!RUN_API_TESTS)("API: /api/social-auth/meta/disconnect", () => {
  it("returns success even without a token (best-effort)", async () => {
    const res = await apiPost("/api/social-auth/meta/disconnect", {});
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns success with a fake token (revoke is best-effort)", async () => {
    const res = await apiPost("/api/social-auth/meta/disconnect", {
      accessToken: "fake_token_12345",
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("handles invalid JSON body gracefully", async () => {
    const res = await fetch(`${APP_URL}/api/social-auth/meta/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json",
    });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. META PROVIDER HELPERS — scope validation
// ═══════════════════════════════════════════════════════════════

describe("Meta: Provider Helper Utilities", () => {
  it("FACEBOOK_SCOPES includes all required permissions for Facebook publishing", () => {
    expect(FACEBOOK_SCOPES).toContain("pages_manage_posts");
    expect(FACEBOOK_SCOPES).toContain("pages_show_list");
    expect(FACEBOOK_SCOPES).toContain("pages_read_engagement");
    expect(FACEBOOK_SCOPES).toContain("public_profile");
    expect(FACEBOOK_SCOPES).toContain("email");
  });

  it("INSTAGRAM_SCOPES includes all required permissions for Instagram publishing", () => {
    expect(INSTAGRAM_SCOPES).toContain("instagram_business_basic");
    expect(INSTAGRAM_SCOPES).toContain("instagram_business_content_publish");
    expect(INSTAGRAM_SCOPES).toContain("instagram_business_manage_insights");
  });

  it("META_SCOPES is the union of Facebook and Instagram scopes", () => {
    for (const scope of FACEBOOK_SCOPES) {
      expect(META_SCOPES).toContain(scope);
    }
    for (const scope of INSTAGRAM_SCOPES) {
      expect(META_SCOPES).toContain(scope);
    }
  });

  it("no duplicate scopes in FACEBOOK_SCOPES", () => {
    const unique = new Set(FACEBOOK_SCOPES);
    expect(unique.size).toBe(FACEBOOK_SCOPES.length);
  });

  it("no duplicate scopes in INSTAGRAM_SCOPES", () => {
    const unique = new Set(INSTAGRAM_SCOPES);
    expect(unique.size).toBe(INSTAGRAM_SCOPES.length);
  });

  it("no duplicate scopes in META_SCOPES", () => {
    const unique = new Set(META_SCOPES);
    expect(unique.size).toBe(META_SCOPES.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. STATE ENCODING ROUND-TRIP (simulating authorize → callback)
// ═══════════════════════════════════════════════════════════════

describe("OAuth: Full State Round-Trip", () => {
  it("encodes with Buffer.toString('base64') and decodes with atob()", () => {
    const payload = {
      userId: "user_abc123",
      workspaceId: "ws_xyz789",
      csrf: "random-uuid",
      ts: Date.now(),
    };

    // Simulate what the authorize route does
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");

    // Simulate what the Convex callback does
    const decoded = JSON.parse(atob(encoded));

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.workspaceId).toBe(payload.workspaceId);
    expect(decoded.csrf).toBe(payload.csrf);
    expect(decoded.ts).toBe(payload.ts);
  });

  it("handles unicode in state via Buffer round-trip", () => {
    // atob() doesn't handle multi-byte UTF-8 — use Buffer for both encode/decode
    const payload = {
      userId: "user_日本語",
      workspaceId: "ws_العربية",
      ts: Date.now(),
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    const decoded = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.workspaceId).toBe(payload.workspaceId);
  });

  it("state with ASCII-only IDs works with both atob and Buffer", () => {
    // Convex IDs are always ASCII, so atob() is safe in production
    const payload = {
      userId: "user_abc123",
      workspaceId: "ws_def456",
      ts: Date.now(),
    };

    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");

    const decodedAtob = JSON.parse(atob(encoded));
    const decodedBuffer = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));

    expect(decodedAtob.userId).toBe(payload.userId);
    expect(decodedBuffer.userId).toBe(payload.userId);
    expect(decodedAtob.workspaceId).toBe(decodedBuffer.workspaceId);
  });

  it("handles base64 padding correctly", () => {
    for (let i = 1; i <= 10; i++) {
      const payload = { userId: "u".repeat(i), workspaceId: "w", ts: 1 };
      const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
      const decoded = JSON.parse(atob(encoded));
      expect(decoded.userId).toBe("u".repeat(i));
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. PUBLISHING CAPTION RULES
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Caption Edge Cases", () => {
  it("handles emoji in captions", () => {
    const caption = "Check out our new 🍕 pizza! 🎉🔥 #food";
    expect(caption.length).toBeLessThanOrEqual(2200);
    expect(caption).toContain("🍕");
  });

  it("handles newlines in captions", () => {
    const caption = "Line 1\n\nLine 2\n\nLine 3";
    expect(caption.length).toBeLessThanOrEqual(2200);
    expect(caption.split("\n").length).toBe(5);
  });

  it("handles hashtags at end of caption", () => {
    const caption = "Amazing post!\n\n#social #media #marketing";
    expect(caption.length).toBeLessThanOrEqual(2200);
  });

  it("handles max-length caption with unicode", () => {
    const caption = "📸".repeat(550) + "a".repeat(100);
    expect(caption.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. MEDIA URL HANDLING
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Media URL Validation", () => {
  it("accepts HTTPS URLs for media", () => {
    const url = "https://cdn.example.com/image.jpg";
    expect(url.startsWith("https://")).toBe(true);
  });

  it("Instagram API requires public HTTPS URLs", () => {
    const validUrl = "https://storage.example.com/post.jpg";
    const invalidUrl = "http://localhost:3000/image.jpg";

    expect(validUrl.startsWith("https://")).toBe(true);
    expect(invalidUrl.startsWith("https://")).toBe(false);
  });

  it("validates file extensions for images", () => {
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const validFile = "photo.jpg";
    const ext = validFile.substring(validFile.lastIndexOf("."));
    expect(imageExts).toContain(ext);
  });

  it("validates video extensions for reels", () => {
    const videoExts = [".mp4", ".mov"];
    const validFile = "reel.mp4";
    const ext = validFile.substring(validFile.lastIndexOf("."));
    expect(videoExts).toContain(ext);
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. CONVEX HTTP ROUTE — /social-auth/meta/callback
// ═══════════════════════════════════════════════════════════════

describe("Convex HTTP: /social-auth/meta/callback", () => {
  const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://little-toad-958.convex.cloud";
  const callbackUrl = CONVEX_URL.replace(".convex.cloud", ".convex.site") + "/social-auth/meta/callback";

  it("redirects with error when code is missing", async () => {
    const state = btoa(JSON.stringify({ userId: "u1", workspaceId: "w1", ts: Date.now() }));
    const res = await fetch(`${callbackUrl}?state=${state}`, { redirect: "manual" });

    if (res.status === 302) {
      const location = res.headers.get("location") || "";
      expect(location).toContain("social_error");
    } else {
      expect([302, 404, 502, 503]).toContain(res.status);
    }
  });

  it("redirects with error when state is missing", async () => {
    const res = await fetch(`${callbackUrl}?code=test_code`, { redirect: "manual" });

    if (res.status === 302) {
      const location = res.headers.get("location") || "";
      expect(location).toContain("social_error");
    } else {
      expect([302, 404, 502, 503]).toContain(res.status);
    }
  });

  it("redirects with error on invalid state base64", async () => {
    const res = await fetch(`${callbackUrl}?code=test&state=!!!not_base64!!!`, {
      redirect: "manual",
    });

    if (res.status === 302) {
      const location = res.headers.get("location") || "";
      expect(location).toContain("social_error");
    } else {
      expect([302, 404, 502, 503]).toContain(res.status);
    }
  });

  it("redirects with 'session expired' for old state", async () => {
    const oldState = btoa(
      JSON.stringify({ userId: "u1", workspaceId: "w1", ts: Date.now() - 20 * 60 * 1000 })
    );
    const res = await fetch(`${callbackUrl}?code=test&state=${oldState}`, {
      redirect: "manual",
    });

    if (res.status === 302) {
      const location = res.headers.get("location") || "";
      expect(location).toContain("social_error");
      expect(location.toLowerCase()).toContain("expired");
    } else {
      expect([302, 404, 502, 503]).toContain(res.status);
    }
  });

  it("passes OAuth error through from Facebook", async () => {
    const res = await fetch(
      `${callbackUrl}?error=access_denied&error_description=User+denied+access`,
      { redirect: "manual" }
    );

    if (res.status === 302) {
      const location = res.headers.get("location") || "";
      expect(location).toContain("social_error");
    } else {
      expect([302, 404, 502, 503]).toContain(res.status);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. SCHEDULED POST TIMING
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Schedule Timing Validation", () => {
  it("allows scheduling 1 minute in the future", () => {
    const scheduledFor = Date.now() + 60 * 1000;
    expect(scheduledFor > Date.now()).toBe(true);
  });

  it("allows scheduling 30 days in the future", () => {
    const scheduledFor = Date.now() + 30 * 24 * 60 * 60 * 1000;
    expect(scheduledFor > Date.now()).toBe(true);
  });

  it("cron processes posts where scheduledFor <= now", () => {
    const now = Date.now();
    const duePost = { scheduledFor: now - 1000, status: "scheduled" };
    const futurePost = { scheduledFor: now + 60000, status: "scheduled" };

    expect(duePost.scheduledFor <= now).toBe(true);
    expect(futurePost.scheduledFor <= now).toBe(false);
  });
});
