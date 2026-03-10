import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handlePaymentWebhook } from "./webhooks";
import { handleMetaCallback, handleDeauthorize, handleDataDeletion } from "./socialAuth";

const http = httpRouter();

auth.addHttpRoutes(http);

// UPayments webhook endpoint
http.route({
  path: "/payments/webhook",
  method: "POST",
  handler: handlePaymentWebhook,
});

// Meta OAuth callback (Facebook + Instagram Business Login)
http.route({
  path: "/social-auth/meta/callback",
  method: "GET",
  handler: handleMetaCallback,
});

// Meta deauthorize callback (called when user removes app)
http.route({
  path: "/social-auth/meta/deauthorize",
  method: "POST",
  handler: handleDeauthorize,
});

// Meta data deletion request callback (GDPR compliance)
http.route({
  path: "/social-auth/meta/data-deletion",
  method: "POST",
  handler: handleDataDeletion,
});

export default http;
