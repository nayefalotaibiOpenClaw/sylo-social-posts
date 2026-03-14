"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Theme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  accentLime: string;
  accentGold: string;
  accentOrange: string;
  border: string;
  font: string;
}

export const defaultTheme: Theme = {
  primary: "#1B4332",
  primaryLight: "#EAF4EE",
  primaryDark: "#0D241C",
  accent: "#40916C",
  accentLight: "#52B788",
  accentLime: "#B7FF5B",
  accentGold: "#FCD34D",
  accentOrange: "#F4A261",
  border: "#254d3c",
  font: "var(--font-cairo), 'Cairo', sans-serif",
};

const STORAGE_KEY = "sylo-theme";

// Issue 39: Validate localStorage data against Theme schema
const THEME_KEYS: (keyof Theme)[] = [
  "primary", "primaryLight", "primaryDark", "accent", "accentLight",
  "accentLime", "accentGold", "accentOrange", "border", "font",
];

function loadTheme(): Theme {
  if (typeof window === "undefined") return defaultTheme;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultTheme;
    const parsed = JSON.parse(stored);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return defaultTheme;
    // Only pick known theme keys with string values
    const validated: Partial<Theme> = {};
    for (const key of THEME_KEYS) {
      if (key in parsed && typeof parsed[key] === "string") {
        validated[key] = parsed[key];
      }
    }
    return { ...defaultTheme, ...validated };
  } catch {}
  return defaultTheme;
}

const ThemeContext = createContext<Theme>(defaultTheme);
export { ThemeContext as ThemeCtx };
const ThemeSetContext = createContext<(theme: Theme) => void>(() => {});

export const useTheme = () => useContext(ThemeContext);
export const useSetTheme = () => useContext(ThemeSetContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(loadTheme());
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTheme));
    } catch {}
  };

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeSetContext.Provider value={setTheme}>
        {children}
      </ThemeSetContext.Provider>
    </ThemeContext.Provider>
  );
}
