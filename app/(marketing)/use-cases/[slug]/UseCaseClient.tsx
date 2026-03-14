"use client";

import React from "react";
import Link from "@/lib/i18n/LocaleLink";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FloatingNav from "@/app/components/FloatingNav";
import { useLocale } from "@/lib/i18n/context";
import {
  ArrowRight,
  Sparkles,
  Share2,
  Palette,
  CalendarDays,
  Home,
  TrendingUp,
  UtensilsCrossed,
  Tag,
  MapPin,
  Image,
  Layers,
  ShoppingBag,
  Building2,
} from "lucide-react";

// Post components for showcase
import SaaSDashboardPost from "@/features/posts/templates/showcase/SaaSDashboardPost";
import FoodDeliveryPost from "@/features/posts/templates/showcase/FoodDeliveryPost";
import RealEstatePost from "@/features/posts/templates/showcase/RealEstatePost";
import SeasonsHeroPost from "@/features/posts/templates/seasons/SeasonsHeroPost";
import SeasonsGiftPost from "@/features/posts/templates/seasons/SeasonsGiftPost";
import SeasonsSubscriptionPost from "@/features/posts/templates/seasons/SeasonsSubscriptionPost";
import AnalyticsPost from "@/features/posts/templates/sylo/AnalyticsPost";
import LoyaltyPost from "@/features/posts/templates/sylo/LoyaltyPost";
import CloudPOSPost from "@/features/posts/templates/sylo/CloudPOSPost";

import { type Theme, defaultTheme, ThemeCtx } from "@/contexts/ThemeContext";
import { EditContext, AspectRatioContext } from "@/contexts/EditContext";

const themes: Theme[] = [
  defaultTheme,
  {
    primary: "#1e3a5f", primaryLight: "#e8f0fe", primaryDark: "#0d1f33",
    accent: "#3b82f6", accentLight: "#60a5fa", accentLime: "#67e8f9",
    accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#2a4a6f",
    font: "var(--font-cairo), 'Cairo', sans-serif",
  },
  {
    primary: "#3b1f6e", primaryLight: "#f3e8ff", primaryDark: "#1e0f3a",
    accent: "#8b5cf6", accentLight: "#a78bfa", accentLime: "#c4b5fd",
    accentGold: "#fbbf24", accentOrange: "#f97316", border: "#4c2d8a",
    font: "var(--font-cairo), 'Cairo', sans-serif",
  },
  {
    primary: "#881337", primaryLight: "#fff1f2", primaryDark: "#4c0519",
    accent: "#e11d48", accentLight: "#fb7185", accentLime: "#fda4af",
    accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#9f1239",
    font: "var(--font-cairo), 'Cairo', sans-serif",
  },
];

