# Security Audit Report

**Date:** 2026-03-14
**Status:** Pending fixes

---

## CRITICAL (11 issues) — Must fix before production

### 1. No Authentication on Convex Mutations/Queries
- **Files:** `convex/workspaces.ts`, `convex/posts.ts`, `convex/collections.ts`, `convex/branding.ts`, `convex/assets.ts`, `convex/generations.ts`, `convex/websiteCrawls.ts`
- **Issue:** Nearly ALL Convex functions have zero auth checks. They accept `userId` from the client and trust it blindly. Any caller can read, modify, or delete ANY user's data.
- **Fix:** Every mutation/query must call `auth.getUserId(ctx)`, verify the user is authenticated, and verify ownership of the resource being accessed.
- [ ] Fixed

### 2. Client-Supplied `userId` Enables Impersonation
- **Files:** `convex/workspaces.ts`, `convex/posts.ts`, `convex/assets.ts`, `convex/collections.ts`, `convex/generations.ts`, `convex/websiteCrawls.ts`
- **Issue:** Mutations like `workspaces.create`, `posts.create`, `assets.create`, `collections.create` accept `userId` as a client argument instead of deriving it from the authenticated session.
- **Fix:** Remove `userId` from args. Derive it from `await auth.getUserId(ctx)` inside the handler.
- [ ] Fixed

### 3. No Authentication on API Routes
- **Files:** All files under `app/api/` — `generate/`, `fetch-website/`, `crawl-website/`, `proxy-image/`, `unsplash/`, `payments/*`, `adapt-ratio/`
- **Issue:** Every API route has zero authentication. Anyone on the internet can call them.
- **Fix:** Add authentication checks (verify Convex auth session token) at the top of every API route handler.
- [ ] Fixed

### 4. Open SSRF Proxy (`/api/proxy-image`)
- **File:** `app/api/proxy-image/route.ts`
- **Issue:** Accepts any URL, fetches it server-side, returns the body. No URL validation, no IP blocklist, no auth. Can scan internal networks, access cloud metadata (`169.254.169.254`), exfiltrate internal data.
- **Fix:** (a) Require authentication. (b) Validate URL against an allowlist of permitted domains. (c) Resolve hostname and reject private/internal IP ranges. (d) Verify Content-Type is `image/*`.
- [ ] Fixed

### 5. SSRF via Unsplash Download Tracking
- **File:** `app/api/unsplash/route.ts` (lines 60-73)
- **Issue:** POST handler fetches a user-supplied `downloadLocation` URL with the Unsplash API key in the `Authorization` header — leaks the API key to any attacker-controlled URL.
- **Fix:** Validate that `downloadLocation` starts with `https://api.unsplash.com/` before fetching.
- [ ] Fixed

### 6. Payment Webhook Has No Signature Verification
- **Files:** `convex/webhooks.ts` (lines 14-89), `app/api/payments/webhook/route.ts`
- **Issue:** Accepts ANY POST request as a valid payment notification. No HMAC signature verification, no IP allowlist, no shared secret. An attacker can forge webhooks to activate subscriptions without paying.
- **Fix:** Implement UPayments webhook signature verification using a shared secret. At minimum, call UPayments' payment status API to independently verify before activating.
- [ ] Fixed

### 7. `markPaidByUser` Lets Users Self-Confirm Payments
- **File:** `convex/payments.ts` (lines 113-141)
- **Issue:** Any authenticated user can mark their own pending payment as "paid" without the payment gateway confirming it. Creates a path to free subscriptions.
- **Fix:** Remove `markPaidByUser` entirely. Payment status should only be updated through the webhook or through server-side verification that confirms payment status with UPayments.
- [ ] Fixed

### 8. `subscriptions.activate` Trusts Client `amountPaid`
- **File:** `convex/subscriptions.ts` (lines 265-336)
- **Issue:** Client can pass any `amountPaid` value, inflating proration credits for future plan changes.
- **Fix:** Read `amountPaid` from `payment.amount` (the server-computed value) instead of accepting it as a client argument.
- [ ] Fixed

### 9. OAuth Authorize Endpoints Accept Arbitrary `userId`
- **Files:** `app/api/social-auth/meta/authorize/route.ts`, `facebook/authorize/route.ts`, `instagram/authorize/route.ts`, `twitter/authorize/route.ts`, `threads/authorize/route.ts`
- **Issue:** All social auth routes take `userId` and `workspaceId` from query params with no auth check. Attacker can link social accounts to any user's workspace.
- **Fix:** Extract `userId` from the authenticated session instead of trusting query parameters.
- [ ] Fixed

