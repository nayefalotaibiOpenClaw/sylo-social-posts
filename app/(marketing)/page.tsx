"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import {
  ChevronRight,
  LogOut
} from "lucide-react";

// Real post components
import AnalyticsPost from "@/features/posts/templates/sylo/AnalyticsPost";
import LoyaltyPost from "@/features/posts/templates/sylo/LoyaltyPost";
import InventoryPost from "@/features/posts/templates/sylo/InventoryPost";
import CloudPOSPost from "@/features/posts/templates/sylo/CloudPOSPost";
import DashboardOverviewPost from "@/features/posts/templates/sylo/DashboardOverviewPost";
import OnlineOrderingPost from "@/features/posts/templates/sylo/OnlineOrderingPost";
import SmartMenuPost from "@/features/posts/templates/sylo/SmartMenuPost";
import SeasonsHeroPost from "@/features/posts/templates/seasons/SeasonsHeroPost";
import SeasonsGiftPost from "@/features/posts/templates/seasons/SeasonsGiftPost";
import SeasonsRomancePost from "@/features/posts/templates/seasons/SeasonsRomancePost";
import SeasonsSubscriptionPost from "@/features/posts/templates/seasons/SeasonsSubscriptionPost";

// Contexts for rendering posts
import { type Theme, defaultTheme, ThemeCtx } from "@/contexts/ThemeContext";
import { EditContext, AspectRatioContext } from "@/contexts/EditContext";

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

const tabs: { key: TabKey; label: string }[] = [
  { key: "social", label: "Social Media" },
  { key: "appstore", label: "App Store" },
  { key: "ads", label: "Ads" },
];

// Social media posts — 1:1 square
const socialPosts = [
  { component: <AnalyticsPost />, theme: themes[0], label: "Analytics" },
  { component: <SeasonsHeroPost />, theme: themes[3], label: "Brand Hero" },
  { component: <LoyaltyPost />, theme: themes[1], label: "Loyalty" },
  { component: <CloudPOSPost />, theme: themes[4], label: "Cloud POS" },
  { component: <InventoryPost />, theme: themes[2], label: "Inventory" },
  { component: <SeasonsGiftPost />, theme: themes[5], label: "Gift Sets" },
  { component: <SmartMenuPost />, theme: themes[6], label: "Smart Menu" },
  { component: <OnlineOrderingPost />, theme: themes[1], label: "Online Store" },
  { component: <DashboardOverviewPost />, theme: themes[0], label: "Dashboard" },
  { component: <SeasonsSubscriptionPost />, theme: themes[4], label: "Subscriptions" },
  { component: <SeasonsRomancePost />, theme: themes[3], label: "Romance" },
];

// App Store Preview — 9:16 tall
const appStorePosts = [
  { component: <OnlineOrderingPost />, theme: themes[0], label: "Online Store" },
  { component: <SmartMenuPost />, theme: themes[1], label: "Smart Menu" },
  { component: <CloudPOSPost />, theme: themes[2], label: "Cloud POS" },
  { component: <SeasonsHeroPost />, theme: themes[3], label: "Brand Hero" },
  { component: <DashboardOverviewPost />, theme: themes[4], label: "Dashboard" },
  { component: <SeasonsGiftPost />, theme: themes[5], label: "Gift Sets" },
  { component: <SeasonsRomancePost />, theme: themes[6], label: "Romance" },
  { component: <AnalyticsPost />, theme: themes[0], label: "Analytics" },
];

// Ads — 16:9 landscape
const adsPosts = [
  { component: <DashboardOverviewPost />, theme: themes[6], label: "Dashboard" },
  { component: <AnalyticsPost />, theme: themes[1], label: "Analytics" },
  { component: <LoyaltyPost />, theme: themes[0], label: "Loyalty" },
  { component: <SeasonsHeroPost />, theme: themes[4], label: "Brand Hero" },
  { component: <InventoryPost />, theme: themes[3], label: "Inventory" },
  { component: <CloudPOSPost />, theme: themes[5], label: "Cloud POS" },
  { component: <SeasonsSubscriptionPost />, theme: themes[2], label: "Subscriptions" },
  { component: <SmartMenuPost />, theme: themes[1], label: "Smart Menu" },
];

const tabPostsMap: Record<TabKey, { posts: typeof socialPosts; aspect: string; size: number; minW: string }> = {
  social:   { posts: socialPosts,   aspect: "1:1",  size: 280, minW: "280px" },
  appstore: { posts: appStorePosts, aspect: "9:16", size: 280, minW: "168px" },
  ads:      { posts: adsPosts,      aspect: "16:9", size: 280, minW: "336px" },
};

