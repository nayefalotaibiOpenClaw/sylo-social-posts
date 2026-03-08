"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import EditableText from "../EditableText";
import { useTheme } from "../ThemeContext";
import { Command } from "lucide-react";

interface PostHeaderProps {
  id: string;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  /** "dark" = light text on dark bg, "light" = dark text on light bg */
  variant?: "dark" | "light";
}

/**
 * Reusable post header with SYLO logo + optional badge.
 *
 * Usage:
 *   <PostHeader
 *     id="header-mypost"
 *     subtitle="ANALYTICS"
 *     badge={<><TrendingUp size={12} /> MARGIN OPTIMIZER</>}
 *     variant="light"
 *   />
 */
export default function PostHeader({
  id,
  title = "SYLO",
  subtitle,
  badge,
  variant = "dark",
}: PostHeaderProps) {
  const t = useTheme();
  const isDark = variant === "dark";

  return (
    <div className="flex justify-between items-start">
      <DraggableWrapper id={`logo-${id}`} variant="card" className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: isDark ? t.accentLime : t.primary }}
        >
          <Command
            size={24}
            strokeWidth={2.5}
            style={{ color: isDark ? t.primary : t.accentLime }}
          />
        </div>
        <div className="flex flex-col leading-none">
          <EditableText
            as="span"
            className="font-black text-xl tracking-tight"
            style={{ color: isDark ? t.primaryLight : t.primary }}
          >
            {title}
          </EditableText>
          {subtitle && (
            <EditableText
              as="span"
              className="text-[9px] font-bold uppercase tracking-widest mt-1"
              style={{ color: isDark ? t.accentLight : t.accent }}
            >
              {subtitle}
            </EditableText>
          )}
        </div>
      </DraggableWrapper>

      {badge && (
        <DraggableWrapper
          id={`badge-${id}`}
          variant="card"
          className={`px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black tracking-widest uppercase ${
            isDark
              ? "bg-white/10 border border-white/20 backdrop-blur-md"
              : "shadow-md"
          }`}
          style={
            isDark
              ? { color: t.primaryLight }
              : { backgroundColor: t.primary, color: "white" }
          }
        >
          {badge}
        </DraggableWrapper>
      )}
    </div>
  );
}
