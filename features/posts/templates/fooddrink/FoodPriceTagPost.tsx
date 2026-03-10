"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { PostHeader, PostFooter } from "@/app/components/shared";

export default function FoodPriceTagPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: "25px 25px" }} />
      {/* Discount badge */}
      <div className="absolute top-8 right-8 w-24 h-24 rounded-full flex items-center justify-center z-20 shadow-xl" style={{ backgroundColor: t.accentOrange, transform: "rotate(-12deg)" }}>
        <div className="text-center">
          <EditableText as="span" className="text-3xl font-black text-white block leading-none">50%</EditableText>
          <EditableText as="span" className="text-[10px] font-black text-white uppercase">OFF</EditableText>
        </div>
      </div>
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <PostHeader id="header" title="PIZZA KING" variant="dark" />
        <DraggableWrapper id="headline" className="mt-4">
          <EditableText as="p" className="text-sm font-bold uppercase tracking-widest" style={{ color: t.accentGold }}>Cheesy Delicious</EditableText>
          <EditableText as="h2" className={`${isTall ? "text-6xl" : "text-5xl"} font-black italic leading-none mt-1`} style={{ color: t.primaryLight }}>Pizza</EditableText>
        </DraggableWrapper>
        {/* Hero product image */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative">
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80"
            alt="Pizza"
            className={`${isTall ? "w-72 h-72" : "w-56 h-56"} object-contain drop-shadow-2xl`}
            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
          />
        </div>
        <DraggableWrapper id="price" className="text-center mb-2">
          <div className="flex items-center justify-center gap-3">
            <EditableText as="span" className="text-2xl font-bold line-through opacity-40" style={{ color: t.primaryLight }}>KD 5.900</EditableText>
            <EditableText as="span" className={`${isTall ? "text-5xl" : "text-4xl"} font-black`} style={{ color: t.accentOrange }}>KD 2.950</EditableText>
          </div>
        </DraggableWrapper>
        <DraggableWrapper id="cta" className="flex justify-center mb-2">
          <div className="px-8 py-2.5 rounded-full" style={{ backgroundColor: t.accentOrange }}>
            <EditableText as="span" className="text-sm font-black text-white uppercase tracking-wider">Order Now</EditableText>
          </div>
        </DraggableWrapper>
        <PostFooter id="footer" label="PIZZA KING" variant="dark" />
      </div>
    </div>
  );
}
