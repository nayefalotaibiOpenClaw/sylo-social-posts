"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { ArrowRight } from "lucide-react";

export default function FoodSplitHalfPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";
  const isWide = ratio === "16:9" || ratio === "4:3";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className={`absolute ${isWide ? "top-0 left-0 w-1/2 h-full" : "top-0 left-0 w-full h-1/2"}`} style={{ background: `linear-gradient(135deg, ${t.accentOrange}, ${t.accentGold})` }} />
      <div className={`absolute ${isWide ? "top-0 right-0 w-1/2 h-full" : "bottom-0 left-0 w-full h-1/2"}`} style={{ backgroundColor: t.primaryDark }} />
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        {/* Top/Left half — image area */}
        <div className={`${isWide ? "" : "flex-1"} min-h-0 flex items-center justify-center`}>
          <div className={`${isTall ? "w-48 h-48" : "w-36 h-36"} rounded-2xl shadow-2xl flex items-center justify-center`} style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
            <div className="text-center">
              <EditableText as="span" className="text-5xl block">🍕</EditableText>
              <EditableText as="span" className="text-xs font-black uppercase tracking-widest mt-2 block" style={{ color: "white" }}>Fresh</EditableText>
            </div>
          </div>
        </div>
        {/* Bottom/Right half — text area */}
        <div className={`${isWide ? "" : "flex-1"} min-h-0 flex flex-col justify-center`}>
          <DraggableWrapper id="content">
            <EditableText as="p" className="text-xs font-black uppercase tracking-[0.3em] mb-2" style={{ color: t.accentGold }}>Weekly Special</EditableText>
            <EditableText as="h2" className={`${isTall ? "text-4xl" : "text-3xl"} font-black leading-tight`} style={{ color: t.primaryLight }}>Super Delicious</EditableText>
            <EditableText as="h2" className={`${isTall ? "text-4xl" : "text-3xl"} font-black leading-tight`} style={{ color: t.accentOrange }}>Pizza</EditableText>
            <EditableText as="p" className="text-sm font-bold mt-3 opacity-60" style={{ color: t.primaryLight }}>&quot;Eat what you love&quot;</EditableText>
          </DraggableWrapper>
          <DraggableWrapper id="cta" className="mt-4 flex items-center gap-2">
            <div className="px-5 py-2 rounded-full flex items-center gap-2" style={{ backgroundColor: t.accentOrange }}>
              <EditableText as="span" className="text-xs font-black text-white uppercase">Order</EditableText>
              <ArrowRight size={14} className="text-white" />
            </div>
            <EditableText as="span" className="text-sm font-bold" style={{ color: t.primaryLight }}>098-6545-888</EditableText>
          </DraggableWrapper>
        </div>
      </div>
    </div>
  );
}
