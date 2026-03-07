"use client";

import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { EditContext } from './EditContext';
import { Move } from 'lucide-react';

interface DraggableWrapperProps {
  children: React.ReactNode;
  className?: string;
  id: string;
}

export default function DraggableWrapper({ children, className = "", id }: DraggableWrapperProps) {
  const isEditMode = useContext(EditContext);

  return (
    <motion.div
      drag={isEditMode}
      dragMomentum={false}
      dragTransition={{ power: 0 }}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
      whileTap={isEditMode ? { cursor: "grabbing" } : {}}
      onDragStart={() => console.log(`Dragging: ${id}`)}
      className={`relative ${isEditMode ? 'cursor-move' : ''} ${className}`}
      style={{ touchAction: isEditMode ? 'none' : 'auto' }}
    >
      {isEditMode && (
        <div className="absolute -inset-2 border-2 border-dashed border-[#B7FF5B]/40 rounded-xl pointer-events-none z-50">
          <div className="absolute -top-3 -left-3 bg-[#B7FF5B] text-[#1B4332] p-1 rounded-md shadow-lg flex items-center justify-center">
             <Move size={14} />
          </div>
        </div>
      )}

      {children}
    </motion.div>
  );
}
