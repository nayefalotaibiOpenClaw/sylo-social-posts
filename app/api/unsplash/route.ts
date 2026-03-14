import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";

const UNSPLASH_API = "https://api.unsplash.com";

function getAccessKey() {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error("UNSPLASH_ACCESS_KEY not set");
  return key;
}

/** GET /api/unsplash?query=restaurant&per_page=9 */
export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const query = req.nextUrl.searchParams.get("query");
  const perPage = req.nextUrl.searchParams.get("per_page") || "12";

  if (!query) {
    return NextResponse.json({ error: "query param required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${getAccessKey()}` } }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json();

    // Return only what we need (minimal payload)
    const photos = data.results.map((p: {
      id: string;
      urls: { small: string; regular: string; raw: string };
      user: { name: string; username: string; links: { html: string } };
      links: { download_location: string };
      alt_description: string | null;
    }) => ({
      id: p.id,
      thumb: p.urls.small,
      regular: p.urls.regular,
      // Use raw + params for best quality in posts
      url: `${p.urls.raw}&w=1200&q=80&auto=format&fit=crop`,
      photographer: p.user.name,
      photographerUrl: `${p.user.links.html}?utm_source=sylo&utm_medium=referral`,
      downloadLocation: p.links.download_location,
      alt: p.alt_description || "",
    }));

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("Unsplash search failed:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

/** POST /api/unsplash — trigger download event (required by Unsplash API Terms Section 6) */
export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { downloadLocation } = await req.json();
  if (!downloadLocation) {
    return NextResponse.json({ error: "downloadLocation required" }, { status: 400 });
  }

  // Issue 5: Validate downloadLocation to prevent SSRF / API key leakage
  if (!downloadLocation.startsWith("https://api.unsplash.com/")) {
    return NextResponse.json({ error: "Invalid download location" }, { status: 400 });
  }

  try {
    await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${getAccessKey()}` },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Download tracking failed" }, { status: 500 });
  }
}
