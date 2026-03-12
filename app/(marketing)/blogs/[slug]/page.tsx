"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import { Calendar, ArrowLeft, User, Tag } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

function formatDate(timestamp: number, locale: string) {
  return new Date(timestamp).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Renders markdown-like content with proper formatting.
 * Supports: ## headings, paragraphs, bold/italic via React elements.
 * Content is trusted (admin-authored from Convex DB, not user-generated).
 */
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let key = 0;

  const formatInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(
          <strong key={`b-${match.index}`} className="text-slate-800 dark:text-neutral-200 font-semibold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(<em key={`i-${match.index}`}>{match[3]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      elements.push(
        <p key={key++} className="text-slate-600 dark:text-neutral-400 leading-relaxed text-lg mb-6">
          {formatInline(text)}
        </p>
      );
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      elements.push(
        <h2 key={key++} className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      elements.push(
        <h1 key={key++} className="text-3xl font-black text-slate-900 dark:text-white mt-12 mb-6">
          {trimmed.slice(2)}
        </h1>
      );
      continue;
    }

    currentParagraph.push(trimmed);
  }

  flushParagraph();
  return <>{elements}</>;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const blog = useQuery(api.blogs.getBySlug, slug ? { slug } : "skip");
  const { locale, dir, t } = useLocale();

  return (
    <div dir={dir} className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      <FloatingNav activePage="blogs" />

      {blog === undefined ? (
        <div className="pt-40 pb-32 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="h-8 w-48 bg-slate-100 dark:bg-neutral-800 rounded-lg animate-pulse mb-8" />
            <div className="h-12 w-full bg-slate-100 dark:bg-neutral-800 rounded-lg animate-pulse mb-4" />
            <div className="h-6 w-2/3 bg-slate-100 dark:bg-neutral-800 rounded-lg animate-pulse mb-12" />
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-slate-50 dark:bg-neutral-900 rounded animate-pulse"
                  style={{ width: `${85 + Math.random() * 15}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : blog === null ? (
        <div className="pt-40 pb-32 px-6 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl font-black mb-4">{t("blog.notFound")}</h1>
            <p className="text-slate-500 dark:text-neutral-400 mb-8">
              {t("blog.notFoundDesc")}
            </p>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("blog.browseAll")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="pt-40 pb-8 px-6">
            <div className="max-w-3xl mx-auto">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white hover:gap-3 transition-all mb-10"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("blog.backToBlogs")}
              </Link>

              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                {blog.title}
              </h1>

              <div className="flex items-center gap-6 text-sm text-slate-400 font-medium pb-10 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {blog.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(blog.publishedAt, locale)}
                </div>
              </div>
            </div>
          </section>

          <section className="pb-32 px-6">
            <article className="max-w-3xl mx-auto pt-10">
              <MarkdownContent content={blog.content} />
            </article>
          </section>
        </>
      )}

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
