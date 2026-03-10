"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { PostHeader, PostFooter } from "@/app/components/shared";
import { Flame, Star, Clock } from "lucide-react";

export default function FoodMenuCardPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  const items = [
    { icon: Flame, name: "Spicy Chicken", desc: "Crispy & bold", price: "KD 3.500" },
    { icon: Star, name: "Classic Burger", desc: "The original", price: "KD 2.900" },
    { icon: Clock, name: "Quick Wrap", desc: "Ready in 5 min", price: "KD 1.750" },
  ];

  const visibleItems = isTall ? items : items.slice(0, 2);

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
      <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] opacity-[0.08] blur-[80px] rounded-full" style={{ backgroundColor: t.accentOrange }} />
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <PostHeader id="header" title="MENU" variant="light" />
        <DraggableWrapper id="headline" className="mt-3">
          <EditableText as="h2" className={`${isTall ? "text-4xl" : "text-3xl"} font-black`} style={{ color: t.primary }}>Today&apos;s Picks</EditableText>
          <EditableText as="p" className="text-sm mt-1 opacity-60" style={{ color: t.primary }}>Chef&apos;s selection — freshly prepared</EditableText>
        </DraggableWrapper>
        <div className="flex-1 min-h-0 flex flex-col gap-3 mt-4">
          {visibleItems.map((item, i) => (
            <DraggableWrapper key={i} id={`item-${i}`}>
              <div className="flex items-center gap-3 p-3 rounded-xl shadow-lg" style={{ backgroundColor: "white" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: t.accentOrange + "15" }}>
                  <item.icon size={22} style={{ color: t.accentOrange }} />
                </div>
                <div className="flex-1 min-w-0">
                  <EditableText as="span" className="text-sm font-black block" style={{ color: t.primary }}>{item.name}</EditableText>
                  <EditableText as="span" className="text-xs opacity-50 block" style={{ color: t.primary }}>{item.desc}</EditableText>
                </div>
                <EditableText as="span" className="text-sm font-black shrink-0" style={{ color: t.accentOrange }}>{item.price}</EditableText>
              </div>
            </DraggableWrapper>
          ))}
        </div>
        <PostFooter id="footer" label="ORDER NOW" variant="light" />
      </div>
    </div>
  );
}
