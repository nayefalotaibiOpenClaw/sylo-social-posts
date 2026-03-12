"use client";

import React from "react";
import { Check } from "lucide-react";
import { type Theme } from "@/contexts/ThemeContext";
import { FONTS } from "@/features/design-editor/constants/fonts";
import { PALETTES } from "@/features/design-editor/constants/palettes";

interface ThemePanelProps {
  currentTheme: Theme;
  setTheme: (t: Theme) => void;
}

export default function ThemePanel({ currentTheme, setTheme }: ThemePanelProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg p-4 text-center" style={{ backgroundColor: currentTheme.primaryLight, fontFamily: currentTheme.font }}>
        <p className="text-lg font-black" style={{ color: currentTheme.primary }}>معاينة مباشرة</p>
        <p className="text-xs font-bold" style={{ color: currentTheme.accent }}>هذا مثال على شكل النصوص</p>
        <div className="flex justify-center gap-1.5 mt-2">
          <span className="px-3 py-1 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: currentTheme.accent }}>زر</span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: currentTheme.accentLime, color: currentTheme.primary }}>مميز</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Color Palette</label>
        <div className="space-y-1.5">
          {PALETTES.map((palette) => {
            const isSelected = palette.theme.primary === currentTheme.primary && palette.theme.primaryLight === currentTheme.primaryLight;
            return (
              <button
                key={palette.name}
                onClick={() => setTheme({ ...palette.theme, font: currentTheme.font })}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  isSelected ? 'border-gray-900 dark:border-white bg-white dark:bg-neutral-900 shadow-sm' : 'border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex gap-1 shrink-0">
                  {[palette.theme.primary, palette.theme.accent, palette.theme.accentLight, palette.theme.accentLime].map((c, j) => (
                    <div key={j} className="w-5 h-5 rounded" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-neutral-300 truncate flex-1">{palette.name}</span>
                {isSelected && <Check size={14} className="text-gray-900 dark:text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Edit Colors</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: 'primary', label: 'Primary' },
            { key: 'primaryLight', label: 'Light BG' },
            { key: 'accent', label: 'Accent' },
            { key: 'accentLight', label: 'Accent Light' },
            { key: 'accentLime', label: 'Highlight' },
            { key: 'accentGold', label: 'Gold' },
            { key: 'border', label: 'Border' },
            { key: 'primaryDark', label: 'Dark' },
          ] as { key: keyof Theme; label: string }[]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 cursor-pointer hover:border-gray-300 dark:hover:border-neutral-600 transition-colors">
              <input
                type="color"
                value={currentTheme[key]}
                onChange={(e) => setTheme({ ...currentTheme, [key]: e.target.value })}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
              />
              <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Font</label>
        <div className="space-y-1.5">
          {FONTS.map((font) => {
            const isSelected = font.value === currentTheme.font;
            return (
              <button
                key={font.value}
                onClick={() => setTheme({ ...currentTheme, font: font.value })}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  isSelected ? 'border-gray-900 dark:border-white bg-white dark:bg-neutral-900 shadow-sm' : 'border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600'
                }`}
              >
                <span className="text-sm font-bold" style={{ fontFamily: font.value }}>{font.name}</span>
                {isSelected && <Check size={14} className="text-gray-900 dark:text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
