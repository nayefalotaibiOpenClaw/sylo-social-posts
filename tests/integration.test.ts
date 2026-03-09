/**
 * Integration / API Tests
 *
 * Tests the real API routes and Convex backend.
 * Requires:
 *   1. `npx convex dev` running
 *   2. `npm run dev` running (Next.js on localhost:3000)
 *
 * Run: npm test -- tests/integration.test.ts
 */
import { describe, it, expect, beforeAll } from "vitest";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// ─── Config ──────────────────────────────────────────────────
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://little-toad-958.convex.cloud";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const convex = new ConvexHttpClient(CONVEX_URL);

// ─── Helpers ─────────────────────────────────────────────────
function uniqueOrderId() {
  return `test_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${APP_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function apiGet(path: string) {
  const res = await fetch(`${APP_URL}${path}`);
  return { status: res.status, data: await res.json() };
}

// ═══════════════════════════════════════════════════════════════
// 1. API ROUTE TESTS — /api/payments/create
// ═══════════════════════════════════════════════════════════════
describe("API: /api/payments/create", () => {
  it("rejects missing plan", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      orderId: uniqueOrderId(),
      userId: "fake_user",
      billingPeriod: "monthly",
    });
    expect(status).toBe(400);
    expect(data.error).toBe("Invalid plan");
  });

  it("rejects invalid plan name", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "enterprise",
      orderId: uniqueOrderId(),
      userId: "fake_user",
      billingPeriod: "monthly",
    });
    expect(status).toBe(400);
    expect(data.error).toBe("Invalid plan");
  });

  it("rejects missing userId", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "starter",
      orderId: uniqueOrderId(),
      billingPeriod: "monthly",
    });
    expect(status).toBe(400);
    expect(data.error).toBe("User ID required");
  });

  it("rejects missing orderId", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "starter",
      userId: "fake_user",
      billingPeriod: "monthly",
    });
    expect(status).toBe(400);
    expect(data.error).toBe("Order ID required");
  });

  it("creates charge for valid starter monthly request", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "starter",
      billingPeriod: "monthly",
      orderId: uniqueOrderId(),
      userId: "test_user_123",
      userName: "Test User",
      userEmail: "test@example.com",
    });
    // Should succeed and return checkout URL from UPayments sandbox
    expect(status).toBe(200);
    expect(data.checkoutUrl).toBeDefined();
    expect(typeof data.checkoutUrl).toBe("string");
    expect(data.checkoutUrl).toContain("http");
    expect(data.orderId).toBeDefined();
  });

  it("creates charge for valid pro yearly request", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "pro",
      billingPeriod: "yearly",
      orderId: uniqueOrderId(),
      userId: "test_user_123",
      userName: "Test User",
      userEmail: "test@example.com",
    });
    expect(status).toBe(200);
    expect(data.checkoutUrl).toBeDefined();
    expect(data.orderId).toBeDefined();
  });

  it("defaults billingPeriod to monthly when not provided", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "starter",
      orderId: uniqueOrderId(),
      userId: "test_user_123",
      userName: "Test User",
      userEmail: "test@example.com",
    });
    // Should still work — defaults to monthly
    expect(status).toBe(200);
    expect(data.checkoutUrl).toBeDefined();
  });

  it("defaults billingPeriod to monthly for invalid value", async () => {
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "starter",
      billingPeriod: "biweekly", // invalid
      orderId: uniqueOrderId(),
      userId: "test_user_123",
      userName: "Test User",
      userEmail: "test@example.com",
    });
    // Should default to monthly, not crash
    expect(status).toBe(200);
    expect(data.checkoutUrl).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. API ROUTE TESTS — /api/payments/verify
// ═══════════════════════════════════════════════════════════════
describe("API: /api/payments/verify", () => {
  it("rejects missing track_id", async () => {
    const { status, data } = await apiGet("/api/payments/verify");
    expect(status).toBe(400);
    expect(data.error).toBe("track_id is required");
  });

  it("returns error for fake track_id", async () => {
    const { status, data } = await apiGet("/api/payments/verify?track_id=fake_track_999");
    // UPayments sandbox should return 400 or empty data
    expect([400, 404].includes(status) || data.error).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. CONVEX QUERY TESTS — Unauthenticated access
// ═══════════════════════════════════════════════════════════════
describe("Convex Queries: Unauthenticated", () => {
  it("getActive returns null for unauthenticated user", async () => {
    const result = await convex.query(api.subscriptions.getActive);
    expect(result).toBeNull();
  });

  it("getUsage returns null for unauthenticated user", async () => {
    const result = await convex.query(api.subscriptions.getUsage);
    expect(result).toBeNull();
  });

  it("canGenerate returns not-allowed for unauthenticated user", async () => {
    const result = await convex.query(api.subscriptions.canGenerate, { postsCount: 1 });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Not authenticated");
  });

  it("list returns empty for unauthenticated user", async () => {
    const result = await convex.query(api.subscriptions.list);
    expect(result).toEqual([]);
  });

  it("payments.listMine returns empty for unauthenticated user", async () => {
    const result = await convex.query(api.payments.listMine);
    expect(result).toEqual([]);
  });

  it("payments.getByOrderId returns null for unauthenticated user", async () => {
    const result = await convex.query(api.payments.getByOrderId, { orderId: "fake" });
    expect(result).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. CONVEX MUTATION TESTS — Auth guard enforcement
// ═══════════════════════════════════════════════════════════════
describe("Convex Mutations: Auth Guards", () => {
  it("startTrial rejects unauthenticated user", async () => {
    await expect(convex.mutation(api.subscriptions.startTrial, {}))
      .rejects.toThrow();
  });

  it("incrementUsage rejects unauthenticated user", async () => {
    await expect(
      convex.mutation(api.subscriptions.incrementUsage, {
        tokensUsed: 100,
        postsGenerated: 1,
      })
    ).rejects.toThrow();
  });

  it("activate rejects unauthenticated user", async () => {
    await expect(
      convex.mutation(api.subscriptions.activate, {
        plan: "starter",
        orderId: "fake_order",
        amountPaid: 40,
        currency: "USD",
      })
    ).rejects.toThrow();
  });

  it("payments.createPending rejects unauthenticated user", async () => {
    await expect(
      convex.mutation(api.payments.createPending, {
        plan: "starter",
        billingPeriod: "monthly",
        orderId: uniqueOrderId(),
        amount: 40,
        currency: "USD",
      })
    ).rejects.toThrow();
  });

  it("payments.markPaidByUser rejects unauthenticated user", async () => {
    await expect(
      convex.mutation(api.payments.markPaidByUser, {
        orderId: "fake_order",
      })
    ).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. UPAYMENTS SANDBOX CONNECTIVITY
// ═══════════════════════════════════════════════════════════════
describe("UPayments Sandbox Connectivity", () => {
  const UPAYMENTS_BASE_URL = "https://sandboxapi.upayments.com/api/v1";
  const UPAYMENTS_API_KEY = "jtest123";

  it("sandbox API is reachable", async () => {
    // Just check connectivity — even a 401 means the server responded
    const res = await fetch(`${UPAYMENTS_BASE_URL}/charge`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UPAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    // Should get a response (even if error) — not a network failure
    expect(res.status).toBeDefined();
    expect(typeof res.status).toBe("number");
  });

  it("sandbox accepts valid charge request structure", async () => {
    const orderId = uniqueOrderId();
    const res = await fetch(`${UPAYMENTS_BASE_URL}/charge`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UPAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [{ name: "Test Plan", description: "Test", price: 1, quantity: 1 }],
        order: { id: orderId, reference: orderId, description: "Test", currency: "USD", amount: 1 },
        language: "en",
        reference: { id: orderId },
        customer: { uniqueId: "test", name: "Test", email: "test@test.com", mobile: "" },
        returnUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        notificationUrl: "https://example.com/webhook",
      }),
    });
    const data = await res.json();
    // Sandbox returns 200 or 201 for created charge
    expect([200, 201].includes(res.status)).toBe(true);
    expect(data.status).toBe(true);
    expect(data.data?.link).toBeDefined();
  });

  it("sandbox rejects invalid API key", async () => {
    const res = await fetch(`${UPAYMENTS_BASE_URL}/charge`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer invalid_key_12345",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [{ name: "Test", description: "Test", price: 1, quantity: 1 }],
        order: { id: "test", reference: "test", description: "Test", currency: "USD", amount: 1 },
        language: "en",
        reference: { id: "test" },
        customer: { uniqueId: "test", name: "Test", email: "test@test.com", mobile: "" },
        returnUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        notificationUrl: "https://example.com/webhook",
      }),
    });
    // Should reject — 401, 403, or non-200 status, or data.status === false
    const data = await res.json().catch(() => ({ status: false }));
    const isRejected = res.status === 401 || res.status === 403 || res.status >= 400 || data.status === false;
    expect(isRejected).toBe(true);
  });

  it("verify endpoint rejects fake track_id", async () => {
    const res = await fetch(`${UPAYMENTS_BASE_URL}/get-payment-status/fake_track_000`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${UPAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    // Should return false status or empty data for non-existent track
    expect(data.status === false || !data.data?.transaction).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. PAYMENT FLOW — End-to-End (no actual payment)
// ═══════════════════════════════════════════════════════════════
describe("Payment Flow: Create Charge → Get Checkout URL", () => {
  it("starter monthly flow returns valid checkout URL", async () => {
    const orderId = uniqueOrderId();
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "starter",
      billingPeriod: "monthly",
      orderId,
      userId: "flow_test_user",
      userName: "Flow Test",
      userEmail: "flow@test.com",
    });

    expect(status).toBe(200);
    expect(data.checkoutUrl).toMatch(/^https?:\/\//);
    expect(data.orderId).toBe(orderId);
  });

  it("pro yearly flow returns valid checkout URL", async () => {
    const orderId = uniqueOrderId();
    const { status, data } = await apiPost("/api/payments/create", {
      plan: "pro",
      billingPeriod: "yearly",
      orderId,
      userId: "flow_test_user",
      userName: "Flow Test",
      userEmail: "flow@test.com",
    });

    expect(status).toBe(200);
    expect(data.checkoutUrl).toMatch(/^https?:\/\//);
    expect(data.orderId).toBe(orderId);
  });

  it("checkout URL contains UPayments sandbox domain", async () => {
    const { data } = await apiPost("/api/payments/create", {
      plan: "starter",
      billingPeriod: "monthly",
      orderId: uniqueOrderId(),
      userId: "flow_test_user",
      userName: "Test",
      userEmail: "test@test.com",
    });

    // Sandbox checkout URLs should be on UPayments domain
    expect(data.checkoutUrl).toContain("upayments");
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. CONVEX SCHEMA VALIDATION — Query shapes
// ═══════════════════════════════════════════════════════════════
describe("Convex: Response Shapes", () => {
  it("canGenerate returns correct shape", async () => {
    const result = await convex.query(api.subscriptions.canGenerate, { postsCount: 1 });
    expect(result).toHaveProperty("allowed");
    expect(result).toHaveProperty("reason");
    expect(typeof result.allowed).toBe("boolean");
  });

  it("getUsage returns null or correct shape for unauthenticated", async () => {
    const result = await convex.query(api.subscriptions.getUsage);
    // Unauthenticated → null
    expect(result).toBeNull();
  });

  it("getActive returns null for unauthenticated", async () => {
    const result = await convex.query(api.subscriptions.getActive);
    expect(result).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. PRICING PAGE ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════
describe("Page Accessibility", () => {
  it("pricing page returns 200", async () => {
    const res = await fetch(`${APP_URL}/pricing`);
    expect(res.status).toBe(200);
  });

  it("payment success page returns 200", async () => {
    const res = await fetch(`${APP_URL}/payment/success`);
    expect(res.status).toBe(200);
  });

  it("payment cancel page returns 200", async () => {
    const res = await fetch(`${APP_URL}/payment/cancel`);
    expect(res.status).toBe(200);
  });
});
