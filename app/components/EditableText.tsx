"use client";

import React, { useContext, useRef, useCallback, useId } from "react";
import { EditContext, useSetSelectedId } from "./EditContext";
import { useElementOverride, useSetOverride } from "./OverrideContext";
import { useSelectedElement } from "./SelectedElementContext";

// Map Tailwind text size classes to CSS font-size values
const FONT_SIZE_MAP: Record<string, string> = {
  "text-xs": "0.75rem",
  "text-sm": "0.875rem",
  "text-base": "1rem",
  "text-lg": "1.125rem",
  "text-xl": "1.25rem",
  "text-2xl": "1.5rem",
  "text-3xl": "1.875rem",
  "text-4xl": "2.25rem",
  "text-5xl": "3rem",
  "text-6xl": "3.75rem",
  "text-7xl": "4.5rem",
};

interface EditableTextProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
  configKey?: string;
}

export default function EditableText({
  children,
  as: Component = "span",
  className = "",
  style,
  configKey,
}: EditableTextProps) {
  const autoId = useId();
  // Use provided configKey, or fall back to a stable auto-generated key
  const resolvedKey = configKey ?? `auto-${autoId}`;
  const isEditMode = useContext(EditContext);
  const override = useElementOverride(resolvedKey);
  const setOverride = useSetOverride();
  const { setSelectedElement, selectedElementKey } = useSelectedElement();
  const setDraggableSelectedId = useSetSelectedId();
  const elRef = useRef<HTMLDivElement>(null);

  // Build override styles
  const overrideStyle: React.CSSProperties = { ...style };
  if (override?.color) {
    overrideStyle.color = override.color;
  }
  if (override?.fontSize && FONT_SIZE_MAP[override.fontSize]) {
    overrideStyle.fontSize = FONT_SIZE_MAP[override.fontSize];
  }

  // Use override text if available
  const displayContent = override?.text ?? children;

  const handleBlur = useCallback(() => {
    if (!elRef.current) return;
    const newText = elRef.current.innerText;
    // Compare against current display content (override or original)
    const currentText = typeof displayContent === 'string' ? displayContent : (typeof children === 'string' ? children : '');
    if (newText !== currentText) {
      setOverride(`elements.${resolvedKey}.text`, newText);
    }
  }, [resolvedKey, children, displayContent, setOverride]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      // Clear DraggableWrapper selection so its toolbar hides
      setDraggableSelectedId(null);
      setSelectedElement(resolvedKey, 'text');
      // Store original text so we can find this element in the code later
      if (!override?._originalText) {
        const text = typeof children === 'string' ? children : (elRef.current?.innerText ?? '');
        if (text) {
          setOverride(`elements.${resolvedKey}._originalText`, text);
        }
      }
    }
  }, [isEditMode, resolvedKey, setSelectedElement, setDraggableSelectedId, override, children, setOverride]);

  const isThisSelected = selectedElementKey === resolvedKey;

  if (!isEditMode) {
    return <Component className={className} style={overrideStyle}>{displayContent}</Component>;
  }

  return (
    <Component
      ref={elRef as React.Ref<never>}
      contentEditable
      suppressContentEditableWarning
      data-config-key={resolvedKey}
      className={`${className} outline-none border-b border-dashed border-transparent hover:border-[#B7FF5B]/50 focus:border-[#B7FF5B] transition-colors cursor-text select-text ${isThisSelected ? 'ring-2 ring-blue-400/50 rounded' : ''}`}
      style={overrideStyle}
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={handleBlur}
    >
      {displayContent}
    </Component>
  );
}
