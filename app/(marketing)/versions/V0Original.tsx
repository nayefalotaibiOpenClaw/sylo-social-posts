"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import FloatingNav from "@/app/components/FloatingNav";
import HeroDemo from "./HeroDemo";

// ... existing code ...

// Real post components - Sylo
import AnalyticsPost from "@/features/posts/templates/sylo/AnalyticsPost";
import LoyaltyPost from "@/features/posts/templates/sylo/LoyaltyPost";
import InventoryPost from "@/features/posts/templates/sylo/InventoryPost";
import CloudPOSPost from "@/features/posts/templates/sylo/CloudPOSPost";
import DashboardOverviewPost from "@/features/posts/templates/sylo/DashboardOverviewPost";
import OnlineOrderingPost from "@/features/posts/templates/sylo/OnlineOrderingPost";
import SmartMenuPost from "@/features/posts/templates/sylo/SmartMenuPost";
// Real post components - Seasons
import SeasonsHeroPost from "@/features/posts/templates/seasons/SeasonsHeroPost";
import SeasonsGiftPost from "@/features/posts/templates/seasons/SeasonsGiftPost";
import SeasonsRomancePost from "@/features/posts/templates/seasons/SeasonsRomancePost";
import SeasonsSubscriptionPost from "@/features/posts/templates/seasons/SeasonsSubscriptionPost";
// Showcase posts
import SaaSDashboardPost from "@/features/posts/templates/showcase/SaaSDashboardPost";
import FoodDeliveryPost from "@/features/posts/templates/showcase/FoodDeliveryPost";
import LuxuryFashionPost from "@/features/posts/templates/showcase/LuxuryFashionPost";
import FitnessAppPost from "@/features/posts/templates/showcase/FitnessAppPost";
import TravelBookingPost from "@/features/posts/templates/showcase/TravelBookingPost";
import FintechBankingPost from "@/features/posts/templates/showcase/FintechBankingPost";
import RealEstatePost from "@/features/posts/templates/showcase/RealEstatePost";
import BeautyCosmeticsPost from "@/features/posts/templates/showcase/BeautyCosmeticsPost";

// Contexts for rendering posts
import { type Theme, defaultTheme, ThemeCtx } from "@/contexts/ThemeContext";
import { EditContext, AspectRatioContext } from "@/contexts/EditContext";

// i18n
import { useLocale } from "@/lib/i18n/context";

const themes: Theme[] = [
  defaultTheme, // Green
  { // Blue
    primary: "#1e3a5f", primaryLight: "#e8f0fe", primaryDark: "#0d1f33",
    accent: "#3b82f6", accentLight: "#60a5fa", accentLime: "#67e8f9",
    accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#2a4a6f", font: "var(--font-cairo), 'Cairo', sans-serif",
  },
  { // Purple
    primary: "#3b1f6e", primaryLight: "#f3e8ff", primaryDark: "#1e0f3a",
    accent: "#8b5cf6", accentLight: "#a78bfa", accentLime: "#c4b5fd",
    accentGold: "#fbbf24", accentOrange: "#f97316", border: "#4c2d8a", font: "var(--font-cairo), 'Cairo', sans-serif",
  },
  { // Rose
    primary: "#881337", primaryLight: "#fff1f2", primaryDark: "#4c0519",
    accent: "#e11d48", accentLight: "#fb7185", accentLime: "#fda4af",
    accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#9f1239", font: "var(--font-cairo), 'Cairo', sans-serif",
  },
  { // Teal
    primary: "#134e4a", primaryLight: "#f0fdfa", primaryDark: "#042f2e",
    accent: "#14b8a6", accentLight: "#2dd4bf", accentLime: "#5eead4",
    accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#1a5c57", font: "var(--font-cairo), 'Cairo', sans-serif",
  },
  { // Amber/warm
    primary: "#78350f", primaryLight: "#fffbeb", primaryDark: "#451a03",
    accent: "#d97706", accentLight: "#fbbf24", accentLime: "#fde68a",
    accentGold: "#fbbf24", accentOrange: "#f97316", border: "#92400e", font: "var(--font-cairo), 'Cairo', sans-serif",
  },
  { // Navy
    primary: "#1e1b4b", primaryLight: "#eef2ff", primaryDark: "#0c0a26",
    accent: "#6366f1", accentLight: "#818cf8", accentLime: "#a5b4fc",
    accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#312e81", font: "var(--font-cairo), 'Cairo', sans-serif",
  },
];

import type { AspectRatioType } from "@/contexts/EditContext";