### 10. Arbitrary Code Execution via Dynamic Evaluation
- **Files:** `features/posts/editor/DynamicPost.tsx`, `features/design-editor/components/PostGrid.tsx`
- **Issue:** `DynamicPost` dynamically evaluates TSX code at runtime. PostGrid has a textarea letting users edit raw code. Any authenticated user can execute arbitrary JavaScript. In shared workspaces, this is stored XSS.
- **Fix:** (a) Sandbox code execution using an `<iframe>` with `sandbox` attribute. (b) Restrict evaluation scope to prevent access to `window`, `document`, `fetch`, `localStorage`. (c) Add server-side validation of `componentCode` — reject dangerous patterns.
- [x] Fixed

### 11. Unauthenticated File Upload
- **File:** `convex/assets.ts` (lines 19-21)
- **Issue:** `generateUploadUrl` has zero auth. Anyone with the Convex deployment URL can generate upload URLs and upload arbitrary files.
- **Fix:** Add `const userId = await auth.getUserId(ctx); if (!userId) throw new Error("Not authenticated");`
- [ ] Fixed

---

## HIGH (15 issues) — Fix before launch

### 12. SSRF via `fetch-website` and `crawl-website`
- **Files:** `app/api/fetch-website/route.ts`, `app/api/crawl-website/route.ts`
- **Issue:** Accept user-supplied URLs. Validate protocol is `http:`/`https:` but do not block private/internal IP ranges. Can reach cloud metadata, localhost, internal network.
- **Fix:** Resolve hostname to IP and reject private/reserved ranges before fetching.
- [ ] Fixed

### 13. No Security Headers
- **File:** `next.config.ts` (empty config)
- **Issue:** No CSP, X-Frame-Options, HSTS, X-Content-Type-Options, or Referrer-Policy configured anywhere.
- **Fix:** Add `headers()` function in `next.config.ts` with all standard security headers.
- [x] Fixed

### 14. Subscription Enforcement is Client-Side Only
- **Files:** `app/api/generate/route.ts`, `convex/subscriptions.ts`
- **Issue:** API routes don't check subscription status before calling Gemini. Users can bypass subscription checks by calling the API directly.
- **Fix:** Verify subscription status server-side in the API route before making AI calls.
- [x] Fixed

### 15. `branding.updateField` Accepts Arbitrary Field Names
- **File:** `convex/branding.ts` (lines 62-85)
- **Issue:** Accepts `field: v.string()` and `value: v.any()`, allowing overwriting ANY field on the branding document. Bypasses schema validation.
- **Fix:** Replace with explicit mutation args for each allowed field, or validate `field` against an allowlist.
- [ ] Fixed

### 16. No File Type/Size Validation on Uploads
- **File:** `convex/assets.ts`
- **Issue:** `generateUploadUrl` creates upload URLs with no restrictions. Client-side `accept="image/*"` is trivially bypassed.
- **Fix:** Validate file MIME type and size server-side after upload. Verify file header/magic bytes match expected image types.
- [x] Fixed

### 17. Workspace Deletion Doesn't Cascade
- **File:** `convex/workspaces.ts` (lines 58-63)
- **Issue:** `workspaces.remove` only deletes the workspace document. Does NOT cascade delete collections, posts, branding, assets, social accounts, generations, etc. Orphaned OAuth tokens remain.
- **Fix:** Implement cascading deletion that removes all dependent records.
- [x] Fixed

### 18. Blog `seed` Mutation is Public and Destructive
- **File:** `convex/blogs.ts` (lines 38-171)
- **Issue:** Public mutation with no auth. Any client can delete all blog posts and replace them with seed data.
- **Fix:** Convert to `internalMutation`.
- [x] Fixed

### 19. `seedAll.run` is Unauthenticated
- **File:** `convex/seedAll.ts` (lines 6-129)
- **Issue:** Public mutation that accepts any `userId` and creates workspaces/data for that user with no auth.
- **Fix:** Convert to `internalMutation`.
- [x] Fixed

### 20. Payment Creation API Trusts Client-Supplied `userId`
- **File:** `app/api/payments/create/route.ts`
- **Issue:** `userId`, `userName`, and `userEmail` are accepted from the request body with no session verification.
- **Fix:** Validate the caller's session and ensure `userId` matches the authenticated user.
- [ ] Fixed

