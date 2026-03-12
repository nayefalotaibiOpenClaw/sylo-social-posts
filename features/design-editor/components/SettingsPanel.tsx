"use client";

import React from "react";
import { LayoutGrid, List, Pencil, ArrowUpDown, MousePointer2, Check, Eye } from "lucide-react";
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
  hiddenComponents: Set<string>;
  onRestoreComponent: (id: string) => void;
  onRestoreAll: () => void;
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
  hiddenComponents, onRestoreComponent, onRestoreAll,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
              editMode
                ? 'bg-yellow-400 text-yellow-900 border-yellow-500'
                : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'
            }`}
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={() => setReorderMode(!reorderMode)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${
              reorderMode
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'
            }`}
          >
            <ArrowUpDown size={14} />
            Reorder
          </button>
        </div>
        <button
          onClick={() => { setSelectMode(!selectMode); if (selectMode) setSelectedPosts([]); }}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border transition-all mt-2 ${
            selectMode
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'
          }`}
        >
          <MousePointer2 size={14} />
          Select & Download
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
        <div className="flex gap-1">
          {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === ratio
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Device</label>
        <div className="flex gap-1 flex-wrap">
          {(['iphone', 'android', 'ipad', 'android_tablet', 'desktop'] as const).map((device) => (
            <button
              key={device}
              onClick={() => setDeviceType(device)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                deviceType === device
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700'
              }`}
            >
              {device === 'iphone' ? 'iPhone' : device === 'android' ? 'Android' : device === 'ipad' ? 'iPad' : device === 'android_tablet' ? 'Tab' : 'Desktop'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Grid Columns</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((cols) => (
            <button
              key={cols}
              onClick={() => { setGridCols(cols); setViewMode('grid'); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' && gridCols === cols
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700'
              }`}
            >
              {cols}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">View</label>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-[#1B4332] text-white shadow-sm'
                : 'bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700'
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
                : 'bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 hover:bg-gray-100 dark:hover:bg-neutral-700'
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
          <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Collection</label>
          <div className="space-y-1">
            {collections.map((col) => (
              <Link
                key={col._id}
                href={`/design?workspace=${workspaceId}&collection=${col._id}`}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left text-xs font-bold ${
                  col._id === activeCollectionId
                    ? 'border-gray-900 dark:border-white bg-white dark:bg-neutral-900 shadow-sm text-gray-900 dark:text-white'
                    : 'border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600 text-gray-500 dark:text-neutral-400'
                }`}
              >
                {col.name}
                {col._id === activeCollectionId && <Check size={14} />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {editMode && hiddenComponents.size > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
            Hidden ({hiddenComponents.size})
          </label>
          <div className="space-y-1">
            {Array.from(hiddenComponents).map((id) => (
              <div key={id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400 truncate flex-1 mr-2">{id}</span>
                <button
                  onClick={() => onRestoreComponent(id)}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors"
                  title="Restore component"
                >
                  <Eye size={12} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onRestoreAll}
            className="w-full mt-2 py-2 rounded-lg text-xs font-bold bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all"
          >
            Restore All
          </button>
        </div>
      )}

      <div className="pt-3 border-t border-gray-100 dark:border-neutral-800">
        <p className="text-xs text-gray-400 dark:text-neutral-500">{postCount} posts</p>
      </div>
    </div>
  );
}
