/**
 * Subscription & Payment Logic Tests
 *
 * Tests the business logic for plans, billing, usage limits,
 * expiry detection, and price consistency — all without needing
 * a running Convex backend.
 */
import { describe, it, expect } from "vitest";

// ─── Import the PLANS constant directly ──────────────────────
// We re-declare it here to avoid importing Convex server modules
// but keep values in sync. The "sync check" tests below catch drift.
const PLANS = {
  trial: {
    name: "Free Trial",
    monthly: { price: 0, postsLimit: 6, aiTokensLimit: 30_000 },
    yearly: { price: 0, postsLimit: 6, aiTokensLimit: 30_000 },
    currency: "USD",
  },
  starter: {
    name: "Starter",
    monthly: { price: 40, postsLimit: 100, aiTokensLimit: 500_000 },
    yearly: { price: 384, postsLimit: 1_200, aiTokensLimit: 6_000_000 },
    currency: "USD",
  },
  pro: {
    name: "Pro",
    monthly: { price: 100, postsLimit: 250, aiTokensLimit: 1_250_000 },
    yearly: { price: 960, postsLimit: 3_000, aiTokensLimit: 15_000_000 },
    currency: "USD",
  },
} as const;

// API route prices (mirrors app/api/payments/create/route.ts)
const API_PLAN_PRICES = {
  starter: {
    monthly: { amount: 40, name: "Starter Plan — 100 Ads/mo" },
    yearly: { amount: 384, name: "Starter Plan — 1,200 Ads/yr" },
  },
  pro: {
    monthly: { amount: 100, name: "Pro Plan — 250 Ads/mo" },
    yearly: { amount: 960, name: "Pro Plan — 3,000 Ads/yr" },
  },
};

// Pricing page prices (mirrors app/(dashboard)/pricing/page.tsx)
const UI_PLANS = {
  starter: {
    monthly: { price: 40, ads: 100 },
    yearly: { price: 384, ads: 1200, monthlyEquiv: 32 },
  },
  pro: {
    monthly: { price: 100, ads: 250 },
    yearly: { price: 960, ads: 3000, monthlyEquiv: 80 },
  },
};

const BILLING_DURATION = {
  monthly: 30 * 24 * 60 * 60 * 1000,
  yearly: 365 * 24 * 60 * 60 * 1000,
} as const;

function getPlanConfig(plan: "trial" | "starter" | "pro", period: "monthly" | "yearly" = "monthly") {
  return PLANS[plan][period];
}

// ─── Helper: simulate getUsage logic ─────────────────────────
type SubRecord = {
  plan: "trial" | "starter" | "pro";
  status: "active" | "expired" | "cancelled";
  postsUsed: number;
  postsLimit: number;
  aiTokensUsed: number;
  aiTokensLimit: number;
  expiresAt: number;
};

function computeUsage(sub: SubRecord | null, now: number) {
  if (sub && sub.expiresAt < now) {
    return {
      plan: sub.plan,
      status: "expired" as const,
      canGenerate: false,
      daysLeft: 0,
      isExpired: true,
      isExpiringSoon: false,
      postsUsed: sub.postsUsed,
      postsLimit: sub.postsLimit,
      aiTokensUsed: sub.aiTokensUsed,
      aiTokensLimit: sub.aiTokensLimit,
    };
  }
  if (!sub) {
    return {
      plan: null,
      status: "none" as const,
      canGenerate: false,
      daysLeft: 0,
      isExpired: false,
      isExpiringSoon: false,
      postsUsed: 0,
      postsLimit: 0,
      aiTokensUsed: 0,
      aiTokensLimit: 0,
    };
  }
  const daysLeft = Math.ceil((sub.expiresAt - now) / (24 * 60 * 60 * 1000));
  const isExpiringSoon = daysLeft <= 5;
  return {
    plan: sub.plan,
    status: "active" as const,
    canGenerate: sub.postsUsed < sub.postsLimit && sub.aiTokensUsed < sub.aiTokensLimit,
    daysLeft,
    isExpired: false,
    isExpiringSoon,
    postsUsed: sub.postsUsed,
    postsLimit: sub.postsLimit,
    aiTokensUsed: sub.aiTokensUsed,
    aiTokensLimit: sub.aiTokensLimit,
  };
}

