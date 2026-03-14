"use client";

import { useLocale } from "./context";
import { useState, useRef, useEffect } from "react";
import type { Locale } from "./config";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "ar", label: "العربية", flag: "AR" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "pt", label: "Português", flag: "PT" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "tr", label: "Türkçe", flag: "TR" },
  { code: "id", label: "Indonesia", flag: "ID" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 rounded-full text-xs font-bold border border-current/20 hover:scale-105 transition-all active:scale-95"
        aria-label="Switch language"
      >
        {current.flag}
      </button>
      {open && (
        <div className="absolute end-0 top-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl py-1 min-w-[140px] z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={`w-full text-start px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between ${
                locale === lang.code ? "font-bold text-blue-600 dark:text-blue-400" : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-[10px] text-neutral-400">{lang.flag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
