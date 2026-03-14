import "server-only";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

/**
 * Get the authenticated user from the Convex session in API routes.
 * Returns the user document or null if not authenticated.
 */
export async function getAuthenticatedUser() {
  const token = await convexAuthNextjsToken();
  if (!token) return null;

  const client = new ConvexHttpClient(convexUrl);
  client.setAuth(token);

  try {
    const user = await client.query(api.users.currentUser);
    return user;
  } catch {
    return null;
  }
}

/**
 * Require authentication in an API route.
 * Returns a 401 Response if not authenticated, or the user document if authenticated.
 */
export async function requireAuth(): Promise<
  | { user: NonNullable<Awaited<ReturnType<typeof getAuthenticatedUser>>>; error?: never }
  | { user?: never; error: Response }
> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user };
}
