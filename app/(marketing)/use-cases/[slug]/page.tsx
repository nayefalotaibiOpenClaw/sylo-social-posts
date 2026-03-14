import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { generateAlternates } from "@/lib/i18n/seo";
import UseCaseClient from "./UseCaseClient";

const BASE_URL = "https://odesigns.app";

function getLocaleLanguage(headerLocale: string | null): "en" | "ar" {
  return headerLocale === "ar" ? "ar" : "en";
}

export async function generateStaticParams() {
  try {
    const useCases = await fetchQuery(api.blogs.listByType, {
      type: "use-case",
      language: "en",
    });
    return useCases.map((uc) => ({ slug: uc.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const headersList = await headers();
  const language = getLocaleLanguage(headersList.get("x-locale"));

  try {
    const useCase = await fetchQuery(api.blogs.getBySlugAndType, {
      slug,
      type: "use-case",
      language,
    });

    if (!useCase) {
      return { title: "Not Found | oDesigns" };
    }

    const metaTitle = useCase.metaTitle || useCase.title;
    const metaDescription = useCase.excerpt;

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: useCase.keywords,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${BASE_URL}/use-cases/${useCase.slug}`,
        siteName: "oDesigns",
        type: "website",
        images: [
          {
            url: `${BASE_URL}/og-image.png`,
            width: 1200,
            height: 1200,
            alt: useCase.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: [`${BASE_URL}/og-image.png`],
      },
      alternates: generateAlternates(`/use-cases/${useCase.slug}`),
    };
  } catch {
    return {
      title: "Use Case | oDesigns",
      description: "Discover how oDesigns helps your business with AI-powered social media design.",
      alternates: generateAlternates(`/use-cases/${slug}`),
    };
  }
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const headersList = await headers();
  const language = getLocaleLanguage(headersList.get("x-locale"));

  let useCase = null;
  try {
    useCase = await fetchQuery(api.blogs.getBySlugAndType, {
      slug,
      type: "use-case",
      language,
    });
  } catch {
    // If Convex is unavailable during build, 404
  }

  if (!useCase) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: useCase.title,
    description: useCase.excerpt,
    url: `${BASE_URL}/use-cases/${useCase.slug}`,
    inLanguage: useCase.language || "en",
    datePublished: new Date(useCase.publishedAt).toISOString(),
    publisher: {
      "@type": "Organization",
      name: "oDesigns",
      url: BASE_URL,
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "oDesigns",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  };

  // Server-fetched structured data from Convex DB (not user input)
  const structuredData = JSON.stringify(jsonLd);

  return (
    <>
      {/* Safe: structured data is built from server-fetched DB content, not user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <UseCaseClient slug={slug} />
    </>
  );
}
