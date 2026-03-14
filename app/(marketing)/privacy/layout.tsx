import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Privacy Policy | oDesigns",
  description:
    "Read the oDesigns privacy policy. Learn how we protect your data, handle social media account connections, and safeguard your information.",
  openGraph: {
    title: "Privacy Policy | oDesigns",
    description: "How oDesigns protects your data and privacy.",
    url: "https://odesigns.app/privacy",
    type: "website",
  },
  alternates: generateAlternates("/privacy"),
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
