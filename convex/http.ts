import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handlePaymentWebhook } from "./webhooks";

const http = httpRouter();

auth.addHttpRoutes(http);

// UPayments webhook endpoint
http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: handlePaymentWebhook,
});

export default http;
