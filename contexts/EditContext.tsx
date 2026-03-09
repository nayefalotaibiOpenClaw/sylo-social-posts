"use client";

import { createContext, useContext } from "react";

export const EditContext = createContext(false);
export const useEditMode = () => useContext(EditContext);

export type AspectRatioType = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
export const AspectRatioContext = createContext<AspectRatioType>("1:1");
export const useAspectRatio = () => useContext(AspectRatioContext);

// Track which DraggableWrapper is currently selected
export const SelectedIdContext = createContext<string | null>(null);
export const SetSelectedIdContext = createContext<(id: string | null) => void>(() => {});
export const useSelectedId = () => useContext(SelectedIdContext);
export const useSetSelectedId = () => useContext(SetSelectedIdContext);

// Whether the current DraggableWrapper parent is selected
export const ParentSelectedContext = createContext(false);
export const useParentSelected = () => useContext(ParentSelectedContext);

// Whether the parent DraggableWrapper is currently being dragged
export const ParentDraggingContext = createContext(false);
export const useParentDragging = () => useContext(ParentDraggingContext);

// Upload signal — increments when toolbar upload button is clicked
export const UploadSignalContext = createContext(0);
export const useUploadSignal = () => useContext(UploadSignalContext);
