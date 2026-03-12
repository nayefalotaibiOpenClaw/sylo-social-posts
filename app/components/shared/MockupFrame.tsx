"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAspectRatio } from "../EditContext";
import { useDeviceType } from "@/contexts/DeviceContext";
import { useEditMode } from "../EditContext";
import IPhoneMockup from "./IPhoneMockup";
import IPadMockup from "./IPadMockup";
import DesktopMockup from "./DesktopMockup";
import AndroidPhoneMockup from "./AndroidPhoneMockup";
import AndroidTabletMockup from "./AndroidTabletMockup";
import DraggableWrapper from "../DraggableWrapper";

interface MockupFrameProps {
  id: string;
  src: string;
  alt?: string;
  className?: string;
  /** Override device: "phone" | "tablet" | "desktop". If omitted, uses useDeviceType(). */
  device?: "phone" | "tablet" | "desktop";
}

/**
 * Self-sizing mockup container. Reads the current aspect ratio and device type,
 * then renders the correct mockup at the right size. AI code just uses:
 *   <MockupFrame id="mockup" src={url} />
 * No sizing classes needed.
 */

// Fixed pixel sizes per ratio group × device type
// Tuned for 540px-base canvas. Available space after header+headline+footer+padding:
// 1:1 (540×540): ~286px vertical space for mockup area
// 3:4 (540×720): ~466px vertical space
// 9:16 (540×960): ~706px vertical space
// 4:3 (720×540): ~286px vertical, ~720px horizontal
// 16:9 (960×540): ~286px vertical, ~960px horizontal
const SIZES = {
  phone: {
    tall:   { w: 340, h: 680 },  // 9:16, 3:4 — big hero, may overflow bottom
    square: { w: 210, h: 420 },  // 1:1 — dominant, overflows bottom naturally
    wide:   { w: 160, h: 320 },  // 16:9, 4:3 — fills vertical space
  },
  tablet: {
    tall:   { w: 420, h: 300 },
    square: { w: 340, h: 240 },
    wide:   { w: 380, h: 260 },
  },
  desktop: {
    tall:   { w: 440, h: 280 },
    square: { w: 380, h: 240 },
    wide:   { w: 460, h: 260 },
  },
} as const;

export default function MockupFrame({
  id,
  src,
  alt,
  className = "",
  device,
}: MockupFrameProps) {
  const ratio = useAspectRatio();
  const deviceType = useDeviceType();
  const isEditMode = useEditMode();

  // Determine device category
  const resolvedDevice = device
    ? device
    : deviceType === "iphone" || deviceType === "android"
      ? "phone"
      : deviceType === "ipad" || deviceType === "android_tablet"
        ? "tablet"
        : "desktop";

  // Determine ratio group
  const isTall = ratio === "9:16" || ratio === "3:4";
  const isWide = ratio === "16:9" || ratio === "4:3";
  const ratioGroup = isTall ? "tall" : isWide ? "wide" : "square";

  const defaultSize = SIZES[resolvedDevice][ratioGroup];
  const [size, setSize] = useState({ w: defaultSize.w, h: defaultSize.h });
  const resizingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Sync with default when ratio/device changes
  useEffect(() => {
    setSize({ w: defaultSize.w, h: defaultSize.h });
  }, [defaultSize.w, defaultSize.h]);

  // Resize handlers
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = true;
    startRef.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };

    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const dx = ev.clientX - startRef.current.x;
      const dy = ev.clientY - startRef.current.y;
      const aspectRatio = startRef.current.w / startRef.current.h;
      // Use the larger delta to maintain aspect ratio
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy * aspectRatio;
      const newW = Math.max(60, Math.round(startRef.current.w + delta));
      const newH = Math.round(newW / aspectRatio);
      setSize({ w: newW, h: newH });
    };

    const onUp = () => {
      resizingRef.current = false;
      // Log final size for tuning
      console.log(
        `%c[MockupFrame] ${resolvedDevice} @ ${ratio} (${ratioGroup}): ${size.w}×${size.h}`,
        "color: #f59e0b; font-weight: bold; font-size: 14px;"
      );
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [size.w, size.h, resolvedDevice, ratio, ratioGroup]);

  // Pick the right mockup component
  const MockupComponent =
    resolvedDevice === "phone"
      ? deviceType === "android"
        ? AndroidPhoneMockup
        : IPhoneMockup
      : resolvedDevice === "tablet"
        ? deviceType === "android_tablet"
          ? AndroidTabletMockup
          : IPadMockup
        : DesktopMockup;

  return (
    <DraggableWrapper
      id={id}
      variant="mockup"
      className={`relative z-20 flex-shrink-0 ${className}`}
      style={{ width: size.w, height: size.h }}
    >
      <MockupComponent src={src} alt={alt} />

      {/* Resize handle — only in edit mode */}
      {isEditMode && (
        <>
          {/* Size label */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-mono font-bold whitespace-nowrap z-50 pointer-events-none"
          >
            {size.w}×{size.h}
          </div>

          {/* Drag handle at bottom-right corner */}
          <div
            onMouseDown={onResizeStart}
            className="absolute -bottom-2 -right-2 w-5 h-5 bg-amber-500 rounded-full cursor-nwse-resize z-50 flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
              <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}
    </DraggableWrapper>
  );
}
