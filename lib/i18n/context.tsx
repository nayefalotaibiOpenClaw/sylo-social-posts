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

function getInitialLocale(): Locale {
  if (typeof document === "undefined") return "en"; // SSR fallback
  const cookie = getLocaleCookie();
  if (cookie) return cookie;
  const detected = detectBrowserLocale();
  setLocaleCookie(detected);
  return detected;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
  }, []);

  // Sync HTML attributes on mount
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

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
