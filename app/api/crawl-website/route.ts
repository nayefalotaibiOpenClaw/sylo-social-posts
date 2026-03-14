import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  fetchSitemap,
  fetchPageViaJina,
  extractLinks,
  extractProductsFromMarkdown,
} from "@/lib/website/crawl";
import {
  classifySections,
  extractProductDetails,
  extractProductsFromPage,
} from "@/lib/website/classify";
import { requireAuth } from "@/lib/auth/api-auth";
import { validateExternalUrl } from "@/lib/security/url-validation";
import { websiteRateLimiter } from "@/lib/security/rate-limit";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const rateLimitResponse = websiteRateLimiter.check(req, authResult.user._id);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { url, step, sectionUrl, productUrls, limit: rawLimit = 6 } = body;
    const limit = Math.min(typeof rawLimit === "number" ? rawLimit : 6, 50);

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
    }

    // Auto-prepend https:// if missing
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
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

    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    // ── STEP: discover ──
    if (step === "discover") {
      // 1. Fetch sitemap (best effort)
      let sitemapEntries: Awaited<ReturnType<typeof fetchSitemap>> = [];
      try {
        sitemapEntries = await fetchSitemap(baseUrl);
      } catch (err) {
        console.error("Sitemap fetch failed:", err);
      }

      // 2. Fetch homepage via Jina
      let homepageMarkdown = "";
      try {
        homepageMarkdown = await fetchPageViaJina(normalizedUrl);
      } catch (err) {
        console.error("Jina homepage fetch failed:", err);
        // Fallback: try direct fetch
        try {
          const directRes = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
              Accept: "text/html",
            },
            signal: AbortSignal.timeout(15000),
          });
          if (directRes.ok) {
            homepageMarkdown = await directRes.text();
          }
        } catch {
          // Both failed
        }
      }

      if (!homepageMarkdown) {
        return NextResponse.json(
          { error: "Could not fetch website content." },
          { status: 502 }
        );
      }

      // 3. Extract links from homepage
      let homepageLinks: string[] = [];
      try {
        homepageLinks = await extractLinks(homepageMarkdown, baseUrl);
      } catch (err) {
        console.error("Link extraction failed:", err);
      }

      // 4. AI: Classify sections + Extract homepage products (parallel)
      let sections: Awaited<ReturnType<typeof classifySections>>["sections"] = [];
      let classifyUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      let homepageProducts: Awaited<ReturnType<typeof extractProductsFromPage>>["products"] = [];
      let productUsageDiscover = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      try {
        const [classifyResult, productsResult] = await Promise.all([
          classifySections(homepageLinks, sitemapEntries, homepageMarkdown, baseUrl),
          extractProductsFromPage(homepageMarkdown, url, limit),
        ]);
        sections = classifyResult.sections;
        classifyUsage = classifyResult.usage;
        homepageProducts = productsResult.products;
        productUsageDiscover = productsResult.usage;
      } catch (err) {
        console.error("Section classification or product extraction failed:", err);
      }

      // 7. Extract website info using Gemini
      let websiteInfo: Record<string, unknown> = {};
      let analysisUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (apiKey) {
          const snippetForAnalysis = homepageMarkdown.slice(0, 6000);
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

          const analysisResult = await model.generateContent([
            {
              text: `Analyze this website content and return a JSON object with company information.

## Website URL: ${url}

## Website content (markdown):
${snippetForAnalysis}

Return a JSON object with this exact structure (no markdown fences, just raw JSON):
{
  "companyName": "The company/brand name",
  "description": "2-3 sentence description of what the company does",
  "industry": "Specific industry (e.g. 'E-commerce - Gifts & Occasions', 'SaaS - Restaurant Management')",
  "features": ["feature 1", "feature 2"],
  "targetAudience": "Who their customers are",
  "tone": "Brand voice/tone",
  "language": "primary language of the website (en, ar, etc.)",
  "logoUrl": "absolute URL to the company/brand logo image found in the markdown (look for images with 'logo' in alt text or URL path), or null if not found",
  "contact": {
    "phone": "phone if found or null",
    "email": "email if found or null",
    "address": "address if found or null",
    "socialMedia": ["social links if found"]
  }
}

Return ONLY the JSON, no markdown fences.`,
            },
          ]);

          const responseText = analysisResult.response.text();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            websiteInfo = JSON.parse(jsonMatch[0]);
          }

          const um = analysisResult.response.usageMetadata;
          analysisUsage = {
            promptTokens: um?.promptTokenCount ?? 0,
            completionTokens: um?.candidatesTokenCount ?? 0,
            totalTokens: um?.totalTokenCount ?? 0,
          };
        }
      } catch (err) {
        console.error("Website analysis failed:", err);
      }

      // Aggregate usage
      const totalUsage = {
        promptTokens: classifyUsage.promptTokens + productUsageDiscover.promptTokens + analysisUsage.promptTokens,
        completionTokens: classifyUsage.completionTokens + productUsageDiscover.completionTokens + analysisUsage.completionTokens,
        totalTokens: classifyUsage.totalTokens + productUsageDiscover.totalTokens + analysisUsage.totalTokens,
        model: "gemini-3.1-flash-lite-preview",
      };

      return NextResponse.json({
        sections,
        homepageProducts: homepageProducts.slice(0, limit),
        websiteInfo,
        usage: totalUsage,
        stats: {
          sitemapUrls: sitemapEntries.length,
          homepageLinks: homepageLinks.length,
          sectionsFound: sections.length,
          productsOnHomepage: homepageProducts.length,
        },
      });
    }

    // ── STEP: fetch-section ──
    if (step === "fetch-section") {
      if (!sectionUrl || typeof sectionUrl !== "string") {
        return NextResponse.json(
          { error: "sectionUrl is required for fetch-section step." },
          { status: 400 }
        );
      }

      // Validate sectionUrl: must be same domain as base URL and pass SSRF check
      try {
        const sectionParsed = new URL(sectionUrl);
        if (sectionParsed.host !== parsedUrl.host) {
          return NextResponse.json({ error: "sectionUrl must be on the same domain." }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid sectionUrl format." }, { status: 400 });
      }
      const sectionCheck = await validateExternalUrl(sectionUrl);
      if (!sectionCheck.allowed) {
        return NextResponse.json({ error: sectionCheck.reason }, { status: 403 });
      }

      // 1. Fetch the section page via Jina
      let sectionMarkdown = "";
      try {
        sectionMarkdown = await fetchPageViaJina(sectionUrl);
      } catch (err) {
        console.error("Section page fetch failed:", err);
        return NextResponse.json(
          { error: "Could not fetch section page." },
          { status: 502 }
        );
      }

      // 2. AI extracts products directly from the section markdown
      let allProducts: Awaited<ReturnType<typeof extractProductsFromPage>>["products"] = [];
      let sectionUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      try {
        const result = await extractProductsFromPage(sectionMarkdown, sectionUrl, limit);
        allProducts = result.products;
        sectionUsage = result.usage;
      } catch (err) {
        console.error("Product extraction from section failed:", err);
      }

      // Also extract links that might be product pages (for deeper fetching)
      let productLinks: string[] = [];
      try {
        const allLinks = await extractLinks(sectionMarkdown, baseUrl);
        productLinks = allLinks.filter(l =>
          /\/(product|item|p|dp)\b/i.test(l) ||
          (l.split("/").length > 4 && !/(category|collection|brand|shop|page)/i.test(l.split("/").slice(-2, -1)[0] || ""))
        );
      } catch (err) {
        console.error("Product link extraction failed:", err);
      }

      const totalFound = allProducts.length;
      const limitedProducts = allProducts;

      return NextResponse.json({
        products: limitedProducts,
        totalFound,
        hasMore: totalFound > limit,
        productLinks: productLinks.slice(0, 50),
      });
    }

    // ── STEP: fetch-products ──
    if (step === "fetch-products") {
      if (!productUrls || !Array.isArray(productUrls) || productUrls.length === 0) {
        return NextResponse.json(
          { error: "productUrls array is required for fetch-products step." },
          { status: 400 }
        );
      }

      // Cap limit to prevent abuse
      const safeLimitProducts = Math.min(limit, 20);

      // Validate all product URLs: must be strings, same domain, pass SSRF check
      const validatedUrls: string[] = [];
      for (const pu of productUrls.slice(0, safeLimitProducts)) {
        if (typeof pu !== "string") continue;
        try {
          const puParsed = new URL(pu);
          if (puParsed.host !== parsedUrl.host) continue;
        } catch {
          continue;
        }
        const puCheck = await validateExternalUrl(pu);
        if (puCheck.allowed) validatedUrls.push(pu);
      }

      if (validatedUrls.length === 0) {
        return NextResponse.json({ error: "No valid product URLs provided." }, { status: 400 });
      }

      const urlsToFetch = validatedUrls;
      const products: Awaited<ReturnType<typeof extractProductDetails>>["product"][] = [];
      const productUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      // Fetch product pages in parallel (with concurrency limit of 3)
      const batchSize = 3;
      for (let i = 0; i < urlsToFetch.length; i += batchSize) {
        const batch = urlsToFetch.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (productUrl: string) => {
            try {
              const markdown = await fetchPageViaJina(productUrl);
              const { product, usage } = await extractProductDetails(markdown, productUrl);
              productUsage.promptTokens += usage.promptTokens;
              productUsage.completionTokens += usage.completionTokens;
              productUsage.totalTokens += usage.totalTokens;
              return product;
            } catch (err) {
              console.error(`Failed to fetch product ${productUrl}:`, err);
              return null;
            }
          })
        );

        for (const result of batchResults) {
          if (result) products.push(result);
        }
      }

      return NextResponse.json({
        products,
        usage: { ...productUsage, model: "gemini-3.1-flash-lite-preview" },
      });
    }

    return NextResponse.json(
      { error: `Unknown step: "${step}". Use "discover", "fetch-section", or "fetch-products".` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("timeout") || message.includes("abort")) {
      return NextResponse.json({ error: "Request timed out." }, { status: 504 });
    }
    console.error("crawl-website error:", err);
    return NextResponse.json({ error: "Failed to crawl website." }, { status: 500 });
  }
}

