"use client";

import React, { useContext, useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useDragControls, type MotionValue, type DragControls } from 'framer-motion';
import { EditContext, useSelectedId, useSetSelectedId, useAspectRatio, ParentSelectedContext, ParentDraggingContext, UploadSignalContext } from './EditContext';
import { Move, RotateCcw, ImagePlus } from 'lucide-react';

/* ── Toolbar variants ──
   "mockup"  → Move + XY position + Rotation XYZ + Reset
   "text"    → Move + XY position + Rotation Z + Reset
   "card"    → Move + XY position + Reset
*/
export type ToolbarVariant = "mockup" | "text" | "card";

/* ── Toolbar Portal ── */

interface ToolbarPortalProps {
  toolbarPos: { top: number; left: number };
  variant: ToolbarVariant;
  position: { x: MotionValue<number>; y: MotionValue<number> };
  transforms: Transforms;
  onSetPosition: (axis: 'x' | 'y', value: number) => void;
  onUpdateTransform: (key: keyof Transforms, value: number) => void;
  onUpload: () => void;
  onReset: () => void;
  dragControls: DragControls;
}

function ToolbarPortal({ toolbarPos, variant, position, transforms, onSetPosition, onUpdateTransform, onUpload, onReset, dragControls }: ToolbarPortalProps) {
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const rotationAxes = variant === "mockup"
    ? [
        { key: 'rotateX' as const, label: 'rX', color: '#EF4444' },
        { key: 'rotateY' as const, label: 'rY', color: '#3B82F6' },
        { key: 'rotateZ' as const, label: 'rZ', color: '#10B981' },
      ]
    : variant === "text"
    ? [{ key: 'rotateZ' as const, label: 'rZ', color: '#10B981' }]
    : [];

  return createPortal(
    <div
      data-toolbar-portal
      className="fixed z-[9999]"
      style={{ top: toolbarPos.top - 44, left: toolbarPos.left, transform: 'translateX(-50%)' }}
      onClick={stop}
      onMouseDown={stop}
      onPointerDown={stop}
    >
      <div className="flex items-center gap-0.5 bg-white rounded-2xl shadow-xl border border-gray-200 px-1.5 py-1">
        {/* Move handle */}
        <button
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
          title="Drag to move"
          onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
        >
          <Move size={14} />
        </button>

        <div className="w-px h-5 bg-gray-200" />

        {/* X/Y position inputs */}
        <div className="flex items-center gap-0.5 px-1">
          <span className="text-[10px] font-bold text-gray-400">X</span>
          <input
            type="number"
            value={Math.round(position.x.get())}
            onChange={(e) => onSetPosition('x', Number(e.target.value))}
            className="w-12 h-6 text-[11px] text-center font-mono font-bold text-gray-700 bg-gray-100 rounded-lg border-none outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        <div className="flex items-center gap-0.5 px-1">
          <span className="text-[10px] font-bold text-gray-400">Y</span>
          <input
            type="number"
            value={Math.round(position.y.get())}
            onChange={(e) => onSetPosition('y', Number(e.target.value))}
            className="w-12 h-6 text-[11px] text-center font-mono font-bold text-gray-700 bg-gray-100 rounded-lg border-none outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* Rotation inputs */}
        {rotationAxes.length > 0 && (
          <>
            <div className="w-px h-5 bg-gray-200" />
            {rotationAxes.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-0.5 px-1">
                <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
                <input
                  type="number"
                  min={-45}
                  max={45}
                  value={transforms[key]}
                  onChange={(e) => onUpdateTransform(key, Number(e.target.value))}
                  className="w-10 h-6 text-[11px] text-center font-mono font-bold text-gray-700 bg-gray-100 rounded-lg border-none outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            ))}
          </>
        )}

        {/* Upload — only for mockup */}
        {variant === "mockup" && (
          <>
            <div className="w-px h-5 bg-gray-200" />
            <button
              onClick={onUpload}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              title="Upload image"
            >
              <ImagePlus size={14} />
            </button>
          </>
        )}

        {/* Reset */}
        <div className="w-px h-5 bg-gray-200" />
        <button
          onClick={onReset}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          title="Reset position & angle"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>,
    document.body
  );
}

const STORAGE_KEY = "sylo-drag-positions";
const TRANSFORM_KEY = "sylo-transforms";

function loadPosition(id: string, ratio: string): { x: number; y: number } {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const qualifiedKey = `${id}::${ratio}`;
    return data[qualifiedKey] || data[id] || { x: 0, y: 0 };
  } catch { return { x: 0, y: 0 }; }
}

