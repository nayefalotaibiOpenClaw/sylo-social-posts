// Temporary: Meta API permission test calls for App Review
// DELETE THIS FILE after App Review is approved

import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { decrypt } from "./lib/encryption";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";
const IG_GRAPH_URL = "https://graph.instagram.com/v21.0";

interface TestResult {
  permission: string;
  status: "success" | "error";
  data?: unknown;
  error?: string;
}

export const runAllTests = action({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args): Promise<TestResult[]> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workspace = await ctx.runQuery(internal.publishing.getWorkspace, { id: args.workspaceId });
    if (!workspace || workspace.userId !== userId) throw new Error("Workspace not found");

    // Get all connected accounts for this workspace
    const accounts = await ctx.runQuery(internal.metaApiTest.getAccountsWithTokens, {
      workspaceId: args.workspaceId,
    });

    const fbAccount = accounts.find((a) => a.provider === "facebook" && a.status === "active");
    const igAccount = accounts.find((a) => a.provider === "instagram" && a.status === "active");

    const results: TestResult[] = [];

    // ─── Facebook Tests ──────────────────────────────────────────────
    if (fbAccount) {
      const token = fbAccount.accessToken;

      // 1. public_profile — GET /me
      results.push(await testApi("public_profile", `${META_GRAPH_URL}/me?fields=id,name&access_token=${token}`));

      // 2. business_management — GET /{page-id}?fields=business
      if (fbAccount.providerPageId) {
        results.push(await testApi(
          "business_management",
          `${META_GRAPH_URL}/${fbAccount.providerPageId}?fields=id,name,business&access_token=${token}`
        ));
      }

      // 3. pages_show_list — GET /{page-id}?fields=id,name,category
      if (fbAccount.providerPageId) {
        results.push(await testApi(
          "pages_show_list",
          `${META_GRAPH_URL}/${fbAccount.providerPageId}?fields=id,name,category&access_token=${token}`
        ));
      }

      // 4. pages_read_engagement — GET /{page-id}?fields=engagement
      if (fbAccount.providerPageId) {
        results.push(await testApi(
          "pages_read_engagement",
          `${META_GRAPH_URL}/${fbAccount.providerPageId}?fields=id,name,fan_count,talking_about_count&access_token=${token}`
        ));
      }

      // 5. pages_manage_posts — GET /{page-id}/published_posts
      if (fbAccount.providerPageId) {
        results.push(await testApi(
          "pages_manage_posts",
          `${META_GRAPH_URL}/${fbAccount.providerPageId}/published_posts?limit=1&access_token=${token}`
        ));
      }

      // 6. instagram_manage_comments — GET /{page-id}/instagram_accounts
      if (fbAccount.providerPageId) {
        // Get IG account through page, then fetch recent media comments
        const igViaPage = await fetchJson(
          `${META_GRAPH_URL}/${fbAccount.providerPageId}?fields=instagram_business_account&access_token=${token}`
        );
        if (igViaPage?.instagram_business_account?.id) {
          const igId = igViaPage.instagram_business_account.id;
          // Get recent media to find a media ID for comments test
          const media = await fetchJson(
            `${META_GRAPH_URL}/${igId}/media?limit=1&access_token=${token}`
          );
          if (media?.data?.[0]?.id) {
            results.push(await testApi(
              "instagram_manage_comments",
              `${META_GRAPH_URL}/${media.data[0].id}/comments?access_token=${token}`
            ));
          } else {
            results.push({ permission: "instagram_manage_comments", status: "success", data: { note: "No media found, but IG account accessible", igId } });
          }
        }
      }
    } else {
      results.push({ permission: "facebook_account", status: "error", error: "No active Facebook account connected" });
    }

    // ─── Instagram Business Login Tests ──────────────────────────────
    if (igAccount) {
      const token = igAccount.accessToken;
      const igUserId = igAccount.providerAccountId;

      // 7. instagram_business_basic — GET /me
      results.push(await testApi(
        "instagram_business_basic",
        `${IG_GRAPH_URL}/me?fields=id,username,name,profile_picture_url&access_token=${token}`
      ));

      // 8. instagram_business_content_publish — GET /{ig-user}/content_publishing_limit
      if (igUserId) {
        results.push(await testApi(
          "instagram_business_content_publish",
          `${IG_GRAPH_URL}/${igUserId}/content_publishing_limit?fields=config,quota_usage&access_token=${token}`
        ));
      }

      // 9. instagram_business_manage_insights — GET /{ig-user}/insights
      if (igUserId) {
        results.push(await testApi(
          "instagram_business_manage_insights",
          `${IG_GRAPH_URL}/${igUserId}/insights?metric=reach&period=day&access_token=${token}`
        ));
      }

      // 10. instagram_business_manage_messages — GET /{ig-user}/conversations
      if (igUserId) {
        results.push(await testApi(
          "instagram_business_manage_messages",
          `${IG_GRAPH_URL}/${igUserId}/conversations?access_token=${token}`
        ));
      }
    } else {
      results.push({ permission: "instagram_account", status: "error", error: "No active Instagram account connected" });
    }

    // ─── Threads API Tests ────────────────────────────────────────────
    const THREADS_GRAPH_URL = "https://graph.threads.net/v1.0";
    const threadsAccount = accounts.find((a) => a.provider === "threads" && a.status === "active");
    if (threadsAccount) {
      const tToken = threadsAccount.accessToken;

      // 11. threads_basic — GET /me
      results.push(await testApi(
        "threads_basic",
        `${THREADS_GRAPH_URL}/me?fields=id,username,threads_profile_picture_url&access_token=${tToken}`
      ));

      // 12. threads_content_publish — GET /me/threads_publishing_limit
      results.push(await testApi(
        "threads_content_publish",
        `${THREADS_GRAPH_URL}/me/threads_publishing_limit?fields=config,quota_usage&access_token=${tToken}`
      ));

      // 13. threads_manage_insights — GET /me/threads
      results.push(await testApi(
        "threads_manage_insights",
        `${THREADS_GRAPH_URL}/me/threads?fields=id,text,timestamp&limit=1&access_token=${tToken}`
      ));
    } else {
      results.push({ permission: "threads_account", status: "error", error: "No active Threads account connected. Connect Threads first via Channels page." });
    }

    return results;
  },
});

// Internal query to get accounts with tokens
export const getAccountsWithTokens = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const accounts = await ctx.db
      .query("socialAccounts")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(50);

    return Promise.all(
      accounts.map(async (account) => ({
        ...account,
        accessToken: await decrypt(account.accessToken),
        refreshToken: account.refreshToken
          ? await decrypt(account.refreshToken)
          : account.refreshToken,
      }))
    );
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return null;
  }
}

async function testApi(permission: string, url: string): Promise<TestResult> {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      return { permission, status: "error", error: data.error.message };
    }
    return { permission, status: "success", data };
  } catch (e: unknown) {
    return { permission, status: "error", error: e instanceof Error ? e.message : String(e) };
  }
}
