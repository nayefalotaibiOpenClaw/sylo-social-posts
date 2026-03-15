"use client";

import React, { useMemo, useState } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2, RefreshCw, ChevronDown, ChevronUp, Eraser, ArchiveRestore } from "lucide-react";
import MobileNavMenu from "./MobileNavMenu";
import { type SidebarTab } from "./Sidebar";

const ASSET_TYPES = [
  { value: "screenshot", label: "Screenshot" },
  { value: "product", label: "Product" },
  { value: "background", label: "Background" },
  { value: "logo", label: "Logo" },
  { value: "icon", label: "Icon" },
  { value: "iphone", label: "iPhone" },
  { value: "ipad", label: "iPad" },
  { value: "desktop", label: "Desktop" },
  { value: "android_phone", label: "Android Phone" },
  { value: "android_tablet", label: "Android Tablet" },
  { value: "other", label: "Other" },
] as const;

export type AssetTypeValue = typeof ASSET_TYPES[number]["value"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AssetRecord = any;

interface AssetsPageProps {
  assets: AssetRecord[] | undefined;
  pendingFiles: File[];
  setPendingFiles: React.Dispatch<React.SetStateAction<File[]>>;
  showAssetUploadDialog: boolean;
  setShowAssetUploadDialog: React.Dispatch<React.SetStateAction<boolean>>;
  assetTypeSelect: AssetTypeValue;
  setAssetTypeSelect: React.Dispatch<React.SetStateAction<AssetTypeValue>>;
  assetScope: "workspace" | "global";
  setAssetScope: React.Dispatch<React.SetStateAction<"workspace" | "global">>;
  uploadingAsset: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAssetUpload: () => void;
  onRemoveAsset: (id: string) => void;
  onRetryAnalysis: (asset: AssetRecord) => void;
  onRemoveBackground: (asset: AssetRecord | AssetRecord[]) => void;
  removingBgAssetIds?: Set<string>;
  bgRemovalError?: string | null;
  onArchiveAsset: (id: string, archived: boolean) => void;
  activeTab?: SidebarTab;
  onTabClick?: (tab: SidebarTab) => void;
  workspaces?: { _id: string; name: string }[];
  currentWorkspaceId?: string;
  currentWorkspaceName?: string;
}

export default function AssetsPage({
  assets,
  pendingFiles,
  setPendingFiles,
  showAssetUploadDialog,
  setShowAssetUploadDialog,
  assetTypeSelect,
  setAssetTypeSelect,
  assetScope,
  setAssetScope,
  uploadingAsset,
  onFileSelect,
  onAssetUpload,
  onRemoveAsset,
  onRetryAnalysis,
  onRemoveBackground,
  removingBgAssetIds,
  bgRemovalError,
  onArchiveAsset,
  activeTab,
  onTabClick,
  workspaces,
  currentWorkspaceId,
  currentWorkspaceName,
}: AssetsPageProps) {
  const previewUrls = useMemo(() => {
    return pendingFiles.map((file) => URL.createObjectURL(file));
  }, [pendingFiles]);

  React.useEffect(() => {
    return () => { previewUrls.forEach((url) => URL.revokeObjectURL(url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFiles]);

  const { activeGrouped, archivedGrouped, activeCount, archivedCount } = useMemo(() => {
    if (!assets) return { activeGrouped: {}, archivedGrouped: {}, activeCount: 0, archivedCount: 0 };
    const active: Record<string, AssetRecord[]> = {};
    const archived: Record<string, AssetRecord[]> = {};
    let ac = 0, arc = 0;
    for (const asset of assets) {
      const target = asset.archived ? archived : active;
      if (asset.archived) arc++; else ac++;
      const type = asset.type;
      if (!target[type]) target[type] = [];
      target[type].push(asset);
    }
    return { activeGrouped: active, archivedGrouped: archived, activeCount: ac, archivedCount: arc };
  }, [assets]);

  return (
    <div className="flex-1 bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Floating Nav */}
      <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
        <nav className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-4">
          {onTabClick && <MobileNavMenu activeTab={activeTab ?? 'assets'} onTabClick={onTabClick} workspaces={workspaces} currentWorkspaceId={currentWorkspaceId} currentWorkspaceName={currentWorkspaceName} />}
          {onTabClick && <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700 md:hidden" />}
          <div className="flex items-center gap-2 shrink-0">
            <Upload size={14} className="text-slate-400 dark:text-neutral-500 hidden md:block" />
            <span className="text-sm font-black text-slate-900 dark:text-white">Assets</span>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />

          {assets && (
            <span className="text-xs font-medium text-slate-400 dark:text-neutral-500">
              {activeCount} asset{activeCount !== 1 ? "s" : ""}{archivedCount > 0 && ` · ${archivedCount} archived`}
            </span>
          )}

          <div className="flex-1" />

          <label className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] transition-colors cursor-pointer">
            <Upload size={14} />
            Upload
            <input type="file" multiple accept="image/*" onChange={onFileSelect} className="hidden" />
          </label>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Upload Dialog */}
          {showAssetUploadDialog && pendingFiles.length > 0 && (
            <div className="mb-8 p-5 rounded-2xl border border-[#1B4332]/20 dark:border-[#1B4332]/40 bg-[#EAF4EE] dark:bg-[#1B4332]/10 space-y-4 max-w-2xl">
              <p className="text-sm font-bold text-slate-700 dark:text-neutral-300">{pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} selected</p>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {pendingFiles.map((file, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
                    <img src={previewUrls[i]} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Asset Type</label>
                  <select
                    value={assetTypeSelect}
                    onChange={(e) => setAssetTypeSelect(e.target.value as AssetTypeValue)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-sm font-medium text-slate-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#1B4332]"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Scope</label>
                  <div className="flex gap-1.5">
                    {(["workspace", "global"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setAssetScope(s)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          assetScope === s
                            ? "bg-[#1B4332] text-white"
                            : "bg-white dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {s === "workspace" ? "This Project" : "All Projects"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setPendingFiles([]); setShowAssetUploadDialog(false); }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onAssetUpload}
                  disabled={uploadingAsset}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
                >
                  {uploadingAsset ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  {uploadingAsset ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          )}

          {/* BG Removal Error */}
          {bgRemovalError && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs font-medium text-red-600 dark:text-red-400">
              {bgRemovalError}
            </div>
          )}

          {/* Active Assets grouped by type */}
          {assets && activeCount > 0 && (
            <div className="space-y-8">
              {Object.entries(activeGrouped).map(([type, items]) => (
                <AssetGroup
                  key={type}
                  type={type}
                  items={items}
                  onRemoveAsset={onRemoveAsset}
                  onRetryAnalysis={onRetryAnalysis}
                  onRemoveBackground={onRemoveBackground}
                  removingBgAssetIds={removingBgAssetIds}
                  onArchiveAsset={onArchiveAsset}
                />
              ))}
            </div>
          )}

          {/* Archived Assets */}
          {archivedCount > 0 && (
            <ArchivedSection
              grouped={archivedGrouped}
              count={archivedCount}
              onRemoveAsset={onRemoveAsset}
              onArchiveAsset={onArchiveAsset}
            />
          )}

          {assets && assets.length === 0 && (
            <div className="text-center py-20">
              <ImageIcon className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-neutral-400 font-medium">No assets yet</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Upload images for AI to use in your designs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const COLLAPSED_COUNT = 12; // 2 rows × 6 columns

function AssetGroup({
  type,
  items,
  onRemoveAsset,
  onRetryAnalysis,
  onRemoveBackground,
  removingBgAssetIds,
  onArchiveAsset,
}: {
  type: string;
  items: AssetRecord[];
  onRemoveAsset: (id: string) => void;
  onRetryAnalysis: (asset: AssetRecord) => void;
  onRemoveBackground: (asset: AssetRecord | AssetRecord[]) => void;
  removingBgAssetIds?: Set<string>;
  onArchiveAsset: (id: string, archived: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, COLLAPSED_COUNT);
  const hasMore = items.length > COLLAPSED_COUNT;

  return (
    <div>
      <h2 className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
        {ASSET_TYPES.find((t) => t.value === type)?.label || type} ({items.length})
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {visibleItems.map((asset: AssetRecord) => (
          <AssetCard
            key={asset._id}
            asset={asset}
            onRemoveAsset={onRemoveAsset}
            onRetryAnalysis={onRetryAnalysis}
            onRemoveBackground={onRemoveBackground}
            isRemovingBg={removingBgAssetIds?.has(asset._id)}
            onArchiveAsset={onArchiveAsset}
          />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300 transition-colors"
        >
          {expanded ? (
            <><ChevronUp size={14} /> Show less</>
          ) : (
            <><ChevronDown size={14} /> Show all {items.length}</>
          )}
        </button>
      )}
    </div>
  );
}

function AssetCard({
  asset,
  onRemoveAsset,
  onRetryAnalysis,
  onRemoveBackground,
  isRemovingBg,
  onArchiveAsset,
  isArchived,
}: {
  asset: AssetRecord;
  onRemoveAsset: (id: string) => void;
  onRetryAnalysis?: (asset: AssetRecord) => void;
  onRemoveBackground?: (asset: AssetRecord) => void;
  isRemovingBg?: boolean;
  onArchiveAsset: (id: string, archived: boolean) => void;
  isArchived?: boolean;
}) {
  return (
    <div
      className={`group relative aspect-square rounded-2xl overflow-hidden border transition-colors ${
        isArchived
          ? "bg-slate-200 dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 opacity-60"
          : "bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600"
      }`}
      title={asset.description || asset.fileName}
    >
      {asset.url ? (
        <img src={asset.url} alt={asset.fileName} className={`w-full h-full object-cover ${isArchived ? "grayscale" : ""}`} />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon size={24} className="text-slate-300 dark:text-neutral-600" />
        </div>
      )}

      {/* Analysis status */}
      {!isArchived && asset.analyzingStatus === "pending" && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <Loader2 size={12} className="animate-spin text-yellow-800" />
        </div>
      )}
      {!isArchived && asset.analyzingStatus === "done" && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}
      {!isArchived && asset.analyzingStatus === "failed" && onRetryAnalysis && (
        <button
          onClick={() => onRetryAnalysis(asset)}
          className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
          title="Analysis failed — click to retry"
        >
          <RefreshCw size={12} className="text-white" />
        </button>
      )}

      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isArchived ? (
          <button
            onClick={() => onArchiveAsset(asset._id, false)}
            className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            title="Restore from archive"
          >
            <ArchiveRestore size={12} />
          </button>
        ) : (
          <>
            {isRemovingBg ? (
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center">
                <Loader2 size={12} className="animate-spin" />
              </div>
            ) : onRemoveBackground ? (
              <button
                onClick={() => onRemoveBackground(asset)}
                className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                title="Remove background"
              >
                <Eraser size={12} />
              </button>
            ) : null}
          </>
        )}
        <button
          onClick={() => onRemoveAsset(asset._id)}
          className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-white truncate font-medium">
          {isArchived && <span className="text-amber-300">Archived · </span>}
          {asset.description || asset.fileName}
        </p>
      </div>
    </div>
  );
}

function ArchivedSection({
  grouped,
  count,
  onRemoveAsset,
  onArchiveAsset,
}: {
  grouped: Record<string, AssetRecord[]>;
  count: number;
  onRemoveAsset: (id: string) => void;
  onArchiveAsset: (id: string, archived: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-10 pt-8 border-t border-slate-200 dark:border-neutral-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Archived ({count})
        <span className="normal-case font-normal text-[10px]">· not sent to AI</span>
      </button>
      {expanded && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-[10px] font-semibold text-slate-300 dark:text-neutral-600 uppercase tracking-wider mb-3">
                {ASSET_TYPES.find((t) => t.value === type)?.label || type} ({items.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {items.map((asset: AssetRecord) => (
                  <AssetCard
                    key={asset._id}
                    asset={asset}
                    onRemoveAsset={onRemoveAsset}
                    onArchiveAsset={onArchiveAsset}
                    isArchived
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
