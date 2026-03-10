"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function DrinkLifestylePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      {/* Full lifestyle background */}
      <img src="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 h-2/3" style={{ background: `linear-gradient(to top, ${t.primaryDark} 10%, ${t.primaryDark}80 50%, transparent 100%)` }} />
      <div className="relative z-10 w-full h-full flex flex-col justify-end overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <DraggableWrapper id="brand" className="mb-auto pt-4">
          <EditableText as="span" className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: t.accentGold }}>Artisan Coffee</EditableText>
        </DraggableWrapper>
        <DraggableWrapper id="content" className="mb-4">
          <EditableText as="h2" className={`${isTall ? "text-4xl" : "text-3xl"} font-black leading-tight`} style={{ color: t.primaryLight }}>Start your morning</EditableText>
          <EditableText as="h2" className={`${isTall ? "text-4xl" : "text-3xl"} font-black leading-tight`} style={{ color: t.accentGold }}>the right way</EditableText>
        </DraggableWrapper>
        <DraggableWrapper id="footer-line" className="flex items-center gap-3">
          <div className="w-8 h-[2px]" style={{ backgroundColor: t.accentGold }} />
          <EditableText as="span" className="text-xs font-bold uppercase tracking-widest" style={{ color: t.primaryLight }}>Handcrafted Daily</EditableText>
        </DraggableWrapper>
      </div>
    </div>
  );
}
