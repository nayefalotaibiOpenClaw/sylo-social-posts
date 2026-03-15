"use client";

import React, { useState, useRef } from "react";
import {
  Globe,
  RefreshCw,
  Loader2,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  X,
  Building2,
  Tag,
  Users,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Check,
  Palette,
  Type,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { type Theme } from "@/contexts/ThemeContext";
import { FONTS } from "@/features/design-editor/constants/fonts";
import { PALETTES } from "@/features/design-editor/constants/palettes";
import MobileNavMenu from "./MobileNavMenu";
import { type SidebarTab } from "./Sidebar";

// ─── Types ──────────────────────────────────────────────────────────

interface WebsiteInfo {
  companyName?: string;
  description?: string;
  industry?: string;
  features?: string[];
  targetAudience?: string;
  tone?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    socialMedia?: string[];
  };
  ogImage?: string;
  rawContent?: string;
  fetchedAt?: number;
}

interface CrawlSection {
  type: string;
  name: string;
  nameAr?: string;
  url: string;
  imageUrl?: string;
  productCount?: number;
  fetched: boolean;
  fetchedAt?: number;
  productsFetched?: number;
}

interface CrawlData {
  _id: string;
  status: "discovering" | "ready" | "failed";
  businessInfo?: {
    companyName?: string;
    description?: string;
    industry?: string;
    tone?: string;
    targetAudience?: string;
    logoUrl?: string;
  };
  sections: CrawlSection[];
  discoveredProducts: Array<{
    name: string;
    price?: string;
    currency?: string;
    imageUrl?: string;
    sourceUrl: string;
    brand?: string;
    section?: string;
    savedAsAssetId?: string;
  }>;
  totalProductsFound: number;
  totalProductsFetched: number;
  lastCrawledAt: number;
}

interface Branding {
  _id: string;
  brandName: string;
  tagline?: string;
  logo?: string;
  logoDark?: string;
  colors: Record<string, string>;
  fonts: { heading: string; body: string };
}

interface Workspace {
  _id: string;
  name: string;
  website?: string;
  industry?: string;
  websiteInfo?: WebsiteInfo;
}

interface BrandPanelProps {
  workspace: Workspace | null | undefined;
  branding: Branding | null | undefined;
  crawlData: CrawlData | null | undefined;
  logoUrl: string | null | undefined;
  logoDarkUrl: string | null | undefined;
  currentTheme: Theme;
  setTheme: (t: Theme) => void;
  onCrawlDiscover: (url: string, screenshotBase64?: string) => Promise<void>;
  onCrawlSection: (sectionUrl: string) => Promise<void>;
  onSaveProductAsAsset: (product: { name: string; imageUrl?: string; sourceUrl: string }) => Promise<void>;
  onSaveAllProducts: () => Promise<void>;
  onRemoveProduct: (productSourceUrl: string) => Promise<void>;
  onClose: () => void;
  activeTab?: SidebarTab;
  onTabClick?: (tab: SidebarTab) => void;
  workspaces?: { _id: string; name: string }[];
  currentWorkspaceId?: string;
  currentWorkspaceName?: string;
  onUploadLogo: (file: File, variant: "logo" | "logoDark") => Promise<void>;
  onDeleteLogo: (variant: "logo" | "logoDark") => Promise<void>;
  onSaveLogoFromUrl: (url: string, variant: "logo" | "logoDark") => Promise<void>;
  onUpdateBranding: (field: string, value: string) => Promise<void>;
  onUpdateWebsiteInfo: (updates: Partial<WebsiteInfo>) => Promise<void>;
  onUpdateWorkspace: (updates: { website?: string; industry?: string }) => Promise<void>;
}

// ─── Component ──────────────────────────────────────────────────────

