"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import { useTheme } from "../ThemeContext";

interface FloatingCardProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  /** Card rotation in degrees */
  rotate?: number;
  /** Animation class (e.g. "animate-float", "animate-bounce-slow") */
  animation?: string;
  /** Border accent color override - defaults to theme accentLime */
  borderColor?: string;
}

/**
 * Reusable floating stat/info card that appears near mockups.
 *
 * Usage:
 *   <FloatingCard
 *     id="stat-mypost"
 *     icon={<BarChart size={16} />}
 *     label="Growth"
 *     value="+24%"
 *     rotate={3}
 *     className="absolute -right-8 top-16"
 *   />
 */
export default function FloatingCard({
  id,
  icon,
  label,
  value,
  className = "",
  rotate = 0,
  animation = "",
  borderColor,
}: FloatingCardProps) {
  const t = useTheme();

  return (
    <DraggableWrapper
      id={id}
      variant="card"
      className={`p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 z-30 ${animation} ${className}`}
      style={{
        backgroundColor: t.primaryLight,
        borderColor: borderColor || t.accentLime,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: t.primary, color: t.accentLime }}
      >
        {icon}
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[8px] text-gray-500 font-bold uppercase mb-1">{label}</span>
        <span className="text-sm font-black" style={{ color: t.primary }}>{value}</span>
      </div>
    </DraggableWrapper>
  );
}
