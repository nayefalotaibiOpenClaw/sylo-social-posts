"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Loader2, Video } from "lucide-react";
import { toPng, toCanvas } from "html-to-image";

// Design canvas sizes — kept small for viewport rendering.
// Export uses pixelRatio: 2 to hit social media resolution (1080×1080, 1080×1350, etc.)
const SIZES: Record<string, { width: number; height: number }> = {
  "1:1":  { width: 540, height: 540 },
  "4:5":  { width: 540, height: 675 },
  "3:4":  { width: 540, height: 720 },
  "4:3":  { width: 540, height: 405 },
  "9:16": { width: 540, height: 960 },
  "16:9": { width: 960, height: 540 },
};

const ASPECT_RATIOS: Record<string, string> = {
  "1:1":  "1 / 1",
  "4:5":  "4 / 5",
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
  const [recording, setRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [scale, setScale] = useState(1);
  const [toolbarTarget, setToolbarTarget] = useState<HTMLElement | null>(null);

  // Find the toolbar portal target in the parent post card
  useEffect(() => {
    const find = () => {
      const el = containerRef.current;
      if (!el) return false;
      const postCard = el.closest("[data-post-card]");
      if (!postCard) return false;
      const target = postCard.querySelector("[data-toolbar-right]");
      if (target) { setToolbarTarget(target as HTMLElement); return true; }
      return false;
    };
    if (!find()) {
      // Retry once after paint in case DOM isn't ready yet
      requestAnimationFrame(() => find());
    }
  }, []);

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

  const handleDownloadVideo = async () => {
    if (!ref.current) return;
    setRecording(true);
    setRecordProgress(0);

    try {
      const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");

      const fps = 15;
      const duration = 4;
      const totalFrames = fps * duration;
      const pixelRatio = 2;
      const w = size.width * pixelRatio;
      const h = size.height * pixelRatio;

      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: "avc",
          width: w,
          height: h,
        },
        fastStart: "in-memory",
      });

      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => console.error("Encoder error:", e),
      });

      encoder.configure({
        codec: "avc1.640028",
        width: w,
        height: h,
        bitrate: 8_000_000,
        framerate: fps,
      });

      for (let i = 0; i < totalFrames; i++) {
        const frameCanvas = await toCanvas(ref.current, {
          pixelRatio,
          cacheBust: true,
        });

        const frame = new VideoFrame(frameCanvas, {
          timestamp: (i * 1_000_000) / fps,
          duration: 1_000_000 / fps,
        });

        encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
        frame.close();

        setRecordProgress(Math.round(((i + 1) / totalFrames) * 100));
      }

      await encoder.flush();
      encoder.close();
      muxer.finalize();

      const buffer = (muxer.target as InstanceType<typeof ArrayBufferTarget>).buffer;
      const blob = new Blob([buffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${filename}-${aspectRatio.replace(":", "x")}.mp4`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export video:", err);
    } finally {
      setRecording(false);
      setRecordProgress(0);
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

  const actionButtons = (
    <>
      <button
        onClick={handleDownloadVideo}
        disabled={recording || loading}
        className="text-gray-500 p-1 rounded hover:bg-gray-100 hover:text-gray-700 transition-all disabled:opacity-50"
        title="Download as MP4 Video"
      >
        <Video size={14} />
      </button>
      <button
        onClick={handleDownload}
        disabled={loading || recording}
        className="text-gray-500 p-1 rounded hover:bg-gray-100 hover:text-gray-700 transition-all disabled:opacity-50"
        title="Download as PNG"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      </button>
    </>
  );

  return (
    <div ref={containerRef} className="relative group overflow-hidden rounded-xl" style={{ width: '100%', aspectRatio: ar }}>
      <div
        className="absolute top-0 left-0"
        style={{ width: size.width, height: size.height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <div
          ref={ref}
          className="overflow-hidden post-wrapper"
          style={{ width: size.width, height: size.height }}
        >
          {children}
        </div>
      </div>

      {/* Recording progress overlay */}
      {recording && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 rounded-xl">
          <div className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-gray-600" />
            <span className="text-sm font-bold text-gray-700">{recordProgress}%</span>
          </div>
        </div>
      )}

      {toolbarTarget ? createPortal(actionButtons, toolbarTarget) : null}
    </div>
  );
}
