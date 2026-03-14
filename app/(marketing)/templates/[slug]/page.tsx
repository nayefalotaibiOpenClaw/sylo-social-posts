import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { generateAlternates } from "@/lib/i18n/seo";
import TemplatePageClient from "./TemplatePageClient";

const BASE_URL = "https://odesigns.app";

function getLocaleLanguage(headerLocale: string | null): "en" | "ar" {
  return headerLocale === "ar" ? "ar" : "en";
}

export async function generateStaticParams() {
  try {
    const templates = await fetchQuery(api.blogs.listByType, {
      type: "template",
      language: "en",
    });
    return templates.map((tp) => ({ slug: tp.slug }));
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
    const template = await fetchQuery(api.blogs.getBySlugAndType, {
      slug,
      type: "template",
      language,
    });

    if (!template) {
      return { title: "Not Found | oDesigns" };
    }

    const metaTitle = template.metaTitle || template.title;
    const metaDescription = template.excerpt;

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: template.keywords,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: `${BASE_URL}/templates/${template.slug}`,
        siteName: "oDesigns",
        type: "website",
        images: [
          {
            url: `${BASE_URL}/og-image.png`,
            width: 1200,
            height: 1200,
            alt: template.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: metaDescription,
        images: [`${BASE_URL}/og-image.png`],
      },
      alternates: generateAlternates(`/templates/${template.slug}`),
    };
  } catch {
    return {
      title: "Template | oDesigns",
      description: "Explore AI-powered social media post templates.",
      alternates: generateAlternates(`/templates/${slug}`),
    };
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const headersList = await headers();
  const language = getLocaleLanguage(headersList.get("x-locale"));

  let template = null;
  try {
    template = await fetchQuery(api.blogs.getBySlugAndType, {
      slug,
      type: "template",
      language,
    });
  } catch {
    // If Convex is unavailable during build, 404
  }

  if (!template) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: template.title,
    description: template.excerpt,
    url: `${BASE_URL}/templates/${template.slug}`,
    inLanguage: template.language || "en",
    datePublished: new Date(template.publishedAt).toISOString(),
    publisher: {
      "@type": "Organization",
      name: "oDesigns",
      url: BASE_URL,
    },
  };

  // Server-fetched structured data from Convex DB (not user input)
  const structuredData = JSON.stringify(jsonLd);

  return (
    <>
      {/* Safe: structured data is built from server-fetched DB content, not user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <TemplatePageClient slug={slug} />
    </>
  );
}
