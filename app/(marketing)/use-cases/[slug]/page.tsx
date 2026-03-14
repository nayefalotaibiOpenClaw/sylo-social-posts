import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { useCases, getUseCaseBySlug } from "@/lib/seo/use-cases";
import { generateAlternates } from "@/lib/i18n/seo";
import UseCaseClient from "./UseCaseClient";

const BASE_URL = "https://odesigns.app";

export async function generateStaticParams() {
  return useCases.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    return { title: "Not Found | oDesigns" };
  }

  return {
    title: useCase.metaTitle,
    description: useCase.metaDescription,
    keywords: useCase.keywords,
    openGraph: {
      title: useCase.metaTitle,
      description: useCase.metaDescription,
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
      title: useCase.metaTitle,
      description: useCase.metaDescription,
      images: [`${BASE_URL}/og-image.png`],
    },
    alternates: generateAlternates(`/use-cases/${useCase.slug}`),
  };
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const useCase = getUseCaseBySlug(slug);

  if (!useCase) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: useCase.title,
    description: useCase.metaDescription,
    url: `${BASE_URL}/use-cases/${useCase.slug}`,
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

  // Static JSON-LD from source code data, not user input
  const structuredData = JSON.stringify(jsonLd);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <UseCaseClient slug={slug} />
    </>
  );
}
