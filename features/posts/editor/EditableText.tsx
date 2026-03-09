"use client";

import React, { useContext } from "react";
import { EditContext } from "@/contexts/EditContext";

interface EditableTextProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
}

export default function EditableText({
  children,
  as: Component = "span",
  className = "",
  style,
}: EditableTextProps) {
  const isEditMode = useContext(EditContext);

  if (!isEditMode) {
    return <Component className={className} style={style}>{children}</Component>;
  }

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      className={`${className} outline-none border-b border-dashed border-transparent hover:border-[#B7FF5B]/50 focus:border-[#B7FF5B] transition-colors cursor-text select-text`}
      style={style}
      onClick={(e) => e.stopPropagation()} // Prevent drag start when clicking to edit
      onPointerDown={(e) => e.stopPropagation()} // Critical for framer-motion drag
    >
      {children}
    </Component>
  );
}
