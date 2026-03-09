"use client";

import React from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./ThemeContext";
import { LocaleProvider } from "@/lib/i18n/context";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <LocaleProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </LocaleProvider>
    </ConvexAuthNextjsProvider>
  );
}
