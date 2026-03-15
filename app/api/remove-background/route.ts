import "server-only";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/api-auth";
import { aiRateLimiter } from "@/lib/security/rate-limit";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const GEMINI_MODEL = "gemini-3.1-flash-image-preview";
const ALLOWED_INPUT_MIMES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_OUTPUT_MIMES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(req: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const rateLimited = aiRateLimiter.check(req, user._id);
  if (rateLimited) return rateLimited;

  // Verify active subscription + token limits
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const subscription = await fetchQuery(api.subscriptions.getActive, {}, { token });
  if (!subscription) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
  }
  if (subscription.aiTokensUsed >= subscription.aiTokensLimit) {
    return NextResponse.json({ error: "AI token limit reached for current billing period" }, { status: 403 });
  }

  // Parse body inside try/catch
  let imageBase64: string;
  let mimeType: string;
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!imageBase64 || typeof imageBase64 !== "string" || !mimeType) {
    return NextResponse.json({ error: "Missing image data" }, { status: 400 });
  }

  if (!ALLOWED_INPUT_MIMES.includes(mimeType)) {
    return NextResponse.json(
      { error: "Unsupported image format. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  // Validate base64 size (max ~10MB raw = ~14MB base64)
  if (imageBase64.length > 14_000_000) {
    return NextResponse.json({ error: "Image too large. Max 10MB." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
                {
                  text: "Remove the background from this image. Keep ONLY the main subject/product. The background MUST be completely transparent using the PNG alpha channel. IMPORTANT: Do NOT draw a checkerboard pattern, do NOT draw gray and white squares, do NOT draw any visual representation of transparency. The removed areas must have zero opacity (fully transparent alpha). Output as a PNG with a real alpha channel.",
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Gemini image API error:", response.status, errBody);
      return NextResponse.json(
        { error: "Background removal failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Extract image from response parts
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
      return NextResponse.json({ error: "No result from AI model" }, { status: 502 });
    }

    // Find the image part
    const imagePart = parts.find(
      (p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: "AI did not return an image. Please try again." },
        { status: 502 }
      );
    }

    // Validate output MIME type
    const outputMime = imagePart.inlineData.mimeType || "image/png";
    if (!ALLOWED_OUTPUT_MIMES.includes(outputMime)) {
      return NextResponse.json(
        { error: "Unexpected output format from AI model." },
        { status: 502 }
      );
    }

    // Extract token usage
    const usageMetadata = data?.usageMetadata;
    const promptTokens = usageMetadata?.promptTokenCount || 0;
    const completionTokens = usageMetadata?.candidatesTokenCount || 0;
    const totalTokens = usageMetadata?.totalTokenCount || (promptTokens + completionTokens);

    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: outputMime,
      usage: {
        model: GEMINI_MODEL,
        promptTokens,
        completionTokens,
        totalTokens,
      },
    });
  } catch (err) {
    console.error("Remove background error:", err);
    return NextResponse.json(
      { error: "Background removal failed. Please try again." },
      { status: 500 }
    );
  }
}
