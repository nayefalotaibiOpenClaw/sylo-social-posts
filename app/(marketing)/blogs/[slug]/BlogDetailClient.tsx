"use client";

import React from "react";
import Link from "@/lib/i18n/LocaleLink";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import { Calendar, ArrowLeft, User, Tag, ArrowRight, Sparkles } from "lucide-react";
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

export default function BlogDetailClient({ slug }: { slug: string }) {
  const blog = useQuery(api.blogs.getBySlug, slug ? { slug } : "skip");
  const allBlogs = useQuery(api.blogs.list, {});
  const { locale, dir, t } = useLocale();

  // Get related posts (same tags, excluding current)
  const relatedPosts = React.useMemo(() => {
    if (!blog || !allBlogs) return [];
    const currentTags = new Set(blog.tags);
    return allBlogs
      .filter((b) => b.slug !== blog.slug)
      .map((b) => ({
        ...b,
        score: b.tags.filter((tag) => currentTags.has(tag)).length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [blog, allBlogs]);

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
              {[90, 100, 88, 95].map((w, i) => (
                <div
                  key={i}
                  className="h-4 bg-slate-50 dark:bg-neutral-900 rounded animate-pulse"
                  style={{ width: `${w}%` }}
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

          <section className="pb-16 px-6">
            <article className="max-w-3xl mx-auto pt-10">
              <MarkdownContent content={blog.content} />
            </article>
          </section>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="pb-16 px-6">
              <div className="max-w-5xl mx-auto">
                <h3 className="text-2xl font-black mb-8">
                  {locale === "ar" ? "مقالات ذات صلة" : "Related articles"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blogs/${post.slug}`}
                      className="group bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-neutral-800 p-6 hover:border-slate-300 dark:hover:border-neutral-600 transition-all flex flex-col"
                    >
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h4 className="text-lg font-bold leading-snug mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-neutral-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt, locale)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA Bento Cards */}
          <section className="pb-32 px-6">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-neutral-800 rounded-full px-4 py-1.5 mb-5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-bold text-slate-500 dark:text-neutral-400">
                    {locale === "ar" ? "جرّب oDesigns" : "Try oDesigns"}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black mb-3">
                  {locale === "ar"
                    ? "أنشئ منشورات سوشيال ميديا احترافية بالذكاء الاصطناعي"
                    : "Create AI-powered social media posts in seconds"}
                </h3>
                <p className="text-slate-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
                  {locale === "ar"
                    ? "صمّم وانشر محتوى سوشيال ميديا احترافي من مكان واحد."
                    : "Design and publish professional social media content from one place."}
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                {/* Card 1: AI Design (wide) */}
                <div className="md:col-span-7 bg-black rounded-[2rem] p-8 text-white overflow-hidden flex flex-col min-h-[300px] relative">
                  <h4 className="text-2xl font-black mb-2">
                    {locale === "ar" ? "تصميم بالذكاء الاصطناعي" : "AI-Powered Design"}
                  </h4>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                    {locale === "ar"
                      ? "أنشئ منشورات بصرية كاملة — تخطيطات وألوان وخطوط — وليس مجرد نصوص."
                      : "Generate complete visual posts — layouts, colors, typography — not just text captions."}
                  </p>
                  {/* Visual: floating posts */}
                  <div className="mt-auto flex gap-3 items-end -mb-8 pt-6">
                    <div className="w-[110px] aspect-square bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl p-3 flex flex-col justify-between">
                      <div className="w-6 h-6 rounded-md bg-white/20" />
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-white/30 rounded w-full" />
                        <div className="h-1.5 bg-white/20 rounded w-3/4" />
                      </div>
                    </div>
                    <div className="w-[80px] aspect-[9/16] bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl shadow-2xl p-2 flex flex-col justify-between">
                      <div className="h-1 bg-white/25 rounded w-3/4" />
                      <div className="w-full aspect-video bg-white/10 rounded" />
                      <div className="h-1 bg-white/20 rounded w-1/2 mx-auto" />
                    </div>
                    <div className="w-[120px] aspect-square bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl shadow-2xl p-3 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="w-7 h-7 rounded-full bg-white/20" />
                        <div className="w-5 h-5 rounded bg-white/15" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-white/35 rounded w-full" />
                        <div className="h-1.5 bg-white/20 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                </div>

                {/* Card 2: Brand Consistency */}
                <div className="md:col-span-5 bg-black rounded-[2rem] p-8 text-white overflow-hidden flex flex-col min-h-[300px]">
                  <h4 className="text-2xl font-black mb-2">
                    {locale === "ar" ? "تناسق العلامة التجارية" : "Brand Consistency"}
                  </h4>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    {locale === "ar"
                      ? "الذكاء الاصطناعي يتعلم ألوان وخطوط وأسلوب علامتك تلقائياً."
                      : "AI learns your brand colors, fonts, and style automatically."}
                  </p>
                  {/* Visual: color palette */}
                  <div className="mt-auto space-y-4">
                    <div className="flex gap-2.5">
                      {[
                        { color: "#6366f1", label: "Primary" },
                        { color: "#8b5cf6", label: "Accent" },
                        { color: "#f97316", label: "Warm" },
                        { color: "#10b981", label: "Success" },
                        { color: "#0ea5e9", label: "Info" },
                      ].map((sw) => (
                        <div key={sw.label} className="flex flex-col items-center gap-1">
                          <div className="w-9 h-9 rounded-xl shadow-lg" style={{ backgroundColor: sw.color }} />
                          <span className="text-[9px] text-neutral-500">{sw.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Font</span>
                        <span className="text-xs text-white font-semibold">Inter</span>
                      </div>
                      <div className="text-xl font-black text-white tracking-tight">Aa Bb Cc 123</div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Visual Editor */}
                <div className="md:col-span-5 bg-black rounded-[2rem] p-8 text-white overflow-hidden flex flex-col min-h-[280px]">
                  <h4 className="text-2xl font-black mb-2">
                    {locale === "ar" ? "محرر بصري" : "Visual Editor"}
                  </h4>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {locale === "ar"
                      ? "اسحب، غيّر الحجم، عدّل النصوص، وخصّص كل عنصر."
                      : "Drag, resize, edit text, swap themes, and customize every element."}
                  </p>
                  {/* Visual: editor mockup */}
                  <div className="mt-auto bg-white/5 rounded-xl border border-white/10 p-3 -mb-6">
                    <div className="flex gap-1.5 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-400/60" />
                      <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                      <div className="w-2 h-2 rounded-full bg-green-400/60" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 space-y-1.5">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={`w-full aspect-square rounded ${i === 0 ? "bg-indigo-500/40" : "bg-white/5"}`} />
                        ))}
                      </div>
                      <div className="flex-1 aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded border border-white/10 p-2 relative">
                        <div className="absolute top-2 start-2 w-16 h-5 bg-white/20 rounded border border-dashed border-indigo-400/50" />
                        <div className="absolute bottom-2 start-2 end-2 space-y-1">
                          <div className="h-1 bg-white/15 rounded w-3/4" />
                          <div className="h-1 bg-white/10 rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Multi-Platform Publishing */}
                <div className="md:col-span-7 bg-black rounded-[2rem] p-8 text-white overflow-hidden flex flex-col min-h-[280px] relative">
                  <h4 className="text-2xl font-black mb-2">
                    {locale === "ar" ? "نشر متعدد المنصات" : "Multi-Platform Publishing"}
                  </h4>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
                    {locale === "ar"
                      ? "اربط إنستغرام وفيسبوك وX وثريدز. جدول أو انشر فوراً."
                      : "Connect Instagram, Facebook, X, Threads, and more. Schedule or publish instantly."}
                  </p>
                  {/* Visual: platform icons */}
                  <div className="mt-auto grid grid-cols-3 sm:grid-cols-6 gap-3 pt-4">
                    {[
                      { name: "Instagram", color: "from-purple-500 to-pink-500" },
                      { name: "Facebook", color: "from-blue-500 to-blue-600" },
                      { name: "X", color: "from-neutral-600 to-neutral-800" },
                      { name: "Threads", color: "from-neutral-700 to-black" },
                      { name: "TikTok", color: "from-neutral-800 to-black" },
                      { name: "LinkedIn", color: "from-blue-600 to-blue-700" },
                    ].map((p) => (
                      <div key={p.name} className="flex flex-col items-center gap-1.5">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.color} shadow-lg flex items-center justify-center`}>
                          <div className="w-5 h-5 rounded bg-white/25" />
                        </div>
                        <span className="text-[10px] text-neutral-500">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-blue-500/5 blur-3xl rounded-full" />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
                >
                  {locale === "ar" ? "ابدأ مجاناً" : "Get started free"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white font-bold text-lg rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all"
                >
                  {locale === "ar" ? "تعرّف على الأسعار" : "View pricing"}
                </Link>
              </div>
            </div>
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