// Collage posts for bottom CTA section
const collagePostItems = [
  { component: <LoyaltyPost />, theme: themes[2] },
  { component: <AnalyticsPost />, theme: themes[1] },
  { component: <SeasonsGiftPost />, theme: themes[4] },
  { component: <InventoryPost />, theme: themes[0] },
  { component: <CloudPOSPost />, theme: themes[6] },
  { component: <SeasonsHeroPost />, theme: themes[3] },
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
    <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center p-2">
      {children}
    </div>
  </motion.div>
);

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<TabKey>("social");
  const currentTab = tabPostsMap[activeTab];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-slate-200/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-[10px]">oD</span>
              </div>
              <span className="font-black text-lg tracking-tight">oDesigns</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
              <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
              {!isLoading && !isAuthenticated && (
                <Link href="/login" className="hover:text-slate-900">Log in</Link>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="w-24 h-9 bg-slate-100 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/workspaces"
                className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-sm hover:scale-105 transition-all active:scale-95"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                {user?.image ? (
                  <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-bold text-xs">{user?.name?.[0] ?? "?"}</span>
                  </div>
                )}
                <button
                  onClick={() => void signOut()}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-sm hover:scale-105 transition-all active:scale-95"
            >
              Join for free
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 relative">
        {/* Floating Logos Background */}
        <FloatingLogo top="20%" left="15%" delay={0}><div className="w-full h-full bg-indigo-500 rounded-md" /></FloatingLogo>
        <FloatingLogo top="35%" left="8%" delay={1}><div className="w-full h-full bg-pink-500 rounded-md" /></FloatingLogo>
        <FloatingLogo top="15%" right="10%" delay={0.5}><div className="w-full h-full bg-yellow-500 rounded-md" /></FloatingLogo>
        <FloatingLogo top="40%" right="12%" delay={1.5}><div className="w-full h-full bg-emerald-500 rounded-md" /></FloatingLogo>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8"
          >
            Find design patterns <br /> in seconds.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-16"
          >
            <div className="bg-slate-100 p-1 rounded-full flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                    activeTab === tab.key
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
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
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Feature Section 1: Automation */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">Time saving automation</h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-20 leading-relaxed">
            Automatically scale screenshots in all required sizes on App Store & Google Play,
            saving 10+ hours and ensuring consistency.
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

      {/* Feature Section 2: Dark Cards (Screenshot 5 Style) */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Global Reach Card */}
          <div className="bg-black rounded-[2.5rem] p-12 text-white flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-4xl font-black mb-6 leading-tight">Global reach with localization on <br /> App Store & Google Play</h3>
              <p className="text-slate-400 text-lg mb-12">Localize your screenshots to different languages and regions, to effectively market your app to a global audience</p>
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
                <h3 className="text-4xl font-black mb-6 leading-tight">Personalize app's identity using Font styling</h3>
                <p className="text-slate-400 text-lg mb-12">Transform your app's look using AppLaunchpad's screenshot creator font styles like font family, font size, alignment.</p>
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
                           Bangers <ChevronRight className="w-3 h-3" />
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

      {/* Library Grid: Popular Collections (Screenshot 9 Style) */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-4xl font-black mb-12">Popular Collections</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Behavioral UX Patterns", "Tactile", "(Empty) State of the art",
                "Animation", "Tracking", "Personalisation"
              ].map((title, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="aspect-[1.5] bg-slate-50 rounded-[2rem] p-6 border border-slate-100 group-hover:bg-slate-100 transition-colors relative overflow-hidden">
                      <div className="grid grid-cols-2 gap-4 h-full">
                         <div className="h-full bg-white rounded-xl shadow-sm border border-slate-100" />
                         <div className="h-full bg-white rounded-xl shadow-sm border border-slate-100 mt-8" />
                      </div>
                   </div>
                   <div className="mt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden" />
                      <span className="font-bold text-slate-700">{title}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust / Action Split View */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.05)] border border-slate-100">
           <div className="flex-1 bg-slate-900 p-12 md:p-20 text-white flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8">
                <span className="text-slate-900 font-black text-2xl">S</span>
              </div>
              <h2 className="text-5xl font-black mb-12">Welcome back</h2>

              <div className="w-full max-w-sm space-y-4">
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
                   <div className="w-5 h-5 bg-blue-500 rounded" />
                   Continue with Google
                </button>
                <button className="w-full h-14 border border-white/20 rounded-xl font-bold hover:bg-white/5 transition-all">
                   See other options
                </button>
                <div className="py-4 flex items-center gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                   <div className="flex-1 h-px bg-white/10" /> or <div className="flex-1 h-px bg-white/10" />
                </div>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-black text-lg">
                   Continue
                </button>
              </div>
           </div>

           <div className="flex-1 bg-slate-50 relative overflow-hidden hidden md:block min-h-[500px]">
              {/* Real post collage */}
              <div className="absolute inset-0 grid grid-cols-2 gap-3 p-6 rotate-12 scale-125 origin-center">
                {collagePostItems.map((item, i) => (
                  <div key={i} className="aspect-square">
                    <PostPreview theme={item.theme} size={220}>{item.component}</PostPreview>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-l from-slate-50 via-transparent to-transparent" />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold text-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px]">oD</span>
            </div>
            <span className="font-black">oDesigns Studio.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900">Twitter</a>
            <a href="#" className="hover:text-slate-900">LinkedIn</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
          </div>
          <p>© 2026 oDesigns Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
