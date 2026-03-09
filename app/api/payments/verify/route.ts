import { NextRequest, NextResponse } from "next/server";

const UPAYMENTS_BASE_URL = process.env.UPAYMENTS_BASE_URL;

/**
 * Verify payment status using track_id from the returnUrl/cancelUrl.
 * Called client-side after redirect back from UPayments.
 */
export async function GET(req: NextRequest) {
  const UPAYMENTS_API_KEY = process.env.UPAYMENTS_API_KEY;
  if (!UPAYMENTS_API_KEY || !UPAYMENTS_BASE_URL) {
    return NextResponse.json(
      { error: "Payment system not configured" },
      { status: 500 }
    );
  }

  const trackId = req.nextUrl.searchParams.get("track_id");

  if (!trackId) {
    return NextResponse.json({ error: "track_id is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${UPAYMENTS_BASE_URL}/get-payment-status/${trackId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${UPAYMENTS_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        { error: "Could not verify payment" },
        { status: 400 }
      );
    }

    const txn = data?.data?.transaction;
    if (!txn) {
      return NextResponse.json(
        { error: "Transaction data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      result: txn.result,                           // "CAPTURED" = success
      orderId: txn.merchant_requested_order_id || txn.order_id,
      paymentId: txn.payment_id,
      trackId: txn.track_id,
      paymentType: txn.payment_type,
      amount: txn.total_price,
      currency: txn.currency_type,
      customerExtraData: txn.customer_extra_data,
      transactionDate: txn.transaction_date,
    });
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
