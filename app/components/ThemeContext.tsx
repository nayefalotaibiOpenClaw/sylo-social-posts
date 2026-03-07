"use client";

import React, { createContext, useContext, useState } from "react";

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

const ThemeContext = createContext<Theme>(defaultTheme);
const ThemeSetContext = createContext<(theme: Theme) => void>(() => {});

export const useTheme = () => useContext(ThemeContext);
export const useSetTheme = () => useContext(ThemeSetContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeSetContext.Provider value={setTheme}>
        <div
          style={{
            "--t-primary": theme.primary,
            "--t-primary-light": theme.primaryLight,
            "--t-primary-dark": theme.primaryDark,
            "--t-accent": theme.accent,
            "--t-accent-light": theme.accentLight,
            "--t-accent-lime": theme.accentLime,
            "--t-accent-gold": theme.accentGold,
            "--t-accent-orange": theme.accentOrange,
            "--t-border": theme.border,
            "--t-font": theme.font,
          } as React.CSSProperties}
          className="contents"
        >
          {children}
        </div>
      </ThemeSetContext.Provider>
    </ThemeContext.Provider>
  );
}
