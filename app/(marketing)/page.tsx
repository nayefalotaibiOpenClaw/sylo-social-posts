"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Eye, Archive, Pen, Clapperboard } from "lucide-react";
import V1Improved from "./versions/V1Improved";
import V1InteractiveDemo from "./versions/V1InteractiveDemo";
import V2Lovart from "./versions/V2Lovart";
import V3Creati from "./versions/V3Creati";
import V0Original from "./versions/V0Original";

type VersionKey = "lovart" | "creati" | "improved" | "demo" | "original";

const versions: { key: VersionKey; label: string; description: string; icon: React.ElementType }[] = [
  { key: "lovart", label: "Elegant", description: "Lovart-style rotating headlines + editor mockup", icon: Pen },
  { key: "creati", label: "Studio", description: "Creati-style dark theme + creation interface", icon: Clapperboard },
  { key: "improved", label: "Improved", description: "Product-focused interactive demo", icon: Sparkles },
  { key: "demo", label: "Demo V1", description: "Original interactive demo", icon: Eye },
  { key: "original", label: "Original", description: "Original landing page before redesign", icon: Archive },
];

export default function LandingPage() {
  const [version, setVersion] = useState<VersionKey>("lovart");

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={version}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {version === "lovart" && <V2Lovart />}
          {version === "creati" && <V3Creati />}
          {version === "improved" && <V1Improved />}
          {version === "demo" && <V1InteractiveDemo />}
          {version === "original" && <V0Original />}
        </motion.div>
      </AnimatePresence>

      {/* Version Selector — Fixed Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 p-1.5 flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 hidden lg:block">
            Compare
          </span>
          {versions.map((v) => {
            const Icon = v.icon;
            const isActive = version === v.key;
            return (
              <button
                key={v.key}
                onClick={() => {
                  setVersion(v.key);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  {v.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
