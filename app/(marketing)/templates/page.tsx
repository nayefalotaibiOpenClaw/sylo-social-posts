"use client";

import Link from "@/lib/i18n/LocaleLink";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import { useLocale } from "@/lib/i18n/context";
import { ArrowRight } from "lucide-react";

export default function TemplatesIndexPage() {
  const { dir, t, locale } = useLocale();
  const dbLanguage = locale === "ar" ? "ar" as const : "en" as const;
  const templatePages = useQuery(api.blogs.listByType, {
    type: "template",
    language: dbLanguage,
  });

  return (
    <div
      dir={dir}
      className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans overflow-x-hidden"
    >
      <FloatingNav />

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            {t("templates.title")}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-neutral-400 font-medium max-w-2xl mx-auto">
            {t("templates.subtitle")}
          </p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {templatePages === undefined ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 dark:border-neutral-800 p-8 h-48 animate-pulse bg-slate-50 dark:bg-neutral-900" />
            ))
          ) : (
            templatePages.map((tp) => (
              <Link
                key={tp._id}
                href={`/templates/${tp.slug}`}
                className="group block"
              >
                <article className="rounded-2xl border border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] hover:border-slate-200 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-300 p-8 h-full flex flex-col">
                  <h2 className="text-xl font-bold mb-3 group-hover:text-slate-700 dark:group-hover:text-neutral-300 transition-colors">
                    {tp.title}
                  </h2>
                  <p className="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed flex-1">
                    {tp.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white group-hover:gap-3 transition-all">
                    {t("templates.explore")}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold text-sm">
          <div />
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.twitter")}
            </a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.linkedin")}
            </a>
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.termsOfService")}
            </a>
            <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
              {t("footer.privacyPolicy")}
            </a>
          </div>
          <p>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </footer>
    </div>
  );
}
