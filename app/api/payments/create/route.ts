import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { requireAuth } from "@/lib/auth/api-auth";

const UPAYMENTS_BASE_URL = process.env.UPAYMENTS_BASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;

const PLAN_PRICES: Record<string, { monthly: { amount: number; name: string }; yearly: { amount: number; name: string } }> = {
  starter: {
    monthly: { amount: 40, name: "Starter Plan — 100 Ads/mo" },
    yearly: { amount: 384, name: "Starter Plan — 1,200 Ads/yr" },
  },
  pro: {
    monthly: { amount: 100, name: "Pro Plan — 250 Ads/mo" },
    yearly: { amount: 960, name: "Pro Plan — 3,000 Ads/yr" },
  },
};

export async function POST(req: NextRequest) {
  const UPAYMENTS_API_KEY = process.env.UPAYMENTS_API_KEY;
  if (!UPAYMENTS_API_KEY || !UPAYMENTS_BASE_URL || !APP_URL) {
    console.error("Missing env vars: UPAYMENTS_API_KEY, UPAYMENTS_BASE_URL, or NEXT_PUBLIC_APP_URL");
    return NextResponse.json(
      { error: "Payment system not configured" },
      { status: 500 }
    );
  }

  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { plan, billingPeriod, orderId: clientOrderId, userId, userName, userEmail } = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const period = billingPeriod === "yearly" ? "yearly" : "monthly";

    // Verify the userId matches the authenticated user
    if (userId && userId !== authResult.user._id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!clientOrderId || typeof clientOrderId !== "string") {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Look up the pending payment from Convex to get the server-computed amount
    // This prevents clients from manipulating the charge amount
    const convex = new ConvexHttpClient(CONVEX_URL);
    const payment = await convex.query(api.payments.getPendingAmount, { orderId: clientOrderId });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found. Create a pending payment first." }, { status: 400 });
    }
    if (payment.status !== "pending") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 });
    }

    // Use the server-computed amount from the payment record
    const chargeAmount = payment.amount;
    const planInfo = PLAN_PRICES[plan][period];
    const orderId = clientOrderId;

    const body = {
      products: [
        {
          name: planInfo.name,
          description: `oDesigns ${planInfo.name}`,
          price: chargeAmount,
          quantity: 1,
        },
      ],
      order: {
        id: orderId,
        reference: orderId,
        description: `oDesigns${planInfo.name} Subscription`,
        currency: "USD",
        amount: chargeAmount,
      },
      language: "en",
      reference: {
        id: orderId,
      },
      customer: {
        uniqueId: userId,
        name: userName || "Customer",
        email: userEmail || "",
        mobile: "",
      },
      returnUrl: `${APP_URL}/payment/success?orderId=${orderId}&plan=${plan}&billingPeriod=${period}`,
      cancelUrl: `${APP_URL}/payment/cancel?orderId=${orderId}`,
      notificationUrl: CONVEX_SITE_URL
        ? `${CONVEX_SITE_URL}/payments/webhook`
        : `${APP_URL}/api/payments/webhook`,
      customerExtraData: JSON.stringify({ userId, plan, orderId, billingPeriod: period }),
    };

    const chargeUrl = `${UPAYMENTS_BASE_URL}/charge`;

    const response = await fetch(chargeUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UPAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("UPayments returned non-JSON:", responseText.slice(0, 500));
      return NextResponse.json(
        { error: "Payment gateway returned invalid response" },
        { status: 502 }
      );
    }

    if (!response.ok || !data.status) {
      console.error("UPayments error:", data);
      return NextResponse.json(
        { error: "Payment creation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: data.data.link,
      orderId,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
