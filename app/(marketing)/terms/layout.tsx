import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Terms of Service | oDesigns",
  description:
    "Read the oDesigns terms of service. Understand your rights and responsibilities when using our AI-powered social media design platform.",
  openGraph: {
    title: "Terms of Service | oDesigns",
    description: "Terms and conditions for using oDesigns.",
    url: "https://odesigns.app/terms",
    type: "website",
  },
  alternates: generateAlternates("/terms"),
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
