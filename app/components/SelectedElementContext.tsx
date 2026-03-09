"use client";

import React, { createContext, useContext, useCallback, useState } from "react";

export type SelectedElementType = 'text' | 'background' | 'mockup' | 'card' | 'image' | 'section' | null;

interface SelectedElementContextValue {
  selectedElementKey: string | null;
  selectedElementType: SelectedElementType;
  setSelectedElement: (key: string | null, type: SelectedElementType) => void;
}

const SelectedElementContext = createContext<SelectedElementContextValue>({
  selectedElementKey: null,
  selectedElementType: null,
  setSelectedElement: () => {},
});

export function useSelectedElement() {
  return useContext(SelectedElementContext);
}

export function SelectedElementProvider({ children }: { children: React.ReactNode }) {
  const [selectedElementKey, setKey] = useState<string | null>(null);
  const [selectedElementType, setType] = useState<SelectedElementType>(null);

  const setSelectedElement = useCallback((key: string | null, type: SelectedElementType) => {
    setKey(key);
    setType(type);
  }, []);

  return (
    <SelectedElementContext.Provider value={{ selectedElementKey, selectedElementType, setSelectedElement }}>
      {children}
    </SelectedElementContext.Provider>
  );
}

export default SelectedElementContext;
