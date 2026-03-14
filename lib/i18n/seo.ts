import { LOCALES, DEFAULT_LOCALE } from "./config";

const BASE_URL = "https://odesigns.app";

/** Generate hreflang alternates for a given path (e.g., "/pricing") */
export function generateAlternates(path: string) {
  return {
    canonical: `${BASE_URL}${path}`,
    languages: Object.fromEntries(
      LOCALES.map((locale) => [
        locale,
        locale === DEFAULT_LOCALE
          ? `${BASE_URL}${path}`
          : `${BASE_URL}/${locale}${path}`,
      ])
    ),
  };
}
