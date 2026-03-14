import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { cookies, headers } from "next/headers";
import "./globals.css";
import Providers from "./components/Providers";
import { LOCALES, DEFAULT_LOCALE, RTL_LOCALES, type Locale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["400", "600", "700", "900"],
});

const BASE_URL = "https://odesigns.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "oDesigns — AI Social Media Post Generator & Design Tool",
    template: "%s | oDesigns",
  },
  description:
    "Create stunning social media posts in seconds with AI. Generate on-brand designs, schedule across Instagram, Facebook, Threads, and Twitter from one dashboard.",
  keywords: [
    "AI social media post generator",
    "social media design tool",
    "AI post maker",
    "Instagram post generator",
    "social media scheduling",
    "brand design tool",
    "AI content creation",
    "social media automation",
  ],
  openGraph: {
    title: "oDesigns — AI Social Media Post Generator",
    description:
      "Create stunning social media posts in seconds with AI. Generate on-brand designs and publish across all platforms from one dashboard.",
    url: BASE_URL,
    siteName: "oDesigns",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 1200,
        alt: "oDesigns — AI-powered social media post generator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "oDesigns — AI Social Media Post Generator",
    description:
      "Create stunning social media posts in seconds with AI. Design, schedule, and publish from one dashboard.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
    languages: Object.fromEntries(
      LOCALES.map((l) => [l, l === DEFAULT_LOCALE ? BASE_URL : `${BASE_URL}/${l}`])
    ),
  },
  other: {
    "fb:app_id": "810967764709045",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();

  // Locale from middleware x-locale header (preferred), then cookie, then default
  const localeFromHeader = headerStore.get("x-locale");
  const localeFromCookie = cookieStore.get("locale")?.value;
  const locale: Locale =
    (LOCALES as readonly string[]).includes(localeFromHeader ?? "")
      ? (localeFromHeader as Locale)
      : (LOCALES as readonly string[]).includes(localeFromCookie ?? "")
        ? (localeFromCookie as Locale)
        : DEFAULT_LOCALE;
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "oDesigns",
    url: BASE_URL,
    logo: `${BASE_URL}/og-image.png`,
    description:
      "AI-powered social media post generator. Create, schedule, and publish stunning designs across Instagram, Facebook, Threads, and Twitter.",
    sameAs: [],
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "oDesigns",
    url: BASE_URL,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "AI-powered social media post generator and design tool. Create on-brand posts, schedule publishing, and manage multiple social accounts from one dashboard.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan available",
    },
  };

  // JSON-LD structured data (static constants, no user input)
  const structuredData = JSON.stringify([organizationJsonLd, softwareJsonLd]);

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale} dir={dir} suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased`}
        >
          <Providers initialLocale={locale}>{children}</Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
