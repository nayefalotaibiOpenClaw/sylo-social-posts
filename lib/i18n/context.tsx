"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { TranslationKey, Direction } from "./types";
import { LOCALES, DEFAULT_LOCALE, RTL_LOCALES, type Locale } from "./config";
import { setLocaleCookie, stripLocalePrefix, localizeHref } from "./utils";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";
import tr from "./locales/tr.json";
import id from "./locales/id.json";

const translations: Record<Locale, Record<string, string>> = { en, ar, es, pt, fr, tr, id };

interface LocaleContextValue {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setLocaleCookie(newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = RTL_LOCALES.includes(newLocale) ? "rtl" : "ltr";

    // Navigate to the locale-prefixed URL
    const cleanPath = stripLocalePrefix(window.location.pathname);
    const newPath = localizeHref(cleanPath, newLocale);
    if (newPath !== window.location.pathname) {
      window.location.assign(newPath);
    }
  }, []);

  // Sync HTML attributes on mount
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
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

  const dir: Direction = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

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

// Re-export for convenience
export { LOCALES, DEFAULT_LOCALE, type Locale } from "./config";
