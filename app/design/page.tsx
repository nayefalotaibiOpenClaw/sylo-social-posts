"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { LayoutGrid, List, Sparkles, Palette, ArrowUpDown, Pencil, Settings, Upload, Image as ImageIcon, X, Check, MousePointer2, Download, Loader2, Code, Eye, ArrowLeft, FolderOpen, Globe, RefreshCw, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "../components/EditContext";
import { useTheme, useSetTheme, Theme, defaultTheme } from "../components/ThemeContext";
import DynamicPost from "../components/DynamicPost";
import PostWrapper from "../components/PostWrapper";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";


const FONTS = [
  { name: "Cairo", value: "'Cairo', sans-serif" },
  { name: "Tajawal", value: "'Tajawal', sans-serif" },
  { name: "IBM Plex Sans Arabic", value: "'IBM Plex Sans Arabic', sans-serif" },
  { name: "Noto Sans Arabic", value: "'Noto Sans Arabic', sans-serif" },
  { name: "Readex Pro", value: "'Readex Pro', sans-serif" },
  { name: "Rubik", value: "'Rubik', sans-serif" },
  { name: "Almarai", value: "'Almarai', sans-serif" },
  { name: "Changa", value: "'Changa', sans-serif" },
  { name: "El Messiri", value: "'El Messiri', sans-serif" },
  { name: "Baloo Bhaijaan 2", value: "'Baloo Bhaijaan 2', sans-serif" },
  { name: "Inter", value: "'Inter', sans-serif" },
  { name: "Geist", value: "'Geist', sans-serif" },
];

const PALETTES: { name: string; theme: Theme }[] = [
  { name: "Sylo Green", theme: defaultTheme },
  { name: "Ocean Blue", theme: { ...defaultTheme, primary: "#1E3A5F", primaryLight: "#EFF6FF", primaryDark: "#0F1D30", accent: "#3B82F6", accentLight: "#60A5FA", accentLime: "#38BDF8", border: "#2D5A8E" } },
  { name: "Royal Purple", theme: { ...defaultTheme, primary: "#3B0764", primaryLight: "#F5F3FF", primaryDark: "#1E0334", accent: "#7C3AED", accentLight: "#A78BFA", accentLime: "#C084FC", border: "#581C87" } },
  { name: "Warm Orange", theme: { ...defaultTheme, primary: "#7C2D12", primaryLight: "#FFF7ED", primaryDark: "#431407", accent: "#EA580C", accentLight: "#FB923C", accentLime: "#FBBF24", border: "#9A3412" } },
  { name: "Rose Pink", theme: { ...defaultTheme, primary: "#881337", primaryLight: "#FFF1F2", primaryDark: "#4C0519", accent: "#E11D48", accentLight: "#FB7185", accentLime: "#FDA4AF", border: "#9F1239" } },
  { name: "Slate Dark", theme: { ...defaultTheme, primary: "#0F172A", primaryLight: "#F8FAFC", primaryDark: "#020617", accent: "#475569", accentLight: "#94A3B8", accentLime: "#CBD5E1", border: "#1E293B" } },
  { name: "Teal", theme: { ...defaultTheme, primary: "#134E4A", primaryLight: "#F0FDFA", primaryDark: "#042F2E", accent: "#0D9488", accentLight: "#2DD4BF", accentLime: "#5EEAD4", border: "#115E59" } },
  { name: "Gold & Black", theme: { ...defaultTheme, primary: "#1C1917", primaryLight: "#FFFBEB", primaryDark: "#0C0A09", accent: "#A16207", accentLight: "#CA8A04", accentLime: "#FBBF24", border: "#292524" } },
  { name: "Crimson Red", theme: { ...defaultTheme, primary: "#450A0A", primaryLight: "#FEF2F2", primaryDark: "#1C0404", accent: "#DC2626", accentLight: "#F87171", accentLime: "#FCA5A5", border: "#7F1D1D" } },
  { name: "Forest", theme: { ...defaultTheme, primary: "#14532D", primaryLight: "#F0FDF4", primaryDark: "#052E16", accent: "#16A34A", accentLight: "#4ADE80", accentLime: "#86EFAC", border: "#166534" } },
];

