export const LOCALES = ["en", "ar", "es", "pt", "fr", "tr", "id"] as const;
export const DEFAULT_LOCALE = "en";
export type Locale = (typeof LOCALES)[number];
export const RTL_LOCALES: Locale[] = ["ar"];
