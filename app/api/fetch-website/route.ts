import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractBodyText } from "@/lib/website/extract-text";
import { requireAuth } from "@/lib/auth/api-auth";
import { validateExternalUrl } from "@/lib/security/url-validation";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  try {
    const { url, screenshotBase64 } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    // ── SSRF protection: block private/internal IPs ──
    const urlCheck = await validateExternalUrl(parsedUrl.toString());
    if (!urlCheck.allowed) {
      return NextResponse.json({ error: urlCheck.reason }, { status: 403 });
    }

    // ── Step 1: Fetch HTML via plain HTTP and extract text ──
    let pageTitle = "";
    let renderedText = "";

    try {
      const res = await fetch(parsedUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch website: ${res.status}` }, { status: 502 });
      }

      const html = await res.text();
      pageTitle = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();

      // Extract OG metadata
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1] || "";
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] || "";

      renderedText = extractBodyText(html);

      // Prepend meta descriptions for richer context
      const metaInfo = [ogDesc, metaDesc].filter(Boolean).join("\n");
      if (metaInfo) {
        renderedText = `META DESCRIPTION: ${metaInfo}\n\n${renderedText}`;
      }
    } catch (fetchError) {
      const msg = fetchError instanceof Error ? fetchError.message : "Fetch failed";
      return NextResponse.json({ error: `Could not reach website: ${msg}` }, { status: 502 });
    }

    // Cap text to avoid token overflow
    if (renderedText.length > 6000) {
      renderedText = renderedText.slice(0, 6000);
    }

    // ── Step 2: Send text (+ optional screenshot) to Gemini for analysis ──
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        companyName: pageTitle,
        description: "",
        industry: "",
        features: [],
        rawContent: renderedText,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // Add user-uploaded screenshot if provided
    if (screenshotBase64 && typeof screenshotBase64 === "string") {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: screenshotBase64,
        },
      });
    }

    const hasScreenshot = !!screenshotBase64;

    parts.push({
      text: `Analyze this company's website. I'm providing ${hasScreenshot ? "a screenshot of the homepage and " : ""}the extracted text content from ${url}.

## Extracted text from website:
${renderedText}

## Your task:
Analyze everything — ${hasScreenshot ? "the visual design from the screenshot, " : ""}the text content, and any visible information — to produce a comprehensive company profile.

Return a JSON object with this exact structure:
{
  "companyName": "The company/brand name",
  "description": "2-3 sentence description of what the company does, their value proposition",
  "industry": "specific industry (e.g. 'E-commerce - Gifts & Occasions', 'SaaS - Restaurant Management', 'Healthcare - Telemedicine')",
  "features": ["feature 1", "feature 2", ...],
  "targetAudience": "Who their customers are",
  "tone": "Brand voice/tone (e.g. 'professional and modern', 'friendly and casual', 'luxurious and elegant')",
  "contact": {
    "phone": "phone number if found",
    "email": "email if found",
    "address": "physical address if found",
    "socialMedia": ["@instagram", "@twitter", ...]
  }
}

IMPORTANT:
- "features" should be REAL product/service features or key selling points, NOT page headings or navigation items
- Extract actual contact info visible on the page (phone, email, address, social media links)
- Be specific about the industry — don't just say "e-commerce", say what kind
- Detect the brand tone from the copy style${hasScreenshot ? " and visual design" : ""}
- If info is not found, use null for that field
- Return ONLY the JSON, no markdown fences`,
    });

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    const usageMetadata = result.response.usageMetadata;

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        companyName: pageTitle,
        description: "",
        industry: "",
        features: [],
        rawContent: renderedText,
        usage: {
          totalTokens: usageMetadata?.totalTokenCount ?? 0,
          promptTokens: usageMetadata?.promptTokenCount ?? 0,
          completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
          model: "gemini-3.1-flash-lite-preview",
        },
      });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      companyName: analysis.companyName || pageTitle || "",
      description: analysis.description || "",
      industry: analysis.industry || "",
      features: Array.isArray(analysis.features) ? analysis.features : [],
      targetAudience: analysis.targetAudience || null,
      tone: analysis.tone || null,
      contact: analysis.contact || null,
      ogImage: null,
      rawContent: renderedText.slice(0, 2000),
      usage: {
        totalTokens: usageMetadata?.totalTokenCount ?? 0,
        promptTokens: usageMetadata?.promptTokenCount ?? 0,
        completionTokens: usageMetadata?.candidatesTokenCount ?? 0,
        model: "gemini-3.1-flash-lite-preview",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    if (message.includes("timeout") || message.includes("abort")) {
      return NextResponse.json({ error: "Request timed out." }, { status: 504 });
    }
    console.error("fetch-website error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

