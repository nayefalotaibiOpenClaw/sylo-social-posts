"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { TranslationKey, Locale, Direction } from "./types";
import { getLocaleCookie, setLocaleCookie, detectBrowserLocale } from "./utils";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const translations: Record<Locale, Record<string, string>> = { en, ar };

interface LocaleContextValue {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Always return "en" on server to match layout.tsx default.
// On client, read cookie or detect browser language.
function getInitialLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const cookie = getLocaleCookie();
  if (cookie) return cookie;
  // Default to "en" — only switch to Arabic when the user explicitly chooses it
  return "en";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // Initialize to "en" for SSR, then sync to real locale in useEffect to avoid hydration mismatch
  const [locale, setLocaleState] = useState<Locale>("en");
  const [hydrated, setHydrated] = useState(false);

  // After hydration, sync to the real locale from cookie/browser
  useEffect(() => {
    const real = getInitialLocale();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(real);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  }, []);

  // Sync HTML attributes whenever locale changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale, hydrated]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>): string => {
      let str = translations[locale]?.[key] || translations.en[key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, v);
        }
      }
      return str;
    },
    [locale]
  );

  const dir: Direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
