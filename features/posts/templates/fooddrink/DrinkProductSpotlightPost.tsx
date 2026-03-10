"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function DrinkProductSpotlightPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accentGold, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.accentGold} 0%, ${t.accentOrange} 100%)` }} />
      <div className="relative z-10 w-full h-full flex flex-col items-center overflow-hidden" style={{ padding: isTall ? "2.5rem 2rem" : "1.5rem" }}>
        <DraggableWrapper id="title" className="text-center">
          <EditableText as="h2" className={`${isTall ? "text-2xl" : "text-xl"} font-black uppercase tracking-[0.2em]`} style={{ color: t.primaryDark }}>Premium Collection</EditableText>
          <EditableText as="p" className="text-sm mt-1 uppercase tracking-widest opacity-70" style={{ color: t.primaryDark }}>Artisan Chocolate Box</EditableText>
        </DraggableWrapper>
        {/* Product image */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          <img
            src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&q=80"
            alt="Chocolate box"
            className={`${isTall ? "w-64 h-64" : "w-48 h-48"} object-contain drop-shadow-2xl`}
          />
        </div>
        <DraggableWrapper id="footer-info" className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-[1px] opacity-30" style={{ backgroundColor: t.primaryDark }} />
            <EditableText as="span" className="text-xs font-black uppercase tracking-widest" style={{ color: t.primaryDark }}>Haven</EditableText>
            <div className="w-8 h-[1px] opacity-30" style={{ backgroundColor: t.primaryDark }} />
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
