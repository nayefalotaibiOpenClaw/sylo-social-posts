"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";

export default function DrinkPolaroidPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${t.primaryLight} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        {/* Polaroid frame */}
        <DraggableWrapper id="polaroid" className="relative">
          <div className={`${isTall ? "w-64 pb-16 pt-3 px-3" : "w-52 pb-14 pt-2.5 px-2.5"} bg-white rounded-sm shadow-2xl`} style={{ transform: "rotate(-3deg)" }}>
            <div className={`${isTall ? "h-64" : "h-48"} rounded-sm flex items-center justify-center`} style={{ background: `linear-gradient(135deg, ${t.accentLight}, ${t.accent})` }}>
              <div className="text-center">
                <EditableText as="span" className="text-3xl font-black block" style={{ color: t.primaryLight }}>Flash</EditableText>
                <EditableText as="span" className="text-xs font-bold block mt-1 opacity-70" style={{ color: t.primaryLight }}>Refreshment</EditableText>
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <EditableText as="p" className="text-sm font-bold px-3" style={{ color: t.primaryDark }}>Summer vibes only ☀️</EditableText>
            </div>
          </div>
          {/* Second polaroid behind */}
          <div className={`absolute -z-10 ${isTall ? "w-64 h-80" : "w-52 h-64"} bg-white rounded-sm shadow-lg`} style={{ transform: "rotate(4deg)", top: "8px", left: "12px" }} />
        </DraggableWrapper>
        <DraggableWrapper id="brand" className="mt-8 text-center">
          <EditableText as="span" className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: t.accentGold }}>Flash Soda</EditableText>
          <EditableText as="p" className="text-sm font-bold mt-1 opacity-50" style={{ color: t.primaryLight }}>Capture the moment</EditableText>
        </DraggableWrapper>
      </div>
    </div>
  );
}
