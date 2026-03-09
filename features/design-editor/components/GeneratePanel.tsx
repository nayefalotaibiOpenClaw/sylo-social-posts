"use client";

import React from "react";
import { Sparkles, Globe, X, Loader2, RefreshCw, Image as ImageIcon } from "lucide-react";

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
  generateVersion: 1 | 2 | 3;
  setGenerateVersion: (v: 1 | 2 | 3) => void;
  generatedPosts: { id: string; code: string }[];
  setGeneratedPosts: React.Dispatch<React.SetStateAction<{ id: string; code: string }[]>>;
  setLocalOrder: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerate: () => void;
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
  onGenerate,
  fetchingWebsite, onRetryWebsiteFetch,
  websiteScreenshot, setWebsiteScreenshot,
  websiteScreenshotRef, onWebsiteScreenshot,
}: GeneratePanelProps) {
  return (
    <div className="space-y-4">
      {/* Workspace context summary */}
      {(workspace || branding) && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Context</label>
          <div className="flex items-center gap-2">
            {assets?.find((a: AssetRecord) => a.type === 'logo')?.url && (
              <img src={assets.find((a: AssetRecord) => a.type === 'logo')!.url!} alt="" className="w-6 h-6 rounded object-contain" />
            )}
            <span className="text-sm font-bold text-gray-800">{branding?.brandName || workspace?.name}</span>
          </div>
          {branding?.tagline && (
            <p className="text-[11px] text-gray-500">{branding.tagline}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {workspace?.industry && (
              <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{workspace.industry}</span>
            )}
            {workspace?.defaultLanguage && (
              <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{workspace.defaultLanguage === 'ar' ? 'Arabic' : 'English'}</span>
            )}
            {assets && assets.filter((a: AssetRecord) => a.analyzingStatus === 'done').length > 0 && (
              <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{assets.filter((a: AssetRecord) => a.analyzingStatus === 'done').length} assets</span>
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

      {/* Website info (fetched at workspace creation) */}
      {workspace?.websiteInfo && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-blue-400 shrink-0" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Website Info</span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                onClick={() => websiteScreenshotRef.current?.click()}
                className="text-blue-400 hover:text-blue-600"
                title="Upload website screenshot for better AI analysis"
              >
                <ImageIcon size={12} />
              </button>
              <button
                onClick={onRetryWebsiteFetch}
                disabled={fetchingWebsite}
                className="text-blue-400 hover:text-blue-600 disabled:opacity-50"
                title="Refresh website info"
              >
                {fetchingWebsite ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              </button>
            </div>
          </div>

          {websiteScreenshot && (
            <div className="flex items-center gap-1.5 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded">
              <ImageIcon size={10} />
              <span>Screenshot attached — click Refresh to re-analyze</span>
              <button onClick={() => setWebsiteScreenshot(null)} className="ml-auto text-green-400 hover:text-red-500">
                <X size={10} />
              </button>
            </div>
          )}

          {workspace.websiteInfo.companyName && (
            <p className="text-xs font-bold text-blue-900">{workspace.websiteInfo.companyName}</p>
          )}
          {workspace.websiteInfo.industry && (
            <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{workspace.websiteInfo.industry}</span>
          )}
          {workspace.websiteInfo.description && (
            <p className="text-[11px] text-blue-700 leading-relaxed">{workspace.websiteInfo.description}</p>
          )}

          {workspace.websiteInfo.features && workspace.websiteInfo.features.length > 0 && (
            <div>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Features</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {workspace.websiteInfo.features.slice(0, 8).map((f: string, i: number) => (
                  <span key={i} className="text-[10px] font-medium text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{f}</span>
                ))}
              </div>
            </div>
          )}

          {workspace.websiteInfo.targetAudience && (
            <div>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Audience</span>
              <p className="text-[10px] text-blue-600 mt-0.5">{workspace.websiteInfo.targetAudience}</p>
            </div>
          )}

          {workspace.websiteInfo.tone && (
            <div>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Tone</span>
              <p className="text-[10px] text-blue-600 mt-0.5">{workspace.websiteInfo.tone}</p>
            </div>
          )}

          {workspace.websiteInfo.contact && (
            <div>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Contact</span>
              <div className="text-[10px] text-blue-600 mt-0.5 space-y-0.5">
                {workspace.websiteInfo.contact.phone && <p>{workspace.websiteInfo.contact.phone}</p>}
                {workspace.websiteInfo.contact.email && <p>{workspace.websiteInfo.contact.email}</p>}
                {workspace.websiteInfo.contact.address && <p>{workspace.websiteInfo.contact.address}</p>}
                {workspace.websiteInfo.contact.socialMedia && workspace.websiteInfo.contact.socialMedia.length > 0 && (
                  <p>{workspace.websiteInfo.contact.socialMedia.join(' · ')}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {workspace?.website && !workspace?.websiteInfo && (
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-2.5 space-y-2">
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-amber-400 shrink-0" />
            <p className="text-[10px] text-amber-600 truncate flex-1">{workspace.website}</p>
            <button
              onClick={() => websiteScreenshotRef.current?.click()}
              className="text-amber-500 hover:text-amber-700 shrink-0"
              title="Upload website screenshot (optional)"
            >
              <ImageIcon size={12} />
            </button>
            <button
              onClick={onRetryWebsiteFetch}
              disabled={fetchingWebsite}
              className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-800 disabled:opacity-50 shrink-0"
            >
              {fetchingWebsite ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={12} />
              )}
              {fetchingWebsite ? 'Fetching...' : 'Analyze'}
            </button>
          </div>
          {websiteScreenshot && (
            <div className="flex items-center gap-1.5 text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded">
              <ImageIcon size={10} />
              <span>Screenshot attached</span>
              <button onClick={() => setWebsiteScreenshot(null)} className="ml-auto text-green-400 hover:text-red-500">
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-gray-500">Describe the post you want and AI will generate it with your brand context.</p>
      <textarea
        value={generatePrompt}
        onChange={(e) => setGeneratePrompt(e.target.value)}
        placeholder="e.g. A post about our new delivery tracking feature with a phone mockup showing live order status"
        className="w-full h-28 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] placeholder:text-gray-400"
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Posts</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setGenerateCount(n)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  generateCount === n
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Engine</label>
          <div className="flex gap-1">
            {([1, 2, 3] as const).map((v) => (
              <button
                key={v}
                onClick={() => setGenerateVersion(v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  generateVersion === v
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                V{v}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={generating || !generatePrompt.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <><Loader2 size={16} className="animate-spin" /> Generating {generateCount} post{generateCount > 1 ? 's' : ''}...</>
        ) : (
          <><Sparkles size={16} /> Generate {generateCount} Post{generateCount > 1 ? 's' : ''}</>
        )}
      </button>
      {generateError && (
        <p className="text-xs text-red-500 font-medium">{generateError}</p>
      )}
      {generatedPosts.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Generated ({generatedPosts.length})
          </label>
          <div className="space-y-1.5">
            {generatedPosts.map((gp) => (
              <div key={gp.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-xs font-medium text-gray-600 truncate">{gp.id}</span>
                <button
                  onClick={() => {
                    setGeneratedPosts(prev => prev.filter(p => p.id !== gp.id));
                    setLocalOrder(prev => prev.filter(id => id !== gp.id));
                  }}
                  className="text-gray-400 hover:text-red-500 shrink-0"
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
