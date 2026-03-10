"use client";

import React from "react";
import { useAspectRatio } from "../EditContext";
import { useDeviceType } from "@/contexts/DeviceContext";
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
// 1:1 (540×540): ~250px vertical space for mockup area
// 9:16 (540×960): ~600px vertical space
// 16:9 (960×540): ~200px vertical, but ~800px horizontal
const SIZES = {
  phone: {
    tall:   { w: 180, h: 360 },  // 9:16, 3:4 — plenty of room
    square: { w: 120, h: 240 },  // 1:1 — tight, must be small
    wide:   { w: 90, h: 180 },   // 16:9, 4:3 — very tight vertically
  },
  tablet: {
    tall:   { w: 300, h: 210 },
    square: { w: 240, h: 170 },
    wide:   { w: 280, h: 190 },
  },
  desktop: {
    tall:   { w: 340, h: 210 },
    square: { w: 280, h: 175 },
    wide:   { w: 360, h: 210 },
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

  const size = SIZES[resolvedDevice][ratioGroup];

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
      className={`relative z-20 flex-shrink-0 ${className}`}
      style={{ width: size.w, height: size.h, maxHeight: "100%" }}
    >
      <MockupComponent src={src} alt={alt} />
    </DraggableWrapper>
  );
}
