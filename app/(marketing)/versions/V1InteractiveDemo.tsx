"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Globe,
  Scissors,
  Sparkles,
  Send,
  Search,
  Palette,
  Type,
  Image,
  Layers,
  Languages,
  Shield,
  MonitorSmartphone,
  FlaskConical,
  ArrowRight,
  Lock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import FloatingNav from "@/app/components/FloatingNav";
import { PostPreview, themes, socialPosts, appStorePosts, adsPosts } from "./shared";

/* ─── Demo Step Types ─── */
type DemoStep = "idle" | "scanning" | "extracting" | "generating";

/* ─── Scanning Animation ─── */
function ScanningVisual() {
  return (
    <div className="relative w-full h-48 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
      {/* Scanning lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          initial={{ top: "0%", opacity: 0 }}
          animate={{
            top: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      {/* Pulse ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-full border-2 border-blue-400"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full border-2 border-blue-400"
          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
        />
        <div className="absolute">
          <Search className="w-6 h-6 text-blue-500" />
        </div>
      </div>
      {/* Skeleton lines */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        {[0.8, 0.6, 0.45].map((w, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full bg-slate-200"
            initial={{ width: 0 }}
            animate={{ width: `${w * 100}%` }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Brand Extraction Animation ─── */
function ExtractingVisual() {
  const swatches = [
    { color: "#1B4332", label: "Primary" },
    { color: "#2D6A4F", label: "Secondary" },
    { color: "#52B788", label: "Accent" },
    { color: "#D8F3DC", label: "Light" },
    { color: "#081C15", label: "Dark" },
  ];

  return (
    <div className="relative w-full h-48 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden p-6">
      {/* Color swatches */}
      <div className="flex gap-3 mb-5">
        {swatches.map((s, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
          >
            <motion.div
              className="w-10 h-10 rounded-xl shadow-md"
              style={{ backgroundColor: s.color }}
              whileHover={{ scale: 1.1 }}
            />
            <span className="text-[10px] text-slate-400 font-medium">{s.label}</span>
          </motion.div>
        ))}
      </div>
      {/* Font detection */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Type className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500">Font detected:</span>
        <span className="text-sm font-semibold text-slate-800">Inter, SF Pro</span>
      </motion.div>
      {/* Logo detection */}
      <motion.div
        className="flex items-center gap-3 mt-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Image className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500">Logo:</span>
        <span className="text-sm font-semibold text-slate-800">Detected & extracted</span>
        <motion.div
          className="w-4 h-4 rounded-full bg-green-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
        />
      </motion.div>
    </div>
  );
}

/* ─── Post Generation Animation ─── */
function GeneratingVisual() {
  const previewPosts = socialPosts.slice(0, 4);

  return (
    <div className="relative w-full h-48 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden">
      <div className="flex gap-4 p-4 overflow-hidden">
        {previewPosts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.3 }}
            className="shrink-0"
          >
            <PostPreview theme={post.theme} size={140} aspect="1:1">
              {post.component}
            </PostPreview>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Interactive Demo Hero ─── */
function InteractiveDemo() {
  const [demoStep, setDemoStep] = useState<DemoStep>("idle");
  const [inputValue, setInputValue] = useState("");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startDemo = useCallback(() => {
    if (demoStep !== "idle") return;
    clearTimers();

    setDemoStep("scanning");
    const t1 = setTimeout(() => setDemoStep("extracting"), 2000);
    const t2 = setTimeout(() => setDemoStep("generating"), 4000);
    const t3 = setTimeout(() => setDemoStep("idle"), 8000);
    timersRef.current = [t1, t2, t3];
  }, [demoStep, clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const stepLabels: Record<DemoStep, string> = {
    idle: "Paste any website URL to see the magic",
    scanning: "Scanning website...",
    extracting: "Extracting brand identity...",
    generating: "Generating scroll-stopping posts...",
  };

  const stepIndex = demoStep === "scanning" ? 0 : demoStep === "extracting" ? 1 : demoStep === "generating" ? 2 : -1;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* URL Input */}
      <div className="relative mb-6">
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 focus-within:border-slate-400 focus-within:shadow-xl focus-within:shadow-slate-200/80">
          <div className="flex items-center gap-2 pl-5 pr-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <Lock className="w-3 h-3 text-slate-300 ml-2" />
          </div>
          <input
            type="text"
            placeholder="yourwebsite.com"
            className="flex-1 py-4 px-2 text-base text-slate-800 placeholder-slate-300 outline-none bg-transparent"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={startDemo}
          />
          <button
            onClick={startDemo}
            className="m-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      {demoStep !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4 justify-center">
            {["Scan", "Extract", "Generate"].map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && (
                  <div className={`h-px w-8 transition-colors duration-300 ${i <= stepIndex ? "bg-slate-900" : "bg-slate-200"}`} />
                )}
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                      i <= stepIndex
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                    animate={i === stepIndex ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    {i + 1}
                  </motion.div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${i <= stepIndex ? "text-slate-800" : "text-slate-300"}`}>
                    {label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mb-4">{stepLabels[demoStep]}</p>

          {/* Step Visuals */}
          <AnimatePresence mode="wait">
            {demoStep === "scanning" && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <ScanningVisual />
              </motion.div>
            )}
            {demoStep === "extracting" && (
              <motion.div key="extract" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <ExtractingVisual />
              </motion.div>
            )}
            {demoStep === "generating" && (
              <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <GeneratingVisual />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Use Case Tabs ─── */
type TabKey = "social" | "appstore" | "ads";

const tabConfig: { key: TabKey; label: string; aspect: string; posts: typeof socialPosts }[] = [
  { key: "social", label: "Social Media", aspect: "1:1", posts: socialPosts },
  { key: "appstore", label: "App Store", aspect: "9:16", posts: appStorePosts },
  { key: "ads", label: "Ads", aspect: "16:9", posts: adsPosts },
];

function UseCaseTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("social");
  const active = tabConfig.find((t) => t.key === activeTab)!;

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex justify-center gap-2 mb-10">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Post row */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="overflow-x-auto pb-4 scrollbar-hide"
        >
          <div className="flex gap-5 px-4 w-max">
            {active.posts.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="shrink-0"
              >
                <PostPreview theme={post.theme} size={280} aspect={active.aspect}>
                  {post.component}
                </PostPreview>
                <p className="text-center text-xs text-slate-400 mt-3 font-medium">{post.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── How It Works ─── */
const steps = [
  {
    icon: Globe,
    title: "Paste your URL",
    description: "Drop any website link and we instantly start analyzing your brand.",
  },
  {
    icon: Scissors,
    title: "AI removes backgrounds",
    description: "Product images are cleaned up and made content-ready automatically.",
  },
  {
    icon: Sparkles,
    title: "Generate content",
    description: "AI creates on-brand posts, ads, and previews tailored to your audience.",
  },
  {
    icon: Send,
    title: "Publish everywhere",
    description: "Export or push to Instagram, TikTok, Facebook, X, and app stores.",
  },
];

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 relative">
      {/* Connecting line (desktop) */}
      <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-slate-200" />

      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={i}
            className="relative flex flex-col items-center text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            {/* Step number + icon */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Icon className="w-8 h-8 text-slate-700" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1">{step.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">{step.description}</p>

            {/* Arrow between steps (desktop) */}
            {i < steps.length - 1 && (
              <div className="hidden md:flex absolute right-0 top-10 translate-x-1/2 -translate-y-1/2 z-10">
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Features Grid ─── */
const features = [
  {
    icon: Sparkles,
    title: "AI Copywriting",
    description: "Generate compelling, on-brand copy in seconds. No more writer's block.",
  },
  {
    icon: Languages,
    title: "50+ Languages",
    description: "Localize content for global audiences with one click.",
  },
  {
    icon: Palette,
    title: "Brand Consistency",
    description: "Auto-extract colors, fonts, and visual identity from your website.",
  },
  {
    icon: MonitorSmartphone,
    title: "Multi-Channel Publish",
    description: "Push to Instagram, TikTok, Facebook, X, and more simultaneously.",
  },
  {
    icon: FlaskConical,
    title: "A/B Testing",
    description: "Generate dozens of content variants instantly to find what converts.",
  },
  {
    icon: Layers,
    title: "App Store Ready",
    description: "All screenshot sizes for iOS App Store and Google Play listings.",
  },
];

function FeaturesGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {features.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={i}
            className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors duration-300">
              <Icon className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-1.5">{feature.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Section Wrapper ─── */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-6 md:px-10 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

function SectionHeader({ label, title, subtitle }: { label?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-14">
      {label && (
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

/* ─── Main Component ─── */
export default function V1InteractiveDemo() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <FloatingNav activePage="home" />

      {/* ── Hero ── */}
      <Section className="pt-36 pb-20 md:pt-44 md:pb-28">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-xs font-bold uppercase tracking-widest text-slate-500 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            AI-Powered Content Studio
          </motion.span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
            Your URL{" "}
            <span className="text-slate-300">&rarr;</span>{" "}
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-400 bg-clip-text text-transparent">
              Scroll-Stopping Content
            </span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
            Paste any website URL. Our AI extracts your brand, generates on-brand content, and publishes everywhere — in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <InteractiveDemo />
        </motion.div>
      </Section>

      {/* ── Use Case Tabs ── */}
      <Section className="py-20 md:py-28" id="use-cases">
        <SectionHeader
          label="What you can create"
          title="Content for every channel"
          subtitle="Social posts, app store screenshots, and performance ads — all from one URL."
        />
        <UseCaseTabs />
      </Section>

      {/* ── How It Works ── */}
      <Section className="py-20 md:py-28 bg-slate-50/50" id="how-it-works">
        <SectionHeader
          label="How it works"
          title="Four steps to content that converts"
          subtitle="From URL to published content in under a minute."
        />
        <HowItWorks />
      </Section>

      {/* ── Features Grid ── */}
      <Section className="py-20 md:py-28" id="features">
        <SectionHeader
          label="Features"
          title="Everything you need to create at scale"
          subtitle="Built for teams who need quality content, fast."
        />
        <FeaturesGrid />
      </Section>

      {/* ── CTA Section ── */}
      <Section className="py-20 md:py-28">
        <motion.div
          className="rounded-3xl bg-slate-900 text-white text-center px-8 py-16 md:py-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Start creating for free
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            No credit card required. Paste your URL and see the magic in seconds.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl text-base font-bold hover:bg-slate-100 transition-colors active:scale-95 transition-transform"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </Section>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-10 py-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-400">&copy; 2026 oDesigns Studio.</span>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              Twitter
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
