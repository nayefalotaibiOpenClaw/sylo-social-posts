import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { generateAlternates } from "@/lib/i18n/seo";
import BlogDetailClient from "./BlogDetailClient";

const BASE_URL = "https://odesigns.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await fetchQuery(api.blogs.getBySlug, { slug });

    if (!blog) {
      return {
        title: "Blog Post Not Found | oDesigns",
        description: "The blog post you are looking for does not exist.",
      };
    }

    const publishedDate = new Date(blog.publishedAt).toISOString();

    return {
      title: `${blog.title} | oDesigns Blog`,
      description: blog.excerpt,
      keywords: blog.tags,
      authors: [{ name: blog.author }],
      openGraph: {
        title: blog.title,
        description: blog.excerpt,
        url: `${BASE_URL}/blogs/${blog.slug}`,
        siteName: "oDesigns Studio",
        type: "article",
        publishedTime: publishedDate,
        authors: [blog.author],
        tags: blog.tags,
        images: [
          {
            url: `${BASE_URL}/og-image.png`,
            width: 1200,
            height: 1200,
            alt: blog.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt,
        images: [`${BASE_URL}/og-image.png`],
      },
      alternates: generateAlternates(`/blogs/${blog.slug}`),
    };
  } catch {
    return {
      title: "Blog | oDesigns",
      description: "Read the latest insights on AI-powered social media design.",
    };
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch blog server-side for JSON-LD structured data
  let blogJsonLd = null;
  try {
    const blog = await fetchQuery(api.blogs.getBySlug, { slug });
    if (blog) {
      blogJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blog.title,
        description: blog.excerpt,
        author: {
          "@type": "Organization",
          name: blog.author,
          url: BASE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "oDesigns",
          url: BASE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/og-image.png`,
          },
        },
        datePublished: new Date(blog.publishedAt).toISOString(),
        dateModified: new Date(blog.publishedAt).toISOString(),
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${BASE_URL}/blogs/${blog.slug}`,
        },
        image: `${BASE_URL}/og-image.png`,
        keywords: blog.tags.join(", "),
        inLanguage: blog.language === "ar" ? "ar" : "en",
        url: `${BASE_URL}/blogs/${blog.slug}`,
      };
    }
  } catch {
    // Render without JSON-LD if fetch fails
  }

  return (
    <>
      {blogJsonLd && (
        <script
          type="application/ld+json"
          // Safe: JSON-LD from admin-authored DB content, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
        />
      )}
      <BlogDetailClient slug={slug} />
    </>
  );
}
