"use client";

import React, { useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useParentSelected } from "../EditContext";
import { ImagePlus } from "lucide-react";

interface DesktopMockupProps {
  src: string;
  alt?: string;
  className?: string;
  /** Show traffic light dots (macOS style) */
  trafficLights?: boolean;
  /** Optional URL to display in the address bar */
  url?: string;
}

/**
 * Reusable desktop/MacBook browser mockup.
 * Renders at 100% of its parent container — wrap in a sized div to control dimensions.
 * Shows upload button when parent DraggableWrapper is selected.
 *
 * Usage:
 *   <div className="w-[400px] h-[280px]">
 *     <DesktopMockup src="/screenshot.jpg" url="app.sylo.com" />
 *   </div>
 */
export default function DesktopMockup({
  src,
  alt = "Desktop screenshot",
  className = "",
  trafficLights = true,
  url,
}: DesktopMockupProps) {
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

  return (
    <div className={`relative w-full h-full flex flex-col ${className}`}>
      {/* Browser Chrome / Title Bar */}
      <div
        className="relative w-full h-9 rounded-t-xl flex items-center px-3 gap-2 shrink-0"
        style={{ backgroundColor: t.primaryDark }}
      >
        {/* Traffic Lights */}
        {trafficLights && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          </div>
        )}

        {/* Address Bar */}
        <div className="flex-1 flex justify-center">
          <div
            className="px-4 py-1 rounded-md text-[10px] font-medium flex items-center gap-1.5 max-w-[60%]"
            style={{ backgroundColor: t.primary, color: t.accentLight }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="truncate opacity-70">{url || "app.sylo.com"}</span>
          </div>
        </div>

        {/* Spacer to balance traffic lights */}
        {trafficLights && <div className="w-12" />}
      </div>

      {/* Screen Content */}
      <div
        className="relative flex-1 overflow-hidden rounded-b-xl border-x-2 border-b-2"
        style={{ borderColor: t.border }}
      >
        <div className="absolute inset-0 bg-white">
          <img src={displaySrc} alt={alt} className="w-full h-full object-cover object-top pointer-events-none" draggable={false} />
          {/* Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Stand / Base (optional decorative) */}
      <div className="flex flex-col items-center mt-0">
        <div className="w-[15%] h-3 rounded-b-sm" style={{ backgroundColor: t.border, opacity: 0.3 }} />
        <div className="w-[30%] h-1 rounded-b-md" style={{ backgroundColor: t.border, opacity: 0.2 }} />
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
