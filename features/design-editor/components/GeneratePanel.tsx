"use client";

import React from "react";
import { Sparkles, Globe, X, Loader2, RefreshCw, Image as ImageIcon, LayoutGrid } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WorkspaceRecord = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BrandingRecord = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AssetRecord = any;

interface GeneratePanelProps {
  workspace: WorkspaceRecord | undefined;
  branding: BrandingRecord | undefined;
  assets: AssetRecord[] | undefined;
  generatePrompt: string;
  setGeneratePrompt: (v: string) => void;
  generating: boolean;
  generateError: string | null;
  generateCount: number;
  setGenerateCount: (v: number) => void;
  generateVersion: 1 | 2 | 3 | 4 | 5;
  setGenerateVersion: (v: 1 | 2 | 3 | 4 | 5) => void;
  generatedPosts: { id: string; code: string }[];
  setGeneratedPosts: React.Dispatch<React.SetStateAction<{ id: string; code: string }[]>>;
  setLocalOrder: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerate: () => void;
  onGenerateAllLayouts: () => void;
  fetchingWebsite: boolean;
  onRetryWebsiteFetch: () => void;
  websiteScreenshot: string | null;
  setWebsiteScreenshot: (v: string | null) => void;
  websiteScreenshotRef: React.RefObject<HTMLInputElement | null>;
  onWebsiteScreenshot: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function GeneratePanel({
  workspace, branding, assets,
  generatePrompt, setGeneratePrompt,
  generating, generateError,
  generateCount, setGenerateCount,
  generateVersion, setGenerateVersion,
  generatedPosts, setGeneratedPosts, setLocalOrder,
  onGenerate, onGenerateAllLayouts,
  fetchingWebsite, onRetryWebsiteFetch,
  websiteScreenshot, setWebsiteScreenshot,
  websiteScreenshotRef, onWebsiteScreenshot,
}: GeneratePanelProps) {
  return (
    <div className="space-y-4">
      {/* Workspace context summary */}
      {(workspace || branding) && (
        <div className="rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 p-3 space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest block">Context</label>
          <div className="flex items-center gap-2">
            {assets?.find((a: AssetRecord) => a.type === 'logo')?.url && (
              <img src={assets.find((a: AssetRecord) => a.type === 'logo')!.url!} alt="" className="w-6 h-6 rounded object-contain" />
            )}
            <span className="text-sm font-bold text-gray-800 dark:text-neutral-200">{branding?.brandName || workspace?.name}</span>
          </div>
          {branding?.tagline && (
            <p className="text-[11px] text-gray-500 dark:text-neutral-400">{branding.tagline}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {workspace?.industry && (
              <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded border border-gray-200 dark:border-neutral-700">{workspace.industry}</span>
            )}
            {workspace?.defaultLanguage && (
              <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded border border-gray-200 dark:border-neutral-700">{workspace.defaultLanguage === 'ar' ? 'Arabic' : 'English'}</span>
            )}
            {assets && assets.filter((a: AssetRecord) => a.analyzingStatus === 'done').length > 0 && (
              <span className="text-[10px] font-semibold text-gray-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded border border-gray-200">{assets.filter((a: AssetRecord) => a.analyzingStatus === 'done').length} assets</span>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for website screenshot */}
      <input
        ref={websiteScreenshotRef}
        type="file"
        accept="image/*"
        onChange={onWebsiteScreenshot}
        className="hidden"
      />

      {/* Website info summary — full details in Brand tab */}
      {workspace?.websiteInfo?.companyName && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-2.5 flex items-center gap-2">
          <Globe size={12} className="text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-blue-900 truncate">{workspace.websiteInfo.companyName}</p>
            {workspace.websiteInfo.industry && (
              <p className="text-[9px] text-blue-500 truncate">{workspace.websiteInfo.industry}</p>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-neutral-400">Describe the post you want and AI will generate it with your brand context.</p>
      <textarea
        value={generatePrompt}
        onChange={(e) => setGeneratePrompt(e.target.value)}
        placeholder="e.g. A post about our new delivery tracking feature with a phone mockup showing live order status"
        className="w-full h-28 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-neutral-700 text-sm text-gray-900 dark:text-white resize-none focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] placeholder:text-gray-400 dark:placeholder:text-neutral-500 dark:bg-neutral-800"
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Posts</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setGenerateCount(n)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  generateCount === n
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Style</label>
          <div className="flex gap-1">
            {([
              { v: 5 as const, label: 'Classic' },
              { v: 1 as const, label: 'Guided' },
              { v: 2 as const, label: 'Creative' },
              { v: 3 as const, label: 'Free' },
              { v: 4 as const, label: 'Wild' },
            ]).map(({ v, label }) => (
              <button
                key={v}
                onClick={() => setGenerateVersion(v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  generateVersion === v
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onGenerate}
          disabled={generating || !generatePrompt.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <><Loader2 size={16} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={16} /> Generate {generateCount}</>
          )}
        </button>
        <button
          onClick={onGenerateAllLayouts}
          disabled={generating || !generatePrompt.trim()}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate one post per layout (all 24 layouts)"
        >
          <LayoutGrid size={16} />
          <span className="text-xs">All</span>
        </button>
      </div>
      {generateError && (
        <p className="text-xs text-red-500 font-medium">{generateError}</p>
      )}
      {generatedPosts.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
            Generated ({generatedPosts.length})
          </label>
          <div className="space-y-1.5">
            {generatedPosts.map((gp) => (
              <div key={gp.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700">
                <span className="text-xs font-medium text-gray-600 dark:text-neutral-400 truncate">{gp.id}</span>
                <button
                  onClick={() => {
                    setGeneratedPosts(prev => prev.filter(p => p.id !== gp.id));
                    setLocalOrder(prev => prev.filter(id => id !== gp.id));
                  }}
                  className="text-gray-400 dark:text-neutral-500 hover:text-red-500 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
