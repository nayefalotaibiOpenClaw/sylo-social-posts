import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { templatePages, getTemplatePageBySlug } from "@/lib/seo/templates";
import { generateAlternates } from "@/lib/i18n/seo";
import TemplatePageClient from "./TemplatePageClient";

const BASE_URL = "https://odesigns.app";

export async function generateStaticParams() {
  return templatePages.map((tp) => ({ slug: tp.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplatePageBySlug(slug);

  if (!template) {
    return { title: "Not Found | oDesigns" };
  }

  return {
    title: template.metaTitle,
    description: template.metaDescription,
    keywords: template.keywords,
    openGraph: {
      title: template.metaTitle,
      description: template.metaDescription,
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
      title: template.metaTitle,
      description: template.metaDescription,
      images: [`${BASE_URL}/og-image.png`],
    },
    alternates: generateAlternates(`/templates/${template.slug}`),
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = getTemplatePageBySlug(slug);

  if (!template) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: template.title,
    description: template.metaDescription,
    url: `${BASE_URL}/templates/${template.slug}`,
    publisher: {
      "@type": "Organization",
      name: "oDesigns",
      url: BASE_URL,
    },
  };

  // Static JSON-LD from hardcoded source data, not user input
  const structuredData = JSON.stringify(jsonLd);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <TemplatePageClient slug={slug} />
    </>
  );
}
