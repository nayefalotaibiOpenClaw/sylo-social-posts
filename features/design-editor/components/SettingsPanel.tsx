"use client";

import React from "react";
import { LayoutGrid, List, Pencil, ArrowUpDown, MousePointer2, Check } from "lucide-react";
import Link from "next/link";
import { AspectRatioType } from "@/contexts/EditContext";
import { Id } from "@/convex/_generated/dataModel";

interface SettingsPanelProps {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  reorderMode: boolean;
  setReorderMode: (v: boolean) => void;
  selectMode: boolean;
  setSelectMode: (v: boolean) => void;
  setSelectedPosts: React.Dispatch<React.SetStateAction<string[]>>;
  aspectRatio: AspectRatioType;
  setAspectRatio: (v: AspectRatioType) => void;
  gridCols: number;
  setGridCols: (v: number) => void;
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
  collections: { _id: Id<"collections">; name: string }[] | undefined;
  activeCollectionId: Id<"collections"> | null;
  workspaceId: Id<"workspaces">;
  postCount: number;
  deviceType: "iphone" | "android" | "ipad" | "android_tablet" | "desktop";
  setDeviceType: (v: "iphone" | "android" | "ipad" | "android_tablet" | "desktop") => void;
}

export default function SettingsPanel({
  editMode, setEditMode,
  reorderMode, setReorderMode,
  selectMode, setSelectMode,
  setSelectedPosts,
  aspectRatio, setAspectRatio,
  gridCols, setGridCols,
  viewMode, setViewMode,
  collections, activeCollectionId,
  workspaceId, postCount,
  deviceType, setDeviceType,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditMode(!editMode); setReorderMode(false); setSelectMode(false); }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
              editMode
                ? 'bg-yellow-400 text-yellow-900 border-yellow-500'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => { setReorderMode(!reorderMode); setEditMode(false); setSelectMode(false); }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
              reorderMode
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <ArrowUpDown size={14} />
            Reorder
          </button>
        </div>
        <button
          onClick={() => { setSelectMode(!selectMode); setEditMode(false); setReorderMode(false); if (selectMode) setSelectedPosts([]); }}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all mt-2 ${
            selectMode
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
          }`}
        >
          <MousePointer2 size={14} />
          Select & Download
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
        <div className="flex gap-1">
          {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === ratio
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Device</label>
        <div className="flex gap-1 flex-wrap">
          {(['iphone', 'android', 'ipad', 'android_tablet', 'desktop'] as const).map((device) => (
            <button
              key={device}
              onClick={() => setDeviceType(device)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                deviceType === device
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {device === 'iphone' ? 'iPhone' : device === 'android' ? 'Android' : device === 'ipad' ? 'iPad' : device === 'android_tablet' ? 'Tab' : 'Desktop'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Grid Columns</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((cols) => (
            <button
              key={cols}
              onClick={() => { setGridCols(cols); setViewMode('grid'); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' && gridCols === cols
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {cols}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">View</label>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <LayoutGrid size={14} />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <List size={14} />
            List
          </button>
        </div>
      </div>

      {/* Collection Selector */}
      {collections && collections.length > 1 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Collection</label>
          <div className="space-y-1">
            {collections.map((col) => (
              <Link
                key={col._id}
                href={`/design?workspace=${workspaceId}&collection=${col._id}`}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left text-xs font-bold ${
                  col._id === activeCollectionId
                    ? 'border-gray-900 bg-white shadow-sm text-gray-900'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-500'
                }`}
              >
                {col.name}
                {col._id === activeCollectionId && <Check size={14} />}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">{postCount} posts</p>
      </div>
    </div>
  );
}
