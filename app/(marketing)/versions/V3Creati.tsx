"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3x3,
  Megaphone,
  Smartphone,
  ArrowUpRight,
  Sparkles,
  Layers,
  Send,
  Link2,
  Camera,
  Palette,
  Search,
  Type,
  Image,
  Scissors,
  Lock,
  Check,
} from "lucide-react";
import Link from "next/link";
import FloatingNav from "@/app/components/FloatingNav";
import { PostPreview, themes, socialPosts, appStorePosts, adsPosts } from "./shared";

/* ─── Creation Tabs ─── */
const creationTabs = [
  { id: "social", label: "Social Posts", icon: Grid3x3 },
  { id: "ads", label: "Ad Creatives", icon: Megaphone },
  { id: "appstore", label: "App Store", icon: Smartphone },
] as const;

type CreationTab = (typeof creationTabs)[number]["id"];

/* ─── Demo Step Types ─── */
type DemoStep = "idle" | "scanning" | "extracting" | "generating" | "publishing" | "done";

/* ─── Scanning Visual ─── */
function ScanningVisual() {
  return (
    <div className="relative w-full h-52 rounded-xl bg-neutral-800/50 border border-neutral-700/30 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
          initial={{ top: "0%", opacity: 0 }}
          animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, ease: "linear" }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-indigo-400/40"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full border-2 border-indigo-400/40"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
        />
        <div className="absolute">
          <Search className="w-6 h-6 text-indigo-400" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        {[0.8, 0.6, 0.45].map((w, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full bg-neutral-700/50"
            initial={{ width: 0 }}
            animate={{ width: `${w * 100}%` }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Extracting Visual ─── */
function ExtractingVisual() {
  const swatches = [
    { color: "#1B4332", label: "Primary" },
    { color: "#2D6A4F", label: "Secondary" },
    { color: "#52B788", label: "Accent" },
    { color: "#D8F3DC", label: "Light" },
    { color: "#081C15", label: "Dark" },
  ];

  return (
    <div className="relative w-full h-52 rounded-xl bg-neutral-800/50 border border-neutral-700/30 overflow-hidden p-5">
      <div className="flex gap-3 mb-4">
        {swatches.map((s, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <div className="w-10 h-10 rounded-xl shadow-md" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-neutral-500">{s.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <Type className="w-4 h-4 text-neutral-500" />
        <span className="text-sm text-neutral-400">Brand font:</span>
        <span className="text-sm font-semibold text-white">Inter, SF Pro</span>
      </motion.div>
      <motion.div className="flex items-center gap-3 mt-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
        <Image className="w-4 h-4 text-neutral-500" />
        <span className="text-sm text-neutral-400">Products found:</span>
        <span className="text-sm font-semibold text-white">12 items</span>
        <motion.div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring" }}>
          <Check className="w-2.5 h-2.5 text-white" />
        </motion.div>
      </motion.div>
      <motion.div className="flex items-center gap-3 mt-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
        <Scissors className="w-4 h-4 text-neutral-500" />
        <span className="text-sm text-neutral-400">Backgrounds:</span>
        <span className="text-sm font-semibold text-white">Removed & cleaned</span>
      </motion.div>
    </div>
  );
}

/* ─── Generating Visual — mix of 1:1 posts and 9:16 stories ─── */
function GeneratingVisual() {
  const items = [
    { post: socialPosts[0], aspect: "1:1" as const, size: 130 },
    { post: socialPosts[2], aspect: "9:16" as const, size: 130 },
    { post: socialPosts[1], aspect: "1:1" as const, size: 130 },
    { post: socialPosts[4], aspect: "9:16" as const, size: 130 },
  ];

  return (
    <div className="relative w-full h-52 rounded-xl bg-neutral-800/50 border border-neutral-700/30 overflow-hidden">
      <div className="flex gap-3 p-4 items-end overflow-hidden">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.25 }}
            className="shrink-0"
          >
            <PostPreview theme={item.post.theme} size={item.size} aspect={item.aspect}>
              {item.post.component}
            </PostPreview>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Publishing Visual — Channel logos ─── */
function PublishingVisual() {
  const channels = [
    { name: "Instagram", color: "from-purple-500 to-pink-500" },
    { name: "TikTok", color: "from-neutral-100 to-neutral-300" },
    { name: "Facebook", color: "from-blue-500 to-blue-600" },
    { name: "X", color: "from-neutral-100 to-neutral-300" },
    { name: "App Store", color: "from-blue-400 to-blue-500" },
    { name: "Google Play", color: "from-green-400 to-emerald-500" },
  ];

  return (
    <div className="relative w-full h-52 rounded-xl bg-neutral-800/50 border border-neutral-700/30 overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="grid grid-cols-3 gap-4 mb-4">
        {channels.map((ch, i) => (
          <motion.div
            key={ch.name}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.12, type: "spring" }}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center shadow-lg`}>
              <span className="text-[10px] font-black text-white mix-blend-difference">{ch.name.slice(0, 2).toUpperCase()}</span>
            </div>
            <span className="text-[10px] text-neutral-500">{ch.name}</span>
          </motion.div>
        ))}
      </div>
      {/* Animated connection lines from center */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
        />
        <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap">Publishing...</span>
      </motion.div>
    </div>
  );
}

/* ─── Done Visual — Posts + Stories mix ─── */
function DoneVisual() {
  const items = [
    { post: socialPosts[0], aspect: "1:1" as const, label: "Post" },
    { post: socialPosts[3], aspect: "9:16" as const, label: "Story" },
    { post: socialPosts[1], aspect: "1:1" as const, label: "Post" },
    { post: socialPosts[5], aspect: "9:16" as const, label: "Story" },
    { post: socialPosts[2], aspect: "1:1" as const, label: "Post" },
    { post: socialPosts[6], aspect: "9:16" as const, label: "Story" },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
        <span className="text-sm font-semibold text-emerald-400">6 posts published to all channels</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide items-end">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="shrink-0"
          >
            <PostPreview theme={item.post.theme} size={140} aspect={item.aspect}>
              {item.post.component}
            </PostPreview>
            <p className="text-neutral-500 text-[10px] text-center mt-1.5">{item.post.label} · {item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Demo URLs ─── */
const demoUrls: { url: string; tab: CreationTab }[] = [
  { url: "brewhaus-coffee.com", tab: "social" },
  { url: "fitpulse-app.io", tab: "appstore" },
  { url: "luxe-fashion.store", tab: "ads" },
  { url: "summit-saas.com", tab: "social" },
  { url: "fresh-eats.delivery", tab: "ads" },
];

/* ─── Interactive Creation Card ─── */
function CreationCard() {
  const [activeTab, setActiveTab] = useState<CreationTab>("social");
  const [demoStep, setDemoStep] = useState<DemoStep>("idle");
  const [inputValue, setInputValue] = useState("");
  const [urlIndex, setUrlIndex] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (typingRef.current) { clearTimeout(typingRef.current); typingRef.current = null; }
  }, []);

  // Auto-type a URL then start demo
  const typeAndStart = useCallback((idx: number) => {
    const demo = demoUrls[idx % demoUrls.length];
    setActiveTab(demo.tab);
    setInputValue("");
    setDemoStep("idle");

    let charIndex = 0;
    const typeNext = () => {
      if (charIndex <= demo.url.length) {
        setInputValue(demo.url.slice(0, charIndex));
        charIndex++;
        typingRef.current = setTimeout(typeNext, 60 + Math.random() * 40);
      } else {
        // Pause then start scanning
        typingRef.current = setTimeout(() => {
          setDemoStep("scanning");
          const t1 = setTimeout(() => setDemoStep("extracting"), 2200);
          const t2 = setTimeout(() => setDemoStep("generating"), 4400);
          const t3 = setTimeout(() => setDemoStep("publishing"), 6600);
          const t4 = setTimeout(() => setDemoStep("done"), 9000);
          // After done, wait then cycle to next URL
          const t5 = setTimeout(() => {
            setUrlIndex((prev) => prev + 1);
          }, 13000);
          timersRef.current = [t1, t2, t3, t4, t5];
        }, 500);
      }
    };
    typingRef.current = setTimeout(typeNext, 800);
  }, []);

  // Start auto-demo on mount and cycle
  useEffect(() => {
    typeAndStart(urlIndex);
    return () => clearTimers();
  }, [urlIndex, typeAndStart, clearTimers]);

  const resetDemo = useCallback(() => {
    clearTimers();
    setUrlIndex((prev) => prev + 1);
  }, [clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const stepIndex = demoStep === "scanning" ? 0 : demoStep === "extracting" ? 1 : demoStep === "generating" ? 2 : demoStep === "publishing" ? 3 : demoStep === "done" ? 4 : -1;
  const stepLabels = ["Scan", "Extract", "Generate", "Publish"];

  return (
    <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
      {/* Tab bar — hidden during demo */}

      <div className="p-5">
        {/* Idle/typing state — Auto-typing URL */}
        {demoStep === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Browser-style URL bar with auto-typing */}
            <div className="flex items-center bg-neutral-800/60 border border-neutral-700/50 rounded-xl overflow-hidden mb-4">
              <div className="flex items-center gap-2 pl-4 pr-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400/70" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/70" />
                  <div className="w-2 h-2 rounded-full bg-green-400/70" />
                </div>
                <Lock className="w-3 h-3 text-neutral-600 ml-1" />
              </div>
              <div className="flex-1 py-3 px-2 text-sm text-white">
                {inputValue}
                <motion.span
                  className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </div>
              <div className="m-1.5 px-5 py-2 bg-white text-black rounded-lg text-sm font-bold">
                Generate
              </div>
            </div>

            {/* Option pills */}
            <div className="flex items-center gap-2">
              {[
                { label: "URL to Content", icon: Link2 },
                { label: "Product Shots", icon: Camera },
                { label: "Brand Kit", icon: Palette },
              ].map((pill) => {
                const PillIcon = pill.icon;
                return (
                  <span
                    key={pill.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 text-xs font-medium"
                  >
                    <PillIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">{pill.label}</span>
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Active demo — progress steps + visuals */}
        {demoStep !== "idle" && demoStep !== "done" && demoStep !== "publishing" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Progress steps */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {stepLabels.map((label, i) => (
                <React.Fragment key={label}>
                  {i > 0 && (
                    <div className={`h-px w-8 transition-colors duration-300 ${i <= stepIndex ? "bg-white" : "bg-neutral-700"}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                        i < stepIndex ? "bg-emerald-500 text-white" :
                        i === stepIndex ? "bg-white text-black" : "bg-neutral-800 text-neutral-500"
                      }`}
                      animate={i === stepIndex ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.6, repeat: i === stepIndex ? Infinity : 0 }}
                    >
                      {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </motion.div>
                    <span className={`text-sm font-medium transition-colors duration-300 ${i <= stepIndex ? "text-white" : "text-neutral-600"}`}>
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Step status text */}
            <p className="text-center text-sm text-neutral-400 mb-4">
              {demoStep === "scanning" && "Scanning your website & products..."}
              {demoStep === "extracting" && "Extracting brand colors, fonts & product images..."}
              {demoStep === "generating" && "Generating ads, social posts & app store previews..."}
            </p>

            {/* Step visuals */}
            <AnimatePresence mode="wait">
              {demoStep === "scanning" && (
                <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanningVisual />
                </motion.div>
              )}
              {demoStep === "extracting" && (
                <motion.div key="extract" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ExtractingVisual />
                </motion.div>
              )}
              {demoStep === "generating" && (
                <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <GeneratingVisual />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Publishing state — channel logos */}
        {demoStep === "publishing" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Progress steps */}
            <div className="flex items-center justify-center gap-3 mb-4">
              {stepLabels.map((label, i) => (
                <React.Fragment key={label}>
                  {i > 0 && (
                    <div className={`h-px w-6 transition-colors duration-300 ${i <= stepIndex ? "bg-white" : "bg-neutral-700"}`} />
                  )}
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors duration-300 ${
                        i < stepIndex ? "bg-emerald-500 text-white" :
                        i === stepIndex ? "bg-white text-black" : "bg-neutral-800 text-neutral-500"
                      }`}
                      animate={i === stepIndex ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.6, repeat: i === stepIndex ? Infinity : 0 }}
                    >
                      {i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}
                    </motion.div>
                    <span className={`text-xs font-medium transition-colors duration-300 ${i <= stepIndex ? "text-white" : "text-neutral-600"}`}>
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <p className="text-center text-sm text-neutral-400 mb-4">Publishing to all channels...</p>
            <PublishingVisual />
          </motion.div>
        )}

        {/* Done state — generated posts */}
        {demoStep === "done" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <DoneVisual />
            <div className="flex items-center justify-center mt-4 pt-4 border-t border-neutral-800">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
              >
                Start Creating — It&apos;s Free
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── Showcase Grid ─── */
const filterTabs = ["All", "Social", "App Store", "Ads"] as const;
type FilterTab = (typeof filterTabs)[number];

function getShowcasePosts(filter: FilterTab) {
  switch (filter) {
    case "Social":
      return socialPosts.slice(0, 6).map((p) => ({ ...p, aspect: "1:1" as const, size: 240 }));
    case "App Store":
      return appStorePosts.slice(0, 6).map((p) => ({ ...p, aspect: "9:16" as const, size: 220 }));
    case "Ads":
      return adsPosts.slice(0, 6).map((p) => ({ ...p, aspect: "16:9" as const, size: 240 }));
    default: {
      return [
        ...socialPosts.slice(0, 3).map((p) => ({ ...p, aspect: "1:1" as const, size: 240 })),
        ...appStorePosts.slice(0, 2).map((p) => ({ ...p, aspect: "9:16" as const, size: 220 })),
        ...adsPosts.slice(0, 3).map((p) => ({ ...p, aspect: "16:9" as const, size: 240 })),
      ];
    }
  }
}

/* ─── Features ─── */
const features = [
  {
    icon: Sparkles,
    title: "Brand Extraction",
    description: "Paste any URL. We extract colors, fonts, products, and identity automatically.",
  },
  {
    icon: Layers,
    title: "Bulk Generation",
    description: "Generate dozens of content variants from your product catalog in seconds.",
  },
  {
    icon: Send,
    title: "Multi-Channel Publish",
    description: "Push to Instagram, TikTok, Facebook, X, App Store, Google Play — one click.",
  },
];

/* ─── Main Component ─── */
export default function V3Creati() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const posts = getShowcasePosts(activeFilter);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <FloatingNav activePage="home" variant="dark" />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight"
          >
            <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              Your brand, everywhere.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto"
          >
            AI-powered content for social media, app stores, and advertising
          </motion.p>

          {/* Interactive Creation Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <CreationCard />
          </motion.div>
        </div>
      </section>

      {/* Showcase Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Made with oDesigns</h2>
          <div className="flex items-center gap-2 mt-6">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  activeFilter === tab ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={`${activeFilter}-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group"
            >
              <div className="flex justify-center">
                <PostPreview theme={post.theme} size={post.size} aspect={post.aspect}>
                  {post.component}
                </PostPreview>
              </div>
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-sm text-neutral-400 font-medium">{post.label}</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Row */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-neutral-300" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Start creating for free</h2>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block px-8 py-3.5 rounded-full bg-white text-black font-bold text-base hover:scale-105 active:scale-95 transition-transform"
            >
              Get Started
            </Link>
          </div>
          <p className="mt-4 text-neutral-500 text-sm">No credit card required</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <span className="font-black text-white text-base">oDesigns</span>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-300 transition-colors">LinkedIn</a>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-500">
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy</Link>
            <span>&copy; {new Date().getFullYear()} oDesigns</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
