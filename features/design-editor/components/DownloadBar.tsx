"use client";

import React, { useState, useEffect } from "react";
import { Download, Loader2, ChevronUp, ChevronDown } from "lucide-react";

const ALL_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"] as const;

interface DownloadBarProps {
  selectedCount: number;
  downloading: boolean;
  downloadProgress?: string;
  currentRatio: string;
  onClear: () => void;
  onDownload: (ratios: string[]) => void;
}

export default function DownloadBar({ selectedCount, downloading, downloadProgress, currentRatio, onClear, onDownload }: DownloadBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedRatios, setSelectedRatios] = useState<Set<string>>(new Set([currentRatio]));

  useEffect(() => {
    setSelectedRatios(new Set([currentRatio]));
  }, [currentRatio]);

  const toggleRatio = (ratio: string) => {
    setSelectedRatios(prev => {
      const next = new Set(prev);
      if (next.has(ratio)) {
        if (next.size > 1) next.delete(ratio);
      } else {
        next.add(ratio);
      }
      return next;
    });
  };

  return (
    <div className="fixed bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-[70]">
      <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-200/60 dark:border-neutral-700/60 px-2 py-1.5 flex flex-col gap-1.5">
        {expanded && (
          <div className="flex flex-col gap-1.5 pb-1.5 border-b border-gray-200/60 dark:border-neutral-700/60 px-1.5">
            <label className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">Export Sizes</label>
            <div className="flex gap-0.5">
              {ALL_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => toggleRatio(ratio)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                    selectedRatios.has(ratio)
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                      : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-0.5">
          <span className="px-3 py-1.5 text-[12px] font-semibold text-gray-900 dark:text-white">{selectedCount} selected</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300 transition-all flex items-center gap-1"
          >
            Sizes {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            {selectedRatios.size > 1 && (
              <span className="bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{selectedRatios.size}</span>
            )}
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300 transition-all"
          >
            Clear
          </button>
          <button
            onClick={() => onDownload(Array.from(selectedRatios))}
            disabled={downloading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm transition-all hover:bg-gray-800 dark:hover:bg-neutral-200 active:scale-95 disabled:opacity-50"
          >
            {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
