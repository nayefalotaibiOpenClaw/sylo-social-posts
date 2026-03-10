"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function DrinkBoldTypographyPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accentLight, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.accentLight} 0%, ${t.primaryLight} 100%)` }} />
      {/* Sunburst from center */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        background: `repeating-conic-gradient(from 0deg, transparent 0deg 8deg, ${t.accent} 8deg 9deg)`,
      }} />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ padding: isTall ? "2.5rem 1.5rem" : "2rem 1.5rem" }}>
        <DraggableWrapper id="top" className="text-center">
          <EditableText as="p" className="text-lg font-black uppercase tracking-wider" style={{ color: t.primary }}>Do You Know</EditableText>
          <EditableText as="p" className="text-lg font-black uppercase tracking-wider" style={{ color: t.primary }}>What&apos;s Inside?</EditableText>
        </DraggableWrapper>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <DraggableWrapper id="brand-name" className="text-center">
            <EditableText as="h2" className={`${isTall ? "text-8xl" : "text-7xl"} font-black italic`} style={{ color: t.primaryDark }}>Flash</EditableText>
          </DraggableWrapper>
        </div>
        <DraggableWrapper id="bottom" className="text-center">
          <EditableText as="p" className="text-sm font-bold uppercase tracking-[0.3em]" style={{ color: t.accent }}>Natural Flavors Only</EditableText>
        </DraggableWrapper>
      </div>
    </div>
  );
}
