"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function DrinkMinimalQuotePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accentLight, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.accentLight} 0%, ${t.primaryLight} 100%)` }} />
      <div className="relative z-10 w-full h-full flex flex-col items-center overflow-hidden" style={{ padding: isTall ? "2.5rem 2rem" : "2rem 1.5rem" }}>
        <DraggableWrapper id="product" className="flex-1 min-h-0 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80"
            alt="Drink"
            className={`${isTall ? "h-56" : "h-40"} object-contain drop-shadow-xl`}
          />
        </DraggableWrapper>
        <DraggableWrapper id="quote" className="text-center max-w-xs">
          <EditableText as="h2" className={`${isTall ? "text-2xl" : "text-xl"} font-black leading-snug`} style={{ color: t.primary }}>You changed my life</EditableText>
          <div className="w-12 h-[2px] mx-auto my-3" style={{ backgroundColor: t.accent }} />
          <EditableText as="p" className="text-base font-bold" style={{ color: t.primary }}>But I&apos;m just a delicious drink</EditableText>
        </DraggableWrapper>
        <DraggableWrapper id="brand" className="mt-auto pt-4">
          <EditableText as="span" className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: t.accent }}>Flash Soda</EditableText>
        </DraggableWrapper>
      </div>
    </div>
  );
}
