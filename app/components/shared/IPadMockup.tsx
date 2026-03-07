"use client";

import React, { useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useParentSelected } from "../EditContext";
import { ImagePlus } from "lucide-react";

interface IPadMockupProps {
  src: string;
  alt?: string;
  className?: string;
  /** Orientation: "landscape" or "portrait" */
  orientation?: "landscape" | "portrait";
}

/**
 * Reusable iPad mockup frame.
 * Renders at 100% of its parent container — wrap in a sized div to control dimensions.
 * Shows upload button when parent DraggableWrapper is selected.
 *
 * Usage:
 *   <div className="w-[320px] h-[220px]">
 *     <IPadMockup src="/screenshot.jpg" />
 *   </div>
 */
export default function IPadMockup({
  src,
  alt = "Tablet screenshot",
  className = "",
  orientation = "landscape",
}: IPadMockupProps) {
  const t = useTheme();
  const isSelected = useParentSelected();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customSrc, setCustomSrc] = useState<string | null>(null);

  const displaySrc = customSrc || src;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomSrc(url);
  };

  const isLandscape = orientation === "landscape";

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Hardware Buttons */}
      {isLandscape ? (
        <>
          {/* Power Button - top edge */}
          <div className="absolute top-[-5px] right-[15%] w-[12%] h-[5px] rounded-t-md opacity-30" style={{ backgroundColor: t.border }} />
          {/* Volume Buttons - right edge */}
          <div className="absolute right-[-5px] top-[20%] w-[5px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
          <div className="absolute right-[-5px] top-[32%] w-[5px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
        </>
      ) : (
        <>
          {/* Power Button - top edge */}
          <div className="absolute top-[-5px] right-[20%] w-[8%] h-[5px] rounded-t-md opacity-30" style={{ backgroundColor: t.border }} />
          {/* Volume Buttons - right edge */}
          <div className="absolute right-[-5px] top-[12%] w-[5px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
          <div className="absolute right-[-5px] top-[22%] w-[5px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
        </>
      )}

      {/* iPad Frame */}
      <div
        className="absolute inset-0 rounded-[20px] border-[8px] shadow-2xl overflow-hidden"
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={displaySrc} alt={alt} className="w-full h-full object-cover object-top pointer-events-none" draggable={false} />
          {/* Glass Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-black/20 rounded-full z-30" />

        {/* Front Camera dot */}
        {isLandscape ? (
          <div className="absolute top-1/2 left-1.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-700/30 z-30" />
        ) : (
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-700/30 z-30" />
        )}
      </div>

      {/* Upload button — only when parent DraggableWrapper is selected */}
      {isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="absolute -top-2 -right-2 z-50 w-8 h-8 rounded-full bg-[#B7FF5B] text-[#1B4332] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
        >
          <ImagePlus size={14} />
        </button>
      )}
    </div>
  );
}
