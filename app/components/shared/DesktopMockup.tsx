"use client";

import React from "react";
import { useTheme } from "../ThemeContext";

interface DesktopMockupProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Reusable Desktop/MacBook style mockup frame.
 */
export default function DesktopMockup({
  src,
  alt = "Desktop screenshot",
  className = "",
}: DesktopMockupProps) {
  const t = useTheme();

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Laptop Screen Body */}
      <div
        className="absolute inset-0 rounded-t-2xl border-[10px] border-b-0 shadow-2xl overflow-hidden"
        style={{ backgroundColor: t.primaryDark, borderColor: t.border }}
      >
        {/* Screen Content */}
        <div className="absolute inset-0 bg-white">
          <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
          {/* Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
        
        {/* Camera */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black/40 rounded-full" />
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