function savePosition(id: string, ratio: string, xVal: number, yVal: number) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    data[`${id}::${ratio}`] = { x: xVal, y: yVal };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface Transforms {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

function loadTransforms(id: string, ratio: string): Transforms {
  try {
    const data = JSON.parse(localStorage.getItem(TRANSFORM_KEY) || "{}");
    const qualifiedKey = `${id}::${ratio}`;
    return data[qualifiedKey] || data[id] || { rotateX: 0, rotateY: 0, rotateZ: 0 };
  } catch { return { rotateX: 0, rotateY: 0, rotateZ: 0 }; }
}

function saveTransforms(id: string, ratio: string, transforms: Transforms) {
  try {
    const data = JSON.parse(localStorage.getItem(TRANSFORM_KEY) || "{}");
    data[`${id}::${ratio}`] = transforms;
    localStorage.setItem(TRANSFORM_KEY, JSON.stringify(data));
  } catch {}
}

interface DraggableWrapperProps {
  children: React.ReactNode;
  className?: string;
  id: string;
  dir?: string;
  style?: React.CSSProperties;
  /** Toolbar variant: "mockup" (XYZ rotation), "text" (Z rotation), "card" (move only) */
  variant?: ToolbarVariant;
}

export default function DraggableWrapper({ children, className = "", id, dir, style, variant = "text" }: DraggableWrapperProps) {
  const isEditMode = useContext(EditContext);
  const ratio = useAspectRatio();
  const selectedId = useSelectedId();
  const setSelectedId = useSetSelectedId();
  const isSelected = isEditMode && selectedId === id;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [transforms, setTransforms] = useState<Transforms>({ rotateX: 0, rotateY: 0, rotateZ: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const [posVersion, setPosVersion] = useState(0);
  const [uploadSignal, setUploadSignal] = useState(0);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const saved = loadPosition(id, ratio);
    const savedTransforms = loadTransforms(id, ratio);
    if (saved.x !== 0 || saved.y !== 0) {
      x.set(saved.x);
      y.set(saved.y);
      setHasCustomPosition(true);
    } else {
      x.set(0);
      y.set(0);
      setHasCustomPosition(false);
    }
    if (savedTransforms.rotateX !== 0 || savedTransforms.rotateY !== 0 || savedTransforms.rotateZ !== 0) {
      setHasCustomPosition(true);
    }
    setTransforms(savedTransforms);
  }, [id, ratio, x, y]);

  useEffect(() => {
    if (!isSelected || !wrapperRef.current) {
      setToolbarPos(null);
      return;
    }
    const update = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setToolbarPos({ top: rect.top + window.scrollY, left: rect.left + rect.width / 2, width: rect.width });
    };
    update();
    const interval = setInterval(update, 100);
    window.addEventListener('scroll', update, true);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', update, true);
    };
  }, [isSelected]);

  const handleDragStart = useCallback(() => setIsDragging(true), []);
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    savePosition(id, ratio, x.get(), y.get());
    if (x.get() !== 0 || y.get() !== 0) setHasCustomPosition(true);
    setPosVersion(v => v + 1);
  }, [id, ratio, x, y]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedId(isSelected ? null : id);
  }, [isEditMode, isSelected, id, setSelectedId]);

  const setPosition = useCallback((axis: 'x' | 'y', value: number) => {
    if (axis === 'x') x.set(value);
    else y.set(value);
    savePosition(id, ratio, x.get(), y.get());
    setHasCustomPosition(x.get() !== 0 || y.get() !== 0);
    setPosVersion(v => v + 1);
  }, [id, ratio, x, y]);

  const updateTransform = useCallback((key: keyof Transforms, value: number) => {
    setTransforms(prev => {
      const next = { ...prev, [key]: value };
      saveTransforms(id, ratio, next);
      return next;
    });
    setHasCustomPosition(true);
  }, [id, ratio]);

  const resetAll = useCallback(() => {
    x.set(0);
    y.set(0);
    savePosition(id, ratio, 0, 0);
    const zero = { rotateX: 0, rotateY: 0, rotateZ: 0 };
    setTransforms(zero);
    saveTransforms(id, ratio, zero);
    setHasCustomPosition(false);
    setPosVersion(v => v + 1);
  }, [id, ratio, x, y]);

  const hasTransform = transforms.rotateX !== 0 || transforms.rotateY !== 0 || transforms.rotateZ !== 0;

  return (
    <>
      <motion.div
        ref={wrapperRef}
        drag={isEditMode}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragTransition={{ power: 0 }}
        style={{ x, y, touchAction: isEditMode ? 'none' : 'auto', perspective: hasTransform ? '800px' : undefined, transition: isEditMode ? 'none' : undefined, animation: hasCustomPosition ? 'none' : undefined, ...style }}
        whileDrag={{ scale: 1.05, zIndex: 100 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        dir={dir}
        className={`${className} ${isSelected ? 'relative z-[999]' : ''}`}
      >
        {isSelected && (
          <div className="absolute -inset-1 border-2 border-dashed border-[#B7FF5B]/50 rounded-xl pointer-events-none z-50" />
        )}

        <UploadSignalContext.Provider value={uploadSignal}>
        <ParentDraggingContext.Provider value={isDragging}>
        <ParentSelectedContext.Provider value={isSelected}>
          <div
            style={hasTransform ? {
              width: '100%',
              height: '100%',
              transform: `rotateX(${transforms.rotateX}deg) rotateY(${transforms.rotateY}deg) rotateZ(${transforms.rotateZ}deg)`,
              transformStyle: 'preserve-3d' as const,
              transition: 'transform 0.3s ease',
            } : { display: 'contents' }}
          >
            {children}
          </div>
        </ParentSelectedContext.Provider>
        </ParentDraggingContext.Provider>
        </UploadSignalContext.Provider>
      </motion.div>

      {isSelected && toolbarPos && <ToolbarPortal
        toolbarPos={toolbarPos}
        variant={variant}
        position={{ x, y }}
        transforms={transforms}
        onSetPosition={setPosition}
        onUpdateTransform={updateTransform}
        onUpload={() => setUploadSignal(s => s + 1)}
        onReset={resetAll}
        dragControls={dragControls}
      />}
    </>
  );
}
