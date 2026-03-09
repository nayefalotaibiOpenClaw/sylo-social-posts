"use client";

import React from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadBarProps {
  selectedCount: number;
  downloading: boolean;
  onClear: () => void;
  onDownload: () => void;
}

export default function DownloadBar({ selectedCount, downloading, onClear, onDownload }: DownloadBarProps) {
  return (
    <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4">
      <span className="text-sm font-bold text-gray-700">{selectedCount} selected</span>
      <button
        onClick={onClear}
        className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
      >
        Clear
      </button>
      <button
        onClick={onDownload}
        disabled={downloading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
      >
        {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        Download All
      </button>
    </div>
  );
}
