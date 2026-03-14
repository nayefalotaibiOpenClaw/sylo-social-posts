import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Use Cases — AI-Powered Social Media Content for Every Industry | oDesigns",
  description:
    "Generate, edit, and schedule social media posts, ads, and app store previews with AI. oDesigns automates content creation for small businesses, restaurants, real estate, e-commerce, freelancers, and agencies — publish to Instagram, Facebook, Threads, and Twitter from one dashboard.",
  keywords: [
    "social media use cases",
    "AI social media content generator",
    "automate social media posts",
    "social media scheduling tool",
    "AI ad content generator",
    "app store screenshot generator",
    "social media for small business",
    "social media for restaurants",
    "social media for real estate",
    "bulk social media publishing",
  ],
  openGraph: {
    title: "Use Cases — AI-Powered Social Media Content for Every Industry",
    description:
      "Generate, edit, and schedule social media posts, ads, and app store previews with AI. Automate content creation and publish to all platforms from one dashboard.",
    url: "https://odesigns.app/use-cases",
    siteName: "oDesigns",
    type: "website",
    images: [
      {
        url: "https://odesigns.app/og-image.png",
        width: 1200,
        height: 1200,
        alt: "oDesigns — AI Social Media Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Use Cases — AI-Powered Social Media Content for Every Industry",
    description:
      "Generate, edit, and schedule social media posts, ads, and app store previews with AI. Automate content creation and publish to all platforms from one dashboard.",
    images: ["https://odesigns.app/og-image.png"],
  },
  alternates: generateAlternates("/use-cases"),
};

export default function UseCasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