### 21. Payment Verify Endpoint Has No Auth
- **File:** `app/api/payments/verify/route.ts`
- **Issue:** Anyone with a `track_id` can query full transaction details (amount, payment type, customer data).
- **Fix:** Require authentication and verify the requesting user owns the transaction.
- [ ] Fixed

### 22. OAuth HMAC Comparison is Not Constant-Time
- **File:** `convex/socialAuth.ts` (line 84)
- **Issue:** Uses `!==` for HMAC comparison, vulnerable to timing attacks. The `verifySignedRequest` function correctly uses constant-time comparison, but callback handlers don't.
- **Fix:** Use `crypto.timingSafeEqual` for all HMAC verifications.
- [x] Fixed

### 23. PKCE `codeVerifier` Embedded in URL State (Twitter)
- **File:** `app/api/social-auth/twitter/authorize/route.ts` (lines 36-44)
- **Issue:** PKCE `codeVerifier` is visible in the URL (base64 in state). Can be captured from browser history, referrer headers, or logs.
- **Fix:** Store `codeVerifier` server-side in a short-lived database record or encrypted cookie.
- [ ] Fixed

### 24. `localhost` Fallback in OAuth Callbacks
- **Files:** `convex/socialAuth.ts`, `convex/threadsAuth.ts`, `convex/twitterAuth.ts`
- **Issue:** Fall back to `http://localhost:3000` if `APP_URL` env var is not set. Could cause token leakage in production.
- **Fix:** Throw an error if `APP_URL` is not configured.
- [x] Fixed

### 25. Unvalidated Redirect via `checkoutUrl`
- **File:** `app/(dashboard)/pricing/page.tsx` (line 189)
- **Issue:** `window.location.href = data.checkoutUrl` redirects to a URL returned from the server API without validation.
- **Fix:** Validate that `checkoutUrl` matches expected payment provider domain before redirecting.
- [ ] Fixed

### 26. Hardcoded Production Convex URL in Tests
- **File:** `tests/integration.test.ts` (line 16)
- **Issue:** Production URL `https://little-toad-958.convex.cloud` is hardcoded as fallback. Tests could accidentally hit production.
- **Fix:** Remove hardcoded fallback, fail explicitly if env var not set.
- [ ] Fixed

---

## MEDIUM (15 issues)

### 27. No Rate Limiting on Expensive Endpoints
- **Files:** `app/api/generate/`, `app/api/adapt-ratio/`, `app/api/crawl-website/`, `app/api/fetch-website/`
- **Issue:** No rate limiting. Combined with no auth, attackers can exhaust Gemini API quota rapidly.
- **Fix:** Add rate limiting per-user or per-IP using middleware or `@upstash/ratelimit`.
- [ ] Fixed

### 28. No Input Size Validation on AI Prompts
- **File:** `app/api/generate/route.ts`
- **Issue:** `prompt` field has no size limit. Large payloads cause high token consumption.
- **Fix:** Add max length validation for `prompt` (e.g., 5000 chars).
- [ ] Fixed

### 29. Admin Email Hardcoded in Source
- **File:** `convex/admin.ts` (line 5)
- **Issue:** `ADMIN_EMAILS` array visible in source code.
- **Fix:** Move admin emails to an environment variable.
- [ ] Fixed

### 30. Admin Layout Protection is Client-Side Only
- **File:** `app/(admin)/layout.tsx`
- **Issue:** Redirects non-admins via `useEffect`. Admin page JS bundle is still delivered to any authenticated user.
- **Fix:** Add server-side middleware to block `/admin` routes, or use server components with server-side auth.
- [ ] Fixed

### 31. Dashboard Layout Has No Auth Guard
- **File:** `app/(dashboard)/layout.tsx`
- **Issue:** Pass-through layout with no auth check. Individual pages have inconsistent client-side checks that skip redirect in dev mode.
- **Fix:** Add server-side auth middleware for all dashboard routes.
- [ ] Fixed

### 32. Access Tokens Stored as Plaintext in DB
- **File:** `convex/schema.ts` (line 309)
- **Issue:** Social media access/refresh tokens stored as plaintext strings.
- **Fix:** Encrypt tokens at rest using a server-side encryption key.
- [ ] Fixed

### 33. Access Tokens Passed in URL Query Params (Meta API)
- **File:** `lib/social-providers/meta.ts`
- **Issue:** Tokens passed in URL query strings — logged in server/proxy logs and browser history.
- **Fix:** Use `Authorization: Bearer` header where the API supports it.
- [ ] Fixed

