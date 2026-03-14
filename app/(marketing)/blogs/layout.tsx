import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Blog — AI Social Media Design Tips & Insights | oDesigns",
  description:
    "Learn how to create stunning social media posts with AI. Tips on Instagram design, content scheduling, brand identity, and social media automation.",
  keywords: [
    "AI social media design",
    "social media post generator",
    "Instagram post design",
    "AI content creation",
    "social media scheduling",
    "brand identity",
    "social media tips",
  ],
  openGraph: {
    title: "Blog — AI Social Media Design Tips & Insights",
    description:
      "Learn how to create stunning social media posts with AI. Tips on Instagram design, content scheduling, brand identity, and social media automation.",
    url: "https://odesigns.app/blogs",
    siteName: "oDesigns Studio",
    type: "website",
    images: [
      {
        url: "https://odesigns.app/og-image.png",
        width: 1200,
        height: 1200,
        alt: "oDesigns Blog — AI Social Media Design Tips",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — AI Social Media Design Tips & Insights",
    description:
      "Learn how to create stunning social media posts with AI. Tips on design, scheduling, and automation.",
    images: ["https://odesigns.app/og-image.png"],
  },
  alternates: generateAlternates("/blogs"),
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