export default function BrandPanel({
  workspace,
  branding,
  crawlData,
  logoUrl,
  logoDarkUrl,
  currentTheme,
  setTheme,
  onCrawlDiscover,
  onCrawlSection,
  onSaveProductAsAsset,
  onSaveAllProducts,
  onRemoveProduct,
  onClose,
  activeTab,
  onTabClick,
  workspaces: wsList,
  currentWorkspaceId: wsId,
  currentWorkspaceName: wsName,
  onUploadLogo,
  onDeleteLogo,
  onSaveLogoFromUrl,
  onUpdateBranding,
  onUpdateWebsiteInfo,
  onUpdateWorkspace,
}: BrandPanelProps) {
  const [showFetchPopup, setShowFetchPopup] = useState(false);
  const [fetchUrl, setFetchUrl] = useState(workspace?.website || "");
  const [fetchScreenshot, setFetchScreenshot] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [fetchingSectionUrl, setFetchingSectionUrl] = useState<string | null>(null);
  const [savingProductUrl, setSavingProductUrl] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);
  const screenshotRef = useRef<HTMLInputElement>(null);

  const handleStartFetch = async () => {
    if (!fetchUrl.trim() || fetching) return;
    setFetching(true);
    try {
      await onCrawlDiscover(fetchUrl.trim(), fetchScreenshot || undefined);
      setShowFetchPopup(false);
      setFetchScreenshot(null);
    } catch (err) {
      console.error("Crawl failed:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFetchScreenshot(result.split(",")[1] || result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleSection = (url: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const handleFetchSection = async (sectionUrl: string) => {
    if (fetchingSectionUrl) return;
    setFetchingSectionUrl(sectionUrl);
    try {
      await onCrawlSection(sectionUrl);
    } catch (err) {
      console.error("Section fetch failed:", err);
    } finally {
      setFetchingSectionUrl(null);
    }
  };

  const handleSaveProduct = async (product: { name: string; imageUrl?: string; sourceUrl: string }) => {
    if (savingProductUrl) return;
    setSavingProductUrl(product.sourceUrl);
    try {
      await onSaveProductAsAsset(product);
    } catch (err) {
      console.error("Save product failed:", err);
    } finally {
      setSavingProductUrl(null);
    }
  };

  const websiteInfo = workspace?.websiteInfo;
  const businessInfo = crawlData?.businessInfo || (websiteInfo ? {
    companyName: websiteInfo.companyName,
    description: websiteInfo.description,
    industry: websiteInfo.industry,
    tone: websiteInfo.tone,
    targetAudience: websiteInfo.targetAudience,
  } : null);
  const discoveredLogoUrl = crawlData?.businessInfo?.logoUrl;

  return (
    <div className="flex-1 bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* ── Floating Nav ── */}
      <div className="shrink-0 pt-4 pb-2 px-3 sm:px-6 relative z-[90]">
        <nav className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-3 sm:px-5 h-14 flex items-center gap-2 sm:gap-4">
          {onTabClick && <MobileNavMenu activeTab={activeTab ?? 'brand'} onTabClick={onTabClick} workspaces={wsList} currentWorkspaceId={wsId} currentWorkspaceName={wsName} />}
          {onTabClick && <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700 md:hidden" />}
          {/* Brand name / logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-neutral-800 items-center justify-center overflow-hidden hidden md:flex">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
              ) : (
                <Building2 size={13} className="text-slate-400" />
              )}
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white hidden sm:block">
              {branding?.brandName || workspace?.name || "Brand Kit"}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700 hidden sm:block" />

          {/* Page title */}
          <span className="text-sm font-semibold text-slate-500 dark:text-neutral-400 hidden sm:inline">Brand Kit</span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={() => {
              setFetchUrl(workspace?.website || "");
              setShowFetchPopup(true);
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-neutral-600 transition-all"
          >
            <Globe size={13} />
            <span className="hidden sm:inline">{businessInfo ? "Refetch" : "Fetch"}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white"
            title="Back to editor"
          >
            <X size={18} />
          </button>
        </nav>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

          {/* ── Brand Hero ── */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Logos — clickable to upload */}
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadLogo(file, "logo");
              e.target.value = "";
            }} />
            <input ref={logoDarkInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadLogo(file, "logoDark");
              e.target.value = "";
            }} />

            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden hover:border-slate-300 dark:hover:border-neutral-600 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all group relative"
                title="Upload logo"
              >
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <Upload size={18} className="text-white" />
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onDeleteLogo("logo"); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onDeleteLogo("logo"); } }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-10 shadow-sm cursor-pointer"
                    >
                      <X size={10} className="text-white" />
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload size={18} className="text-slate-300 group-hover:text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-300 group-hover:text-slate-400">Logo</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => logoDarkInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden hover:border-slate-500 transition-all group relative"
                title="Upload dark logo"
              >
                {logoDarkUrl ? (
                  <>
                    <img src={logoDarkUrl} alt="Dark Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <Upload size={18} className="text-white" />
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onDeleteLogo("logoDark"); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onDeleteLogo("logoDark"); } }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm text-slate-500 cursor-pointer"
                    >
                      <X size={10} />
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload size={18} className="text-slate-600 group-hover:text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-600 group-hover:text-slate-400">Dark</span>
                  </div>
                )}
              </button>
            </div>

            {/* Discovered logo from website */}
            {discoveredLogoUrl && !logoUrl && (
              <button
                onClick={() => onSaveLogoFromUrl(discoveredLogoUrl, "logo")}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 dark:hover:border-blue-600 transition-all group relative shrink-0"
                title="Use discovered logo"
              >
                <img src={discoveredLogoUrl} alt="Discovered logo" className="w-full h-full object-contain p-1.5" />
                <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">Use Logo</span>
                </div>
              </button>
            )}

            <div className="flex-1 min-w-0 pt-1">
              {/* Editable brand name */}
              <InlineEdit
                value={branding?.brandName || workspace?.name || ""}
                placeholder="Brand name"
                className="text-2xl font-black text-slate-900 dark:text-white"
                onSave={(val) => onUpdateBranding("brandName", val)}
              />
              {/* Editable tagline */}
              <InlineEdit
                value={branding?.tagline || ""}
                placeholder="Add tagline..."
                className="text-sm text-slate-400 dark:text-neutral-500 mt-0.5"
                onSave={(val) => onUpdateBranding("tagline", val)}
              />
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
                  <Globe size={12} className="shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">
                    <InlineEdit
                      value={workspace?.website || ""}
                      placeholder="https://example.com"
                      className="text-xs text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300"
                      onSave={(val) => onUpdateWorkspace({ website: val })}
                    />
                  </span>
                  {workspace?.website && (
                    <a href={workspace.website} target="_blank" rel="noopener noreferrer" className="shrink-0 hover:text-slate-600">
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <InlineEdit
                  value={workspace?.industry || ""}
                  placeholder="Industry"
                  className="text-xs font-medium text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full"
                  onSave={(val) => onUpdateWorkspace({ industry: val })}
                />
              </div>
            </div>
          </div>

          {/* ── Website Info + Theme Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Website Info Card */}
            <div className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-slate-400" />
                <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Website Info</h2>
              </div>

              {businessInfo ? (
                <div className="space-y-4">
                  <InlineEdit
                    value={businessInfo.description || ""}
                    placeholder="Add description..."
                    className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed"
                    multiline
                    onSave={(val) => onUpdateWebsiteInfo({ description: val })}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <EditableInfoCard
                      icon={<Tag size={14} />}
                      label="Industry"
                      value={businessInfo.industry || ""}
                      placeholder="e.g. E-commerce"
                      onSave={(val) => onUpdateWebsiteInfo({ industry: val })}
                    />
                    <EditableInfoCard
                      icon={<Users size={14} />}
                      label="Audience"
                      value={businessInfo.targetAudience || ""}
                      placeholder="Target audience"
                      onSave={(val) => onUpdateWebsiteInfo({ targetAudience: val })}
                    />
                    <EditableInfoCard
                      icon={<MessageSquare size={14} />}
                      label="Tone"
                      value={businessInfo.tone || ""}
                      placeholder="Brand tone"
                      onSave={(val) => onUpdateWebsiteInfo({ tone: val })}
                    />
                  </div>

                  {websiteInfo?.features && websiteInfo.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {websiteInfo.features.map((f, i) => (
                        <span key={i} className="text-[11px] font-medium px-2.5 py-1 bg-white dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 rounded-full border border-slate-100 dark:border-neutral-700">{f}</span>
                      ))}
                    </div>
                  )}

                  {websiteInfo?.contact && (
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200/60 dark:border-neutral-700/60">
                      {websiteInfo.contact.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-neutral-500"><Phone size={12} /> {websiteInfo.contact.phone}</span>
                      )}
                      {websiteInfo.contact.email && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-neutral-500"><Mail size={12} /> {websiteInfo.contact.email}</span>
                      )}
                      {websiteInfo.contact.address && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-neutral-500"><MapPin size={12} /> {websiteInfo.contact.address}</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 dark:text-neutral-500 mb-3">No website data fetched yet</p>
                  <button
                    onClick={() => {
                      setFetchUrl(workspace?.website || "");
                      setShowFetchPopup(true);
                    }}
                    className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                  >
                    Fetch Website Info
                  </button>
                </div>
              )}
            </div>

            {/* Theme Card */}
            <div className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-slate-400" />
                <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Theme</h2>
              </div>

              {/* Live preview */}
              <div className="rounded-xl p-5 text-center" style={{ backgroundColor: currentTheme.primaryLight, fontFamily: currentTheme.font }}>
                <p className="text-xl font-black" style={{ color: currentTheme.primary }}>Brand Preview</p>
                <p className="text-xs font-bold mt-1" style={{ color: currentTheme.accent }}>Your colors & typography</p>
                <div className="flex justify-center gap-2 mt-3">
                  <span className="px-4 py-1.5 rounded-full text-white text-[11px] font-bold" style={{ backgroundColor: currentTheme.accent }}>Primary</span>
                  <span className="px-4 py-1.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: currentTheme.accentLime, color: currentTheme.primary }}>Accent</span>
                </div>
              </div>

              {/* Colors */}
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Colors</p>
                <div className="grid grid-cols-4 gap-3">
                  {([
                    { key: 'primary', label: 'Primary' },
                    { key: 'accent', label: 'Accent' },
                    { key: 'primaryLight', label: 'Light' },
                    { key: 'accentLime', label: 'Highlight' },
                    { key: 'accentLight', label: 'Soft' },
                    { key: 'accentGold', label: 'Gold' },
                    { key: 'border', label: 'Border' },
                    { key: 'primaryDark', label: 'Dark' },
                  ] as { key: keyof Theme; label: string }[]).map(({ key, label }) => (
                    <label key={key} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="color"
                          value={currentTheme[key]}
                          onChange={(e) => setTheme({ ...currentTheme, [key]: e.target.value })}
                          className="w-10 h-10 rounded-xl border-2 border-white shadow-sm cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0 group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Palette presets */}
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-3">Presets</p>
                <div className="flex flex-wrap gap-2">
                  {PALETTES.map((palette) => {
                    const isSelected = palette.theme.primary === currentTheme.primary && palette.theme.primaryLight === currentTheme.primaryLight;
                    return (
                      <button
                        key={palette.name}
                        onClick={() => setTheme({ ...palette.theme, font: currentTheme.font })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                          isSelected ? 'border-slate-900 dark:border-white bg-white dark:bg-neutral-800 shadow-sm' : 'border-transparent bg-white dark:bg-neutral-800 hover:border-slate-200 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {[palette.theme.primary, palette.theme.accent, palette.theme.accentLime].map((c, j) => (
                            <div key={j} className="w-4 h-4 rounded-md" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-neutral-300">{palette.name}</span>
                        {isSelected && <Check size={12} className="text-slate-900 dark:text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type size={14} className="text-slate-400" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Font</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map((font) => {
                    const isSelected = font.value === currentTheme.font;
                    return (
                      <button
                        key={font.value}
                        onClick={() => setTheme({ ...currentTheme, font: font.value })}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all ${
                          isSelected ? 'border-slate-900 dark:border-white bg-white dark:bg-neutral-800 shadow-sm' : 'border-transparent bg-white dark:bg-neutral-800 hover:border-slate-200 dark:hover:border-neutral-600'
                        }`}
                      >
                        <span className="text-sm font-bold text-slate-700 dark:text-neutral-300 truncate" style={{ fontFamily: font.value }}>{font.name}</span>
                        {isSelected && <Check size={14} className="text-slate-900 dark:text-white shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Sections + Products Row ── */}
          {(crawlData?.status === "ready" || crawlData?.status === "discovering" || crawlData?.status === "failed" || (crawlData && crawlData.totalProductsFound > 0)) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Sections */}
              {crawlData && crawlData.status === "ready" && crawlData.sections.length > 0 && (
                <div className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={16} className="text-slate-400" />
                    <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                      Sections ({crawlData.sections.length})
                    </h2>
                  </div>
                  <div className="space-y-1.5">
                    {crawlData.sections.map((section, sectionIdx) => {
                      const isExpanded = expandedSections.has(section.url);
                      const sectionProducts = crawlData.discoveredProducts.filter(
                        (p) => p.section === section.name || p.sourceUrl.startsWith(section.url)
                      );

                      return (
                        <div key={`${section.url}-${sectionIdx}`} className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleSection(section.url)}
                            className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            {isExpanded
                              ? <ChevronDown size={14} className="text-slate-400 shrink-0" />
                              : <ChevronRight size={14} className="text-slate-400 shrink-0" />
                            }
                            <span className="text-sm font-bold text-slate-700 dark:text-neutral-300 truncate flex-1 text-left">
                              {section.nameAr || section.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500">
                              {section.type}
                            </span>
                            {section.fetched && <CheckCircle2 size={14} className="text-green-400 shrink-0" />}
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-slate-50 dark:border-neutral-700">
                              {!section.fetched && (
                                <button
                                  onClick={() => handleFetchSection(section.url)}
                                  disabled={!!fetchingSectionUrl}
                                  className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-slate-900 hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 rounded-xl py-2.5 transition-all"
                                >
                                  {fetchingSectionUrl === section.url ? (
                                    <><Loader2 size={12} className="animate-spin" /> Fetching...</>
                                  ) : (
                                    <><Globe size={12} /> Fetch Products</>
                                  )}
                                </button>
                              )}

                              {sectionProducts.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                  {sectionProducts.map((product, i) => (
                                    <div key={`${product.sourceUrl}-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-700 group transition-colors">
                                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-neutral-700 overflow-hidden shrink-0">
                                        {product.imageUrl
                                          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                          : <ImageIcon size={16} className="text-slate-300 m-auto mt-2.5" />
                                        }
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 dark:text-neutral-300 truncate">{product.name}</p>
                                        {product.price && <p className="text-[10px] text-slate-400 dark:text-neutral-500">{product.price} {product.currency || ""}</p>}
                                      </div>
                                      {product.savedAsAssetId ? (
                                        <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                                      ) : (
                                        <button
                                          onClick={() => handleSaveProduct(product)}
                                          disabled={!!savingProductUrl}
                                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-200 transition-all shrink-0"
                                        >
                                          {savingProductUrl === product.sourceUrl
                                            ? <Loader2 size={12} className="animate-spin text-slate-400" />
                                            : <Upload size={12} className="text-slate-400" />
                                          }
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {section.fetched && section.productsFetched !== undefined && (
                                <p className="text-[10px] text-slate-300 dark:text-neutral-600 mt-2">{section.productsFetched} products fetched</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Crawl status */}
              {crawlData?.status === "discovering" && (
                <div className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin text-slate-300" />
                  <p className="text-sm font-bold text-slate-400 dark:text-neutral-500">Discovering website structure...</p>
                </div>
              )}
              {crawlData?.status === "failed" && (
                <div className="bg-red-50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
                  <AlertCircle size={24} className="text-red-300" />
                  <p className="text-sm font-bold text-red-400 dark:text-red-300">Crawl failed. Try refetching.</p>
                </div>
              )}

              {/* Products */}
              {crawlData && crawlData.totalProductsFound > 0 && (() => {
                const unsavedProducts = crawlData.discoveredProducts.filter(p => !p.savedAsAssetId && p.imageUrl);
                const savedCount = crawlData.discoveredProducts.filter(p => p.savedAsAssetId).length;
                const visibleProducts = showAllProducts
                  ? crawlData.discoveredProducts
                  : crawlData.discoveredProducts.slice(0, 24);

                return (
                  <div className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-slate-400" />
                        <h2 className="text-xs font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                          Products ({crawlData.totalProductsFound})
                        </h2>
                      </div>
                      {savedCount > 0 && (
                        <span className="text-[11px] font-bold text-green-500 bg-green-50 px-2.5 py-0.5 rounded-full">
                          {savedCount} saved
                        </span>
                      )}
                    </div>

                    {unsavedProducts.length > 0 && (
                      <button
                        onClick={async () => {
                          setSavingAll(true);
                          try { await onSaveAllProducts(); } catch (err) { console.error(err); } finally { setSavingAll(false); }
                        }}
                        disabled={savingAll || !!savingProductUrl}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-slate-900 hover:scale-[1.01] active:scale-[0.99] disabled:bg-slate-300 rounded-xl py-3 mb-4 transition-all"
                      >
                        {savingAll ? (
                          <><Loader2 size={14} className="animate-spin" /> Saving...</>
                        ) : (
                          <><Upload size={14} /> Save All ({unsavedProducts.length})</>
                        )}
                      </button>
                    )}

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {visibleProducts.map((product, i) => (
                        <div
                          key={`${product.sourceUrl}-${i}`}
                          className="aspect-square rounded-xl bg-white dark:bg-neutral-800 overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => !product.savedAsAssetId && handleSaveProduct(product)}
                        >
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <ImageIcon size={20} className="text-slate-300" />
                            </div>
                          )}

                          {/* Saved badge */}
                          {product.savedAsAssetId && (
                            <div className="absolute bottom-1.5 left-1.5">
                              <CheckCircle2 size={16} className="text-green-400 drop-shadow-md" />
                            </div>
                          )}

                          {/* Upload overlay */}
                          {!product.savedAsAssetId && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload size={18} className="text-white" />
                            </div>
                          )}

                          {/* Remove button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveProduct(product.sourceUrl); }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all z-10"
                          >
                            <X size={12} className="text-white" />
                          </button>

                          {/* Name tooltip */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] font-bold text-white truncate">{product.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {crawlData.discoveredProducts.length > 24 && (
                      <button
                        onClick={() => setShowAllProducts(prev => !prev)}
                        className="w-full text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white mt-4 py-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 transition-all"
                      >
                        {showAllProducts ? "Show less" : `Show all ${crawlData.discoveredProducts.length} products`}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      </div>

      {/* ── Fetch Popup ── */}
      {showFetchPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !fetching && setShowFetchPopup(false)} />
          <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Fetch Website</h3>
              <button
                onClick={() => !fetching && setShowFetchPopup(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:bg-neutral-700 text-slate-400 dark:text-neutral-500 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 mb-2 block">Website URL</label>
              <input
                type="url"
                value={fetchUrl}
                onChange={(e) => setFetchUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-12 px-4 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 placeholder:text-slate-300 dark:placeholder:text-neutral-600 transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 dark:text-neutral-400 mb-2 block">
                Screenshot <span className="text-slate-300 font-medium">(optional)</span>
              </label>
              <input ref={screenshotRef} type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
              {fetchScreenshot ? (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-neutral-800 rounded-xl p-3">
                  <div className="w-16 h-12 rounded-lg bg-slate-200 dark:bg-neutral-700 overflow-hidden shrink-0">
                    <img src={`data:image/jpeg;base64,${fetchScreenshot}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 flex-1">Screenshot attached</span>
                  <button onClick={() => setFetchScreenshot(null)} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-400 dark:text-neutral-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => screenshotRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 border-2 border-dashed border-slate-200 dark:border-neutral-700 rounded-xl py-4 hover:border-slate-300 dark:hover:border-neutral-600 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all"
                >
                  <Upload size={14} />
                  Upload for better analysis
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => !fetching && setShowFetchPopup(false)}
                disabled={fetching}
                className="flex-1 h-12 text-sm font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-xl hover:bg-slate-200 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartFetch}
                disabled={!fetchUrl.trim() || fetching}
                className="flex-[1.4] h-12 flex items-center justify-center gap-2 text-sm font-bold text-white bg-slate-900 rounded-xl hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 transition-all"
              >
                {fetching ? (
                  <><Loader2 size={16} className="animate-spin" /> Crawling...</>
                ) : (
                  <><Globe size={16} /> Discover</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function InlineEdit({
  value,
  placeholder,
  className,
  multiline,
  onSave,
}: {
  value: string;
  placeholder: string;
  className?: string;
  multiline?: boolean;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  React.useEffect(() => { setDraft(value); }, [value]);
  React.useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed);
  };

  if (editing) {
    const sharedClass = `${className} w-full bg-transparent border-b-2 border-slate-300 focus:border-slate-900 outline-none py-0.5 transition-colors`;
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className={`${sharedClass} resize-none min-h-[60px]`}
        rows={3}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className={sharedClass}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`${className} cursor-text hover:bg-slate-100/50 dark:hover:bg-neutral-800/50 rounded px-1 -mx-1 transition-colors ${!value ? 'italic opacity-50' : ''}`}
      title="Click to edit"
    >
      {value || placeholder}
    </div>
  );
}

function EditableInfoCard({
  icon,
  label,
  value,
  placeholder,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  onSave: (val: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-slate-300">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <InlineEdit
        value={value}
        placeholder={placeholder}
        className="text-xs font-bold text-slate-600 dark:text-neutral-300"
        onSave={onSave}
      />
    </div>
  );
}
