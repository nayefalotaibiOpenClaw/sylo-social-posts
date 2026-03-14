import en from "./locales/en.json";
export { type Locale } from "./config";

export type TranslationKey = keyof typeof en;
export type Direction = "ltr" | "rtl";
