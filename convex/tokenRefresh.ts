import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

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
