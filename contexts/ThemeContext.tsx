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
  font: "'Cairo', sans-serif",
};

const STORAGE_KEY = "sylo-theme";

function loadTheme(): Theme {
  if (typeof window === "undefined") return defaultTheme;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultTheme, ...JSON.parse(stored) };
  } catch {}
  return defaultTheme;
}

const ThemeContext = createContext<Theme>(defaultTheme);
const ThemeSetContext = createContext<(theme: Theme) => void>(() => {});

export const useTheme = () => useContext(ThemeContext);
export const useSetTheme = () => useContext(ThemeSetContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
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
