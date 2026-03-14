"use client";

import React from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider } from "./ThemeContext";
import { LocaleProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/config";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <LocaleProvider initialLocale={initialLocale}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
      </NextThemesProvider>
    </ConvexAuthNextjsProvider>
  );
}
