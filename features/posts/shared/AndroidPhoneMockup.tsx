"use client";

import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUploadSignal, useParentDragging } from "@/contexts/EditContext";

interface AndroidPhoneMockupProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Reusable Android phone mockup frame.
 * Renders at 100% of its parent container — wrap in a sized div to control dimensions.
 * Upload is triggered via the toolbar's upload button (UploadSignalContext).
 */
export default function AndroidPhoneMockup({
  src,
  alt = "App screenshot",
  className = "",
}: AndroidPhoneMockupProps) {
  const t = useTheme();
  const uploadSignal = useUploadSignal();
  const dragging = useParentDragging();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customSrc, setCustomSrc] = useState<string | null>(null);

  const displaySrc = customSrc || src;

  // Listen for upload signal from toolbar
  useEffect(() => {
    if (uploadSignal > 0) {
      fileInputRef.current?.click();
    }
  }, [uploadSignal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomSrc(url);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Hardware Buttons */}
      <div className="absolute -right-[5px] top-[20%] w-[3px] h-[10%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
      <div className="absolute -right-[5px] top-[35%] w-[3px] h-[15%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />

      {/* Android Phone Frame */}
      <div
        className={`absolute inset-0 rounded-[24px] border-[4px] overflow-hidden will-change-transform transition-shadow ${dragging ? 'shadow-none' : 'shadow-2xl'}`}
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={displaySrc} alt={alt} className="w-full h-full object-cover object-top pointer-events-none" draggable={false} />
          {/* Glass Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-5 flex items-center justify-between px-3 z-30">
          <span className="text-[7px] text-white/70 font-medium">12:00</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-[1px] bg-white/50" />
            <div className="w-1.5 h-1.5 rounded-[1px] bg-white/50" />
            <div className="w-3 h-1.5 rounded-[1px] border border-white/50 relative">
              <div className="absolute inset-[1px] right-[2px] bg-white/50 rounded-[0.5px]" />
            </div>
          </div>
        </div>

        {/* Punch-hole Camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black/80 z-30 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-zinc-800/60" />
        </div>

        {/* Bottom Navigation Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center gap-4 z-30">
          {/* Back */}
          <div className="w-1.5 h-1.5 border border-white/30 rounded-[1px]" />
          {/* Home Indicator Pill */}
          <div className="w-1/4 h-1 bg-white/30 rounded-full" />
          {/* Recent */}
          <div className="w-1.5 h-1.5 border border-white/30 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}
