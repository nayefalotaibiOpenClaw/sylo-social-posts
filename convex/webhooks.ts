import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * UPayments webhook — backup confirmation for payment results.
 * Primary activation happens via returnUrl + verify API.
 * This ensures we catch payments even if user closes browser.
 *
 * Webhook fields: payment_id, result, post_date, tran_id, ref,
 * track_id, auth, order_id, requested_order_id, refund_order_id,
 * payment_type, invoice_id, transaction_date, receipt_id, trn_udf,
 * customer_extra_data
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
      // Mark payment paid via internal mutation (no auth needed)
      await ctx.runMutation(internal.payments.markPaid, {
        orderId,
        upaymentTransactionId: payment_id?.toString(),
        upaymentTrackId: track_id?.toString(),
      });

      // Activate subscription using orderId (looks up user from payment)
      try {
        await ctx.runMutation(internal.subscriptions.activateByOrderId, {
          orderId,
          paymentId: payment_id?.toString(),
        });
      } catch (activateError) {
        const msg = activateError instanceof Error ? activateError.message : String(activateError);
        // Idempotency: activateByOrderId returns existing sub if already created
        // Only log unexpected errors
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
