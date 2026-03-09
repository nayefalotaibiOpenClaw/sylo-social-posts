"use client";

import { useLocale } from "./context";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "ar" : "en")}
      className="px-3 py-1.5 rounded-full text-xs font-bold border border-current/20 hover:scale-105 transition-all active:scale-95"
      aria-label="Switch language"
    >
      {locale === "en" ? "عربي" : "EN"}
    </button>
  );
}
