"use client";

import React, { useContext, useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { EditContext, useSelectedId, useSetSelectedId, ParentSelectedContext, UploadSignalContext } from './EditContext';
import { Move, RotateCw, ImagePlus, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const STORAGE_KEY = "sylo-drag-positions";
const TRANSFORM_KEY = "sylo-transforms";

function loadPosition(id: string): { x: number; y: number } {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data[id] || { x: 0, y: 0 };
  } catch { return { x: 0, y: 0 }; }
}

function savePosition(id: string, xVal: number, yVal: number) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    data[id] = { x: xVal, y: yVal };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface Transforms {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

function loadTransforms(id: string): Transforms {
  try {
    const data = JSON.parse(localStorage.getItem(TRANSFORM_KEY) || "{}");
    return data[id] || { rotateX: 0, rotateY: 0, rotateZ: 0 };
  } catch { return { rotateX: 0, rotateY: 0, rotateZ: 0 }; }
}

function saveTransforms(id: string, transforms: Transforms) {
  try {
    const data = JSON.parse(localStorage.getItem(TRANSFORM_KEY) || "{}");
    data[id] = transforms;
    localStorage.setItem(TRANSFORM_KEY, JSON.stringify(data));
  } catch {}
}

const stopAll = (e: React.SyntheticEvent) => {
  e.stopPropagation();
  e.nativeEvent.stopImmediatePropagation();
};

interface DraggableWrapperProps {
  children: React.ReactNode;
  className?: string;
  id: string;
  dir?: string;
  style?: React.CSSProperties;
}

export default function DraggableWrapper({ children, className = "", id, dir, style }: DraggableWrapperProps) {
  const isEditMode = useContext(EditContext);
  const selectedId = useSelectedId();
  const setSelectedId = useSetSelectedId();
  const isSelected = isEditMode && selectedId === id;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [transforms, setTransforms] = useState<Transforms>({ rotateX: 0, rotateY: 0, rotateZ: 0 });
  const [showAnglePanel, setShowAnglePanel] = useState(false);
  const [uploadSignal, setUploadSignal] = useState(0);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const saved = loadPosition(id);
    if (saved.x !== 0 || saved.y !== 0) {
      x.set(saved.x);
      y.set(saved.y);
    }
    setTransforms(loadTransforms(id));
  }, [id, x, y]);

  // Update toolbar position when selected
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

  const handleDragEnd = useCallback(() => {
    savePosition(id, x.get(), y.get());
  }, [id, x, y]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setSelectedId(isSelected ? null : id);
    if (isSelected) setShowAnglePanel(false);
  }, [isEditMode, isSelected, id, setSelectedId]);

  const updateTransform = useCallback((key: keyof Transforms, value: number) => {
    setTransforms(prev => {
      const next = { ...prev, [key]: value };
      saveTransforms(id, next);
      return next;
    });
  }, [id]);

  const resetAll = useCallback(() => {
    x.set(0);
    y.set(0);
    savePosition(id, 0, 0);
    const zero = { rotateX: 0, rotateY: 0, rotateZ: 0 };
    setTransforms(zero);
    saveTransforms(id, zero);
    setShowAnglePanel(false);
  }, [id, x, y]);

  const nudge = useCallback((dx: number, dy: number) => {
    x.set(x.get() + dx);
    y.set(y.get() + dy);
    savePosition(id, x.get(), y.get());
  }, [id, x, y]);

  const hasTransform = transforms.rotateX !== 0 || transforms.rotateY !== 0 || transforms.rotateZ !== 0;

  return (
    <>
      <motion.div
        ref={wrapperRef}
        drag={isSelected}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragTransition={{ power: 0 }}
        style={{ x, y, touchAction: isSelected ? 'none' : 'auto', perspective: hasTransform ? '800px' : undefined, ...style }}
        whileDrag={{ scale: 1.05, zIndex: 100 }}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        dir={dir}
        className={`${className}`}
      >
        {/* Selection border */}
        {isSelected && (
          <div className="absolute -inset-1 border-2 border-dashed border-[#B7FF5B]/50 rounded-xl pointer-events-none z-50" />
        )}

        <UploadSignalContext.Provider value={uploadSignal}>
        <ParentSelectedContext.Provider value={isSelected}>
          {hasTransform ? (
            <div
              style={{
                transform: `rotateX(${transforms.rotateX}deg) rotateY(${transforms.rotateY}deg) rotateZ(${transforms.rotateZ}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.3s ease',
              }}
            >
              {children}
            </div>
          ) : children}
        </ParentSelectedContext.Provider>
        </UploadSignalContext.Provider>
      </motion.div>

      {/* Portal toolbar — rendered at body level so it's always on top */}
      {isSelected && toolbarPos && createPortal(
        <div
          className="fixed z-[9999] pointer-events-auto"
          style={{ top: toolbarPos.top - 52, left: toolbarPos.left, transform: 'translateX(-50%)' }}
          onClick={stopAll}
          onPointerDown={stopAll}
          onMouseDown={stopAll}
        >
          {/* Angle Panel */}
          {showAnglePanel && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-56">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">3D Rotation</div>
              {([
                { key: 'rotateX' as const, label: 'X', color: '#EF4444' },
                { key: 'rotateY' as const, label: 'Y', color: '#3B82F6' },
                { key: 'rotateZ' as const, label: 'Z', color: '#10B981' },
              ]).map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span className="text-xs font-bold w-4 text-center" style={{ color }}>{label}</span>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    value={transforms[key]}
                    onChange={(e) => updateTransform(key, Number(e.target.value))}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex-1 h-1.5 appearance-none bg-gray-200 rounded-full cursor-pointer accent-gray-900"
                  />
                  <span className="text-[10px] font-mono font-bold text-gray-500 w-8 text-right">{transforms[key]}°</span>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-0.5 bg-white rounded-2xl shadow-xl border border-gray-200 px-1.5 py-1">
            <button
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
              title="Drag to move"
              onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
            >
              <Move size={16} />
            </button>

            <div className="w-px h-6 bg-gray-200" />

            <button onClick={() => nudge(0, -4)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Nudge up">
              <ChevronUp size={14} />
            </button>
            <button onClick={() => nudge(0, 4)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Nudge down">
              <ChevronDown size={14} />
            </button>
            <button onClick={() => nudge(-4, 0)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Nudge left">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => nudge(4, 0)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Nudge right">
              <ChevronRight size={14} />
            </button>

            <div className="w-px h-6 bg-gray-200" />

            <button
              onClick={() => setShowAnglePanel(!showAnglePanel)}
              className={`p-2 rounded-xl transition-colors ${showAnglePanel ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              title="Adjust angle"
            >
              <RotateCw size={16} />
            </button>

            <button
              onClick={() => setUploadSignal(s => s + 1)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              title="Upload image"
            >
              <ImagePlus size={16} />
            </button>

            <div className="w-px h-6 bg-gray-200" />

            <button
              onClick={resetAll}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              title="Reset position & angle"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
