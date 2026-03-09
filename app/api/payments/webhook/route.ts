import { NextRequest, NextResponse } from "next/server";

/**
 * UPayments webhook proxy — forwards to Convex HTTP action
 * which uses internal mutations (not client-callable).
 *
 * The Convex HTTP action endpoint is:
 *   {CONVEX_SITE_URL}/payments/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Forward the webhook payload to the Convex HTTP action
    const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    if (!siteUrl) {
      console.error("NEXT_PUBLIC_CONVEX_SITE_URL not configured");
      return NextResponse.json({ status: "ok" });
    }

    const response = await fetch(`${siteUrl}/payments/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Webhook proxy error:", error);
    return NextResponse.json({ status: "ok" }); // Always 200 for UPayments
  }
}
