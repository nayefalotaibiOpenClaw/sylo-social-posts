import type { Locale } from "./types";

const COOKIE_NAME = "locale";

const SUPPORTED_LOCALES: Locale[] = ["en", "ar", "es", "pt", "fr", "tr", "id"];

export function getLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  const val = match[1];
  return SUPPORTED_LOCALES.includes(val as Locale) ? (val as Locale) : null;
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${COOKIE_NAME}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  const prefix = lang.split("-")[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(prefix as Locale)) return prefix as Locale;
  return "en";
}
