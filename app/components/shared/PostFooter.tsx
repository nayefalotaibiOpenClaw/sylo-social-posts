"use client";

import React from "react";
import DraggableWrapper from "../DraggableWrapper";
import EditableText from "../EditableText";
import { useTheme } from "../ThemeContext";

interface PostFooterProps {
  id: string;
  label: string;
  text: string;
  icon?: React.ReactNode;
  /** "dark" = light text on dark bg, "light" = dark text on light bg */
  variant?: "dark" | "light";
}

/**
 * Reusable post footer with brand label + description + optional icon.
 *
 * Usage:
 *   <PostFooter
 *     id="footer-mypost"
 *     label="SYLO BUSINESS INTELLIGENCE"
 *     text="تابع مشروعك من أي مكان"
 *     icon={<Smartphone size={24} />}
 *     variant="dark"
 *   />
 */
export default function PostFooter({
  id,
  label,
  text,
  icon,
  variant = "dark",
}: PostFooterProps) {
  const t = useTheme();
  const isDark = variant === "dark";

  return (
    <div
      className={`mt-auto flex justify-between items-end pt-6 border-t ${
        isDark ? "border-white/10" : ""
      }`}
      style={!isDark ? { borderColor: t.primary + "1a" } : undefined}
      dir="rtl"
    >
      <DraggableWrapper id={`footer-text-${id}`} variant="text" className="flex flex-col gap-1">
        <EditableText
          as="span"
          className="text-[9px] font-black uppercase tracking-[0.3em]"
          style={{ color: isDark ? t.accentLight : t.accent }}
        >
          {label}
        </EditableText>
        <EditableText
          className="text-sm font-bold"
          style={{ color: isDark ? t.primaryLight : t.primary }}
        >
          {text}
        </EditableText>
      </DraggableWrapper>

      {icon && (
        <DraggableWrapper
          id={`footer-icon-${id}`}
          variant="card"
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: isDark ? t.accentLime : t.primary,
            color: isDark ? t.primary : t.primaryLight,
          }}
        >
          {icon}
        </DraggableWrapper>
      )}
    </div>
  );
}
