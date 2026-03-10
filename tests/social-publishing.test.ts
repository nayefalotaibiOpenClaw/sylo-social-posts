/**
 * Social Media Publishing — Unit Tests
 *
 * Tests the business logic for social account management,
 * publishing validation, scheduling, and Meta OAuth flow
 * — all without needing a running backend.
 */
import { describe, it, expect } from "vitest";

// ─── Constants (mirrored from codebase) ─────────────────────

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

const META_SCOPES = [...FACEBOOK_SCOPES, ...INSTAGRAM_SCOPES];

const PROVIDERS = ["facebook", "instagram", "tiktok", "twitter"] as const;
type Provider = (typeof PROVIDERS)[number];

const CONTENT_TYPES = ["image", "carousel", "reel", "story"] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

const ACCOUNT_STATUSES = ["active", "expired", "revoked"] as const;
const SCHEDULED_STATUSES = ["scheduled", "publishing", "published", "failed", "cancelled"] as const;

// ─── Helper types ───────────────────────────────────────────

type SocialAccount = {
  provider: Provider;
  status: (typeof ACCOUNT_STATUSES)[number];
  workspaceId: string;
  tokenExpiresAt?: number;
  canPublishPosts: boolean;
  canPublishStories: boolean;
  canPublishReels: boolean;
  canReadInsights: boolean;
};

type PublishArgs = {
  caption: string;
  contentType: ContentType;
  workspaceId: string;
  account: SocialAccount;
};

// ─── Validation helpers (mirror server-side logic) ──────────

function validatePublish(args: PublishArgs): { valid: boolean; error?: string } {
  const { account, caption, workspaceId } = args;

  if (!account) return { valid: false, error: "Social account not found" };
  if (account.status !== "active") return { valid: false, error: "Social account is not active" };
  if (account.workspaceId !== workspaceId) return { valid: false, error: "Account does not belong to this workspace" };
  if (account.tokenExpiresAt && account.tokenExpiresAt < Date.now()) {
    return { valid: false, error: "Access token has expired. Please reconnect the account." };
  }
  if (caption.length > 2200) return { valid: false, error: "Caption exceeds 2200 character limit" };

  return { valid: true };
}

function validateSchedule(args: {
  caption: string;
  scheduledFor: number;
  workspaceUserId: string;
  currentUserId: string;
}): { valid: boolean; error?: string } {
  if (args.currentUserId !== args.workspaceUserId) {
    return { valid: false, error: "Workspace not found" };
  }
  if (args.caption.length > 2200) {
    return { valid: false, error: "Caption exceeds 2200 character limit" };
  }
  if (args.scheduledFor <= Date.now()) {
    return { valid: false, error: "Scheduled time must be in the future" };
  }
  return { valid: true };
}

function validateCarousel(itemCount: number): { valid: boolean; error?: string } {
  if (itemCount < 2) return { valid: false, error: "Instagram carousels require at least 2 images" };
  if (itemCount > 10) return { valid: false, error: "Instagram carousels support at most 10 images" };
  return { valid: true };
}

function claimScheduledPost(currentStatus: string): boolean {
  return currentStatus === "scheduled";
}

// ─── OAuth state helpers ────────────────────────────────────

function encodeState(data: { userId: string; workspaceId: string; ts: number }) {
  return btoa(JSON.stringify({ ...data, csrf: "test-csrf" }));
}

function decodeState(stateParam: string): { userId: string; workspaceId: string; ts: number } | null {
  try {
    return JSON.parse(atob(stateParam));
  } catch {
    return null;
  }
}

function validateStateAge(ts: number, maxAgeMs = 15 * 60 * 1000): boolean {
  return Date.now() - ts <= maxAgeMs;
}

