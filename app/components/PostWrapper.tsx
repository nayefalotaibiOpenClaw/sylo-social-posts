"use client";

import React, { useRef, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";

const SIZES: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 540, height: 540 },
  "3:4":  { width: 540, height: 720 },
  "4:3":  { width: 540, height: 405 },
  "9:16": { width: 540, height: 960 },
  "16:9": { width: 540, height: 304 },
};

const ASPECT_RATIOS: Record<string, string> = {
  "1:1":  "1 / 1",
  "3:4":  "3 / 4",
  "4:3":  "4 / 3",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
};

interface PostWrapperProps {
  children: React.ReactNode;
  filename?: string;
  aspectRatio?: string;
}

export default function PostWrapper({ children, filename = "post", aspectRatio = "1:1" }: PostWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1);

  const handleDownload = async () => {
    if (!ref.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${filename}-${aspectRatio.replace(":", "x")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setLoading(false);
    }
  };

  const size = SIZES[aspectRatio] || SIZES["1:1"];
  const ar = ASPECT_RATIOS[aspectRatio] || ASPECT_RATIOS["1:1"];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / size.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [size.width]);

  return (
    <div ref={containerRef} className="relative group overflow-hidden rounded-xl" style={{ width: '100%', aspectRatio: ar }}>
      <div
        className="absolute top-0 left-0"
        style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <div
          ref={ref}
          className="overflow-hidden rounded-xl post-wrapper"
          style={{ width: size.width, height: size.height }}
        >
          {children}
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm text-gray-700 p-2.5 rounded-xl shadow-lg border border-gray-200 hover:bg-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        title="Download as PNG"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      </button>
    </div>
  );
}