type SidebarTab = 'settings' | 'theme' | 'assets' | 'generate' | null;

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

const SIDEBAR_ITEMS: { id: SidebarTab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'theme', icon: Palette, label: 'Theme' },
  { id: 'assets', icon: Upload, label: 'Assets' },
  { id: 'generate', icon: Sparkles, label: 'Generate' },
];

export default function DesignPage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspace") as Id<"workspaces"> | null;
  const collectionIdParam = searchParams.get("collection") as Id<"collections"> | null;

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);

  // Fetch workspace data
  const collections = useQuery(
    api.collections.listByWorkspace,
    workspaceId ? { workspaceId } : "skip"
  );

  // Use first collection if none specified
  const activeCollectionId = collectionIdParam ?? collections?.[0]?._id ?? null;

  const posts = useQuery(
    api.posts.listByCollection,
    activeCollectionId ? { collectionId: activeCollectionId } : "skip"
  );

  const updatePostCode = useMutation(api.posts.updateCode);
  const reorderPosts = useMutation(api.posts.reorder);
  const removePost = useMutation(api.posts.remove);
  const createPost = useMutation(api.posts.create);
  const createCollection = useMutation(api.collections.create);

  // Workspace & branding data for generate context
  const workspace = useQuery(
    api.workspaces.get,
    workspaceId ? { id: workspaceId } : "skip"
  );
  const branding = useQuery(
    api.branding.getByWorkspace,
    workspaceId ? { workspaceId } : "skip"
  );
  const updateWebsiteInfo = useMutation(api.workspaces.updateWebsiteInfo);

  // Assets
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const createAsset = useMutation(api.assets.create);
  const removeAsset = useMutation(api.assets.remove);
  const analyzeImage = useAction(api.assets.analyzeImage);
  const assets = useQuery(
    api.assets.listForWorkspace,
    workspaceId && user ? { workspaceId, userId: user._id } : "skip"
  );

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editMode, setEditMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [gridCols, setGridCols] = useState(3);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
  const [reorderMode, setReorderMode] = useState(false);
  const dragItem = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [assetTypeSelect, setAssetTypeSelect] = useState<typeof ASSET_TYPES[number]["value"]>("screenshot");
  const [assetScope, setAssetScope] = useState<"workspace" | "global">("workspace");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showAssetUploadDialog, setShowAssetUploadDialog] = useState(false);
  const currentTheme = useTheme();
  const setTheme = useSetTheme();
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<{ id: string; code: string }[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateCount, setGenerateCount] = useState(2);
  const [generateVersion, setGenerateVersion] = useState<1 | 2>(1);
  const [codeViewPosts, setCodeViewPosts] = useState<Set<string>>(new Set());
  const [fetchingWebsite, setFetchingWebsite] = useState(false);
  const [websiteScreenshot, setWebsiteScreenshot] = useState<string | null>(null);
  const websiteScreenshotRef = useRef<HTMLInputElement>(null);

  // Local order state for drag-and-drop (syncs with Convex)
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  useEffect(() => {
    if (posts) {
      setLocalOrder(posts.map(p => p._id));
    }
  }, [posts]);

  const toggleCodeView = (id: string) => {
    setCodeViewPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRetryWebsiteFetch = async () => {
    if (!workspaceId || !workspace?.website || fetchingWebsite) return;
    setFetchingWebsite(true);
    try {
      const res = await fetch('/api/fetch-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: workspace.website, ...(websiteScreenshot ? { screenshotBase64: websiteScreenshot } : {}) }),
      });
      if (!res.ok) return;
      const data = await res.json();
      await updateWebsiteInfo({
        id: workspaceId,
        websiteInfo: {
          companyName: data.companyName || "",
          description: data.description || "",
          industry: data.industry || "",
          features: data.features || [],
          targetAudience: data.targetAudience || undefined,
          tone: data.tone || undefined,
          contact: data.contact ? {
            phone: data.contact.phone || undefined,
            email: data.contact.email || undefined,
            address: data.contact.address || undefined,
            socialMedia: data.contact.socialMedia || undefined,
          } : undefined,
          ogImage: data.ogImage || undefined,
          rawContent: data.rawContent || "",
          fetchedAt: Date.now(),
        },
      });
    } catch {
      // will stay as pending, user can retry again
    } finally {
      setFetchingWebsite(false);
    }
  };

  const handleWebsiteScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix to get raw base64
      const base64 = result.split(",")[1] || result;
      setWebsiteScreenshot(base64);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleGenerate = async () => {
    if (!generatePrompt.trim() || generating) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      // Build context from workspace, branding, and assets
      const context = {
        brandName: branding?.brandName || workspace?.name,
        tagline: branding?.tagline,
        website: workspace?.website,
        industry: workspace?.industry,
        language: workspace?.defaultLanguage || 'ar' as const,
        logoUrl: assets?.find(a => a.type === 'logo')?.url || undefined,
        websiteInfo: workspace?.websiteInfo ? (() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const wi = workspace.websiteInfo as any;
          return {
            companyName: wi.companyName || wi.title || "",
            description: wi.description || "",
            industry: wi.industry || "",
            features: wi.features || [],
            targetAudience: wi.targetAudience,
            tone: wi.tone,
            contact: wi.contact,
            content: wi.rawContent || wi.content || "",
          };
        })() : undefined,
        assets: (assets || [])
          .filter(a => a.url)
          .map(a => ({
            id: a._id,
            url: a.url || '',
            type: a.type,
            label: a.label || a.fileName,
            description: a.description,
            aiAnalysis: a.aiAnalysis,
          })),
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generatePrompt, context, count: generateCount, version: generateVersion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const codes: string[] = data.codes || [data.code];

      // Save generated posts to Convex
      if (workspaceId && user) {
        let collectionId = activeCollectionId;

        // Auto-create a collection if none exists
        if (!collectionId) {
          collectionId = await createCollection({
            workspaceId,
            userId: user._id,
            name: "Generated Posts",
            mode: "social_grid",
            language: workspace?.defaultLanguage || "ar",
            aspectRatio: "1:1",
          });
        }

        for (let i = 0; i < codes.length; i++) {
          await createPost({
            collectionId,
            workspaceId,
            userId: user._id,
            title: `${generatePrompt.slice(0, 80)} (${i + 1}/${codes.length})`,
            componentCode: codes[i],
            language: workspace?.defaultLanguage || "ar",
            device: "none",
            order: (posts ? posts.length : 0) + i,
          });
        }
      } else {
        // Fallback to local state if not authenticated
        for (const code of codes) {
          const newId = `generated-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          setGeneratedPosts(prev => [{ id: newId, code }, ...prev]);
          setLocalOrder(prev => [newId, ...prev]);
        }
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDragEnter = useCallback((targetId: string) => {
    if (!dragItem.current || dragItem.current === targetId) return;
    setLocalOrder(prev => {
      const newOrder = [...prev];
      const fromIdx = newOrder.indexOf(dragItem.current!);
      const toIdx = newOrder.indexOf(targetId);
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, dragItem.current!);
      return newOrder;
    });
  }, []);

  const handleDragEnd = useCallback(async () => {
    dragItem.current = null;
    setDraggingId(null);
    // Persist new order to Convex
    if (posts) {
      const reorderData = localOrder
        .map((id, index) => ({ id: id as Id<"posts">, order: index }))
        .filter(item => posts.some(p => p._id === item.id));
      if (reorderData.length > 0) {
        await reorderPosts({ posts: reorderData });
      }
    }
  }, [localOrder, posts, reorderPosts]);

  const handleTabClick = (tab: SidebarTab) => {
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPendingFiles(Array.from(files));
    setShowAssetUploadDialog(true);
    e.target.value = '';
  };

  const handleAssetUpload = async () => {
    if (!workspaceId || !user || pendingFiles.length === 0) return;
    setUploadingAsset(true);
    try {
      for (const file of pendingFiles) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();

        const assetId = await createAsset({
          workspaceId: assetScope === "workspace" ? workspaceId : undefined,
          userId: user._id,
          scope: assetScope,
          fileId: storageId,
          fileName: file.name,
          type: assetTypeSelect,
        });

        // Trigger AI vision analysis in the background
        analyzeImage({
          assetId,
          storageId,
          fileName: file.name,
          assetType: assetTypeSelect,
        }).catch((err) => console.error("Background analysis failed:", err));
      }
      setPendingFiles([]);
      setShowAssetUploadDialog(false);
    } catch (err) {
      console.error("Failed to upload asset:", err);
    } finally {
      setUploadingAsset(false);
    }
  };

  const togglePostSelection = useCallback((id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedPosts.length === 0) return;
    setDownloading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (let i = 0; i < selectedPosts.length; i++) {
        const id = selectedPosts[i];
        const container = postRefs.current.get(id);
        if (!container) continue;
        const postEl = container.querySelector('.post-wrapper') as HTMLElement;
        if (!postEl) continue;
        const dataUrl = await toPng(postEl, {
          pixelRatio: 2,
          cacheBust: true,
          skipFonts: true,
        });
        const base64 = dataUrl.split(",")[1];
        const post = posts?.find(p => p._id === id);
        zip.file(`${i + 1}-${post?.title || id}.png`, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `posts-${selectedPosts.length}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download posts:", err);
    } finally {
      setDownloading(false);
    }
  }, [selectedPosts, posts]);

  const panelOpen = activeTab !== null;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  // Loading state (user === undefined means query still loading, null means not found)
  if (authLoading || user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // Not authenticated or no user record
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // No workspace selected
  if (!workspaceId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">No workspace selected</h2>
          <p className="text-sm text-gray-400 mb-6">Select a workspace to view your posts</p>
          <Link
            href="/workspaces"
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95"
          >
            Go to Workspaces
          </Link>
        </div>
      </div>
    );
  }

  // Build combined list: Convex posts + generated (unsaved) posts
  const allPostIds = localOrder.length > 0 ? localOrder : (posts?.map(p => p._id) ?? []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Icon Rail */}
      <div className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0">
        <Link href={`/workspaces`} className="w-10 h-10 bg-[#1B4332] rounded-xl flex items-center justify-center mb-4" title="Back to Workspaces">
          <span className="text-white font-black text-sm">S</span>
        </Link>
        {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-[10px] font-medium ${
              activeTab === id
                ? 'bg-[#1B4332] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      {/* Expandable Panel */}
      <div
        className={`bg-white border-r border-gray-200 overflow-y-auto shrink-0 transition-all duration-300 ${
          panelOpen ? 'w-[280px]' : 'w-0'
        }`}
      >
        {panelOpen && (
          <div className="w-[280px] p-5">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900 capitalize">{activeTab}</h2>
              <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {/* Settings Panel */}
            {activeTab === 'settings' && (
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
                  <p className="text-xs text-gray-400">{posts?.length ?? 0} posts</p>
                </div>
              </div>
            )}

            {/* Theme Panel */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                <div className="rounded-lg p-4 text-center" style={{ backgroundColor: currentTheme.primaryLight, fontFamily: currentTheme.font }}>
                  <p className="text-lg font-black" style={{ color: currentTheme.primary }}>معاينة مباشرة</p>
                  <p className="text-xs font-bold" style={{ color: currentTheme.accent }}>هذا مثال على شكل النصوص</p>
                  <div className="flex justify-center gap-1.5 mt-2">
                    <span className="px-3 py-1 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: currentTheme.accent }}>زر</span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: currentTheme.accentLime, color: currentTheme.primary }}>مميز</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Color Palette</label>
                  <div className="space-y-1.5">
                    {PALETTES.map((palette) => {
                      const isSelected = palette.theme.primary === currentTheme.primary && palette.theme.primaryLight === currentTheme.primaryLight;
                      return (
                        <button
                          key={palette.name}
                          onClick={() => setTheme({ ...palette.theme, font: currentTheme.font })}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                            isSelected ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex gap-1 shrink-0">
                            {[palette.theme.primary, palette.theme.accent, palette.theme.accentLight, palette.theme.accentLime].map((c, j) => (
                              <div key={j} className="w-5 h-5 rounded" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-700 truncate flex-1">{palette.name}</span>
                          {isSelected && <Check size={14} className="text-gray-900 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Edit Colors</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'primary', label: 'Primary' },
                      { key: 'primaryLight', label: 'Light BG' },
                      { key: 'accent', label: 'Accent' },
                      { key: 'accentLight', label: 'Accent Light' },
                      { key: 'accentLime', label: 'Highlight' },
                      { key: 'accentGold', label: 'Gold' },
                      { key: 'border', label: 'Border' },
                      { key: 'primaryDark', label: 'Dark' },
                    ] as { key: keyof Theme; label: string }[]).map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 cursor-pointer hover:border-gray-300 transition-colors">
                        <input
                          type="color"
                          value={currentTheme[key]}
                          onChange={(e) => setTheme({ ...currentTheme, [key]: e.target.value })}
                          className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
                        />
                        <span className="text-[10px] font-semibold text-gray-500">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Font</label>
                  <div className="space-y-1.5">
                    {FONTS.map((font) => {
                      const isSelected = font.value === currentTheme.font;
                      return (
                        <button
                          key={font.value}
                          onClick={() => setTheme({ ...currentTheme, font: font.value })}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                            isSelected ? 'border-gray-900 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-bold" style={{ fontFamily: font.value }}>{font.name}</span>
                          {isSelected && <Check size={14} className="text-gray-900 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Assets Panel */}
            {activeTab === 'assets' && (
              <div className="space-y-4">
                <label className="block w-full cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors">
                    <Upload size={16} />
                    Upload Assets
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>

                {/* Upload Dialog */}
                {showAssetUploadDialog && pendingFiles.length > 0 && (
                  <div className="p-3 rounded-lg border border-[#1B4332] bg-[#EAF4EE] space-y-3">
                    <p className="text-xs font-bold text-gray-700">{pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''} selected</p>

                    <div className="grid grid-cols-3 gap-1.5">
                      {pendingFiles.map((file, i) => (
                        <div key={i} className="aspect-square rounded-md overflow-hidden bg-white border border-gray-200">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Asset Type</label>
                      <select
                        value={assetTypeSelect}
                        onChange={(e) => setAssetTypeSelect(e.target.value as typeof assetTypeSelect)}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#1B4332]"
                      >
                        {ASSET_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Scope</label>
                      <div className="flex gap-1.5">
                        {(["workspace", "global"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setAssetScope(s)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              assetScope === s
                                ? 'bg-[#1B4332] text-white'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {s === "workspace" ? "This Project" : "All Projects"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setPendingFiles([]); setShowAssetUploadDialog(false); }}
                        className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssetUpload}
                        disabled={uploadingAsset}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors disabled:opacity-50"
                      >
                        {uploadingAsset ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        {uploadingAsset ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Asset List grouped by type */}
                {assets && assets.length > 0 ? (
                  (() => {
                    const grouped = assets.reduce((acc, asset) => {
                      const type = asset.type;
                      if (!acc[type]) acc[type] = [];
                      acc[type].push(asset);
                      return acc;
                    }, {} as Record<string, typeof assets>);

                    return Object.entries(grouped).map(([type, items]) => (
                      <div key={type}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                          {ASSET_TYPES.find(t => t.value === type)?.label || type} ({items.length})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {items.map((asset) => (
                            <div key={asset._id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200" title={asset.description || asset.fileName}>
                              {asset.url ? (
                                <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon size={20} className="text-gray-300" />
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
                                  onClick={() => {
                                    analyzeImage({
                                      assetId: asset._id,
                                      storageId: asset.fileId,
                                      fileName: asset.fileName,
                                      assetType: asset.type,
                                    }).catch(console.error);
                                  }}
                                  className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                                  title="Analysis failed — click to retry"
                                >
                                  <RefreshCw size={10} className="text-white" />
                                </button>
                              )}
                              <button
                                onClick={() => removeAsset({ id: asset._id })}
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
                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No assets yet. Upload images for AI to use.</p>
                  </div>
                ) : null}

              </div>
            )}

            {/* Generate Panel */}
            {activeTab === 'generate' && (
              <div className="space-y-4">
                {/* Workspace context summary */}
                {(workspace || branding) && (
                  <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Context</label>
                    <div className="flex items-center gap-2">
                      {assets?.find(a => a.type === 'logo')?.url && (
                        <img src={assets.find(a => a.type === 'logo')!.url!} alt="" className="w-6 h-6 rounded object-contain" />
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
                      {assets && assets.filter(a => a.analyzingStatus === 'done').length > 0 && (
                        <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{assets.filter(a => a.analyzingStatus === 'done').length} assets</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Hidden file input for website screenshot */}
                <input
                  ref={websiteScreenshotRef}
                  type="file"
                  accept="image/*"
                  onChange={handleWebsiteScreenshot}
                  className="hidden"
                />

                {/* Website info (fetched at workspace creation) */}
                {workspace?.websiteInfo && (
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <Globe size={12} className="text-blue-400 shrink-0" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Website Info</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <Check size={12} className="text-green-500 shrink-0" />
                        <button
                          onClick={() => websiteScreenshotRef.current?.click()}
                          className="text-blue-400 hover:text-blue-600"
                          title="Upload website screenshot for better AI analysis"
                        >
                          <ImageIcon size={12} />
                        </button>
                        <button
                          onClick={handleRetryWebsiteFetch}
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
                          {workspace.websiteInfo.features.slice(0, 8).map((f, i) => (
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
                        onClick={handleRetryWebsiteFetch}
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
                      {([1, 2] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => setGenerateVersion(v)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            generateVersion === v
                              ? 'bg-[#1B4332] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {v === 1 ? 'V1' : 'V2'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
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
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto p-6"
        onClick={(e) => {
          if (!editMode) return;
          if ((e.target as HTMLElement).closest?.('[data-toolbar-portal]')) return;
          setSelectedId(null);
        }}
      >
        {collections !== undefined && collections.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-500 mb-2">No collections yet</h2>
              <p className="text-sm text-gray-400">Create a collection in your workspace to get started</p>
            </div>
          </div>
        ) : posts === undefined ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
          </div>
        ) : posts.length === 0 && generatedPosts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-500 mb-2">No posts yet</h2>
              <p className="text-sm text-gray-400">Use the Generate panel to create your first post</p>
            </div>
          </div>
        ) : (
          <EditContext.Provider value={editMode}>
          <AspectRatioContext.Provider value={aspectRatio}>
          <SelectedIdContext.Provider value={selectedId}>
          <SetSelectedIdContext.Provider value={handleSetSelectedId}>
          <div
            className={`
              mx-auto transition-all duration-500
              ${viewMode === 'list' ? 'flex flex-col items-center space-y-12' : 'gap-6'}
              ${editMode ? 'edit-mode' : ''}
            `}
            style={viewMode === 'grid' ? {
              display: 'grid',
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            } : undefined}
          >
              {allPostIds.map((id) => {
                const post = posts?.find(p => p._id === id);
                const generatedPost = generatedPosts.find(gp => gp.id === id);
                if (!post && !generatedPost) return null;

                const code = post?.componentCode ?? generatedPost?.code;
                if (!code) return null;

                const selectionIndex = selectedPosts.indexOf(id);
                const isSelected = selectionIndex !== -1;

                return (
                  <div
                    key={id}
                    ref={(el) => { if (el) postRefs.current.set(id, el); else postRefs.current.delete(id); }}
                    draggable={reorderMode}
                    onDragStart={reorderMode ? (e) => {
                      dragItem.current = id;
                      setDraggingId(id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', id);
                    } : undefined}
                    onDragOver={reorderMode ? (e) => {
                      e.preventDefault();
                    } : undefined}
                    onDragEnter={reorderMode ? () => {
                      handleDragEnter(id);
                    } : undefined}
                    onDragEnd={reorderMode ? () => {
                      handleDragEnd();
                    } : undefined}
                    onClick={selectMode ? (e) => { e.stopPropagation(); togglePostSelection(id); } : undefined}
                    className="relative group"
                    style={{
                      opacity: draggingId === id ? 0.4 : 1,
                      transition: 'opacity 0.2s',
                      cursor: reorderMode ? 'grab' : selectMode ? 'pointer' : undefined,
                    }}
                  >
                    {codeViewPosts.has(id) ? (
                      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-[#1e1e1e]" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}>
                        <textarea
                          value={code}
                          onChange={(e) => {
                            if (post) {
                              updatePostCode({ id: post._id, componentCode: e.target.value });
                            } else if (generatedPost) {
                              setGeneratedPosts(prev => prev.map(p => p.id === id ? { ...p, code: e.target.value } : p));
                            }
                          }}
                          className="w-full h-full p-4 text-xs font-mono text-green-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                          spellCheck={false}
                        />
                      </div>
                    ) : (
                      <PostWrapper aspectRatio={aspectRatio} filename={post?.title || id}>
                        <DynamicPost code={code} />
                      </PostWrapper>
                    )}
                    {/* Code toggle & delete buttons - visible on hover */}
                    <div className="absolute top-2 left-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleCodeView(id)}
                        className="bg-white/90 backdrop-blur-sm text-gray-600 p-1.5 rounded-md shadow-sm border border-gray-200 hover:bg-white hover:scale-105 active:scale-95 transition-all"
                        title={codeViewPosts.has(id) ? 'Show Preview' : 'Show Code'}
                      >
                        {codeViewPosts.has(id) ? <Eye size={12} /> : <Code size={12} />}
                      </button>
                      {post && (
                        <button
                          onClick={() => {
                            if (confirm('Delete this post?')) {
                              removePost({ id: post._id });
                            }
                          }}
                          className="bg-white/90 backdrop-blur-sm text-red-400 p-1.5 rounded-md shadow-sm border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:scale-105 active:scale-95 transition-all"
                          title="Delete post"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    {reorderMode && <div className="absolute inset-0 z-10 border-2 border-dashed border-transparent hover:border-[#1B4332]/30 transition-colors" />}
                    {selectMode && (
                      <div className={`absolute inset-0 z-20 rounded-xl transition-all ${isSelected ? 'ring-4 ring-blue-500 bg-blue-500/10' : 'hover:bg-black/5'}`}>
                        <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                          isSelected ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/80 backdrop-blur-sm text-gray-400 border-2 border-gray-300'
                        }`}>
                          {isSelected ? selectionIndex + 1 : ''}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          </SetSelectedIdContext.Provider>
          </SelectedIdContext.Provider>
          </AspectRatioContext.Provider>
          </EditContext.Provider>
        )}
      </main>

      {/* Floating download bar */}
      {selectMode && selectedPosts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-bold text-gray-700">{selectedPosts.length} selected</span>
          <button
            onClick={() => setSelectedPosts([])}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleDownloadSelected}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download All
          </button>
        </div>
      )}
    </div>
  );
}
