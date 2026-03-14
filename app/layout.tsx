import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { cookies } from "next/headers";
import "./globals.css";
import Providers from "./components/Providers";

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

export const metadata: Metadata = {
  title: "oDesigns Studio",
  description:
    "AI-powered content for social media, app stores, and advertising",
  openGraph: {
    title: "oDesigns — Your brand, everywhere.",
    description:
      "AI-powered content for social media, app stores, and advertising",
    url: "https://odesigns.app",
    siteName: "oDesigns Studio",
    images: [
      {
        url: "https://odesigns.app/og-image.png",
        width: 1200,
        height: 1200,
        alt: "oDesigns — AI-powered content for social media, app stores, and advertising",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "oDesigns — Your brand, everywhere.",
    description:
      "AI-powered content for social media, app stores, and advertising",
    images: ["https://odesigns.app/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("locale")?.value as "en" | "ar") || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale} dir={dir} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} antialiased`}
        >
          <Providers>{children}</Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
