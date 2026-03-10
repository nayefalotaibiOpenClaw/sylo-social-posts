"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { PostHeader, PostFooter } from "@/app/components/shared";
import { Zap, ShoppingBag } from "lucide-react";

export default function FoodSaleBannerPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primaryDark}, ${t.primary})` }} />
      {/* Diagonal stripes */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, ${t.primaryLight} 20px, ${t.primaryLight} 21px)`,
      }} />
      <div className="absolute -top-20 -right-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full" style={{ backgroundColor: t.accentOrange }} />
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <PostHeader id="header" title="FRIDAY SALE" variant="dark" badge={<Zap size={14} style={{ color: t.accentGold }} />} />
        <DraggableWrapper id="discount" className="mt-4 text-center">
          <EditableText as="h2" className={`${isTall ? "text-8xl" : "text-7xl"} font-black leading-none`} style={{ color: t.accentOrange }}>75%</EditableText>
          <EditableText as="p" className="text-2xl font-black uppercase tracking-widest mt-1" style={{ color: t.primaryLight }}>OFF</EditableText>
        </DraggableWrapper>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`${isTall ? "w-48 h-48" : "w-36 h-36"} mx-auto rounded-2xl shadow-2xl flex items-center justify-center`} style={{ background: `linear-gradient(135deg, ${t.accentOrange}, ${t.accentGold})` }}>
              <ShoppingBag size={isTall ? 64 : 48} className="text-white" />
            </div>
            <EditableText as="p" className="text-lg font-bold mt-4" style={{ color: t.primaryLight }}>All Menu Items</EditableText>
          </div>
        </div>
        <DraggableWrapper id="cta" className="flex justify-center mb-2">
          <div className="px-10 py-3 rounded-full shadow-xl" style={{ backgroundColor: t.accentOrange }}>
            <EditableText as="span" className="text-sm font-black text-white uppercase tracking-wider">Order Now</EditableText>
          </div>
        </DraggableWrapper>
        <PostFooter id="footer" label="YELLOW FRIDAY" variant="dark" />
      </div>
    </div>
  );
}
