import { NextRequest, NextResponse } from "next/server";
import { revokeToken } from "@/lib/social-providers/meta";
import { requireAuth } from "@/lib/auth/api-auth";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { accessToken } = await request.json();

    if (accessToken) {
      // Best-effort revoke on Meta's side
      try {
        await revokeToken(accessToken);
      } catch {
        // Token may already be invalid, continue anyway
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Meta disconnect error:", err);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}
