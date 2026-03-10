"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function DrinkColorMatchPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      {/* Close-up chocolate texture background */}
      <img src="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ padding: isTall ? "2.5rem 2rem" : "2rem 1.5rem" }}>
        <div className="flex-1" />
        <DraggableWrapper id="brand" className="text-center">
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black tracking-[0.15em]`} style={{ color: t.primaryLight, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>HAVEN</EditableText>
          <EditableText as="p" className="text-xs font-bold uppercase tracking-[0.4em] mt-1" style={{ color: t.accentGold }}>Artisan Chocolatier</EditableText>
        </DraggableWrapper>
        <div className="flex-1" />
        <DraggableWrapper id="tagline" className="text-center">
          <div className="w-16 h-[1px] mx-auto mb-4" style={{ backgroundColor: t.accentGold + "40" }} />
          <EditableText as="p" className="text-xs font-bold uppercase tracking-[0.5em]" style={{ color: t.primaryLight + "90" }}>Kuwait</EditableText>
        </DraggableWrapper>
      </div>
    </div>
  );
}
