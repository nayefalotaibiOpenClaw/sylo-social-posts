import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Verify a payment with UPayments API using the track_id.
 * UPayments does not provide webhook HMAC signatures, so we verify
 * by calling their getpaymentstatus API independently.
 */
async function verifyWithUPayments(trackId: string) {
  const baseUrl = process.env.UPAYMENTS_BASE_URL;
  const apiKey = process.env.UPAYMENTS_API_KEY;
  if (!baseUrl || !apiKey) {
    console.error("Missing UPAYMENTS_BASE_URL or UPAYMENTS_API_KEY for verification");
    return null;
  }

  try {
    const res = await fetch(`${baseUrl}/get-payment-status/${trackId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    if (!res.ok || !data.status) return null;

    const txn = data?.data?.transaction;
    if (!txn) return null;

    return {
      result: txn.result as string,
      orderId: (txn.merchant_requested_order_id || txn.order_id) as string,
      paymentId: txn.payment_id?.toString() as string,
      amount: parseFloat(txn.total_price) || 0,
    };
  } catch (err) {
    console.error("UPayments verification error:", err);
    return null;
  }
}

/**
 * UPayments webhook — backup confirmation for payment results.
 * Primary activation happens via returnUrl + verify API.
 * This ensures we catch payments even if user closes browser.
 *
 * Security: Verifies payment status with UPayments API before activating,
 * since UPayments does not provide webhook HMAC signatures.
 */
export const handlePaymentWebhook = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    console.log(
      "UPayments webhook received:",
      body?.result ?? "unknown result",
      "order:",
      body?.requested_order_id ?? body?.order_id ?? "unknown"
    );

    const { result, track_id, payment_id, customer_extra_data } = body;

    if (!result || !payment_id) {
      console.error("Webhook missing required fields: result or payment_id");
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse our custom data embedded in the charge request
    let extraData: { userId?: string; plan?: string; orderId?: string } = {};
    try {
      extraData = customer_extra_data ? JSON.parse(customer_extra_data) : {};
    } catch {
      console.error("Failed to parse customer_extra_data");
    }

    const orderId =
      extraData.orderId || body.requested_order_id || body.order_id;
    if (!orderId) {
      console.error("No orderId found in webhook");
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (result === "CAPTURED") {
      // Verify with UPayments API before trusting webhook data
      if (!track_id) {
        console.error("Webhook missing track_id — cannot verify");
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const verified = await verifyWithUPayments(track_id.toString());
      if (!verified || verified.result !== "CAPTURED") {
        console.error("Payment verification failed for track_id:", track_id, "result:", verified?.result);
        if (verified && verified.result !== "CAPTURED") {
          await ctx.runMutation(internal.payments.markFailed, { orderId });
        }
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Verify amount matches our payment record
      const paymentRecord = await ctx.runQuery(internal.payments.getByOrderIdInternal, { orderId });
      if (paymentRecord && verified.amount > 0) {
        const diff = Math.abs(paymentRecord.amount - verified.amount);
        if (diff > 0.02) {
          console.error(`Amount mismatch: expected ${paymentRecord.amount}, got ${verified.amount} for ${orderId}`);
          return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // Payment verified — proceed with activation
      await ctx.runMutation(internal.payments.markPaid, {
        orderId,
        upaymentTransactionId: verified.paymentId || payment_id?.toString(),
        upaymentTrackId: track_id?.toString(),
      });

      try {
        await ctx.runMutation(internal.subscriptions.activateByOrderId, {
          orderId,
          paymentId: verified.paymentId || payment_id?.toString(),
        });
      } catch (activateError) {
        const msg = activateError instanceof Error ? activateError.message : String(activateError);
        if (!msg.includes("not found") && !msg.includes("already")) {
          console.error("Webhook activation error:", msg);
        }
      }
    } else {
      await ctx.runMutation(internal.payments.markFailed, { orderId });
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
