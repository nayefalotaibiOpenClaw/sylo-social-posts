"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { PostHeader, PostFooter } from "@/app/components/shared";
import { Truck, Phone } from "lucide-react";

export default function FoodHeroBurgerPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      {/* Background image */}
      <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.primaryDark} 30%, ${t.primaryDark}90 60%, transparent 100%)` }} />
      <div className="relative z-10 w-full h-full flex flex-col justify-end overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <PostHeader id="header" title="BURGER HOUSE" variant="dark" />
        <div className="flex-1" />
        <DraggableWrapper id="badge" className="mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: t.accentOrange }}>
            <EditableText as="span" className="text-xs font-black text-white uppercase tracking-wider">100% Fresh</EditableText>
          </div>
        </DraggableWrapper>
        <DraggableWrapper id="headline" className="mb-4">
          <EditableText as="h2" className={`${isTall ? "text-6xl" : "text-5xl"} font-black leading-none`} style={{ color: t.primaryLight }}>Smash</EditableText>
          <EditableText as="h2" className={`${isTall ? "text-6xl" : "text-5xl"} font-black leading-none`} style={{ color: t.accentOrange }}>Burger</EditableText>
          <EditableText as="p" className="text-lg mt-2 opacity-80" style={{ color: t.primaryLight }}>Fresh & Hot — Made to Order</EditableText>
        </DraggableWrapper>
        <DraggableWrapper id="info" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={16} style={{ color: t.accentOrange }} />
            <EditableText as="span" className="text-sm font-bold" style={{ color: t.primaryLight }}>Free Delivery</EditableText>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} style={{ color: t.accentOrange }} />
            <EditableText as="span" className="text-sm font-bold" style={{ color: t.primaryLight }}>1800-BURGER</EditableText>
          </div>
        </DraggableWrapper>
        <PostFooter id="footer" label="BURGER HOUSE" variant="dark" />
      </div>
    </div>
  );
}
