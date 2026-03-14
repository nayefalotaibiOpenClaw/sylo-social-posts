"use client";

import React, { useMemo } from "react";
import { Upload, Image as ImageIcon, X, Check, Loader2, RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

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

interface AssetsPanelProps {
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
}

export default function AssetsPanel({
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
}: AssetsPanelProps) {
  const { t } = useLocale();

  const assetTypeLabel = (value: string) => {
    const map: Record<string, Parameters<typeof t>[0]> = {
      screenshot: "assets.screenshot", product: "assets.product", background: "assets.background",
      logo: "assets.logo", icon: "assets.icon", iphone: "assets.iphone", ipad: "assets.ipad",
      desktop: "assets.desktop", android_phone: "assets.androidPhone", android_tablet: "assets.androidTablet", other: "assets.other",
    };
    return map[value] ? t(map[value]) : value;
  };

  // Memoize preview URLs to avoid creating new blob URLs on every render
  const previewUrls = useMemo(() => {
    return pendingFiles.map((file) => URL.createObjectURL(file));
  }, [pendingFiles]);

  // Clean up blob URLs when files change
  React.useEffect(() => {
    return () => { previewUrls.forEach((url) => URL.revokeObjectURL(url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFiles]);

  return (
    <div className="space-y-4">
      <label className="block w-full cursor-pointer">
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors">
          <Upload size={16} />
          {t("assets.uploadAssets")}
        </div>
        <input type="file" multiple accept="image/*" onChange={onFileSelect} className="hidden" />
      </label>

      {/* Upload Dialog */}
      {showAssetUploadDialog && pendingFiles.length > 0 && (
        <div className="p-3 rounded-lg border border-[#1B4332] bg-[#EAF4EE] space-y-3">
          <p className="text-xs font-bold text-gray-700 dark:text-neutral-300">{t("assets.filesSelected", { count: String(pendingFiles.length) })}</p>

          <div className="grid grid-cols-3 gap-1.5">
            {pendingFiles.map((file, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
                <img src={previewUrls[i]} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">{t("assets.assetType")}</label>
            <select
              value={assetTypeSelect}
              onChange={(e) => setAssetTypeSelect(e.target.value as AssetTypeValue)}
              className="w-full px-2.5 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 text-xs font-bold text-gray-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 focus:outline-none focus:border-[#1B4332]"
            >
              {ASSET_TYPES.map((at) => (
                <option key={at.value} value={at.value}>{assetTypeLabel(at.value)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">{t("assets.scope")}</label>
            <div className="flex gap-1.5">
              {(["workspace", "global"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setAssetScope(s)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    assetScope === s
                      ? 'bg-[#1B4332] text-white'
                      : 'bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700'
                  }`}
                >
                  {s === "workspace" ? t("assets.thisProject") : t("assets.allProjects")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setPendingFiles([]); setShowAssetUploadDialog(false); }}
              className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
            >
              {t("assets.cancel")}
            </button>
            <button
              onClick={onAssetUpload}
              disabled={uploadingAsset}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
            >
              {uploadingAsset ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {uploadingAsset ? t("assets.uploading") : t("assets.upload")}
            </button>
          </div>
        </div>
      )}

      {/* Asset List grouped by type */}
      {assets && assets.length > 0 ? (
        (() => {
          const grouped = assets.reduce((acc: Record<string, typeof assets>, asset: AssetRecord) => {
            const type = asset.type;
            if (!acc[type]) acc[type] = [];
            acc[type].push(asset);
            return acc;
          }, {} as Record<string, typeof assets>);

          return Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                {assetTypeLabel(type)} ({items!.length})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {items!.map((asset: AssetRecord) => (
                  <div key={asset._id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700" title={asset.description || asset.fileName}>
                    {asset.url ? (
                      <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-gray-300 dark:text-neutral-600" />
                      </div>
                    )}
                    {/* Analysis status indicator */}
                    {asset.analyzingStatus === "pending" && (
                      <div className="absolute top-1 left-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Loader2 size={10} className="animate-spin text-yellow-800" />
                      </div>
                    )}
                    {asset.analyzingStatus === "done" && (
                      <div className="absolute top-1 left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    {asset.analyzingStatus === "failed" && (
                      <button
                        onClick={() => onRetryAnalysis(asset)}
                        className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                        title={t("assets.retryAnalysis")}
                      >
                        <RefreshCw size={10} className="text-white" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveAsset(asset._id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[9px] text-white truncate font-medium">{asset.description || asset.fileName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ));
        })()
      ) : assets && assets.length === 0 ? (
        <div className="text-center py-6">
          <ImageIcon className="w-8 h-8 text-gray-300 dark:text-neutral-600 mx-auto mb-2" />
          <p className="text-xs text-gray-400 dark:text-neutral-500">{t("assets.noAssets")}</p>
        </div>
      ) : null}
    </div>
  );
}
