"use client";

import React, { createContext, useContext, useCallback } from "react";

export interface ElementOverride {
  text?: string;
  color?: string;
  fontSize?: string;
  imageSrc?: string;
  hidden?: boolean;
  /** Original text content — used to locate this element in the code string */
  _originalText?: string;
}

export interface PostConfigOverrides {
  bgImage?: string;
  bgColor?: string;
  bgGradient?: string;
  elements?: {
    [configKey: string]: ElementOverride;
  };
}

interface OverrideContextValue {
  overrides: PostConfigOverrides;
  setOverride: (path: string, value: unknown) => void;
}

const OverrideContext = createContext<OverrideContextValue>({
  overrides: {},
  setOverride: () => {},
});

export function useOverrides(): PostConfigOverrides {
  return useContext(OverrideContext).overrides;
}

export function useSetOverride(): (path: string, value: unknown) => void {
  return useContext(OverrideContext).setOverride;
}

export function useElementOverride(configKey: string | undefined): ElementOverride | undefined {
  const { overrides } = useContext(OverrideContext);
  if (!configKey || !overrides.elements) return undefined;
  return overrides.elements[configKey];
}

interface OverrideProviderProps {
  overrides: PostConfigOverrides;
  onChange: (overrides: PostConfigOverrides) => void;
  children: React.ReactNode;
}

export function OverrideProvider({ overrides, onChange, children }: OverrideProviderProps) {
  const setOverride = useCallback((path: string, value: unknown) => {
    const next = { ...overrides };

    // Top-level keys: bgImage, bgColor, bgGradient
    if (path === "bgImage" || path === "bgColor" || path === "bgGradient") {
      (next as Record<string, unknown>)[path] = value;
    } else {
      // Element overrides: "elements.<configKey>.<field>"
      const parts = path.split(".");
      if (parts[0] === "elements" && parts.length === 3) {
        const configKey = parts[1];
        const field = parts[2];
        next.elements = { ...next.elements };
        next.elements[configKey] = { ...next.elements[configKey], [field]: value };
      }
    }

    onChange(next);
  }, [overrides, onChange]);

  return (
    <OverrideContext.Provider value={{ overrides, setOverride }}>
      {children}
    </OverrideContext.Provider>
  );
}

export default OverrideContext;
