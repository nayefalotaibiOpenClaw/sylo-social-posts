"use client";

import React from "react";
import Link from "@/lib/i18n/LocaleLink";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

function formatDate(timestamp: number, locale: string) {
  return new Date(timestamp).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogsPage() {
  const { locale, dir, t } = useLocale();
  const blogLanguage = locale === "ar" ? "ar" as const : "en" as const;
  const blogs = useQuery(api.blogs.list, { language: blogLanguage });

  return (
    <div dir={dir} className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      <FloatingNav activePage="blogs" />

      {/* Hero */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            {t("blog.title")}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-neutral-400 font-medium max-w-2xl mx-auto">
            {t("blog.subtitle")}
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          {blogs === undefined ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 animate-pulse h-80"
                />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center text-slate-400 font-medium text-lg py-20">
              {t("blog.noPosts")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blogs/${blog.slug}`}
                  className="group block"
                >
                  <article className="rounded-2xl border border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] hover:border-slate-200 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Decorative gradient header */}
                    <div className="h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-6 left-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute bottom-4 right-8 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                      </div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex flex-wrap gap-2">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 text-xs font-bold text-white/80 bg-white/10 rounded-full backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-3">
                        <Calendar className="w-4 h-4" />
                        {formatDate(blog.publishedAt, locale)}
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-slate-700 dark:group-hover:text-neutral-300 transition-colors leading-tight">
                        {blog.title}
                      </h2>

                      <p className="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed flex-1">
                        {blog.excerpt}
                      </p>

                      <div className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white group-hover:gap-3 transition-all">
                        {t("blog.readArticle")}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold text-sm">
          <div />
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">{t("footer.twitter")}</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">{t("footer.linkedin")}</a>
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-white">{t("footer.termsOfService")}</a>
            <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white">{t("footer.privacyPolicy")}</a>
          </div>
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
