import type { Metadata } from "next";
import { generateAlternates } from "@/lib/i18n/seo";

export const metadata: Metadata = {
  title: "Contact Us | oDesigns",
  description:
    "Get in touch with the oDesigns team. We are here to help with questions about AI-powered social media post generation, publishing, and design.",
  openGraph: {
    title: "Contact Us | oDesigns",
    description:
      "Get in touch with the oDesigns team for questions about AI social media design and publishing.",
    url: "https://odesigns.app/contact",
    type: "website",
  },
  alternates: generateAlternates("/contact"),
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