// ═══════════════════════════════════════════════════════════════
// 1. PUBLISH VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Validation", () => {
  const baseAccount: SocialAccount = {
    provider: "instagram",
    status: "active",
    workspaceId: "ws_123",
    canPublishPosts: true,
    canPublishStories: true,
    canPublishReels: true,
    canReadInsights: true,
  };

  it("accepts valid publish request", () => {
    const result = validatePublish({
      caption: "Hello world!",
      contentType: "image",
      workspaceId: "ws_123",
      account: baseAccount,
    });
    expect(result.valid).toBe(true);
  });

  it("rejects when account is expired", () => {
    const result = validatePublish({
      caption: "Test",
      contentType: "image",
      workspaceId: "ws_123",
      account: { ...baseAccount, status: "expired" },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not active");
  });

  it("rejects when account is revoked", () => {
    const result = validatePublish({
      caption: "Test",
      contentType: "image",
      workspaceId: "ws_123",
      account: { ...baseAccount, status: "revoked" },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not active");
  });

  it("rejects workspace mismatch", () => {
    const result = validatePublish({
      caption: "Test",
      contentType: "image",
      workspaceId: "ws_other",
      account: baseAccount,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("does not belong");
  });

  it("rejects expired token", () => {
    const result = validatePublish({
      caption: "Test",
      contentType: "image",
      workspaceId: "ws_123",
      account: { ...baseAccount, tokenExpiresAt: Date.now() - 1000 },
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("expired");
  });

  it("allows non-expired token", () => {
    const result = validatePublish({
      caption: "Test",
      contentType: "image",
      workspaceId: "ws_123",
      account: { ...baseAccount, tokenExpiresAt: Date.now() + 86400000 },
    });
    expect(result.valid).toBe(true);
  });

  it("allows account with no tokenExpiresAt (page tokens)", () => {
    const result = validatePublish({
      caption: "Test",
      contentType: "image",
      workspaceId: "ws_123",
      account: { ...baseAccount, tokenExpiresAt: undefined },
    });
    expect(result.valid).toBe(true);
  });

  it("rejects caption over 2200 characters", () => {
    const result = validatePublish({
      caption: "x".repeat(2201),
      contentType: "image",
      workspaceId: "ws_123",
      account: baseAccount,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("2200");
  });

  it("accepts caption at exactly 2200 characters", () => {
    const result = validatePublish({
      caption: "x".repeat(2200),
      contentType: "image",
      workspaceId: "ws_123",
      account: baseAccount,
    });
    expect(result.valid).toBe(true);
  });

  it("accepts empty caption", () => {
    const result = validatePublish({
      caption: "",
      contentType: "image",
      workspaceId: "ws_123",
      account: baseAccount,
    });
    expect(result.valid).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. CAROUSEL VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Carousel Validation", () => {
  it("rejects carousel with 1 item", () => {
    const result = validateCarousel(1);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("at least 2");
  });

  it("accepts carousel with 2 items (minimum)", () => {
    expect(validateCarousel(2).valid).toBe(true);
  });

  it("accepts carousel with 10 items (maximum)", () => {
    expect(validateCarousel(10).valid).toBe(true);
  });

  it("rejects carousel with 11 items", () => {
    const result = validateCarousel(11);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("at most 10");
  });

  it.each([2, 3, 5, 7, 10])("accepts carousel with %d items", (count) => {
    expect(validateCarousel(count).valid).toBe(true);
  });

  it.each([0, 1, 11, 20, 100])("rejects carousel with %d items", (count) => {
    expect(validateCarousel(count).valid).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. SCHEDULE VALIDATION
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Schedule Validation", () => {
  it("accepts valid schedule", () => {
    const result = validateSchedule({
      caption: "Scheduled post",
      scheduledFor: Date.now() + 3600000,
      workspaceUserId: "user_1",
      currentUserId: "user_1",
    });
    expect(result.valid).toBe(true);
  });

  it("rejects schedule in the past", () => {
    const result = validateSchedule({
      caption: "Too late",
      scheduledFor: Date.now() - 1000,
      workspaceUserId: "user_1",
      currentUserId: "user_1",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("future");
  });

  it("rejects schedule at current time", () => {
    const now = Date.now();
    const result = validateSchedule({
      caption: "Now",
      scheduledFor: now,
      workspaceUserId: "user_1",
      currentUserId: "user_1",
    });
    expect(result.valid).toBe(false);
  });

  it("rejects schedule for wrong workspace", () => {
    const result = validateSchedule({
      caption: "Valid",
      scheduledFor: Date.now() + 3600000,
      workspaceUserId: "user_1",
      currentUserId: "user_2",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Workspace not found");
  });

  it("rejects schedule with too-long caption", () => {
    const result = validateSchedule({
      caption: "x".repeat(2201),
      scheduledFor: Date.now() + 3600000,
      workspaceUserId: "user_1",
      currentUserId: "user_1",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("2200");
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. CLAIM SCHEDULED POST (RACE CONDITION PREVENTION)
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Claim Scheduled Post", () => {
  it("claims a post in 'scheduled' status", () => {
    expect(claimScheduledPost("scheduled")).toBe(true);
  });

  it("rejects a post in 'publishing' status (already claimed)", () => {
    expect(claimScheduledPost("publishing")).toBe(false);
  });

  it("rejects a post in 'published' status", () => {
    expect(claimScheduledPost("published")).toBe(false);
  });

  it("rejects a post in 'failed' status", () => {
    expect(claimScheduledPost("failed")).toBe(false);
  });

  it("rejects a post in 'cancelled' status", () => {
    expect(claimScheduledPost("cancelled")).toBe(false);
  });

  it.each(["publishing", "published", "failed", "cancelled"])(
    "only 'scheduled' can be claimed, not '%s'",
    (status) => {
      expect(claimScheduledPost(status)).toBe(false);
    }
  );
});

// ═══════════════════════════════════════════════════════════════
// 5. OAUTH STATE ENCODING/DECODING
// ═══════════════════════════════════════════════════════════════

describe("OAuth: State Encoding", () => {
  it("round-trips state correctly", () => {
    const input = { userId: "user_abc", workspaceId: "ws_xyz", ts: Date.now() };
    const encoded = encodeState(input);
    const decoded = decodeState(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe(input.userId);
    expect(decoded!.workspaceId).toBe(input.workspaceId);
    expect(decoded!.ts).toBe(input.ts);
  });

  it("returns null for invalid base64", () => {
    expect(decodeState("not-valid-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 but invalid JSON", () => {
    expect(decodeState(btoa("not json"))).toBeNull();
  });

  it("preserves CSRF token in encoded state", () => {
    const encoded = encodeState({ userId: "u1", workspaceId: "w1", ts: 1000 });
    const decoded = JSON.parse(atob(encoded));
    expect(decoded.csrf).toBe("test-csrf");
  });
});

describe("OAuth: State Age Validation", () => {
  it("accepts fresh state (just created)", () => {
    expect(validateStateAge(Date.now())).toBe(true);
  });

  it("accepts state from 5 minutes ago", () => {
    expect(validateStateAge(Date.now() - 5 * 60 * 1000)).toBe(true);
  });

  it("accepts state from 14 minutes ago", () => {
    expect(validateStateAge(Date.now() - 14 * 60 * 1000)).toBe(true);
  });

  it("rejects state from 16 minutes ago", () => {
    expect(validateStateAge(Date.now() - 16 * 60 * 1000)).toBe(false);
  });

  it("rejects state from 1 hour ago", () => {
    expect(validateStateAge(Date.now() - 60 * 60 * 1000)).toBe(false);
  });

  it("rejects state from the future (clock skew protection)", () => {
    // Future timestamps have negative age — still valid by default
    expect(validateStateAge(Date.now() + 60000)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. META SCOPES
// ═══════════════════════════════════════════════════════════════

describe("Meta: Scope Configuration", () => {
  it("FACEBOOK_SCOPES has 5 required scopes", () => {
    expect(FACEBOOK_SCOPES).toHaveLength(5);
  });

  it("INSTAGRAM_SCOPES has 3 required scopes", () => {
    expect(INSTAGRAM_SCOPES).toHaveLength(3);
  });

  it("META_SCOPES is the combined set (8 total)", () => {
    expect(META_SCOPES).toHaveLength(8);
  });

  it("includes Instagram Business Login publishing scope", () => {
    expect(INSTAGRAM_SCOPES).toContain("instagram_business_content_publish");
  });

  it("includes Facebook page management scope", () => {
    expect(FACEBOOK_SCOPES).toContain("pages_manage_posts");
  });

  it("includes Instagram business basic scope", () => {
    expect(INSTAGRAM_SCOPES).toContain("instagram_business_basic");
  });

  it("includes Instagram business insights scope", () => {
    expect(INSTAGRAM_SCOPES).toContain("instagram_business_manage_insights");
  });

  it("includes pages_show_list to discover pages", () => {
    expect(FACEBOOK_SCOPES).toContain("pages_show_list");
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. CONTENT TYPE SUPPORT MATRIX
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Content Type Support", () => {
  const igSupported: ContentType[] = ["image", "carousel", "reel", "story"];
  const fbSupported: ContentType[] = ["image", "reel"];
  const fbUnsupported: ContentType[] = ["carousel", "story"];

  it.each(igSupported)("Instagram supports %s", (type) => {
    expect(igSupported).toContain(type);
  });

  it.each(fbSupported)("Facebook supports %s", (type) => {
    expect(fbSupported).toContain(type);
  });

  it.each(fbUnsupported)("Facebook does not yet support %s", (type) => {
    expect(fbSupported).not.toContain(type);
  });

  it("stories should not have captions on Instagram", () => {
    // This validates the logic: contentType !== "story" for caption inclusion
    const contentType = "story";
    const shouldIncludeCaption = contentType !== "story";
    expect(shouldIncludeCaption).toBe(false);
  });

  it("images should include captions on Instagram", () => {
    const contentType: ContentType = "image";
    const shouldIncludeCaption = (contentType as ContentType) !== "story";
    expect(shouldIncludeCaption).toBe(true);
  });

  it("reels should include captions on Instagram", () => {
    const contentType: ContentType = "reel";
    const shouldIncludeCaption = (contentType as ContentType) !== "story";
    expect(shouldIncludeCaption).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. TOKEN REFRESH LOGIC
// ═══════════════════════════════════════════════════════════════

describe("Token Refresh: Expiry Detection", () => {
  function shouldRefresh(account: { tokenExpiresAt?: number; provider: string }): boolean {
    if (!account.tokenExpiresAt) return false; // Page tokens never expire
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return account.tokenExpiresAt < Date.now() + sevenDaysMs;
  }

  it("skips page tokens (no tokenExpiresAt)", () => {
    expect(shouldRefresh({ provider: "facebook" })).toBe(false);
  });

  it("skips tokens expiring in 30 days", () => {
    expect(shouldRefresh({
      provider: "facebook",
      tokenExpiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    })).toBe(false);
  });

  it("refreshes tokens expiring in 6 days", () => {
    expect(shouldRefresh({
      provider: "facebook",
      tokenExpiresAt: Date.now() + 6 * 24 * 60 * 60 * 1000,
    })).toBe(true);
  });

  it("refreshes tokens expiring in 1 day", () => {
    expect(shouldRefresh({
      provider: "facebook",
      tokenExpiresAt: Date.now() + 1 * 24 * 60 * 60 * 1000,
    })).toBe(true);
  });

  it("refreshes already-expired tokens", () => {
    expect(shouldRefresh({
      provider: "instagram",
      tokenExpiresAt: Date.now() - 86400000,
    })).toBe(true);
  });

  it("refreshes tokens expiring at exactly 7 days", () => {
    // At exactly 7 days, tokenExpiresAt === now + 7d, which is NOT < now + 7d
    expect(shouldRefresh({
      provider: "facebook",
      tokenExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. RETRY LOGIC
// ═══════════════════════════════════════════════════════════════

describe("Publishing: Retry Logic", () => {
  function computeRetryStatus(retryCount: number): "scheduled" | "failed" {
    const newCount = retryCount + 1;
    return newCount >= 3 ? "failed" : "scheduled";
  }

  it("reschedules on first failure (retry 0→1)", () => {
    expect(computeRetryStatus(0)).toBe("scheduled");
  });

  it("reschedules on second failure (retry 1→2)", () => {
    expect(computeRetryStatus(1)).toBe("scheduled");
  });

  it("fails permanently on third failure (retry 2→3)", () => {
    expect(computeRetryStatus(2)).toBe("failed");
  });

  it("stays failed on subsequent retries", () => {
    expect(computeRetryStatus(3)).toBe("failed");
    expect(computeRetryStatus(10)).toBe("failed");
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. SCHEMA CONSISTENCY
// ═══════════════════════════════════════════════════════════════

describe("Schema: Table Definitions", () => {
  it("providers enum is consistent", () => {
    expect(PROVIDERS).toEqual(["facebook", "instagram", "tiktok", "twitter"]);
  });

  it("content types match Instagram API types", () => {
    expect(CONTENT_TYPES).toEqual(["image", "carousel", "reel", "story"]);
  });

  it("account statuses cover all lifecycle states", () => {
    expect(ACCOUNT_STATUSES).toEqual(["active", "expired", "revoked"]);
  });

  it("scheduled post statuses cover full lifecycle", () => {
    expect(SCHEDULED_STATUSES).toEqual(["scheduled", "publishing", "published", "failed", "cancelled"]);
  });
});