// Aspect ratio configs: inner render size and outer display dimensions
const ratioConfigs: Record<string, { innerW: number; innerH: number; displayW: (s: number) => number; displayH: (s: number) => number; ratio: AspectRatioType }> = {
  "1:1":  { innerW: 600, innerH: 600, displayW: s => s, displayH: s => s, ratio: "1:1" },
  "9:16": { innerW: 600, innerH: 1067, displayW: s => s * 0.6, displayH: s => s * 1.067, ratio: "9:16" },
  "16:9": { innerW: 1067, innerH: 600, displayW: s => s * 1.2, displayH: s => s * 0.675, ratio: "16:9" },
};

const PostPreview = ({ children, theme, size = 300, aspect = "1:1" }: { children: React.ReactNode; theme: Theme; size?: number; aspect?: string }) => {
  const cfg = ratioConfigs[aspect] || ratioConfigs["1:1"];
  const w = cfg.displayW(size);
  const h = cfg.displayH(size);
  const scale = w / cfg.innerW;

  return (
    <EditContext.Provider value={false}>
      <AspectRatioContext.Provider value={cfg.ratio}>
        <ThemeCtx.Provider value={theme}>
          <div
            dir="ltr"
            className="rounded-2xl overflow-hidden shadow-xl pointer-events-none select-none"
            style={{ width: w, height: h }}
          >
            <div style={{ width: cfg.innerW, height: cfg.innerH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              {children}
            </div>
          </div>
        </ThemeCtx.Provider>
      </AspectRatioContext.Provider>
    </EditContext.Provider>
  );
};

type TabKey = "social" | "appstore" | "ads";

// Social media posts — 1:1 square (showcase + existing mix)
const socialPosts = [
  { component: <SaaSDashboardPost />, theme: themes[6], label: "SaaS Dashboard" },
  { component: <FoodDeliveryPost />, theme: themes[0], label: "Food Delivery" },
  { component: <LuxuryFashionPost />, theme: themes[2], label: "Luxury Fashion" },
  { component: <FitnessAppPost />, theme: themes[4], label: "Fitness App" },
  { component: <TravelBookingPost />, theme: themes[1], label: "Travel Booking" },
  { component: <FintechBankingPost />, theme: themes[0], label: "Fintech" },
  { component: <RealEstatePost />, theme: themes[4], label: "Real Estate" },
  { component: <BeautyCosmeticsPost />, theme: themes[3], label: "Beauty" },
  { component: <AnalyticsPost />, theme: themes[0], label: "Analytics" },
  { component: <LoyaltyPost />, theme: themes[1], label: "Loyalty" },
  { component: <InventoryPost />, theme: themes[2], label: "Inventory" },
];

// App Store Preview — 9:16 tall
const appStorePosts = [
  { component: <FoodDeliveryPost />, theme: themes[0], label: "Food Delivery" },
  { component: <SaaSDashboardPost />, theme: themes[1], label: "SaaS Dashboard" },
  { component: <FitnessAppPost />, theme: themes[4], label: "Fitness App" },
  { component: <FintechBankingPost />, theme: themes[6], label: "Fintech" },
  { component: <LuxuryFashionPost />, theme: themes[2], label: "Luxury Fashion" },
  { component: <BeautyCosmeticsPost />, theme: themes[3], label: "Beauty" },
  { component: <TravelBookingPost />, theme: themes[5], label: "Travel Booking" },
  { component: <RealEstatePost />, theme: themes[0], label: "Real Estate" },
];

// Ads — 16:9 landscape
const adsPosts = [
  { component: <LuxuryFashionPost />, theme: themes[2], label: "Luxury Fashion" },
  { component: <SaaSDashboardPost />, theme: themes[6], label: "SaaS Dashboard" },
  { component: <TravelBookingPost />, theme: themes[1], label: "Travel Booking" },
  { component: <FoodDeliveryPost />, theme: themes[0], label: "Food Delivery" },
  { component: <FitnessAppPost />, theme: themes[4], label: "Fitness App" },
  { component: <RealEstatePost />, theme: themes[5], label: "Real Estate" },
  { component: <BeautyCosmeticsPost />, theme: themes[3], label: "Beauty" },
  { component: <FintechBankingPost />, theme: themes[0], label: "Fintech" },
];

const tabPostsMap: Record<TabKey, { posts: typeof socialPosts; aspect: string; size: number; minW: string }> = {
  social:   { posts: socialPosts,   aspect: "1:1",  size: 280, minW: "280px" },
  appstore: { posts: appStorePosts, aspect: "9:16", size: 280, minW: "168px" },
  ads:      { posts: adsPosts,      aspect: "16:9", size: 280, minW: "336px" },
};

// Collage posts for bottom CTA section
const collagePostItems = [
  { component: <SaaSDashboardPost />, theme: themes[6] },
  { component: <FoodDeliveryPost />, theme: themes[0] },
  { component: <LuxuryFashionPost />, theme: themes[2] },
  { component: <FitnessAppPost />, theme: themes[4] },
  { component: <TravelBookingPost />, theme: themes[1] },
  { component: <BeautyCosmeticsPost />, theme: themes[3] },
];

const FloatingLogo = ({ delay, children, top, left, right }: { delay: number; children: React.ReactNode; top?: string; left?: string; right?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.1, 1],
      y: [0, -10, 0]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute z-0 hidden md:flex items-center justify-center"
    style={{ top, left, right }}
  >
    <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-slate-100 dark:border-neutral-700 flex items-center justify-center p-2">
      {children}
    </div>
  </motion.div>
);

export default function V0Original() {
  const [activeTab, setActiveTab] = useState<TabKey>("social");
  const currentTab = tabPostsMap[activeTab];
  const { t } = useLocale();

  const tabs: { key: TabKey; label: string }[] = [
    { key: "social", label: t("landing.tabSocial") },
    { key: "appstore", label: t("landing.tabAppStore") },
    { key: "ads", label: t("landing.tabAds") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-100 overflow-x-hidden">
      <FloatingNav activePage="home" />

      {/* Hero Demo Section — Interactive Demo with Floating Icons */}
      <section className="pt-36 pb-16 px-6 relative">
        {/* Floating Logo Animations */}
        <FloatingLogo top="12%" left="12%" delay={0}><div className="w-full h-full bg-indigo-300 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="30%" left="6%" delay={1}><div className="w-full h-full bg-pink-500 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="10%" right="8%" delay={0.5}><div className="w-full h-full bg-yellow-400 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="35%" right="10%" delay={1.5}><div className="w-full h-full bg-emerald-500 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="55%" left="10%" delay={0.8}><div className="w-full h-full bg-orange-400 rounded-lg" /></FloatingLogo>
        <FloatingLogo top="50%" right="14%" delay={2}><div className="w-full h-full bg-sky-400 rounded-lg" /></FloatingLogo>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-5"
          >
            Your brand, everywhere.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-lg sm:text-xl text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto mb-12"
          >
            AI-powered content for social media, app stores, and advertising
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <HeroDemo />
          </motion.div>
        </div>
      </section>

      {/* Original Hero Section — Tabs + Post Carousel */}
      <section className="pt-20 pb-20 px-6 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8"
          >
            {t("landing.heroTitle")} <br /> {t("landing.heroTitle2")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-16"
          >
            <div className="bg-slate-100 dark:bg-neutral-800 p-1 rounded-full flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                    activeTab === tab.key
                      ? "bg-white dark:bg-neutral-700 shadow-sm text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Real Posts Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full overflow-hidden mt-12"
          >
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "-15%" }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex gap-6 px-6"
            >
              {currentTab.posts.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  style={{ minWidth: currentTab.minW }}
                >
                  <PostPreview theme={item.theme} size={currentTab.size} aspect={currentTab.aspect}>{item.component}</PostPreview>
                  <div className="mt-4 flex items-center justify-between px-2">
                    <span className="font-bold text-sm">{item.label}</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-neutral-700" />
                      <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-neutral-700" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Feature Section 1: Automation */}
      <section className="py-32 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">{t("landing.automationTitle")}</h2>
          <p className="text-xl text-slate-500 dark:text-neutral-400 max-w-3xl mx-auto mb-20 leading-relaxed">
            {t("landing.automationDesc")}
          </p>

          <div className="relative flex items-end justify-center gap-4 md:gap-8 pt-20">
             {/* Device Stack Mockup */}
             <div className="w-[30%] aspect-video bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl relative z-0 scale-125">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20" />
             </div>
             <div className="w-[15%] aspect-[9/19] bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl absolute -bottom-10 left-[20%] z-10 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20" />
             </div>
             <div className="w-[18%] aspect-[9/19] bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl absolute -bottom-20 right-[25%] z-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-500/30" />
             </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Dark Cards */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Global Reach Card */}
          <div className="bg-black rounded-[2.5rem] p-12 text-white flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-4xl font-black mb-6 leading-tight">{t("landing.globalTitle")}</h3>
              <p className="text-slate-400 text-lg mb-12">{t("landing.globalDesc")}</p>
            </div>
            <div className="flex gap-4 items-end mt-12 -mb-20 overflow-hidden">
               {[
                 { color: "bg-emerald-500", text: "English" },
                 { color: "bg-purple-600", text: "Arabic" },
                 { color: "bg-yellow-400", text: "French" },
                 { color: "bg-orange-600", text: "German" },
               ].map((lang, i) => (
                 <div key={i} className={`flex-1 aspect-[9/16] ${lang.color} rounded-t-2xl p-4 flex flex-col justify-between`}>
                    <div className="w-full h-1 bg-white/30 rounded" />
                    <div className="space-y-2">
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-2/3 h-2 bg-white/20 rounded" />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Identity/Font Card */}
          <div className="bg-black rounded-[2.5rem] p-12 text-white flex flex-col justify-between overflow-hidden">
             <div>
                <h3 className="text-4xl font-black mb-6 leading-tight">{t("landing.fontTitle")}</h3>
                <p className="text-slate-400 text-lg mb-12">{t("landing.fontDesc")}</p>
             </div>
             <div className="bg-white rounded-2xl p-6 -mb-24 mt-12">
                <div className="flex gap-6 h-full">
                   <div className="w-1/3 space-y-4 text-slate-900">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Font Size</span>
                        <div className="h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold">150</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Font Family</span>
                        <div className="h-10 border border-slate-200 rounded-lg px-3 flex items-center justify-between text-xs font-bold">
                           Bangers <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                        </div>
                      </div>
                   </div>
                   <div className="flex-1 bg-blue-600 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <h4 className="text-3xl font-black tracking-wider leading-none">LOG YOUR EXERCISES AND MONITOR PROGRESS</h4>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Library Grid: Popular Collections */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-4xl font-black mb-12">{t("landing.collectionsTitle")}</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Behavioral UX Patterns", "Tactile", "(Empty) State of the art",
                "Animation", "Tracking", "Personalisation"
              ].map((title, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="aspect-[1.5] bg-slate-50 dark:bg-neutral-900 rounded-[2rem] p-6 border border-slate-100 dark:border-neutral-800 group-hover:bg-slate-100 dark:group-hover:bg-neutral-800 transition-colors relative overflow-hidden">
                      <div className="grid grid-cols-2 gap-4 h-full">
                         <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-700" />
                         <div className="h-full bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-100 dark:border-neutral-700 mt-8" />
                      </div>
                   </div>
                   <div className="mt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-700 overflow-hidden" />
                      <span className="font-bold text-slate-700 dark:text-neutral-300">{title}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust / Action Split View */}
      <section className="py-24 bg-white dark:bg-[#0a0a0a] px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-neutral-800">
           <div className="flex-1 bg-slate-900 p-12 md:p-20 text-white flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8">
                <span className="text-slate-900 font-black text-2xl">S</span>
              </div>
              <h2 className="text-5xl font-black mb-12">{t("landing.welcomeBack")}</h2>

              <div className="w-full max-w-sm space-y-4">
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
                   <div className="w-5 h-5 bg-blue-500 rounded" />
                   {t("landing.continueGoogle")}
                </button>
                <button className="w-full h-14 border border-white/20 rounded-xl font-bold hover:bg-white/5 transition-all">
                   {t("landing.seeOther")}
                </button>
                <div className="py-4 flex items-center gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                   <div className="flex-1 h-px bg-white/10" /> {t("landing.or")} <div className="flex-1 h-px bg-white/10" />
                </div>
                <input
                  type="email"
                  placeholder={t("landing.enterEmail")}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-black text-lg">
                   {t("landing.continue")}
                </button>
              </div>
           </div>

           <div className="flex-1 bg-slate-50 dark:bg-neutral-900 relative overflow-hidden hidden md:block min-h-[500px]">
              {/* Real post collage */}
              <div className="absolute inset-0 grid grid-cols-2 gap-3 p-6 rotate-12 scale-125 origin-center">
                {collagePostItems.map((item, i) => (
                  <div key={i} className="aspect-square">
                    <PostPreview theme={item.theme} size={220}>{item.component}</PostPreview>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-l from-slate-50 dark:from-[#0a0a0a] via-transparent to-transparent" />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold text-sm">
          <div />
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">{t("landing.twitter")}</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white">{t("landing.linkedin")}</a>
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-white">{t("landing.termsOfService")}</a>
            <a href="/privacy" className="hover:text-slate-900 dark:hover:text-white">{t("landing.privacyPolicy")}</a>
          </div>
          <p>{t("landing.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