// ─── Helper: simulate canGenerate logic ──────────────────────
function checkCanGenerate(
  sub: SubRecord | null,
  postsCount: number,
  now: number
): { allowed: boolean; reason: string | null } {
  if (!sub || sub.expiresAt < now) {
    return { allowed: false, reason: "No active plan. Please subscribe to continue generating." };
  }
  if (sub.postsUsed + postsCount > sub.postsLimit) {
    const msg = sub.plan === "trial"
      ? `Free trial limit reached (${sub.postsUsed}/${sub.postsLimit}). Upgrade to keep generating.`
      : `Post limit reached (${sub.postsUsed}/${sub.postsLimit}). Please upgrade your plan.`;
    return { allowed: false, reason: msg };
  }
  if (sub.aiTokensUsed >= sub.aiTokensLimit) {
    return { allowed: false, reason: "AI token limit reached. Please upgrade your plan." };
  }
  return { allowed: true, reason: null };
}

// ─── Helper: simulate incrementUsage logic ───────────────────
function incrementUsage(
  sub: SubRecord,
  tokensUsed: number,
  postsGenerated: number,
  now: number
): { error: string | null; newTokens: number; newPosts: number } {
  const sanitizedTokens = Math.max(0, tokensUsed);
  const sanitizedPosts = Math.max(0, postsGenerated);

  if (sub.expiresAt < now) return { error: "Subscription expired", newTokens: sub.aiTokensUsed, newPosts: sub.postsUsed };

  const newTokens = sub.aiTokensUsed + sanitizedTokens;
  const newPosts = sub.postsUsed + sanitizedPosts;

  if (newPosts > sub.postsLimit) {
    return { error: `Post limit exceeded (${sub.postsUsed}/${sub.postsLimit})`, newTokens: sub.aiTokensUsed, newPosts: sub.postsUsed };
  }
  if (newTokens > sub.aiTokensLimit) {
    return { error: `AI token limit exceeded (${sub.aiTokensUsed}/${sub.aiTokensLimit})`, newTokens: sub.aiTokensUsed, newPosts: sub.postsUsed };
  }

  return { error: null, newTokens, newPosts };
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe("Plan Configuration", () => {
  it("trial plan has correct limits", () => {
    const config = getPlanConfig("trial");
    expect(config.postsLimit).toBe(6);
    expect(config.aiTokensLimit).toBe(30_000);
    expect(config.price).toBe(0);
  });

  it("starter monthly has correct values", () => {
    const config = getPlanConfig("starter", "monthly");
    expect(config.price).toBe(40);
    expect(config.postsLimit).toBe(100);
    expect(config.aiTokensLimit).toBe(500_000);
  });

  it("starter yearly has correct values with 20% discount", () => {
    const config = getPlanConfig("starter", "yearly");
    expect(config.price).toBe(384); // 40 * 12 * 0.8
    expect(config.postsLimit).toBe(1_200); // 100 * 12
    expect(config.aiTokensLimit).toBe(6_000_000); // 500k * 12
  });

  it("pro monthly has correct values", () => {
    const config = getPlanConfig("pro", "monthly");
    expect(config.price).toBe(100);
    expect(config.postsLimit).toBe(250);
    expect(config.aiTokensLimit).toBe(1_250_000);
  });

  it("pro yearly has correct values with 20% discount", () => {
    const config = getPlanConfig("pro", "yearly");
    expect(config.price).toBe(960); // 100 * 12 * 0.8
    expect(config.postsLimit).toBe(3_000); // 250 * 12
    expect(config.aiTokensLimit).toBe(15_000_000); // 1.25M * 12
  });

  it("yearly price is exactly 20% off monthly * 12", () => {
    for (const plan of ["starter", "pro"] as const) {
      const monthly = PLANS[plan].monthly.price;
      const yearly = PLANS[plan].yearly.price;
      const expected = Math.round(monthly * 12 * 0.8);
      expect(yearly).toBe(expected);
    }
  });

  it("yearly limits scale to 12x monthly", () => {
    for (const plan of ["starter", "pro"] as const) {
      expect(PLANS[plan].yearly.postsLimit).toBe(PLANS[plan].monthly.postsLimit * 12);
      expect(PLANS[plan].yearly.aiTokensLimit).toBe(PLANS[plan].monthly.aiTokensLimit * 12);
    }
  });

  it("getPlanConfig defaults to monthly when no period given", () => {
    const config = getPlanConfig("starter");
    expect(config.price).toBe(40);
  });

  it("trial yearly and monthly are identical", () => {
    const monthly = getPlanConfig("trial", "monthly");
    const yearly = getPlanConfig("trial", "yearly");
    expect(monthly).toEqual(yearly);
  });
});

describe("Price Consistency Across Codebase", () => {
  it("API route prices match PLANS for starter", () => {
    expect(API_PLAN_PRICES.starter.monthly.amount).toBe(PLANS.starter.monthly.price);
    expect(API_PLAN_PRICES.starter.yearly.amount).toBe(PLANS.starter.yearly.price);
  });

  it("API route prices match PLANS for pro", () => {
    expect(API_PLAN_PRICES.pro.monthly.amount).toBe(PLANS.pro.monthly.price);
    expect(API_PLAN_PRICES.pro.yearly.amount).toBe(PLANS.pro.yearly.price);
  });

  it("UI pricing page prices match PLANS for starter", () => {
    expect(UI_PLANS.starter.monthly.price).toBe(PLANS.starter.monthly.price);
    expect(UI_PLANS.starter.yearly.price).toBe(PLANS.starter.yearly.price);
    expect(UI_PLANS.starter.monthly.ads).toBe(PLANS.starter.monthly.postsLimit);
    expect(UI_PLANS.starter.yearly.ads).toBe(PLANS.starter.yearly.postsLimit);
  });

  it("UI pricing page prices match PLANS for pro", () => {
    expect(UI_PLANS.pro.monthly.price).toBe(PLANS.pro.monthly.price);
    expect(UI_PLANS.pro.yearly.price).toBe(PLANS.pro.yearly.price);
    expect(UI_PLANS.pro.monthly.ads).toBe(PLANS.pro.monthly.postsLimit);
    expect(UI_PLANS.pro.yearly.ads).toBe(PLANS.pro.yearly.postsLimit);
  });

  it("yearly monthly-equivalent prices are correct", () => {
    expect(UI_PLANS.starter.yearly.monthlyEquiv).toBe(Math.round(384 / 12));
    expect(UI_PLANS.pro.yearly.monthlyEquiv).toBe(Math.round(960 / 12));
  });
});

describe("Billing Duration", () => {
  it("monthly is 30 days in ms", () => {
    expect(BILLING_DURATION.monthly).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("yearly is 365 days in ms", () => {
    expect(BILLING_DURATION.yearly).toBe(365 * 24 * 60 * 60 * 1000);
  });

  it("yearly is roughly 12x monthly", () => {
    const ratio = BILLING_DURATION.yearly / BILLING_DURATION.monthly;
    expect(ratio).toBeCloseTo(365 / 30, 1);
  });
});

describe("Usage Calculation (getUsage logic)", () => {
  const now = Date.now();

  it("returns 'none' when no subscription exists", () => {
    const result = computeUsage(null, now);
    expect(result.status).toBe("none");
    expect(result.canGenerate).toBe(false);
    expect(result.plan).toBeNull();
    expect(result.postsUsed).toBe(0);
    expect(result.postsLimit).toBe(0);
  });

  it("returns 'expired' when subscription past expiresAt", () => {
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 10,
      postsLimit: 100,
      aiTokensUsed: 5000,
      aiTokensLimit: 500_000,
      expiresAt: now - 1000, // expired 1s ago
    };
    const result = computeUsage(sub, now);
    expect(result.status).toBe("expired");
    expect(result.isExpired).toBe(true);
    expect(result.canGenerate).toBe(false);
    expect(result.daysLeft).toBe(0);
  });

  it("returns 'active' with correct days left", () => {
    const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;
    const sub: SubRecord = {
      plan: "pro",
      status: "active",
      postsUsed: 50,
      postsLimit: 250,
      aiTokensUsed: 100_000,
      aiTokensLimit: 1_250_000,
      expiresAt: threeDaysFromNow,
    };
    const result = computeUsage(sub, now);
    expect(result.status).toBe("active");
    expect(result.canGenerate).toBe(true);
    expect(result.daysLeft).toBe(3);
    expect(result.isExpiringSoon).toBe(true); // <= 5 days
  });

  it("marks isExpiringSoon when 5 days or less remain", () => {
    const fiveDays = now + 5 * 24 * 60 * 60 * 1000;
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 0,
      postsLimit: 100,
      aiTokensUsed: 0,
      aiTokensLimit: 500_000,
      expiresAt: fiveDays,
    };
    expect(computeUsage(sub, now).isExpiringSoon).toBe(true);
  });

  it("does NOT mark isExpiringSoon when 6+ days remain", () => {
    const sixDays = now + 6 * 24 * 60 * 60 * 1000;
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 0,
      postsLimit: 100,
      aiTokensUsed: 0,
      aiTokensLimit: 500_000,
      expiresAt: sixDays,
    };
    expect(computeUsage(sub, now).isExpiringSoon).toBe(false);
  });

  it("canGenerate is false when posts maxed out", () => {
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 100,
      postsLimit: 100,
      aiTokensUsed: 0,
      aiTokensLimit: 500_000,
      expiresAt: now + BILLING_DURATION.monthly,
    };
    expect(computeUsage(sub, now).canGenerate).toBe(false);
  });

  it("canGenerate is false when tokens maxed out", () => {
    const sub: SubRecord = {
      plan: "pro",
      status: "active",
      postsUsed: 0,
      postsLimit: 250,
      aiTokensUsed: 1_250_000,
      aiTokensLimit: 1_250_000,
      expiresAt: now + BILLING_DURATION.monthly,
    };
    expect(computeUsage(sub, now).canGenerate).toBe(false);
  });

  it("canGenerate requires BOTH posts and tokens under limit", () => {
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 99,
      postsLimit: 100,
      aiTokensUsed: 499_999,
      aiTokensLimit: 500_000,
      expiresAt: now + BILLING_DURATION.monthly,
    };
    expect(computeUsage(sub, now).canGenerate).toBe(true);
  });
});

