"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { PostFooter } from "@/app/components/shared";
import { Megaphone } from "lucide-react";

export default function FoodNewArrivalPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accentGold, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.accentGold}, ${t.accentOrange})` }} />
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <DraggableWrapper id="announcement" className="flex items-center gap-2">
          <Megaphone size={24} style={{ color: t.primaryDark }} />
          <EditableText as="span" className="text-sm font-black uppercase tracking-widest" style={{ color: t.primaryDark }}>New Products</EditableText>
        </DraggableWrapper>
        <DraggableWrapper id="headline" className="mt-3">
          <EditableText as="h2" className={`${isTall ? "text-4xl" : "text-3xl"} font-black leading-tight`} style={{ color: t.primaryDark }}>Don&apos;t Miss Out!</EditableText>
        </DraggableWrapper>
        {/* Framed product image */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative my-3">
          <div className={`${isTall ? "w-72 h-80" : "w-56 h-64"} border-4 border-white shadow-2xl rounded-lg overflow-hidden`}>
            <img
              src="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&q=80"
              alt="New product"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <DraggableWrapper id="label" className="text-center mb-2">
          <EditableText as="span" className="text-xl font-black" style={{ color: t.primaryDark }}>Available Now</EditableText>
        </DraggableWrapper>
        <PostFooter id="footer" label="BRAND" variant="light" />
      </div>
    </div>
  );
}
