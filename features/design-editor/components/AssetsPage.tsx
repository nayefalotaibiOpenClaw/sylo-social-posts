"use client";

import React, { useMemo, useState } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
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

  const grouped = useMemo(() => {
    if (!assets) return {};
    return assets.reduce((acc: Record<string, AssetRecord[]>, asset: AssetRecord) => {
      const type = asset.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(asset);
      return acc;
    }, {} as Record<string, AssetRecord[]>);
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
              {assets.length} asset{assets.length !== 1 ? "s" : ""}
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

          {/* Asset Grid grouped by type */}
          {assets && assets.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(grouped).map(([type, items]) => (
                <AssetGroup
                  key={type}
                  type={type}
                  items={items}
                  onRemoveAsset={onRemoveAsset}
                  onRetryAnalysis={onRetryAnalysis}
                />
              ))}
            </div>
          ) : assets && assets.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-neutral-400 font-medium">No assets yet</p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">Upload images for AI to use in your designs</p>
            </div>
          ) : null}
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
}: {
  type: string;
  items: AssetRecord[];
  onRemoveAsset: (id: string) => void;
  onRetryAnalysis: (asset: AssetRecord) => void;
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
                      <div
                        key={asset._id}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 transition-colors"
                        title={asset.description || asset.fileName}
                      >
                        {asset.url ? (
                          <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={24} className="text-slate-300 dark:text-neutral-600" />
                          </div>
                        )}
                        {/* Analysis status */}
                        {asset.analyzingStatus === "pending" && (
                          <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Loader2 size={12} className="animate-spin text-yellow-800" />
                          </div>
                        )}
                        {asset.analyzingStatus === "done" && (
                          <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        {asset.analyzingStatus === "failed" && (
                          <button
                            onClick={() => onRetryAnalysis(asset)}
                            className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                            title="Analysis failed — click to retry"
                          >
                            <RefreshCw size={12} className="text-white" />
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveAsset(asset._id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] text-white truncate font-medium">{asset.description || asset.fileName}</p>
                        </div>
                      </div>
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
