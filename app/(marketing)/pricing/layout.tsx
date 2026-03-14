import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Pricing — AI Social Media Post Generator Plans | oDesigns",
  description:
    "Choose the right plan for your social media workflow. Generate AI-powered posts, schedule across platforms, and maintain brand consistency. Free and Pro plans available.",
  keywords: [
    "social media tool pricing",
    "AI post generator pricing",
    "social media management plans",
    "affordable social media design",
  ],
  openGraph: {
    title: "Pricing — AI Social Media Post Generator Plans",
    description:
      "Generate AI-powered social media posts, schedule across platforms, and maintain brand consistency. Free and Pro plans available.",
    url: "https://odesigns.app/pricing",
    type: "website",
  },
  alternates: generateAlternates("/pricing"),
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