### 34. `scheduleBulk` Doesn't Validate Social Account Ownership
- **File:** `convex/publishing.ts` (lines 504-548)
- **Issue:** Validates workspace ownership but not that each `socialAccountId` belongs to the same workspace.
- **Fix:** Verify each `socialAccountId` belongs to the target workspace.
- [ ] Fixed

### 35. No Pagination on Several Queries
- **Files:** `convex/posts.ts`, `convex/collections.ts`, `convex/assets.ts`, `convex/publishing.ts`
- **Issue:** Multiple queries use `.collect()` without limits — unbounded results.
- **Fix:** Add `.take(N)` limits or implement pagination.
- [ ] Fixed

### 36. URL Params Rendered as Toast Messages
- **Files:** `features/design-editor/components/PublishChannelsPage.tsx`, `app/(dashboard)/channels/page.tsx`
- **Issue:** `social_success` and `social_error` URL params displayed directly in toasts. Social engineering risk.
- **Fix:** Use fixed message codes mapped to predefined strings instead of displaying arbitrary URL content.
- [ ] Fixed

### 37. OAuth State Has No Replay Protection
- **Files:** Multiple callback handlers
- **Issue:** State tokens are valid for 15 minutes with no nonce/replay tracking.
- **Fix:** Add a nonce to state and track used nonces to prevent replay.
- [ ] Fixed

### 38. Convex IDs Cast from URL Params Without Validation
- **File:** `app/(dashboard)/design/page.tsx` (lines 29-30)
- **Issue:** `workspaceId` and `collectionIdParam` read from URL and cast directly to `Id<>` types.
- **Fix:** Validate parameter format before use. Ensure backend has proper auth checks.
- [ ] Fixed

### 39. `localStorage` Theme Data Merged Without Schema Validation
- **File:** `contexts/ThemeContext.tsx` (lines 31-39)
- **Issue:** `JSON.parse(stored)` merged into theme without validation. Could allow property pollution.
- **Fix:** Validate parsed data against a schema before merging.
- [ ] Fixed

### 40. Console Logging of Payment Data (PII)
- **File:** `app/api/payments/create/route.ts` (lines 97, 110)
- **Issue:** Full payment request body and response logged via `console.log` including customer data.
- **Fix:** Remove or reduce logging. Log only non-sensitive identifiers.
- [ ] Fixed

### 41. Error Messages Leak Internal Details
- **Files:** `app/api/generate/_shared.ts`, `app/api/crawl-website/route.ts`, `app/api/fetch-website/route.ts`
- **Issue:** Internal error messages passed to client. Could expose paths, library versions, infrastructure details.
- **Fix:** Return generic error messages to clients. Log detailed errors server-side only.
- [ ] Fixed

---

## Priority Action Plan

### Phase 1 — Blocking (do immediately)
1. Add `auth.getUserId(ctx)` + ownership checks to ALL Convex mutations/queries (issues 1, 2)
2. Add auth checks to all API routes (issue 3)
3. Add payment webhook signature verification (issue 6)
4. Remove `markPaidByUser` mutation entirely (issue 7)
5. Fix SSRF: add IP blocklist to proxy-image, fetch-website, crawl-website (issues 4, 12)
6. Validate `downloadLocation` starts with `https://api.unsplash.com/` (issue 5)
7. Fix `subscriptions.activate` to use `payment.amount` (issue 8)
8. Fix OAuth: derive userId from session, not query params (issue 9)
9. Add auth to `generateUploadUrl` (issue 11)

### Phase 2 — Before launch
10. Add security headers in `next.config.ts` (issue 13)
11. Server-side subscription enforcement in API routes (issue 14)
12. Sandbox DynamicPost code execution (issue 10)
13. Add file type/size validation on uploads (issue 16)
14. Convert `seed`/`seedAll` to `internalMutation` (issues 18, 19)
15. Implement cascading workspace deletion (issue 17)
16. Use constant-time comparison for all HMAC checks (issue 22)
17. Remove localhost fallbacks (issue 24)

### Phase 3 — Hardening
18. Add rate limiting on expensive endpoints (issue 27)
19. Encrypt social tokens at rest (issue 32)
20. Add pagination to unbounded queries (issue 35)
21. Sanitize error messages returned to clients (issue 41)
22. Remove PII from console logs (issue 40)
23. Add input size validation (issue 28)
