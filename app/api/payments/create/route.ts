import { NextRequest, NextResponse } from "next/server";

const UPAYMENTS_BASE_URL = process.env.UPAYMENTS_BASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

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

  try {
    const { plan, billingPeriod, orderId: clientOrderId, userId, userName, userEmail } = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const period = billingPeriod === "yearly" ? "yearly" : "monthly";
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    if (!clientOrderId || typeof clientOrderId !== "string") {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const planInfo = PLAN_PRICES[plan][period];
    const orderId = clientOrderId;

    const body = {
      products: [
        {
          name: planInfo.name,
          description: `Sylo ${planInfo.name}`,
          price: planInfo.amount,
          quantity: 1,
        },
      ],
      order: {
        id: orderId,
        reference: orderId,
        description: `Sylo ${planInfo.name} Subscription`,
        currency: "USD",
        amount: planInfo.amount,
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

    const response = await fetch(`${UPAYMENTS_BASE_URL}/charge`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UPAYMENTS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

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
