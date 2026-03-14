import { LOCALES, DEFAULT_LOCALE, type Locale } from "./config";

const COOKIE_NAME = "locale";

export function getLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  const val = match[1];
  return LOCALES.includes(val as Locale) ? (val as Locale) : null;
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  const prefix = lang.split("-")[0].toLowerCase();
  if (LOCALES.includes(prefix as Locale)) return prefix as Locale;
  return DEFAULT_LOCALE;
}

/** Strip locale prefix from a pathname: /es/pricing -> /pricing, /pricing -> /pricing */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && LOCALES.includes(segments[1] as Locale)) {
    return "/" + segments.slice(2).join("/") || "/";
  }
  return pathname;
}

/** Add locale prefix to an href for non-default locales */
export function localizeHref(href: string, locale: Locale): string {
  if (typeof href !== "string") return href;
  // Don't prefix external URLs, API routes, static assets, hash links
  if (href.startsWith("http") || href.startsWith("/api/") || href.startsWith("/_next/") || href.startsWith("#") || href.startsWith("mailto:")) return href;
  if (locale === DEFAULT_LOCALE) return href;
  // Don't double-prefix
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
  return `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
}

/** Detect locale from Accept-Language header (server-side) */
export function detectFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  // Parse Accept-Language: en-US,en;q=0.9,es;q=0.8,ar;q=0.7
  const langs = header.split(",").map((part) => {
    const [lang, q] = part.trim().split(";q=");
    return { lang: lang.split("-")[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
  });
  langs.sort((a, b) => b.q - a.q);
  for (const { lang } of langs) {
    if (LOCALES.includes(lang as Locale)) return lang as Locale;
  }
  return DEFAULT_LOCALE;
}
