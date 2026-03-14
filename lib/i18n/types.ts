import en from "./locales/en.json";

export type TranslationKey = keyof typeof en;
export type Locale = "en" | "ar" | "es" | "pt" | "fr" | "tr" | "id";
export type Direction = "ltr" | "rtl";
