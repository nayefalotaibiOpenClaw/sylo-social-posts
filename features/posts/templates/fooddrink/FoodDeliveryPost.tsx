"use client";
import React from "react";
import EditableText from "@/app/components/EditableText";
import DraggableWrapper from "@/app/components/DraggableWrapper";
import { useAspectRatio } from "@/app/components/EditContext";
import { useTheme } from "@/app/components/ThemeContext";
import { PostHeader, PostFooter } from "@/app/components/shared";
import { Truck, MapPin, Clock, Phone } from "lucide-react";

export default function FoodDeliveryPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === "9:16" || ratio === "3:4";

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accentOrange, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${t.accentOrange}, ${t.accentGold})` }} />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(${t.primaryDark} 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden" style={{ padding: isTall ? "2rem" : "1.5rem" }}>
        <PostHeader id="header" title="FREE DELIVERY" variant="light" />
        <DraggableWrapper id="headline" className="mt-4">
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black leading-tight`} style={{ color: t.primaryDark }}>Free Home</EditableText>
          <EditableText as="h2" className={`${isTall ? "text-5xl" : "text-4xl"} font-black leading-tight`} style={{ color: "white" }}>Delivery</EditableText>
        </DraggableWrapper>
        <div className="flex-1 min-h-0 flex items-center justify-center my-4">
          <div className={`${isTall ? "w-40 h-40" : "w-32 h-32"} rounded-full flex items-center justify-center shadow-2xl`} style={{ backgroundColor: "white" }}>
            <Truck size={isTall ? 56 : 44} style={{ color: t.accentOrange }} />
          </div>
        </div>
        <DraggableWrapper id="features" className={`grid ${isTall ? "grid-cols-1 gap-2" : "grid-cols-2 gap-2"}`}>
          {[
            { icon: Clock, text: "30 Min Delivery" },
            { icon: MapPin, text: "All Areas" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <item.icon size={16} style={{ color: t.primaryDark }} />
              <EditableText as="span" className="text-sm font-bold" style={{ color: t.primaryDark }}>{item.text}</EditableText>
            </div>
          ))}
        </DraggableWrapper>
        <DraggableWrapper id="contact" className="mt-3 flex items-center gap-2">
          <Phone size={14} style={{ color: t.primaryDark }} />
          <EditableText as="span" className="text-sm font-black" style={{ color: t.primaryDark }}>Call: 123-456-789</EditableText>
        </DraggableWrapper>
        <PostFooter id="footer" label="ORDER NOW" variant="light" />
      </div>
    </div>
  );
}
