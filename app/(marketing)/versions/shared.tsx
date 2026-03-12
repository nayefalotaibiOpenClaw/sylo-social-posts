"use client";

import React from "react";
import { type Theme, defaultTheme, ThemeCtx } from "@/contexts/ThemeContext";
import { EditContext, AspectRatioContext } from "@/contexts/EditContext";
import type { AspectRatioType } from "@/contexts/EditContext";

// Post imports - Sylo
import AnalyticsPost from "@/features/posts/templates/sylo/AnalyticsPost";
import LoyaltyPost from "@/features/posts/templates/sylo/LoyaltyPost";
import InventoryPost from "@/features/posts/templates/sylo/InventoryPost";
// Post imports - Showcase
import SaaSDashboardPost from "@/features/posts/templates/showcase/SaaSDashboardPost";
import FoodDeliveryPost from "@/features/posts/templates/showcase/FoodDeliveryPost";
import LuxuryFashionPost from "@/features/posts/templates/showcase/LuxuryFashionPost";
import FitnessAppPost from "@/features/posts/templates/showcase/FitnessAppPost";
import TravelBookingPost from "@/features/posts/templates/showcase/TravelBookingPost";
import FintechBankingPost from "@/features/posts/templates/showcase/FintechBankingPost";
import RealEstatePost from "@/features/posts/templates/showcase/RealEstatePost";
import BeautyCosmeticsPost from "@/features/posts/templates/showcase/BeautyCosmeticsPost";

export const themes: Theme[] = [
  defaultTheme,
  { primary: "#1e3a5f", primaryLight: "#e8f0fe", primaryDark: "#0d1f33", accent: "#3b82f6", accentLight: "#60a5fa", accentLime: "#67e8f9", accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#2a4a6f", font: "var(--font-cairo), 'Cairo', sans-serif" },
  { primary: "#3b1f6e", primaryLight: "#f3e8ff", primaryDark: "#1e0f3a", accent: "#8b5cf6", accentLight: "#a78bfa", accentLime: "#c4b5fd", accentGold: "#fbbf24", accentOrange: "#f97316", border: "#4c2d8a", font: "var(--font-cairo), 'Cairo', sans-serif" },
  { primary: "#881337", primaryLight: "#fff1f2", primaryDark: "#4c0519", accent: "#e11d48", accentLight: "#fb7185", accentLime: "#fda4af", accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#9f1239", font: "var(--font-cairo), 'Cairo', sans-serif" },
  { primary: "#134e4a", primaryLight: "#f0fdfa", primaryDark: "#042f2e", accent: "#14b8a6", accentLight: "#2dd4bf", accentLime: "#5eead4", accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#1a5c57", font: "var(--font-cairo), 'Cairo', sans-serif" },
  { primary: "#78350f", primaryLight: "#fffbeb", primaryDark: "#451a03", accent: "#d97706", accentLight: "#fbbf24", accentLime: "#fde68a", accentGold: "#fbbf24", accentOrange: "#f97316", border: "#92400e", font: "var(--font-cairo), 'Cairo', sans-serif" },
  { primary: "#1e1b4b", primaryLight: "#eef2ff", primaryDark: "#0c0a26", accent: "#6366f1", accentLight: "#818cf8", accentLime: "#a5b4fc", accentGold: "#fbbf24", accentOrange: "#fb923c", border: "#312e81", font: "var(--font-cairo), 'Cairo', sans-serif" },
];

const ratioConfigs: Record<string, { innerW: number; innerH: number; displayW: (s: number) => number; displayH: (s: number) => number; ratio: AspectRatioType }> = {
  "1:1":  { innerW: 600, innerH: 600, displayW: s => s, displayH: s => s, ratio: "1:1" },
  "9:16": { innerW: 600, innerH: 1067, displayW: s => s * 0.6, displayH: s => s * 1.067, ratio: "9:16" },
  "16:9": { innerW: 1067, innerH: 600, displayW: s => s * 1.2, displayH: s => s * 0.675, ratio: "16:9" },
};

export const PostPreview = ({ children, theme, size = 300, aspect = "1:1" }: { children: React.ReactNode; theme: Theme; size?: number; aspect?: string }) => {
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

export const socialPosts = [
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

export const appStorePosts = [
  { component: <FoodDeliveryPost />, theme: themes[0], label: "Food Delivery" },
  { component: <SaaSDashboardPost />, theme: themes[1], label: "SaaS Dashboard" },
  { component: <FitnessAppPost />, theme: themes[4], label: "Fitness App" },
  { component: <FintechBankingPost />, theme: themes[6], label: "Fintech" },
  { component: <LuxuryFashionPost />, theme: themes[2], label: "Luxury Fashion" },
  { component: <BeautyCosmeticsPost />, theme: themes[3], label: "Beauty" },
  { component: <TravelBookingPost />, theme: themes[5], label: "Travel Booking" },
  { component: <RealEstatePost />, theme: themes[0], label: "Real Estate" },
];

export const adsPosts = [
  { component: <LuxuryFashionPost />, theme: themes[2], label: "Luxury Fashion" },
  { component: <SaaSDashboardPost />, theme: themes[6], label: "SaaS Dashboard" },
  { component: <TravelBookingPost />, theme: themes[1], label: "Travel Booking" },
  { component: <FoodDeliveryPost />, theme: themes[0], label: "Food Delivery" },
  { component: <FitnessAppPost />, theme: themes[4], label: "Fitness App" },
  { component: <RealEstatePost />, theme: themes[5], label: "Real Estate" },
  { component: <BeautyCosmeticsPost />, theme: themes[3], label: "Beauty" },
  { component: <FintechBankingPost />, theme: themes[0], label: "Fintech" },
];
