"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function DrinkSunburstPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accent, fontFamily: t.font }}>
      {/* Sunburst pattern */}
      <div className="absolute inset-0" style={{
        background: `repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(255,255,255,0.06) 10deg 20deg)`,
      }} />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <DraggableWrapper id="top-text" className="text-center">
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black leading-tight`} style={{ color: t.primaryLight }}>Choose</EditableText>
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black leading-tight`} style={{ color: t.primaryLight }}>Your Flavor</EditableText>
        </DraggableWrapper>
        {/* Product can image */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          <img
            src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80"
            alt="Drink can"
            className={`${isTall ? "h-64" : "h-48"} object-contain drop-shadow-2xl`}
            style={{ transform: "rotate(-5deg)" }}
          />
        </div>
        <DraggableWrapper id="bottom-text" className="text-center">
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black`} style={{ color: t.primaryLight }}>Your Taste</EditableText>
        </DraggableWrapper>
      </div>
    </div>
  );
}
