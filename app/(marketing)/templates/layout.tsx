import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Social Media Templates — AI-Generated Posts, Ads & App Store Previews | oDesigns",
  description:
    "AI-generated templates for Instagram posts, product ads, restaurant menus, app store screenshots, carousel content, and brand announcements. Generate on-brand designs in seconds, edit visually, and schedule across all social platforms.",
  keywords: [
    "social media post templates",
    "AI design templates",
    "Instagram post templates",
    "AI ad content templates",
    "app store screenshot templates",
    "social media carousel templates",
    "product showcase templates",
    "restaurant social media templates",
    "brand announcement templates",
    "bulk social media content",
  ],
  openGraph: {
    title: "Social Media Templates — AI-Generated Posts, Ads & App Store Previews",
    description:
      "Generate on-brand social media posts, product ads, app store previews, and carousel content with AI. Edit visually and schedule across all platforms in seconds.",
    url: "https://odesigns.app/templates",
    siteName: "oDesigns",
    type: "website",
    images: [
      {
        url: "https://odesigns.app/og-image.png",
        width: 1200,
        height: 1200,
        alt: "oDesigns — AI Social Media Post Templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Templates — AI-Generated Posts, Ads & App Store Previews",
    description:
      "Generate on-brand social media posts, product ads, app store previews, and carousel content with AI. Edit visually and schedule across all platforms in seconds.",
    images: ["https://odesigns.app/og-image.png"],
  },
  alternates: generateAlternates("/templates"),
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
