"use client";

import React, { useState, useCallback, useRef } from "react";
import { X, Check, Download, Loader2, Settings, Palette } from "lucide-react";
import { downloadPostsAsZip } from "@/lib/export/download";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "@/contexts/EditContext";
import { useTheme, useSetTheme, Theme, defaultTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import PostWrapper from "@/app/components/PostWrapper";

import {
  FoodHeroBurgerPost,
  FoodPriceTagPost,
  DrinkProductSpotlightPost,
  FoodNewArrivalPost,
  DrinkSunburstPost,
  FoodSaleBannerPost,
  DrinkLifestylePost,
  FoodMenuCardPost,
  DrinkColorMatchPost,
  FoodDeliveryPost,
  DrinkMinimalQuotePost,
  FoodCinematicDarkPost,
  FoodFlavorQuestionPost,
  DrinkPolaroidPost,
  FoodSplitHalfPost,
  DrinkBoldTypographyPost,
  FoodMoodBoardPost,
} from "@/features/posts/templates/fooddrink";

const FOOD_DRINK_POSTS = [
  { id: "food-hero-burger", filename: "food-hero-burger", component: FoodHeroBurgerPost },
  { id: "food-price-tag", filename: "food-price-tag", component: FoodPriceTagPost },
  { id: "drink-product-spotlight", filename: "drink-product-spotlight", component: DrinkProductSpotlightPost },
  { id: "food-new-arrival", filename: "food-new-arrival", component: FoodNewArrivalPost },
  { id: "drink-sunburst", filename: "drink-sunburst", component: DrinkSunburstPost },
  { id: "food-sale-banner", filename: "food-sale-banner", component: FoodSaleBannerPost },
  { id: "drink-lifestyle", filename: "drink-lifestyle", component: DrinkLifestylePost },
  { id: "food-menu-card", filename: "food-menu-card", component: FoodMenuCardPost },
  { id: "drink-color-match", filename: "drink-color-match", component: DrinkColorMatchPost },
  { id: "food-delivery", filename: "food-delivery", component: FoodDeliveryPost },
  { id: "drink-minimal-quote", filename: "drink-minimal-quote", component: DrinkMinimalQuotePost },
  { id: "food-cinematic-dark", filename: "food-cinematic-dark", component: FoodCinematicDarkPost },
  { id: "food-flavor-question", filename: "food-flavor-question", component: FoodFlavorQuestionPost },
  { id: "drink-polaroid", filename: "drink-polaroid", component: DrinkPolaroidPost },
  { id: "food-split-half", filename: "food-split-half", component: FoodSplitHalfPost },
  { id: "drink-bold-typography", filename: "drink-bold-typography", component: DrinkBoldTypographyPost },
  { id: "food-mood-board", filename: "food-mood-board", component: FoodMoodBoardPost },
];

const FOOD_PALETTE: Theme = {
  ...defaultTheme,
  primary: "#1a1a2e",
  primaryLight: "#f5f0eb",
  primaryDark: "#0f0f1a",
  accent: "#e2725b",
  accentLight: "#f4a193",
  accentLime: "#ff6b35",
  accentGold: "#d4a574",
  accentOrange: "#ff8c42",
  border: "#2d2d44",
  font: "var(--font-cairo), 'Cairo', sans-serif",
};

export default function FoodDrinkPage() {
  const [editMode, setEditMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeTab, setActiveTab] = useState<"settings" | "theme" | null>("theme");
  const currentTheme = useTheme();
  const setTheme = useSetTheme();

  React.useEffect(() => {
    setTheme(FOOD_PALETTE);
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedPosts.length === 0) return;
    setDownloading(true);
    try {
      await downloadPostsAsZip(
        postRefs.current,
        selectedPosts,
        selectedPosts.map((id) => ({ id })),
        `food-drink-posts-${selectedPosts.length}.zip`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }, [selectedPosts]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="w-[72px] bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-neutral-800 flex flex-col items-center py-4 gap-1 shrink-0">
        <Link href="/" className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-black text-sm">F</span>
        </Link>
        <button onClick={() => setActiveTab("settings")} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab === "settings" ? "bg-orange-600 text-white" : "text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"}`}>
          <Settings size={20} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
        <button onClick={() => setActiveTab("theme")} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab === "theme" ? "bg-orange-600 text-white" : "text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"}`}>
          <Palette size={20} />
          <span className="text-[10px] font-medium">Theme</span>
        </button>
      </div>

      {activeTab && (
        <div className="w-[280px] bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-neutral-800 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"><X size={16} /></button>
          </div>
          {activeTab === "settings" && (
            <div className="space-y-6">
              <button onClick={() => setEditMode(!editMode)} className={`w-full py-2.5 rounded-lg text-xs font-bold border ${editMode ? "bg-orange-100 text-orange-900 border-orange-200" : "bg-gray-50 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-800"}`}>
                {editMode ? "Disable Editing" : "Enable Editing"}
              </button>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                <div className="flex gap-1">
                  {(["1:1", "9:16", "3:4", "4:3", "16:9"] as const).map((ratio) => (
                    <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${aspectRatio === ratio ? "bg-orange-600 text-white" : "bg-gray-50 dark:bg-neutral-900 text-gray-400"}`}>
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "theme" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 dark:text-neutral-400">Theme for Food & Drink posts.</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(currentTheme).filter(([k]) => k !== "font").map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800">
                    <input type="color" value={value as string} onChange={(e) => setTheme({ ...currentTheme, [key]: e.target.value })} className="w-6 h-6 rounded cursor-pointer" />
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 truncate">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-orange-950 dark:text-white">Food & Drink</h1>
            <p className="text-orange-900/60 dark:text-orange-300/60 font-bold mt-2">Layout templates for restaurants, cafes, and beverage brands</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSelectedPosts(FOOD_DRINK_POSTS.map((p) => p.id))} className="px-4 py-2 text-orange-900 dark:text-orange-300 font-bold text-sm">Select All</button>
            <button onClick={handleDownloadSelected} disabled={downloading || selectedPosts.length === 0} className="px-6 py-3 bg-orange-600 text-white dark:bg-white dark:text-black rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95">
              {downloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              Download {selectedPosts.length > 0 ? `(${selectedPosts.length})` : ""}
            </button>
          </div>
        </div>

        <EditContext.Provider value={editMode}>
        <AspectRatioContext.Provider value={aspectRatio}>
        <SelectedIdContext.Provider value={selectedId}>
        <SetSelectedIdContext.Provider value={handleSetSelectedId}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FOOD_DRINK_POSTS.map(({ id, component: Post }) => {
              const isSelected = selectedPosts.includes(id);
              return (
                <div key={id} ref={(el) => { if (el) postRefs.current.set(id, el); }} onClick={() => setSelectedPosts((prev) => isSelected ? prev.filter((p) => p !== id) : [...prev, id])} className={`relative cursor-pointer transition-all ${isSelected ? "ring-4 ring-orange-500 rounded-2xl p-1 bg-orange-50 scale-[0.98]" : "hover:scale-[1.01]"}`}>
                  <PostWrapper aspectRatio={aspectRatio} filename={id}>
                    <Post />
                  </PostWrapper>
                  {isSelected && <div className="absolute top-4 right-4 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-50"><Check size={20} /></div>}
                </div>
              );
            })}
          </div>
        </SetSelectedIdContext.Provider>
        </SelectedIdContext.Provider>
        </AspectRatioContext.Provider>
        </EditContext.Provider>
      </main>
    </div>
  );
}
