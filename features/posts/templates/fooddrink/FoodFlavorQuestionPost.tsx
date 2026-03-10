"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { PostHeader } from "@/app/components/shared";
import { HelpCircle } from "lucide-react";

export default function FoodFlavorQuestionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accentGold, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${t.accentGold}, ${t.accentOrange})` }} />
      {/* Decorative swirl paths */}
      <div className="absolute inset-0 opacity-[0.08]">
        <svg viewBox="0 0 540 540" className="w-full h-full" fill="none">
          <path d="M270 100 C 150 200, 390 250, 270 400 C 150 350, 390 150, 270 100" stroke={t.primaryDark} strokeWidth="3" strokeLinecap="round" />
          <path d="M200 50 C 100 180, 440 220, 340 450" stroke={t.primaryDark} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <PostHeader id="header" title="Flash" variant="light" subtitle="After Meal" />
        <DraggableWrapper id="question" className="mt-6 text-center">
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black leading-tight`} style={{ color: t.primaryDark }}>Which Flash flavor</EditableText>
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black leading-tight`} style={{ color: t.primaryDark }}>will arrive first?</EditableText>
        </DraggableWrapper>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="relative">
            <HelpCircle size={isTall ? 100 : 72} style={{ color: t.primaryDark }} strokeWidth={1.5} className="opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <EditableText as="span" className={`${isTall ? "text-4xl" : "text-3xl"} font-black`} style={{ color: t.primaryDark }}>?</EditableText>
            </div>
          </div>
        </div>
        <DraggableWrapper id="flavors" className={`grid ${isTall ? "grid-cols-1 gap-2" : "grid-cols-3 gap-2"} mb-4`}>
          {["Chamomile", "Lemon", "Ginger"].map((flavor, i) => (
            <div key={i} className="flex items-center justify-center gap-2 px-3 py-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primaryDark }} />
              <EditableText as="span" className="text-sm font-bold" style={{ color: t.primaryDark }}>{flavor}</EditableText>
            </div>
          ))}
        </DraggableWrapper>
      </div>
    </div>
  );
}
