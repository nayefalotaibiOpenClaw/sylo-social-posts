import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Refresh a single account's token (used for pre-publish refresh)
export const refreshSingle = internalAction({
  args: { accountId: v.id("socialAccounts") },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.socialAccounts.getWithTokens, { id: args.accountId });
    if (!account || !account.tokenExpiresAt) return;

    if (account.provider === "instagram") {
      const res = await fetch(
        `https://graph.instagram.com/v21.0/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.accessToken}`
      );
      if (!res.ok) throw new Error(`Instagram token refresh failed: HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      await ctx.runMutation(internal.socialAccounts.updateToken, {
        id: args.accountId,
        accessToken: data.access_token,
        tokenExpiresAt: Date.now() + (data.expires_in || 5184000) * 1000,
      });
    } else if (account.provider === "facebook") {
      const clientId = process.env.META_APP_ID;
      const clientSecret = process.env.META_APP_SECRET;
      if (!clientId || !clientSecret) throw new Error("Meta credentials not configured");

      const url = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
      url.searchParams.set("grant_type", "fb_exchange_token");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("client_secret", clientSecret);
      url.searchParams.set("fb_exchange_token", account.accessToken);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Facebook token refresh failed: HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      await ctx.runMutation(internal.socialAccounts.updateToken, {
        id: args.accountId,
        accessToken: data.access_token,
        tokenExpiresAt: Date.now() + (data.expires_in || 5184000) * 1000,
      });
    } else if (account.provider === "twitter") {
      const clientId = process.env.TWITTER_CLIENT_ID;
      const clientSecret = process.env.TWITTER_CLIENT_SECRET;
      if (!clientId || !clientSecret) throw new Error("Twitter credentials not configured");
      if (!account.refreshToken) throw new Error("No refresh token for Twitter account");

      const basicAuth = btoa(`${clientId}:${clientSecret}`);
      const res = await fetch("https://api.x.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: account.refreshToken,
        }),
      });
      if (!res.ok) throw new Error(`Twitter token refresh failed: HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error_description || data.error);

      // X rotates refresh tokens — must store both new tokens
      if (!data.refresh_token) {
        throw new Error("Twitter refresh response missing new refresh_token");
      }
      await ctx.runMutation(internal.socialAccounts.updateTokenWithRefresh, {
        id: args.accountId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: Date.now() + (data.expires_in || 7200) * 1000,
      });
    }
  },
});

// Refresh tokens expiring within 7 days
export const refreshExpiring = internalAction({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.runQuery(internal.socialAccounts.findExpiringSoon, {});

    for (const account of accounts) {
      // Skip accounts without tokenExpiresAt — page tokens never expire
      if (!account.tokenExpiresAt) continue;

      try {
        if (account.provider === "instagram") {
          // Instagram Business Login tokens use ig_refresh_token
          const res = await fetch(
            `https://graph.instagram.com/v21.0/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.accessToken}`
          );
          const data = await res.json();

          if (data.error) {
            console.error(`Instagram token refresh failed for ${account._id}:`, data.error.message);
            await ctx.runMutation(internal.socialAccounts.markExpired, {
              id: account._id,
            });
            continue;
          }

          const expiresIn = data.expires_in || 5184000;
          await ctx.runMutation(internal.socialAccounts.updateToken, {
            id: account._id,
            accessToken: data.access_token,
            tokenExpiresAt: Date.now() + expiresIn * 1000,
          });

          console.log(`Refreshed Instagram token for account ${account._id}`);
        } else if (account.provider === "facebook") {
          // Facebook user-level long-lived tokens use fb_exchange_token
          const clientId = process.env.META_APP_ID;
          const clientSecret = process.env.META_APP_SECRET;

          if (!clientId || !clientSecret) {
            console.error("Meta credentials not configured for token refresh");
            continue;
          }

          const url = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
          url.searchParams.set("grant_type", "fb_exchange_token");
          url.searchParams.set("client_id", clientId);
          url.searchParams.set("client_secret", clientSecret);
          url.searchParams.set("fb_exchange_token", account.accessToken);

          const res = await fetch(url.toString());
          const data = await res.json();

          if (data.error) {
            console.error(`Facebook token refresh failed for ${account._id}:`, data.error.message);
            await ctx.runMutation(internal.socialAccounts.markExpired, {
              id: account._id,
            });
            continue;
          }

          const expiresIn = data.expires_in || 5184000;
          await ctx.runMutation(internal.socialAccounts.updateToken, {
            id: account._id,
            accessToken: data.access_token,
            tokenExpiresAt: Date.now() + expiresIn * 1000,
          });

          console.log(`Refreshed Facebook token for account ${account._id}`);
        } else if (account.provider === "twitter") {
          const clientId = process.env.TWITTER_CLIENT_ID;
          const clientSecret = process.env.TWITTER_CLIENT_SECRET;

          if (!clientId || !clientSecret) {
            console.error("Twitter credentials not configured for token refresh");
            continue;
          }

          if (!account.refreshToken) {
            console.error(`No refresh token for Twitter account ${account._id}`);
            await ctx.runMutation(internal.socialAccounts.markExpired, {
              id: account._id,
            });
            continue;
          }

          const basicAuth = btoa(`${clientId}:${clientSecret}`);
          const res = await fetch("https://api.x.com/2/oauth2/token", {
            method: "POST",
            headers: {
              "Authorization": `Basic ${basicAuth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: account.refreshToken,
            }),
          });
          const data = await res.json();

          if (data.error) {
            console.error(`Twitter token refresh failed for ${account._id}:`, data.error_description || data.error);
            await ctx.runMutation(internal.socialAccounts.markExpired, {
              id: account._id,
            });
            continue;
          }

          // X rotates refresh tokens — must store both new tokens
          if (!data.refresh_token) {
            console.error(`Twitter refresh response missing new refresh_token for ${account._id}`);
            await ctx.runMutation(internal.socialAccounts.markExpired, {
              id: account._id,
            });
            continue;
          }
          await ctx.runMutation(internal.socialAccounts.updateTokenWithRefresh, {
            id: account._id,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            tokenExpiresAt: Date.now() + (data.expires_in || 7200) * 1000,
          });

          console.log(`Refreshed Twitter token for account ${account._id}`);
        }
      } catch (error) {
        console.error(`Token refresh error for ${account._id}:`, error);
        await ctx.runMutation(internal.socialAccounts.markExpired, {
          id: account._id,
        });
      }
    }
  },
});
