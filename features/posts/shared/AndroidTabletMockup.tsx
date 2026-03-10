"use client";

import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useUploadSignal, useParentDragging } from "@/contexts/EditContext";

interface AndroidTabletMockupProps {
  src: string;
  alt?: string;
  className?: string;
  /** Orientation: "landscape" or "portrait" */
  orientation?: "landscape" | "portrait";
}

/**
 * Reusable Android tablet mockup frame.
 * Renders at 100% of its parent container — wrap in a sized div to control dimensions.
 * Upload is triggered via the toolbar's upload button (UploadSignalContext).
 */
export default function AndroidTabletMockup({
  src,
  alt = "Tablet screenshot",
  className = "",
  orientation = "landscape",
}: AndroidTabletMockupProps) {
  const t = useTheme();
  const uploadSignal = useUploadSignal();
  const dragging = useParentDragging();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customSrc, setCustomSrc] = useState<string | null>(null);

  const displaySrc = customSrc || src;

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

  const isLandscape = orientation === "landscape";

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Hardware Buttons */}
      {isLandscape ? (
        <>
          <div className="absolute top-[-4px] right-[15%] w-[10%] h-[4px] rounded-t-md opacity-30" style={{ backgroundColor: t.border }} />
          <div className="absolute right-[-4px] top-[20%] w-[4px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
          <div className="absolute right-[-4px] top-[32%] w-[4px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
        </>
      ) : (
        <>
          <div className="absolute top-[-4px] right-[20%] w-[8%] h-[4px] rounded-t-md opacity-30" style={{ backgroundColor: t.border }} />
          <div className="absolute right-[-4px] top-[12%] w-[4px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
          <div className="absolute right-[-4px] top-[22%] w-[4px] h-[8%] rounded-r-md opacity-30" style={{ backgroundColor: t.border }} />
        </>
      )}

      {/* Android Tablet Frame */}
      <div
        className={`absolute inset-0 rounded-[16px] border-[6px] overflow-hidden will-change-transform transition-shadow ${dragging ? 'shadow-none' : 'shadow-2xl'}`}
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={displaySrc} alt={alt} className="w-full h-full object-cover object-top pointer-events-none" draggable={false} />
          {/* Glass Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        {/* Front Camera dot */}
        {isLandscape ? (
          <div className="absolute top-1/2 left-1.5 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-zinc-700/30 z-30" />
        ) : (
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-zinc-700/30 z-30" />
        )}
      </div>
    </div>
  );
}
