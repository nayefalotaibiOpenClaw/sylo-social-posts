"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Type, Paintbrush, ChevronDown } from "lucide-react";
import { useSelectedElement } from "./SelectedElementContext";
import { useSetOverride } from "./OverrideContext";

const FONT_SIZES = [
  { label: "S", value: "text-2xl" },
  { label: "M", value: "text-3xl" },
  { label: "L", value: "text-4xl" },
  { label: "XL", value: "text-5xl" },
  { label: "2XL", value: "text-6xl" },
  { label: "3XL", value: "text-7xl" },
];

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#1B4332", "#B7FF5B",
  "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6",
  "#EC4899", "#10B981", "#6366F1", "#F97316",
];

export default function ContextualToolbar() {
  const { selectedElementKey, selectedElementType } = useSelectedElement();
  const setOverride = useSetOverride();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");
  const [showSizePicker, setShowSizePicker] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Reset dropdowns when element selection changes
  useEffect(() => {
    setShowColorPicker(false);
    setShowSizePicker(false);
  }, [selectedElementKey]);

  // Find the selected element in the DOM and position toolbar above it
  useEffect(() => {
    if (!selectedElementKey) {
      setPosition(null);
      return;
    }

    const update = () => {
      const el = document.querySelector(`[data-config-key="${selectedElementKey}"]`);
      if (!el) {
        setPosition(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - 48,
        left: rect.left + rect.width / 2,
      });
    };

    update();
    const interval = setInterval(update, 200);
    window.addEventListener("scroll", update, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", update, true);
    };
  }, [selectedElementKey]);

  if (!selectedElementKey || !selectedElementType || !position) return null;

  const handleColorChange = (color: string) => {
    setOverride(`elements.${selectedElementKey}.color`, color);
    setShowColorPicker(false);
  };

  const handleSizeChange = (size: string) => {
    setOverride(`elements.${selectedElementKey}.fontSize`, size);
    setShowSizePicker(false);
  };

  if (selectedElementType !== "text") return null;

  return createPortal(
    <div
      ref={toolbarRef}
      data-contextual-toolbar
      className="fixed z-[9999]"
      style={{ top: position.top, left: position.left, transform: "translateX(-50%)" }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-0.5 bg-white rounded-2xl shadow-xl border border-gray-200 px-1.5 py-1">
        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowSizePicker(false); }}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            title="Text color"
          >
            <Paintbrush size={14} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48">
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleColorChange(customColor); }}
                  className="flex-1 text-xs font-mono text-gray-700 bg-gray-100 rounded-lg px-2 py-1.5 border-none outline-none"
                  placeholder="#000000"
                />
                <button
                  onClick={() => handleColorChange(customColor)}
                  className="text-xs font-bold text-white bg-gray-900 rounded-lg px-2 py-1.5 hover:bg-gray-700 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {/* Font size picker */}
        <div className="relative">
          <button
            onClick={() => { setShowSizePicker(!showSizePicker); setShowColorPicker(false); }}
            className="flex items-center gap-1 p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            title="Font size"
          >
            <Type size={14} />
            <ChevronDown size={10} />
          </button>
          {showSizePicker && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 min-w-[100px]">
              {FONT_SIZES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleSizeChange(value)}
                  className="w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {label} <span className="text-gray-400 font-normal ml-1">{value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
