"use client";

import React, { useRef, useState, useEffect } from "react";
import { useTheme } from "../ThemeContext";
import { useUploadSignal } from "../EditContext";

interface DesktopMockupProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Reusable Desktop/MacBook style mockup frame.
 * Upload is triggered via the toolbar's upload button (UploadSignalContext).
 */
export default function DesktopMockup({
  src,
  alt = "Desktop screenshot",
  className = "",
}: DesktopMockupProps) {
  const t = useTheme();
  const uploadSignal = useUploadSignal();
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

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Laptop Screen Body */}
      <div
        className="absolute inset-0 rounded-t-2xl border-[10px] border-b-0 shadow-2xl overflow-hidden"
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={displaySrc} alt={alt} className="w-full h-full object-cover object-top pointer-events-none" draggable={false} />
          {/* Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Camera */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black/40 rounded-full" />

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>

      {/* Base / Keyboard part */}
      <div
        className="absolute bottom-[-15px] left-[-5%] right-[-5%] h-[15px] rounded-b-xl border-t border-white/10"
        style={{ backgroundColor: t.border }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-1 bg-black/20 rounded-b-full" />
      </div>
    </div>
  );
}
