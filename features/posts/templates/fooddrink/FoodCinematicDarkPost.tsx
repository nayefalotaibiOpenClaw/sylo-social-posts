"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function FoodCinematicDarkPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: "#0a0a0a", fontFamily: t.font }}>
      {/* Dramatic food close-up */}
      <img src="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Heavy dark overlay */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)` }} />
      <div className="relative z-10 w-full h-full flex flex-col justify-end items-center overflow-hidden" style={{ padding: isTall ? "3rem 2rem" : "2rem" }}>
        <DraggableWrapper id="brand" className="text-center mb-auto pt-8">
          <EditableText as="p" className="text-xs font-bold uppercase tracking-[0.5em]" style={{ color: t.accentGold }}>Artisan Bakery</EditableText>
        </DraggableWrapper>
        <DraggableWrapper id="main" className="text-center mb-4">
          <EditableText as="h2" className={`${isTall ? "text-6xl" : "text-5xl"} font-black tracking-[0.05em]`} style={{ color: t.primaryLight, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>Sweet Temptation</EditableText>
        </DraggableWrapper>
        <DraggableWrapper id="tagline" className="text-center">
          <div className="w-16 h-[1px] mx-auto mb-3" style={{ backgroundColor: t.accentGold + "60" }} />
          <EditableText as="p" className="text-sm font-bold" style={{ color: t.primaryLight + "80" }}>Handcrafted with love — since 2018</EditableText>
        </DraggableWrapper>
      </div>
    </div>
  );
}
