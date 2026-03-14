import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { handlePaymentWebhook } from "./webhooks";
import { handleMetaCallback, handleDeauthorize, handleDataDeletion } from "./socialAuth";
import { handleTwitterCallback } from "./twitterAuth";
import { handleThreadsCallback } from "./threadsAuth";

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

// Twitter/X OAuth callback
http.route({
  path: "/social-auth/twitter/callback",
  method: "GET",
  handler: handleTwitterCallback,
});

// Threads OAuth callback
http.route({
  path: "/social-auth/threads/callback",
  method: "GET",
  handler: handleThreadsCallback,
});

export default http;
