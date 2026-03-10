"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { ChefHat, Utensils, Award } from "lucide-react";

export default function FoodMoodBoardPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "1.5rem" : "1rem" }}>
        {/* Mood board grid */}
        <div className={`flex-1 min-h-0 grid gap-2 ${isTall ? "grid-rows-3 grid-cols-2" : "grid-rows-2 grid-cols-3"}`}>
          {/* Main large block */}
          <div className={`${isTall ? "row-span-2" : "row-span-2"} rounded-2xl overflow-hidden shadow-lg flex items-center justify-center`} style={{ background: `linear-gradient(135deg, ${t.primaryDark}, ${t.primary})` }}>
            <DraggableWrapper id="main" className="text-center p-4">
              <ChefHat size={isTall ? 48 : 36} style={{ color: t.accentGold }} className="mx-auto" />
              <EditableText as="h2" className={`${isTall ? "text-3xl" : "text-2xl"} font-black mt-2`} style={{ color: t.primaryLight }}>Wedding Catering</EditableText>
            </DraggableWrapper>
          </div>
          {/* Accent block */}
          <div className="rounded-2xl overflow-hidden shadow-lg flex items-center justify-center" style={{ backgroundColor: t.accentGold }}>
            <DraggableWrapper id="block2" className="text-center p-3">
              <Utensils size={20} style={{ color: t.primaryDark }} className="mx-auto" />
              <EditableText as="span" className="text-xs font-black block mt-1" style={{ color: t.primaryDark }}>Full Menu</EditableText>
            </DraggableWrapper>
          </div>
          {/* Image placeholder block */}
          <div className="rounded-2xl overflow-hidden shadow-lg flex items-center justify-center" style={{ background: `linear-gradient(145deg, ${t.accent}, ${t.accentLight})` }}>
            <DraggableWrapper id="block3" className="text-center p-3">
              <Award size={20} style={{ color: t.primaryLight }} className="mx-auto" />
              <EditableText as="span" className="text-xs font-black block mt-1" style={{ color: t.primaryLight }}>Premium</EditableText>
            </DraggableWrapper>
          </div>
          {/* Text block */}
          <div className={`${isTall ? "col-span-2" : ""} rounded-2xl overflow-hidden shadow-lg flex items-center justify-center`} style={{ backgroundColor: "white" }}>
            <DraggableWrapper id="block4" className="text-center p-3">
              <EditableText as="span" className="text-sm font-black" style={{ color: t.primary }}>HAVEN</EditableText>
              <EditableText as="p" className="text-xs font-bold opacity-50 mt-0.5" style={{ color: t.primary }}>Artisan Chocolatier</EditableText>
            </DraggableWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}
