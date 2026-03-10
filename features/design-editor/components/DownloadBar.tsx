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
    <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 px-4 md:px-6 py-3 flex flex-col gap-2">
      {expanded && (
        <div className="flex flex-col gap-2 pb-2 border-b border-gray-100">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Export Sizes</label>
          <div className="flex gap-1">
            {ALL_RATIOS.map((ratio) => (
              <button
                key={ratio}
                onClick={() => toggleRatio(ratio)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRatios.has(ratio)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-sm font-bold text-gray-700">{selectedCount} selected</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          Sizes {expanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          {selectedRatios.size > 1 && (
            <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{selectedRatios.size}</span>
          )}
        </button>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={() => onDownload(Array.from(selectedRatios))}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {downloading && downloadProgress ? downloadProgress : 'Download'}
        </button>
      </div>
    </div>
  );
}