const PostPreview = ({
  children,
  theme,
  size = 280,
}: {
  children: React.ReactNode;
  theme: Theme;
  size?: number;
}) => {
  const scale = size / 600;
  return (
    <EditContext.Provider value={false}>
      <AspectRatioContext.Provider value="1:1">
        <ThemeCtx.Provider value={theme}>
          <div
            dir="ltr"
            className="rounded-2xl overflow-hidden shadow-xl pointer-events-none select-none"
            style={{ width: size, height: size }}
          >
            <div
              style={{
                width: 600,
                height: 600,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {children}
            </div>
          </div>
        </ThemeCtx.Provider>
      </AspectRatioContext.Provider>
    </EditContext.Provider>
  );
};

const showcasePosts = [
  { component: <SaaSDashboardPost />, theme: themes[1], label: "SaaS" },
  { component: <FoodDeliveryPost />, theme: themes[0], label: "Food" },
  { component: <RealEstatePost />, theme: themes[2], label: "Real Estate" },
  { component: <SeasonsHeroPost />, theme: themes[3], label: "Seasons" },
  { component: <SeasonsGiftPost />, theme: themes[0], label: "Gift" },
  { component: <SeasonsSubscriptionPost />, theme: themes[1], label: "Subscription" },
  { component: <AnalyticsPost />, theme: themes[0], label: "Analytics" },
  { component: <LoyaltyPost />, theme: themes[2], label: "Loyalty" },
  { component: <CloudPOSPost />, theme: themes[1], label: "Cloud POS" },
];

const iconMap: Record<string, React.ElementType> = {
  Sparkles, Share2, Palette, CalendarDays, Home, TrendingUp,
  UtensilsCrossed, Tag, MapPin, Image, Layers, ShoppingBag, Building2,
};

export default function UseCaseClient({ slug }: { slug: string }) {
  const { dir, t, locale } = useLocale();
  const dbLanguage = locale === "ar" ? "ar" as const : "en" as const;
  const useCase = useQuery(api.blogs.getBySlugAndType, {
    slug,
    type: "use-case",
    language: dbLanguage,
  });

  if (useCase === undefined) {
    // Loading
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!useCase) return null;

  // Extract sections by type
  const painPoints = (useCase.sections || []).filter(s => s.sectionType === "painPoint");
  const features = (useCase.sections || []).filter(s => s.sectionType === "feature");

  return (
    <div
      dir={dir}
      className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans overflow-x-hidden"
    >
      <FloatingNav />

      {/* Hero with floating posts */}
      <section className="pt-36 pb-20 px-6 relative">
        {/* Floating post previews behind hero text */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 0.15, y: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute top-20 -left-10 hidden lg:block"
          >
            <PostPreview theme={themes[0]} size={200}>
              <SeasonsHeroPost />
            </PostPreview>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 0.15, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute top-32 -right-10 hidden lg:block"
          >
            <PostPreview theme={themes[2]} size={180}>
              <AnalyticsPost />
            </PostPreview>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 0.1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="absolute bottom-10 left-[8%] hidden lg:block"
          >
            <PostPreview theme={themes[1]} size={160}>
              <CloudPOSPost />
            </PostPreview>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 text-xs font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-full mb-6 uppercase tracking-wider"
          >
            {t("useCases.useCase")}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6"
          >
            {useCase.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12"
          >
            {useCase.heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors text-lg"
            >
              {t("useCases.getStartedFree")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors text-lg"
            >
              {t("useCases.viewPricing")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Scrolling post carousel */}
      <section className="py-12 overflow-hidden">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 px-6"
        >
          {[...showcasePosts, ...showcasePosts].map((item, i) => (
            <div key={i} style={{ minWidth: 280 }}>
              <PostPreview theme={item.theme} size={280}>
                {item.component}
              </PostPreview>
              <div className="mt-4 flex items-center justify-between px-2">
                <span className="font-bold text-sm">{item.label}</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-neutral-700" />
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-neutral-700" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Pain Points — Dark cards like landing page */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black text-center mb-20"
          >
            {t("useCases.builtForWorkflow")}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {painPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black rounded-[2rem] p-10 text-white flex flex-col"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-black">{i + 1}</span>
                </div>
                <h3 className="text-2xl font-black mb-4 leading-tight">
                  {point.title}
                </h3>
                <p className="text-slate-400 leading-relaxed flex-1">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Split layout with post preview */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Feature list */}
            <div className="flex-1 space-y-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black leading-tight"
              >
                {t("useCases.everythingYouNeed")}
              </motion.h2>
              <p className="text-slate-500 dark:text-neutral-400 text-lg max-w-lg">
                {t("useCases.everythingYouNeedDesc")}
              </p>
              {features.map((feature, i) => {
                const Icon = iconMap[feature.icon || ""] || Sparkles;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-5 p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white dark:text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Post collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4 rotate-3">
                <div className="space-y-4">
                  <PostPreview theme={themes[0]} size={240}>
                    <FoodDeliveryPost />
                  </PostPreview>
                  <PostPreview theme={themes[2]} size={240}>
                    <LoyaltyPost />
                  </PostPreview>
                </div>
                <div className="space-y-4 mt-10">
                  <PostPreview theme={themes[1]} size={240}>
                    <SeasonsGiftPost />
                  </PostPreview>
                  <PostPreview theme={themes[3]} size={240}>
                    <SaaSDashboardPost />
                  </PostPreview>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA — Full width dark section */}
      <section className="py-32 px-6 bg-black text-white relative overflow-hidden">
        {/* Background post grid */}
        <div className="absolute inset-0 grid grid-cols-4 gap-4 p-8 opacity-[0.06] pointer-events-none">
          {showcasePosts.slice(0, 8).map((item, i) => (
            <div key={i} className="aspect-square">
              <PostPreview theme={item.theme} size={300}>
                {item.component}
              </PostPreview>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-10 h-10 mx-auto mb-8" />
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              {useCase.ctaTitle}
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto">
              {useCase.ctaSubtitle}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-slate-900 font-bold rounded-xl hover:bg-neutral-200 transition-colors text-lg"
            >
              {t("useCases.startCreatingFree")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Other Use Cases */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-6 text-center">
            {t("useCases.otherUseCases")}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { slug: "small-business-owners", label: "Small Businesses" },
              { slug: "real-estate-agents", label: "Real Estate" },
              { slug: "restaurants-and-cafes", label: "Restaurants" },
              { slug: "freelance-designers", label: "Freelancers" },
              { slug: "ecommerce-brands", label: "E-Commerce" },
              { slug: "marketing-agencies", label: "Agencies" },
            ]
              .filter((uc) => uc.slug !== slug)
              .map((uc) => (
                <Link
                  key={uc.slug}
                  href={`/use-cases/${uc.slug}`}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  {uc.label}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
          <p>&copy; {new Date().getFullYear()} {t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