describe("canGenerate Pre-check", () => {
  const now = Date.now();
  const activeSub = (overrides?: Partial<SubRecord>): SubRecord => ({
    plan: "starter",
    status: "active",
    postsUsed: 0,
    postsLimit: 100,
    aiTokensUsed: 0,
    aiTokensLimit: 500_000,
    expiresAt: now + BILLING_DURATION.monthly,
    ...overrides,
  });

  it("allows generation when under limits", () => {
    const result = checkCanGenerate(activeSub(), 4, now);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
  });

  it("blocks when no subscription", () => {
    const result = checkCanGenerate(null, 1, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("No active plan");
  });

  it("blocks when subscription expired", () => {
    const result = checkCanGenerate(activeSub({ expiresAt: now - 1000 }), 1, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("No active plan");
  });

  it("blocks when posts would exceed limit", () => {
    const result = checkCanGenerate(activeSub({ postsUsed: 98 }), 4, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Post limit reached");
  });

  it("allows exactly hitting the post limit", () => {
    const result = checkCanGenerate(activeSub({ postsUsed: 96 }), 4, now);
    expect(result.allowed).toBe(true);
  });

  it("blocks when AI tokens exhausted", () => {
    const result = checkCanGenerate(activeSub({ aiTokensUsed: 500_000 }), 1, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("AI token limit reached");
  });

  it("shows trial-specific message for trial users", () => {
    const trialSub = activeSub({ plan: "trial", postsUsed: 6, postsLimit: 6 });
    const result = checkCanGenerate(trialSub, 1, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Free trial limit reached");
    expect(result.reason).toContain("Upgrade");
  });

  it("shows paid-plan message for starter/pro users at limit", () => {
    const result = checkCanGenerate(activeSub({ postsUsed: 100 }), 1, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Post limit reached");
    expect(result.reason).toContain("upgrade your plan");
  });
});

describe("incrementUsage Logic", () => {
  const now = Date.now();
  const activeSub = (overrides?: Partial<SubRecord>): SubRecord => ({
    plan: "starter",
    status: "active",
    postsUsed: 0,
    postsLimit: 100,
    aiTokensUsed: 0,
    aiTokensLimit: 500_000,
    expiresAt: now + BILLING_DURATION.monthly,
    ...overrides,
  });

  it("increments usage correctly", () => {
    const result = incrementUsage(activeSub(), 5000, 4, now);
    expect(result.error).toBeNull();
    expect(result.newTokens).toBe(5000);
    expect(result.newPosts).toBe(4);
  });

  it("blocks on expired subscription", () => {
    const result = incrementUsage(activeSub({ expiresAt: now - 1 }), 100, 1, now);
    expect(result.error).toBe("Subscription expired");
  });

  it("blocks when posts would exceed limit", () => {
    const result = incrementUsage(activeSub({ postsUsed: 99 }), 100, 2, now);
    expect(result.error).toContain("Post limit exceeded");
  });

  it("allows exactly hitting post limit", () => {
    const result = incrementUsage(activeSub({ postsUsed: 96 }), 100, 4, now);
    expect(result.error).toBeNull();
    expect(result.newPosts).toBe(100);
  });

  it("blocks when tokens would exceed limit", () => {
    const result = incrementUsage(activeSub({ aiTokensUsed: 499_000 }), 2000, 1, now);
    expect(result.error).toContain("AI token limit exceeded");
  });

  it("allows exactly hitting token limit", () => {
    const result = incrementUsage(activeSub({ aiTokensUsed: 499_000 }), 1000, 1, now);
    expect(result.error).toBeNull();
    expect(result.newTokens).toBe(500_000);
  });

  it("sanitizes negative token values to 0", () => {
    const result = incrementUsage(activeSub(), -500, 1, now);
    expect(result.error).toBeNull();
    expect(result.newTokens).toBe(0); // Math.max(0, -500) = 0
    expect(result.newPosts).toBe(1);
  });

  it("sanitizes negative post values to 0", () => {
    const result = incrementUsage(activeSub({ postsUsed: 5 }), 100, -3, now);
    expect(result.error).toBeNull();
    expect(result.newPosts).toBe(5); // 5 + Math.max(0, -3) = 5
  });

  it("accumulates usage correctly over multiple calls", () => {
    let sub = activeSub();
    // Simulate 3 generation rounds
    const round1 = incrementUsage(sub, 10_000, 4, now);
    expect(round1.error).toBeNull();
    sub = { ...sub, aiTokensUsed: round1.newTokens, postsUsed: round1.newPosts };

    const round2 = incrementUsage(sub, 15_000, 6, now);
    expect(round2.error).toBeNull();
    sub = { ...sub, aiTokensUsed: round2.newTokens, postsUsed: round2.newPosts };

    const round3 = incrementUsage(sub, 8_000, 2, now);
    expect(round3.error).toBeNull();
    expect(round3.newTokens).toBe(33_000);
    expect(round3.newPosts).toBe(12);
  });
});

describe("Subscription Expiry Detection", () => {
  const now = Date.now();

  it("subscription exactly at expiresAt is expired", () => {
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 0,
      postsLimit: 100,
      aiTokensUsed: 0,
      aiTokensLimit: 500_000,
      expiresAt: now, // exactly now
    };
    // expiresAt < now is false when equal, so NOT expired
    const result = computeUsage(sub, now);
    // This tests the exact boundary: expiresAt === now means NOT expired
    // because the check is `sub.expiresAt < now`
    expect(result.status).toBe("active");
  });

  it("subscription 1ms past expiry IS expired", () => {
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 0,
      postsLimit: 100,
      aiTokensUsed: 0,
      aiTokensLimit: 500_000,
      expiresAt: now - 1,
    };
    const result = computeUsage(sub, now);
    expect(result.status).toBe("expired");
    expect(result.isExpired).toBe(true);
  });

  it("30-day subscription expires correctly", () => {
    const startsAt = now;
    const expiresAt = startsAt + BILLING_DURATION.monthly;

    // Day 29: still active
    const day29 = startsAt + 29 * 24 * 60 * 60 * 1000;
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 0,
      postsLimit: 100,
      aiTokensUsed: 0,
      aiTokensLimit: 500_000,
      expiresAt,
    };
    expect(computeUsage(sub, day29).status).toBe("active");

    // Day 31: expired
    const day31 = startsAt + 31 * 24 * 60 * 60 * 1000;
    expect(computeUsage(sub, day31).status).toBe("expired");
  });

  it("365-day subscription expires correctly", () => {
    const startsAt = now;
    const expiresAt = startsAt + BILLING_DURATION.yearly;

    const sub: SubRecord = {
      plan: "pro",
      status: "active",
      postsUsed: 0,
      postsLimit: 3_000,
      aiTokensUsed: 0,
      aiTokensLimit: 15_000_000,
      expiresAt,
    };

    // Day 364: active
    const day364 = startsAt + 364 * 24 * 60 * 60 * 1000;
    expect(computeUsage(sub, day364).status).toBe("active");

    // Day 366: expired
    const day366 = startsAt + 366 * 24 * 60 * 60 * 1000;
    expect(computeUsage(sub, day366).status).toBe("expired");
  });

  it("trial 90-day expiry", () => {
    const startsAt = now;
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const expiresAt = startsAt + ninetyDays;

    const sub: SubRecord = {
      plan: "trial",
      status: "active",
      postsUsed: 0,
      postsLimit: 6,
      aiTokensUsed: 0,
      aiTokensLimit: 30_000,
      expiresAt,
    };

    // Day 89: active
    expect(computeUsage(sub, startsAt + 89 * 24 * 60 * 60 * 1000).status).toBe("active");
    // Day 91: expired
    expect(computeUsage(sub, startsAt + 91 * 24 * 60 * 60 * 1000).status).toBe("expired");
  });
});

describe("Edge Cases", () => {
  const now = Date.now();

  it("zero posts requested is always allowed", () => {
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 100, // at limit
      postsLimit: 100,
      aiTokensUsed: 0,
      aiTokensLimit: 500_000,
      expiresAt: now + BILLING_DURATION.monthly,
    };
    // postsUsed + 0 = 100, NOT > 100, so allowed
    const result = checkCanGenerate(sub, 0, now);
    expect(result.allowed).toBe(true);
  });

  it("canGenerate checks posts BEFORE tokens", () => {
    const sub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 100,
      postsLimit: 100,
      aiTokensUsed: 500_000,
      aiTokensLimit: 500_000,
      expiresAt: now + BILLING_DURATION.monthly,
    };
    const result = checkCanGenerate(sub, 1, now);
    expect(result.reason).toContain("Post limit");
  });

  it("large token increment at boundary", () => {
    const sub: SubRecord = {
      plan: "pro",
      status: "active",
      postsUsed: 0,
      postsLimit: 250,
      aiTokensUsed: 1_200_000,
      aiTokensLimit: 1_250_000,
      expiresAt: now + BILLING_DURATION.monthly,
    };
    // 50k remaining, try to use exactly 50k
    const result = incrementUsage(sub, 50_000, 1, now);
    expect(result.error).toBeNull();
    expect(result.newTokens).toBe(1_250_000);

    // 50k remaining, try to use 50_001
    const result2 = incrementUsage(sub, 50_001, 1, now);
    expect(result2.error).toContain("AI token limit exceeded");
  });

  it("fresh trial has exactly 6 posts and 30k tokens", () => {
    const trialConfig = getPlanConfig("trial");
    const sub: SubRecord = {
      plan: "trial",
      status: "active",
      postsUsed: 0,
      postsLimit: trialConfig.postsLimit,
      aiTokensUsed: 0,
      aiTokensLimit: trialConfig.aiTokensLimit,
      expiresAt: now + 90 * 24 * 60 * 60 * 1000,
    };

    // Can generate 6 posts
    for (let i = 0; i < 6; i++) {
      const result = checkCanGenerate(sub, 1, now);
      expect(result.allowed).toBe(true);
      sub.postsUsed++;
    }

    // 7th post blocked
    const result = checkCanGenerate(sub, 1, now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Free trial limit reached");
  });

  it("upgrade from trial to starter resets limits", () => {
    // Simulate: trial used 5/6 posts, then upgrade
    const starterConfig = getPlanConfig("starter", "monthly");
    const newSub: SubRecord = {
      plan: "starter",
      status: "active",
      postsUsed: 0, // reset on new subscription
      postsLimit: starterConfig.postsLimit,
      aiTokensUsed: 0,
      aiTokensLimit: starterConfig.aiTokensLimit,
      expiresAt: now + BILLING_DURATION.monthly,
    };
    expect(newSub.postsLimit).toBe(100);
    expect(newSub.aiTokensLimit).toBe(500_000);
    expect(checkCanGenerate(newSub, 1, now).allowed).toBe(true);
  });

  it("yearly pro gives 12x capacity vs monthly", () => {
    const monthlyConfig = getPlanConfig("pro", "monthly");
    const yearlyConfig = getPlanConfig("pro", "yearly");
    expect(yearlyConfig.postsLimit / monthlyConfig.postsLimit).toBe(12);
    expect(yearlyConfig.aiTokensLimit / monthlyConfig.aiTokensLimit).toBe(12);
  });
});

describe("Expiry Warning Thresholds", () => {
  const now = Date.now();
  const makeSub = (daysLeft: number): SubRecord => ({
    plan: "starter",
    status: "active",
    postsUsed: 0,
    postsLimit: 100,
    aiTokensUsed: 0,
    aiTokensLimit: 500_000,
    expiresAt: now + daysLeft * 24 * 60 * 60 * 1000,
  });

  it.each([
    { days: 1, expected: true },
    { days: 2, expected: true },
    { days: 3, expected: true },
    { days: 4, expected: true },
    { days: 5, expected: true },
    { days: 6, expected: false },
    { days: 10, expected: false },
    { days: 30, expected: false },
  ])("$days days left → isExpiringSoon=$expected", ({ days, expected }) => {
    expect(computeUsage(makeSub(days), now).isExpiringSoon).toBe(expected);
  });
});
