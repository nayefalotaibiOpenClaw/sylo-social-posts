"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Loader2, FolderOpen, Image as ImageIcon, Proportions, Smartphone, LayoutGrid, Columns3, ArrowUpDown, Pencil, MousePointer2, Download, Paperclip, ArrowUp, Sparkles, EyeOff, Eye, X, Zap, Clock, ChevronRight, ChevronDown, Check, Bot } from "lucide-react";
import MobileNavMenu from "@/features/design-editor/components/MobileNavMenu";
import { downloadPostsAsZip, downloadPostsMultiRatio } from "@/lib/export/download";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext, HiddenComponentsContext, SetHiddenComponentsContext } from "@/contexts/EditContext";
import { DeviceContext } from "@/contexts/DeviceContext";
import { useTheme, useSetTheme, type Theme } from "@/contexts/ThemeContext";
import Link from "@/lib/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/context";
import { localizeHref } from "@/lib/i18n/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useConvexAuth, useQuery, usePaginatedQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import PostPropertiesPanel from "@/app/components/PostPropertiesPanel";

import Sidebar, { type SidebarTab } from "@/features/design-editor/components/Sidebar";
import ThemePanel from "@/features/design-editor/components/ThemePanel";
import { type AssetTypeValue } from "@/features/design-editor/components/AssetsPanel";
import AssetsPage from "@/features/design-editor/components/AssetsPage";
import GeneratePanel from "@/features/design-editor/components/GeneratePanel";
import PostGrid from "@/features/design-editor/components/PostGrid";
import DownloadBar from "@/features/design-editor/components/DownloadBar";
import PublishChannelsPage from "@/features/design-editor/components/PublishChannelsPage";
import BrandPanel from "@/features/design-editor/components/BrandPanel";
import AgentChatPanel from "@/features/design-editor/components/AgentChatPanel";
import { FONTS } from "@/features/design-editor/constants/fonts";

export default function DesignPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspace") as Id<"workspaces"> | null;
  const collectionIdParam = searchParams.get("collection") as Id<"collections"> | null;

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const hasBlogBeta = useQuery(api.users.hasBetaFeature, { feature: "blog_engine" });
  const workspaces = useQuery(
    api.workspaces.listByUser,
    user ? {} : "skip"
  );

  // Fetch workspace data
  const collections = useQuery(
    api.collections.listByWorkspace,
    workspaceId ? { workspaceId } : "skip"
  );

  // Use first collection if none specified
  const activeCollectionId = collectionIdParam ?? collections?.[0]?._id ?? null;

  const {
    results: posts,
    status: postsStatus,
    loadMore,
  } = usePaginatedQuery(
    api.posts.listByCollectionPaginated,
    activeCollectionId ? { collectionId: activeCollectionId } : "skip",
    { initialNumItems: 18 }
  );
  const postCount = useQuery(
    api.posts.countByCollection,
    activeCollectionId ? { collectionId: activeCollectionId } : "skip"
  );

  const updatePostCode = useMutation(api.posts.updateCode);
  const updatePostCodeForRatio = useMutation(api.posts.updateCodeForRatio);
  const reorderPosts = useMutation(api.posts.reorder);
  const removePost = useMutation(api.posts.remove);
  const removePostBatch = useMutation(api.posts.removeBatch);
  const createPost = useMutation(api.posts.create);
  const createPostBatch = useMutation(api.posts.createBatch);
  const createCollection = useMutation(api.collections.create);
  const logAndIncrement = useMutation(api.aiUsage.logAndIncrement);
  const getStorageUrl = useMutation(api.assets.getStorageUrl);

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
  const updateWorkspace = useMutation(api.workspaces.update);
  const updateBrandingField = useMutation(api.branding.updateField);
  const upsertBranding = useMutation(api.branding.upsert);

  // Crawl data
  const crawlData = useQuery(
    api.websiteCrawls.getByWorkspace,
    workspaceId ? { workspaceId } : "skip"
  );
  const upsertCrawl = useMutation(api.websiteCrawls.upsert);
  const addCrawlProducts = useMutation(api.websiteCrawls.addProducts);
  const markProductSaved = useMutation(api.websiteCrawls.markProductSaved);
  const removeCrawlProduct = useMutation(api.websiteCrawls.removeProduct);

  // Logo URLs
  const logoStorageUrl = useMutation(api.assets.getStorageUrl);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null);
  useEffect(() => {
    if (branding?.logo) {
      logoStorageUrl({ storageId: branding.logo }).then(url => setLogoUrl(url ?? null)).catch(() => {});
    }
    if (branding?.logoDark) {
      logoStorageUrl({ storageId: branding.logoDark }).then(url => setLogoDarkUrl(url ?? null)).catch(() => {});
    }
  }, [branding?.logo, branding?.logoDark, logoStorageUrl]);

  // Assets
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const createAsset = useMutation(api.assets.create);
  const removeAsset = useMutation(api.assets.remove);
  const archiveAsset = useMutation(api.assets.archive);
  const analyzeImage = useAction(api.assets.analyzeImage);
  const assets = useQuery(
    api.assets.listForWorkspace,
    workspaceId && user ? { workspaceId } : "skip"
  );

  const [removingBgAssetIds, setRemovingBgAssetIds] = useState<Set<string>>(new Set());
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null);
  // "library" = @imgly only (free, real alpha), "hybrid" = Gemini + @imgly (better isolation, costs tokens)
  const [bgRemovalMode, setBgRemovalMode] = useState<"library" | "hybrid">("library");

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMode, setActiveMode] = useState<'default' | 'edit' | 'reorder' | 'select'>('default');
  const editMode = activeMode === 'edit';
  const reorderMode = activeMode === 'reorder';
  const selectMode = activeMode === 'select';
  const setEditMode = useCallback((v: boolean) => setActiveMode(v ? 'edit' : 'default'), []);
  const setReorderMode = useCallback((v: boolean) => setActiveMode(v ? 'reorder' : 'default'), []);
  const setSelectMode = useCallback((v: boolean) => setActiveMode(v ? 'select' : 'default'), []);
  const [pendingReorder, setPendingReorder] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [deviceType, setDeviceType] = useState<"iphone" | "android" | "ipad" | "android_tablet" | "desktop">("iphone");
  const [gridCols, setGridCols] = useState(3);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
  const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set());
  const handleSetHiddenComponents = useCallback((updater: (prev: Set<string>) => Set<string>) => {
    setHiddenComponents(prev => updater(prev));
  }, []);
  const [toolbarDropdown, setToolbarDropdown] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragItem = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | undefined>();
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [assetTypeSelect, setAssetTypeSelect] = useState<AssetTypeValue>("screenshot");
  const [assetScope, setAssetScope] = useState<"workspace" | "global">("workspace");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showAssetUploadDialog, setShowAssetUploadDialog] = useState(false);
  const currentTheme = useTheme();
  const setTheme = useSetTheme();
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<{ id: string; code: string }[]>([]);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [usageWarning, setUsageWarning] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [generateCount, setGenerateCount] = useState(2);
  const [generateVersion, setGenerateVersion] = useState<4 | 5 | 7 | 8>(4);
  const [generateModel, setGenerateModel] = useState('gemini-3.1-flash-lite-preview');
  const [codeViewPosts, setCodeViewPosts] = useState<Set<string>>(new Set());
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [fetchingWebsite, setFetchingWebsite] = useState(false);
  const [websiteScreenshot, setWebsiteScreenshot] = useState<string | null>(null);
  const websiteScreenshotRef = useRef<HTMLInputElement>(null);
  const [chatImages, setChatImages] = useState<{ base64: string; mimeType: string; preview: string }[]>([]);
  const chatImageInputRef = useRef<HTMLInputElement>(null);
  const [targetRatios, setTargetRatios] = useState<AspectRatioType[]>(['1:1']);
  const [adaptingRatios, setAdaptingRatios] = useState(false);
  const [contextPosts, setContextPosts] = useState<{ id: string; code: string }[]>([]);
  const [contextAssets, setContextAssets] = useState<{ id: string; url: string; type: string; label?: string; description?: string; aiAnalysis?: string }[]>([]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showQuickCountDropdown, setShowQuickCountDropdown] = useState(false);
  const [showQuickStyleDropdown, setShowQuickStyleDropdown] = useState(false);
  const [showQuickRatioDropdown, setShowQuickRatioDropdown] = useState(false);
  const [chatMode, setChatMode] = useState<'quick' | 'agent'>('quick');

  // Local order state for drag-and-drop (syncs with Convex)
  // Merge new post IDs rather than replacing, to preserve drag reorder + generated posts
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  useEffect(() => {
    setLocalOrder(prev => {
      const serverIds = posts.map(p => p._id);
      const serverIdSet: Set<string> = new Set(serverIds);
      // First load: use server order directly
      if (prev.length === 0) return serverIds;
      // All server posts deleted: preserve generated post IDs
      if (posts.length === 0) return prev.filter(id => id.startsWith('generated-'));
      // Remove deleted posts from localOrder, keep generated post IDs (not in server)
      const cleaned = prev.filter(id => serverIdSet.has(id) || id.startsWith('generated-'));
      // Find newly loaded IDs not yet in localOrder
      const existingIds = new Set(cleaned);
      const newIds = serverIds.filter(id => !existingIds.has(id));
      // No changes needed
      if (newIds.length === 0 && cleaned.length === prev.length) return prev;
      // No new IDs, just removals
      if (newIds.length === 0) return cleaned;
      // Append newly loaded page IDs to end
      return [...cleaned, ...newIds];
    });
  }, [posts]);

  // Enable reorder mode once all posts are loaded (after pendingReorder triggered loadMore)
  useEffect(() => {
    if (pendingReorder && postsStatus === 'Exhausted') {
      setPendingReorder(false);
      setActiveMode('reorder');
    }
  }, [pendingReorder, postsStatus]);

  // Keep loading pages while pendingReorder is active
  useEffect(() => {
    if (pendingReorder && postsStatus === 'CanLoadMore') {
      loadMore(100);
    }
  }, [pendingReorder, postsStatus, loadMore]);

  // Close toolbar dropdown on click outside
  useEffect(() => {
    if (!toolbarDropdown) return;
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setToolbarDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [toolbarDropdown]);

  // Close asset picker on click outside
  const assetPickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showAssetPicker) return;
    const handler = (e: MouseEvent) => {
      if (assetPickerRef.current && !assetPickerRef.current.contains(e.target as Node)) {
        setShowAssetPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAssetPicker]);

  // Close quick-mode mobile dropdowns on click outside
  const quickCountRef = useRef<HTMLDivElement>(null);
  const quickStyleRef = useRef<HTMLDivElement>(null);
  const quickRatioRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showQuickCountDropdown && !showQuickStyleDropdown && !showQuickRatioDropdown) return;
    const handler = (e: MouseEvent) => {
      if (showQuickCountDropdown && quickCountRef.current && !quickCountRef.current.contains(e.target as Node)) setShowQuickCountDropdown(false);
      if (showQuickStyleDropdown && quickStyleRef.current && !quickStyleRef.current.contains(e.target as Node)) setShowQuickStyleDropdown(false);
      if (showQuickRatioDropdown && quickRatioRef.current && !quickRatioRef.current.contains(e.target as Node)) setShowQuickRatioDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showQuickCountDropdown, showQuickStyleDropdown, showQuickRatioDropdown]);

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
      // Log website analysis usage
      if (data.usage) {
        logAndIncrement({
          workspaceId: workspaceId || undefined,
          category: "website_analysis",
          model: data.usage.model || "gemini-3.1-flash-lite-preview",
          promptTokens: data.usage.promptTokens || 0,
          completionTokens: data.usage.completionTokens || 0,
          totalTokens: data.usage.totalTokens || 0,
          endpoint: "/api/fetch-website",
        }).catch(console.error);
      }
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
      const base64 = result.split(",")[1] || result;
      setWebsiteScreenshot(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        setChatImages(prev => [...prev, { base64, mimeType: file.type, preview: result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Subscription status
  const usage = useQuery(api.subscriptions.getUsage);

  // Pre-generation subscription check
  const canGenerateCheck = useQuery(api.subscriptions.canGenerate, { postsCount: generateCount });

  const handleGenerate = async () => {
    if (!generatePrompt.trim() || generating) return;

    // Check subscription limits before calling the API
    if (canGenerateCheck && !canGenerateCheck.allowed) {
      setShowLimitModal(true);
      return;
    }

    setGenerating(true);
    setGenerateError(null);
    setUsageWarning(null);
    try {
      // Build context from workspace, branding, and assets
      const context = {
        brandName: branding?.brandName || workspace?.name,
        tagline: branding?.tagline,
        website: workspace?.website,
        industry: workspace?.industry,
        language: workspace?.defaultLanguage || 'ar' as const,
        logoUrl: logoUrl || undefined,
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
          .filter(a => a.url && !a.archived)
          .map(a => ({
            id: a._id,
            url: a.url || '',
            type: a.type,
            label: a.label || a.fileName,
            description: a.description,
            aiAnalysis: a.aiAnalysis,
          })),
        hasSelectedAssets: contextAssets.length > 0,
        themeColors: {
          primary: currentTheme.primary,
          primaryLight: currentTheme.primaryLight,
          primaryDark: currentTheme.primaryDark,
          accent: currentTheme.accent,
          accentLight: currentTheme.accentLight,
          accentLime: currentTheme.accentLime,
          accentGold: currentTheme.accentGold,
          accentOrange: currentTheme.accentOrange,
          border: currentTheme.border,
        },
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: generatePrompt,
          context,
          count: generateCount,
          version: generateVersion,
          targetRatio: aspectRatio,
          model: generateModel,
          referenceImages: chatImages.length > 0 ? chatImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })) : undefined,
          contextPosts: contextPosts.length > 0 ? contextPosts.map(p => p.code) : undefined,
          contextAssets: contextAssets.length > 0 ? contextAssets.map(a => ({ url: a.url, type: a.type, label: a.label, description: a.description, aiAnalysis: a.aiAnalysis })) : undefined,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Something went wrong while generating. Please try again or contact support.');
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong while generating. Please try again or contact support.');

      const codes: string[] = data.codes || [data.code];
      const captions: string[] = data.captions || [];
      const imageKeywords: string[][] = data.imageKeywords || [];

      // Track AI token usage in subscription — if limit exceeded, still show posts but warn user
      setUsageWarning(null);
      if (data.usage) {
        try {
          const usageResult = await logAndIncrement({
            workspaceId: workspaceId || undefined,
            category: "generation",
            model: data.usage.model || "gemini-3.1-flash-lite-preview",
            promptTokens: data.usage.promptTokens || 0,
            completionTokens: data.usage.completionTokens || 0,
            totalTokens: data.usage.totalTokens || 0,
            endpoint: "/api/generate",
            postsGenerated: data.usage.postsGenerated || codes.length,
          });
          if (usageResult?.limitReached) {
            setShowLimitModal(true);
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : '';
          if (msg.includes('expired')) {
            setUsageWarning(t("design.subscriptionExpired"));
          } else if (msg.includes('No active subscription')) {
            setUsageWarning(t("design.noSubscription"));
          }
        }
      }

      // Save generated posts to Convex (inserted at top via createBatch)
      if (workspaceId && user) {
        let collectionId = activeCollectionId;

        if (!collectionId) {
          collectionId = await createCollection({
            workspaceId,
            name: "Generated Posts",
            mode: "social_grid",
            language: workspace?.defaultLanguage || "ar",
            aspectRatio: "1:1",
          });
        }

        const newPostIds = await createPostBatch({
          collectionId,
          workspaceId,
          language: workspace?.defaultLanguage || "ar",
          posts: codes.map((code, i) => ({
            title: `${generatePrompt.slice(0, 80)} (${i + 1}/${codes.length})`,
            componentCode: code,
            device: "none" as const,
            caption: captions[i] || undefined,
            imageKeywords: imageKeywords[i]?.length ? imageKeywords[i] : undefined,
          })),
        });

        // Prepend new post IDs to localOrder so they appear at the top immediately
        if (newPostIds.length > 0) {
          setLocalOrder(prev => {
            const newIdSet = new Set(newPostIds as string[]);
            const filtered = prev.filter(id => !newIdSet.has(id));
            return [...(newPostIds as string[]), ...filtered];
          });
        }

        // Adapt to additional ratios in background
        const extraRatios = targetRatios.filter(r => r !== '1:1');
        if (extraRatios.length > 0 && newPostIds.length > 0) {
          setAdaptingRatios(true);
          Promise.all(
            newPostIds.map((id, i) => adaptPostToRatios(id, codes[i], targetRatios))
          ).catch(err => console.error('Ratio adaptation failed:', err))
            .finally(() => setAdaptingRatios(false));
        }
      } else {
        const newEntries = codes.map(code => ({
          id: `generated-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          code,
        }));
        setGeneratedPosts(prev => [...newEntries, ...prev]);
        setLocalOrder(prev => [...newEntries.map(e => e.id), ...prev]);
      }
      setChatImages([]);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Something went wrong. Please try again or contact support.');
    } finally {
      setGenerating(false);
    }
  };

  const ENGINE_LABELS: Record<number, string> = { 4: 'W (Wild)', 5: 'C (Classic)', 7: 'AG (App Store Guided)', 8: 'S (SaaS)' };

  // After generating posts, adapt each to the additional selected ratios
  const adaptPostToRatios = async (postId: Id<"posts">, baseCode: string, ratios: AspectRatioType[]) => {
    // Filter out 1:1 since that's the base ratio
    const extraRatios = ratios.filter(r => r !== '1:1');
    if (extraRatios.length === 0) return;

    const promises = extraRatios.map(async (ratio) => {
      const res = await fetch('/api/adapt-ratio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: baseCode, targetRatio: ratio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Adapt to ${ratio} failed`);
      // Log adaptation usage
      if (data.usage) {
        logAndIncrement({
          workspaceId: workspaceId || undefined,
          category: "adaptation",
          model: data.usage.model || "gemini-3.1-flash-lite-preview",
          promptTokens: data.usage.promptTokens || 0,
          completionTokens: data.usage.completionTokens || 0,
          totalTokens: data.usage.totalTokens || 0,
          endpoint: "/api/adapt-ratio",
        }).catch(console.error);
      }
      return { ratio, code: data.code };
    });

    const results = await Promise.all(promises);
    for (const { ratio, code } of results) {
      await updatePostCodeForRatio({ id: postId, ratio, componentCode: code });
    }
  };

  // Adapt a single post to a single ratio (called from PostGrid resize button)
  const handleAdaptSingleRatio = useCallback(async (postId: Id<"posts">, baseCode: string, targetRatio: AspectRatioType) => {
    const res = await fetch('/api/adapt-ratio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: baseCode, targetRatio }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Adapt to ${targetRatio} failed`);
    // Log adaptation usage
    if (data.usage) {
      logAndIncrement({
        workspaceId: workspaceId || undefined,
        category: "adaptation",
        model: data.usage.model || "gemini-3.1-flash-lite-preview",
        promptTokens: data.usage.promptTokens || 0,
        completionTokens: data.usage.completionTokens || 0,
        totalTokens: data.usage.totalTokens || 0,
        endpoint: "/api/adapt-ratio",
      }).catch(console.error);
    }
    await updatePostCodeForRatio({ id: postId, ratio: targetRatio, componentCode: data.code });
  }, [updatePostCodeForRatio, logAndIncrement, workspaceId]);

  // ── Crawl handlers ──
  const handleCrawlDiscover = async (url: string) => {
    if (!workspaceId || !user) return;

    // Always apply brand identity — user explicitly triggered fetch/refetch

    // Save the website URL to the workspace so fetch-section can use it
    await updateWorkspace({ id: workspaceId, website: url });

    await upsertCrawl({
      workspaceId,
      url,
      status: "discovering",
      sections: [],
      discoveredProducts: [],
      totalProductsFound: 0,
      totalProductsFetched: 0,
    });

    try {
      const res = await fetch("/api/crawl-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, step: "discover" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crawl failed");

      const sections = (data.sections || []).map((s: Record<string, unknown>) => ({
        type: String(s.type || "page"),
        name: String(s.name || ""),
        nameAr: s.nameAr ? String(s.nameAr) : undefined,
        url: String(s.url || ""),
        imageUrl: s.imageUrl ? String(s.imageUrl) : undefined,
        productCount: typeof s.productCount === "number" ? s.productCount : undefined,
        fetched: false,
      }));

      const homepageProducts = (data.homepageProducts || []).map((p: Record<string, unknown>) => ({
        name: String(p.name || "Unknown"),
        price: p.price ? String(p.price) : undefined,
        currency: p.currency ? String(p.currency) : undefined,
        originalPrice: p.originalPrice ? String(p.originalPrice) : undefined,
        discount: p.discount ? String(p.discount) : undefined,
        imageUrl: p.imageUrl ? String(p.imageUrl) : undefined,
        sourceUrl: String(p.sourceUrl || url),
        brand: p.brand ? String(p.brand) : undefined,
        section: "homepage",
      }));

      const wi = data.websiteInfo || {};
      await upsertCrawl({
        workspaceId,
        url,
        status: "ready",
        businessInfo: {
          companyName: wi.companyName || undefined,
          description: wi.description || undefined,
          industry: wi.industry || undefined,
          tone: wi.tone || undefined,
          targetAudience: wi.targetAudience || undefined,
          logoUrl: wi.logoUrl || undefined,
        },
        sections,
        discoveredProducts: homepageProducts,
        totalProductsFound: homepageProducts.length,
        totalProductsFetched: 0,
      });

      if (wi.companyName || wi.description) {
        await updateWebsiteInfo({
          id: workspaceId,
          websiteInfo: {
            companyName: wi.companyName || "",
            description: wi.description || "",
            industry: wi.industry || "",
            features: Array.isArray(wi.features) ? wi.features : [],
            targetAudience: wi.targetAudience || undefined,
            tone: wi.tone || undefined,
            contact: wi.contact ? {
              phone: wi.contact.phone || undefined,
              email: wi.contact.email || undefined,
              address: wi.contact.address || undefined,
              socialMedia: Array.isArray(wi.contact.socialMedia) ? wi.contact.socialMedia.filter(Boolean) : undefined,
            } : undefined,
            fetchedAt: Date.now(),
          },
        });
      }

      // ── Auto-apply brand identity from crawl results ──
      const brandName = wi.companyName || workspace?.name || "Brand";
      const tagline = wi.tagline || undefined;

      // Validate hex color: must be #RRGGBB or #RGB format
      const isValidHex = (c: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c);
      const normalizeHex = (c: string) => {
        if (!isValidHex(c)) return null;
        const h = c.replace("#", "");
        if (h.length === 3) return "#" + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        return "#" + h;
      };

      // Build theme from discovered brand colors
      let newTheme: Theme | null = null;
      if (wi.brandColors && wi.brandColors.primary) {
        // Color utilities
        const hexToRgb = (hex: string) => {
          const h = hex.replace("#", "");
          return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] as [number, number, number];
        };
        const rgbToHex = (r: number, g: number, b: number) =>
          "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
        const mix = (hex1: string, hex2: string, ratio: number) => {
          const [r1, g1, b1] = hexToRgb(hex1);
          const [r2, g2, b2] = hexToRgb(hex2);
          return rgbToHex(r1 + (r2 - r1) * ratio, g1 + (g2 - g1) * ratio, b1 + (b2 - b1) * ratio);
        };
        const lighten = (hex: string, amount: number) => mix(hex, "#FFFFFF", amount);
        const darken = (hex: string, amount: number) => mix(hex, "#000000", amount);
        const brightness = (hex: string) => {
          const [r, g, b] = hexToRgb(hex);
          return (r * 299 + g * 587 + b * 114) / 1000;
        };

        let primary = normalizeHex(wi.brandColors.primary);
        let accent = normalizeHex(wi.brandColors.accent) || primary;
        let light = normalizeHex(wi.brandColors.light) || "#F8FAFC";

        // Guard: if AI returned a too-light color as primary, swap with accent
        if (primary && accent && brightness(primary) > 200 && brightness(accent) < 200) {
          const tmp = primary;
          primary = accent;
          accent = tmp;
        }
        // Guard: if primary is still too light (near-white), derive from accent
        if (primary && brightness(primary) > 200 && accent) {
          primary = darken(accent, 0.3);
        }

        if (primary) {
          const primaryDark = normalizeHex(wi.brandColors.primaryDark) || darken(primary, 0.5);
          const accentLight = normalizeHex(wi.brandColors.accentLight) || lighten(accent!, 0.3);

          newTheme = {
            primary,
            primaryLight: light,
            primaryDark,
            accent: accent!,
            accentLight,
            accentLime: lighten(accent!, 0.55),
            accentGold: "#FCD34D",
            accentOrange: "#F4A261",
            border: mix(primary, accent!, 0.3),
            font: currentTheme.font,
          };
        }
      }

      // Match suggested font to available fonts
      let matchedFont: string | null = null;
      if (wi.suggestedFont) {
        const suggested = wi.suggestedFont.toLowerCase().trim();
        const fontMatch = FONTS.find(
          (f) => f.name.toLowerCase() === suggested || f.value.toLowerCase().includes(suggested)
        );
        if (fontMatch) {
          matchedFont = fontMatch.value;
        }
      }

      // Apply font to theme (on first crawl only)
      if (matchedFont) {
        if (newTheme) {
          newTheme = { ...newTheme, font: matchedFont };
        } else {
          newTheme = { ...currentTheme, font: matchedFont };
        }
      }

      // Apply theme
      if (newTheme) {
        setTheme(newTheme);
      }

      // Save branding
      const themeToSave = newTheme || currentTheme;
      const brandingColors = {
        primary: themeToSave.primary,
        primaryLight: themeToSave.primaryLight,
        primaryDark: themeToSave.primaryDark,
        accent: themeToSave.accent,
        accentLight: themeToSave.accentLight,
        accentLime: themeToSave.accentLime,
        accentGold: themeToSave.accentGold,
        accentOrange: themeToSave.accentOrange,
        border: themeToSave.border,
      };
      const brandingFonts = { heading: themeToSave.font, body: themeToSave.font };

      if (branding) {
        await updateBrandingField({ workspaceId, field: "brandName", value: brandName });
        if (tagline) await updateBrandingField({ workspaceId, field: "tagline", value: tagline });
        await updateBrandingField({ workspaceId, field: "colors", value: brandingColors });
        await updateBrandingField({ workspaceId, field: "fonts", value: brandingFonts });
      } else {
        await upsertBranding({
          workspaceId,
          brandName,
          tagline,
          colors: brandingColors,
          fonts: brandingFonts,
        });
      }

      // Auto-save discovered logo
      if (wi.logoUrl) {
        try {
          const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(wi.logoUrl)}`);
          if (proxyRes.ok) {
            const blob = await proxyRes.blob();
            const uploadUrl = await generateUploadUrl();
            const uploadRes = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": blob.type || "image/png" },
              body: blob,
            });
            if (uploadRes.ok) {
              const { storageId } = await uploadRes.json();
              await updateBrandingField({ workspaceId, field: "logo", value: storageId });
            }
          }
        } catch (logoErr) {
          console.error("Auto-save logo failed:", logoErr);
        }
      }

      // Update industry on workspace
      if (wi.industry) {
        await updateWorkspace({ id: workspaceId, industry: wi.industry });
      }

      // Log crawl usage
      if (data.usage) {
        logAndIncrement({
          workspaceId: workspaceId || undefined,
          category: "crawl",
          model: data.usage.model || "gemini-3.1-flash-lite-preview",
          promptTokens: data.usage.promptTokens || 0,
          completionTokens: data.usage.completionTokens || 0,
          totalTokens: data.usage.totalTokens || 0,
          endpoint: "/api/crawl-website",
        }).catch(console.error);
      }
    } catch (err) {
      console.error("Crawl discover failed:", err);
      await upsertCrawl({
        workspaceId,
        url,
        status: "failed",
        sections: [],
        discoveredProducts: [],
        totalProductsFound: 0,
        totalProductsFetched: 0,
      });
    }
  };

  const handleCrawlSection = async (sectionUrl: string) => {
    if (!workspaceId || !workspace?.website) return;
    try {
      const res = await fetch("/api/crawl-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: workspace.website, step: "fetch-section", sectionUrl, limit: 6 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Section fetch failed");

      const products = (data.products || []).map((p: Record<string, unknown>) => ({
        name: String(p.name || "Unknown"),
        price: p.price ? String(p.price) : undefined,
        currency: p.currency ? String(p.currency) : undefined,
        originalPrice: p.originalPrice ? String(p.originalPrice) : undefined,
        discount: p.discount ? String(p.discount) : undefined,
        imageUrl: p.imageUrl ? String(p.imageUrl) : undefined,
        sourceUrl: String(p.sourceUrl || sectionUrl),
        brand: p.brand ? String(p.brand) : undefined,
        section: sectionUrl,
      }));

      await addCrawlProducts({ workspaceId, sectionUrl, products });
    } catch (err) {
      console.error("Section fetch failed:", err);
    }
  };

  const handleSaveProductAsAsset = async (product: { name: string; imageUrl?: string; sourceUrl: string }) => {
    if (!workspaceId || !user || !product.imageUrl) return;
    try {
      // Proxy through our API to avoid CORS issues
      const imgRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(product.imageUrl)}&source=crawl`);
      if (!imgRes.ok) throw new Error("Failed to download product image");
      const blob = await imgRes.blob();

      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "image/jpeg" },
        body: blob,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { storageId } = await uploadRes.json();

      const assetId = await createAsset({
        workspaceId,
        scope: "workspace",
        fileId: storageId,
        fileName: `${product.name.slice(0, 50)}.jpg`,
        type: "product",
        label: product.name,
      });

      analyzeImage({ assetId, storageId, fileName: product.name, assetType: "product", userId: user._id, workspaceId }).catch(console.error);

      if (crawlData?._id) {
        await markProductSaved({
          crawlId: crawlData._id as Id<"websiteCrawls">,
          productSourceUrl: product.sourceUrl,
          assetId,
        });
      }
    } catch (err) {
      console.error("Failed to save product as asset:", err);
    }
  };

  const handleSaveAllProducts = async () => {
    if (!workspaceId || !user || !crawlData) return;
    const unsaved = (crawlData.discoveredProducts as Array<{ name: string; imageUrl?: string; sourceUrl: string; savedAsAssetId?: string }>).filter(
      p => !p.savedAsAssetId && p.imageUrl
    );
    const batchSize = 3;
    for (let i = 0; i < unsaved.length; i += batchSize) {
      const batch = unsaved.slice(i, i + batchSize);
      await Promise.all(
        batch.map(product =>
          handleSaveProductAsAsset(product).catch(console.error)
        )
      );
    }
  };

  const handleRemoveProduct = async (productSourceUrl: string) => {
    if (!crawlData?._id) return;
    await removeCrawlProduct({
      crawlId: crawlData._id as Id<"websiteCrawls">,
      productSourceUrl,
    });
  };

  const handleUploadLogo = async (file: File, variant: "logo" | "logoDark") => {
    if (!workspaceId) return;
    const uploadUrl = await generateUploadUrl();
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) return;
    const { storageId } = await res.json();

    if (branding) {
      await updateBrandingField({ workspaceId, field: variant, value: storageId });
    } else {
      // Create branding record if it doesn't exist
      await upsertBranding({
        workspaceId,
        brandName: workspace?.name || "Brand",
        [variant]: storageId,
        colors: {
          primary: currentTheme.primary,
          primaryLight: currentTheme.primaryLight,
          primaryDark: currentTheme.primaryDark,
          accent: currentTheme.accent,
          accentLight: currentTheme.accentLight,
          accentLime: currentTheme.accentLime,
          accentGold: currentTheme.accentGold,
          accentOrange: currentTheme.accentOrange,
          border: currentTheme.border,
        },
        fonts: { heading: currentTheme.font, body: currentTheme.font },
      });
    }

    // Update local URL
    const url = await logoStorageUrl({ storageId });
    if (variant === "logo") setLogoUrl(url ?? null);
    else setLogoDarkUrl(url ?? null);
  };

  const handleSaveLogoFromUrl = async (imageUrl: string, variant: "logo" | "logoDark") => {
    if (!workspaceId) return;
    try {
      // Download via proxy for SSRF safety
      const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      if (!proxyRes.ok) return;
      const blob = await proxyRes.blob();

      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type || "image/png" },
        body: blob,
      });
      if (!uploadRes.ok) return;
      const { storageId } = await uploadRes.json();

      // Save to branding
      if (branding) {
        await updateBrandingField({ workspaceId, field: variant, value: storageId });
      } else {
        await upsertBranding({
          workspaceId,
          brandName: workspace?.name || "Brand",
          [variant]: storageId,
          colors: {
            primary: currentTheme.primary,
            primaryLight: currentTheme.primaryLight,
            primaryDark: currentTheme.primaryDark,
            accent: currentTheme.accent,
            accentLight: currentTheme.accentLight,
            accentLime: currentTheme.accentLime,
            accentGold: currentTheme.accentGold,
            accentOrange: currentTheme.accentOrange,
            border: currentTheme.border,
          },
          fonts: { heading: currentTheme.font, body: currentTheme.font },
        });
      }

      // Update local URL
      const url = await logoStorageUrl({ storageId });
      if (variant === "logo") setLogoUrl(url ?? null);
      else setLogoDarkUrl(url ?? null);
    } catch (err) {
      console.error("Save logo from URL failed:", err);
    }
  };

  const handleDeleteLogo = async (variant: "logo" | "logoDark") => {
    if (!workspaceId || !branding) return;
    await updateBrandingField({ workspaceId, field: variant, value: null, unset: true });
    if (variant === "logo") setLogoUrl(null);
    else setLogoDarkUrl(null);
  };

  const handleUpdateBranding = async (field: string, value: string) => {
    if (!workspaceId || !branding) return;
    await updateBrandingField({ workspaceId, field, value });
  };

  const handleUpdateWebsiteInfo = async (updates: Record<string, unknown>) => {
    if (!workspaceId || !workspace) return;
    const current = workspace.websiteInfo || {};
    await updateWebsiteInfo({
      id: workspaceId,
      websiteInfo: {
        ...current,
        ...updates,
        fetchedAt: current.fetchedAt || Date.now(),
      },
    });
  };

  const handleUpdateWorkspace = async (updates: { website?: string; industry?: string }) => {
    if (!workspaceId) return;
    await updateWorkspace({ id: workspaceId, ...updates });
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
    if (tab === 'blogs' && workspaceId) {
      router.push(localizeHref(`/blog-editor?workspace=${workspaceId}`, locale));
      return;
    }
    if (tab === 'design') {
      setActiveTab(null);
      return;
    }
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPendingFiles(Array.from(files));
    setShowAssetUploadDialog(true);
    e.target.value = '';
  };

  // Compress image for mobile — reduce to max 2048px and convert to JPEG
  const compressImage = async (file: File, maxSize = 2048, quality = 0.85): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : resolve(file),
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
      img.src = url;
    });
  };

  const handleAssetUpload = async () => {
    if (!workspaceId || !user || pendingFiles.length === 0) return;
    setUploadingAsset(true);
    try {
      for (const file of pendingFiles) {
        try {
          // Compress large images to prevent mobile crashes
          const blob = file.size > 1024 * 1024 ? await compressImage(file) : file;
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type || file.type || "application/octet-stream" },
            body: blob,
          });
          if (!result.ok) { console.error(`Upload failed for ${file.name}: ${result.status}`); continue; }
          const { storageId } = await result.json();

          const assetId = await createAsset({
            workspaceId: assetScope === "workspace" ? workspaceId : undefined,
            scope: assetScope,
            fileId: storageId,
            fileName: file.name,
            type: assetTypeSelect,
          });

          analyzeImage({
            assetId,
            storageId,
            fileName: file.name,
            assetType: assetTypeSelect,
            userId: user._id,
            workspaceId: assetScope === "workspace" ? workspaceId : undefined,
          }).catch((err) => console.error("Background analysis failed:", err));
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
        }
      }
      setPendingFiles([]);
      setShowAssetUploadDialog(false);
    } catch (err) {
      console.error("Failed to upload asset:", err);
    } finally {
      setUploadingAsset(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeBackgroundForOne = async (asset: any) => {
    // Step 1: Fetch original image
    const imgRes = await fetch(asset.url);
    if (!imgRes.ok) throw new Error("Failed to fetch image");
    const originalBlob = await imgRes.blob();

    let inputForLibrary: Blob = originalBlob;
    let usage = null;

    // Step 2 (hybrid mode only): Gemini nano banana pre-processing
    if (bgRemovalMode === "hybrid") {
      const mimeType = originalBlob.type || "image/png";
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(originalBlob);
      });

      const res = await fetch("/api/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (res.ok) {
        const data = await res.json();
        usage = data.usage;
        const resultBytes = Uint8Array.from(atob(data.imageBase64), c => c.charCodeAt(0));
        inputForLibrary = new Blob([resultBytes], { type: data.mimeType });
      }
    }

    // Step 3: @imgly/background-removal — produces real alpha transparency
    const { removeBackground } = await import("@imgly/background-removal");
    const transparentBlob: Blob = await removeBackground(inputForLibrary, {
      model: "isnet_quint8",
      output: { format: "image/png" as const },
    });

    // Step 4: Compress if over 10MB (library outputs uncompressed PNGs)
    let finalBlob = transparentBlob;
    if (transparentBlob.size > 9 * 1024 * 1024) {
      const bmpUrl = URL.createObjectURL(transparentBlob);
      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load processed image"));
          img.src = bmpUrl;
        });
        let { width, height } = img;
        const maxDim = 2048;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpBlob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/webp", 0.9));
          if (webpBlob && webpBlob.size < transparentBlob.size) {
            finalBlob = webpBlob;
          }
        }
      } finally {
        URL.revokeObjectURL(bmpUrl);
      }
    }

    const uploadMime = finalBlob.type || "image/png";
    const uploadUrl = await generateUploadUrl();
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": uploadMime },
      body: finalBlob,
    });
    if (!uploadRes.ok) throw new Error("Failed to upload processed image");
    const { storageId } = await uploadRes.json();

    const ext = uploadMime === "image/webp" ? ".webp" : ".png";
    const newFileName = asset.fileName.replace(/\.[^.]+$/, "") + "_nobg" + ext;
    const assetId = await createAsset({
      workspaceId: asset.workspaceId || workspaceId,
      scope: asset.scope || "workspace",
      fileId: storageId,
      fileName: newFileName,
      type: asset.type,
    });

    analyzeImage({
      assetId,
      storageId,
      fileName: newFileName,
      assetType: asset.type,
      userId: user!._id,
      workspaceId: asset.workspaceId || workspaceId,
    }).catch(console.error);

    // Log AI usage (Gemini tokens — only in hybrid mode)
    if (usage) {
      logAndIncrement({
        workspaceId: asset.workspaceId || workspaceId,
        category: "background_removal",
        model: usage.model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        endpoint: "/api/remove-background",
      }).catch(console.error);
    }

    // Archive the original asset
    await archiveAsset({ id: asset._id, archived: true });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRemoveBackground = async (assetOrAssets: any | any[]) => {
    if (!workspaceId || !user) return;
    setBgRemovalError(null);
    const assetList = Array.isArray(assetOrAssets) ? assetOrAssets : [assetOrAssets];
    const validAssets = assetList.filter((a: { url?: string; _id: string }) => a.url && !removingBgAssetIds.has(a._id));
    if (validAssets.length === 0) return;

    const newIds = new Set(removingBgAssetIds);
    validAssets.forEach((a: { _id: string }) => newIds.add(a._id));
    setRemovingBgAssetIds(new Set(newIds));

    let failCount = 0;
    // Process all in parallel
    await Promise.allSettled(
      validAssets.map(async (asset: { _id: string }) => {
        try {
          await removeBackgroundForOne(asset);
        } catch (err) {
          failCount++;
          console.error(`Remove background failed for ${asset._id}:`, err);
        } finally {
          setRemovingBgAssetIds(prev => {
            const next = new Set(prev);
            next.delete(asset._id);
            return next;
          });
        }
      })
    );

    if (failCount > 0) {
      setBgRemovalError(`Background removal failed for ${failCount} image${failCount > 1 ? "s" : ""}. Please try again.`);
    }
  };

  const togglePostSelection = useCallback((id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedPosts.length === 0) return;
    const ids = selectedPosts.map(id => id as Id<"posts">);
    await removePostBatch({ ids });
    setSelectedPosts([]);
  }, [selectedPosts, removePostBatch]);

  const handleAddToContext = useCallback(() => {
    if (selectedPosts.length === 0) return;
    const newContextPosts = selectedPosts
      .map(id => {
        const post = posts?.find(p => p._id === id);
        if (post) return { id, code: post.componentCode };
        const gen = generatedPosts.find(gp => gp.id === id);
        if (gen) return { id, code: gen.code };
        return null;
      })
      .filter((p): p is { id: string; code: string } => p !== null);
    setContextPosts(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const unique = newContextPosts.filter(p => !existingIds.has(p.id));
      return [...prev, ...unique];
    });
    setSelectedPosts([]);
    setActiveMode('default');
  }, [selectedPosts, posts, generatedPosts]);

  const handleToggleAssetContext = useCallback((asset: { _id: string; url: string; type: string; label?: string; fileName?: string; description?: string; aiAnalysis?: string }) => {
    setContextAssets(prev => {
      const exists = prev.find(a => a.id === asset._id);
      if (exists) return prev.filter(a => a.id !== asset._id);
      if (prev.length >= 8) return prev; // cap at 8
      return [...prev, { id: asset._id, url: asset.url, type: asset.type, label: asset.label || asset.fileName, description: asset.description, aiAnalysis: asset.aiAnalysis }];
    });
  }, []);

  // Clean up stale context assets when assets list changes
  React.useEffect(() => {
    if (!assets) return;
    const assetIds = new Set(assets.map((a: { _id: string }) => a._id));
    setContextAssets(prev => prev.filter(a => assetIds.has(a.id)));
  }, [assets]);

  const contextAssetIds = React.useMemo(() => new Set(contextAssets.map(a => a.id)), [contextAssets]);

  const handleDownloadSelected = useCallback(async (ratios: string[]) => {
    if (selectedPosts.length === 0) return;
    setDownloading(true);
    setDownloadProgress(undefined);
    const savedRatio = aspectRatio;
    try {
      const postEntries = selectedPosts.map(id => {
        const post = posts?.find(p => p._id === id);
        return { id, filename: post?.title || id };
      });
      if (ratios.length === 1 && ratios[0] === aspectRatio) {
        // Single ratio, current view — use simple download
        await downloadPostsAsZip(
          postRefs.current,
          selectedPosts,
          postEntries,
          `posts-${selectedPosts.length}.zip`,
        );
      } else {
        // Multi-ratio download
        await downloadPostsMultiRatio(
          postRefs.current,
          selectedPosts,
          postEntries,
          ratios,
          (r) => setAspectRatio(r as AspectRatioType),
          (label) => setDownloadProgress(label),
        );
      }
    } catch (err) {
      console.error("Failed to download posts:", err);
    } finally {
      setAspectRatio(savedRatio);
      setDownloading(false);
      setDownloadProgress(undefined);
    }
  }, [selectedPosts, posts, aspectRatio]);

  // Auth handled by dashboard layout

  // Loading state
  if (authLoading || user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 dark:text-neutral-300 mb-2">{t("design.noWorkspace")}</h2>
          <p className="text-sm text-gray-400 mb-6">{t("design.selectWorkspace")}</p>
          <Link
            href="/workspaces"
            className="px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95"
          >
            {t("design.goToWorkspaces")}
          </Link>
        </div>
      </div>
    );
  }

  const allPostIds = localOrder.length > 0 ? localOrder : posts.map(p => p._id);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      <Sidebar
        activeTab={activeTab}
        onTabClick={handleTabClick}
        workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))}
        currentWorkspaceId={workspaceId ?? undefined}
        currentWorkspaceName={workspace?.name}
        hasBlogBeta={hasBlogBeta === true}
      >
        {activeTab === 'theme' && (
          <ThemePanel currentTheme={currentTheme} setTheme={setTheme} />
        )}
      </Sidebar>

      {/* Brand full page — sits next to sidebar */}
      {activeTab === 'brand' && (
        <BrandPanel
          workspace={workspace as Parameters<typeof BrandPanel>[0]["workspace"]}
          branding={branding as Parameters<typeof BrandPanel>[0]["branding"]}
          crawlData={crawlData as Parameters<typeof BrandPanel>[0]["crawlData"]}
          logoUrl={logoUrl}
          logoDarkUrl={logoDarkUrl}
          currentTheme={currentTheme}
          setTheme={setTheme}
          onCrawlDiscover={handleCrawlDiscover}
          onCrawlSection={handleCrawlSection}
          onSaveProductAsAsset={handleSaveProductAsAsset}
          onSaveAllProducts={handleSaveAllProducts}
          onRemoveProduct={handleRemoveProduct}
          onClose={() => handleTabClick(null)}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))}
          currentWorkspaceId={workspaceId ?? undefined}
          currentWorkspaceName={workspace?.name}
          onUploadLogo={handleUploadLogo}
          onDeleteLogo={handleDeleteLogo}
          onSaveLogoFromUrl={handleSaveLogoFromUrl}
          onUpdateBranding={handleUpdateBranding}
          onUpdateWebsiteInfo={handleUpdateWebsiteInfo}
          onUpdateWorkspace={handleUpdateWorkspace}
        />
      )}

      {/* Publish / Channels full page — sits next to sidebar */}
      {(activeTab === 'publish' || activeTab === 'channels') && user && workspaceId && (
        <PublishChannelsPage
          workspaceId={workspaceId}
          userId={user._id}
          initialTab={activeTab === 'channels' ? 'channels' : 'publish'}
          onClose={() => handleTabClick(null)}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))}
          currentWorkspaceId={workspaceId ?? undefined}
          currentWorkspaceName={workspace?.name}
        />
      )}

      {/* Assets full page — sits next to sidebar */}
      {activeTab === 'assets' && (
        <AssetsPage
          assets={assets}
          pendingFiles={pendingFiles} setPendingFiles={setPendingFiles}
          showAssetUploadDialog={showAssetUploadDialog} setShowAssetUploadDialog={setShowAssetUploadDialog}
          assetTypeSelect={assetTypeSelect} setAssetTypeSelect={setAssetTypeSelect}
          assetScope={assetScope} setAssetScope={setAssetScope}
          uploadingAsset={uploadingAsset}
          onFileSelect={handleFileSelect}
          onAssetUpload={handleAssetUpload}
          onRemoveAsset={(id) => removeAsset({ id: id as Id<"assets"> })}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))}
          currentWorkspaceId={workspaceId ?? undefined}
          currentWorkspaceName={workspace?.name}
          onRetryAnalysis={(asset) => {
            analyzeImage({
              assetId: asset._id,
              storageId: asset.fileId,
              fileName: asset.fileName,
              assetType: asset.type,
              userId: user?._id,
              workspaceId: workspaceId || undefined,
            }).catch(console.error);
          }}
          onRemoveBackground={handleRemoveBackground}
          removingBgAssetIds={removingBgAssetIds}
          bgRemovalError={bgRemovalError}
          onArchiveAsset={(id, archived) => archiveAsset({ id: id as Id<"assets">, archived })}
        />
      )}

      {/* Main Content — Design + Generate merged */}
      {activeTab !== 'brand' && activeTab !== 'publish' && activeTab !== 'channels' && activeTab !== 'assets' && <div className="flex-1 flex flex-col overflow-hidden">
        {/* Nav Header with Design/Generate sub-tab switcher */}
        <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
          <nav ref={toolbarRef} className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-4">
            {/* Mobile: nav menu / Desktop: Design label — single element */}
            <div className="md:hidden">
              <MobileNavMenu activeTab={activeTab} onTabClick={handleTabClick} workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))} currentWorkspaceId={workspaceId ?? undefined} currentWorkspaceName={workspace?.name} />
            </div>
            <span className="hidden md:flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white shrink-0">
              <LayoutGrid size={14} />
              Design
            </span>

            <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />

            {postCount != null && <span className="hidden sm:inline text-xs font-medium text-slate-400">{postCount} post{postCount !== 1 ? 's' : ''}</span>}

            <div className="flex-1" />

            {/* Editing toolbar controls */}
            <div className="flex items-center gap-0.5">
              {/* Cursor / default mode */}
              <button
                onClick={() => { setActiveMode('default'); setToolbarDropdown(null); if (selectMode) setSelectedPosts([]); }}
                title="Select"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${activeMode === 'default' ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300'}`}
              >
                <MousePointer2 size={15} />
              </button>

              {/* Edit mode */}
              <button
                onClick={() => { setActiveMode(activeMode === 'edit' ? 'default' : 'edit'); setToolbarDropdown(null); if (selectMode) setSelectedPosts([]); }}
                title="Edit"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${activeMode === 'edit' ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300'}`}
              >
                <Pencil size={15} />
              </button>

              {/* Hidden components restore — only in edit mode with hidden items */}
              {editMode && hiddenComponents.size > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setToolbarDropdown(toolbarDropdown === 'hidden' ? null : 'hidden')}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all relative ${toolbarDropdown === 'hidden' ? 'bg-red-50 text-red-500' : 'text-red-400 hover:bg-red-50'}`}
                    title={`${hiddenComponents.size} hidden component${hiddenComponents.size > 1 ? 's' : ''}`}
                  >
                    <EyeOff size={15} />
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {hiddenComponents.size}
                    </span>
                  </button>
                  {toolbarDropdown === 'hidden' && (
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 dark:border-neutral-700/60 py-1.5 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("design.hiddenComponents")}</div>
                      {Array.from(hiddenComponents).map((cid) => (
                        <button
                          key={cid}
                          onClick={() => {
                            setHiddenComponents(prev => {
                              const next = new Set(prev);
                              next.delete(cid);
                              return next;
                            });
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Eye size={12} className="text-gray-400 shrink-0" />
                          <span className="font-mono truncate">{cid}</span>
                        </button>
                      ))}
                      <div className="border-t border-gray-100 dark:border-neutral-800 mt-1 pt-1">
                        <button
                          onClick={() => { setHiddenComponents(new Set()); setToolbarDropdown(null); }}
                          className="w-full px-3 py-2 text-[12px] font-bold text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          {t("design.restoreAll")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="w-px h-4 bg-slate-200/80 dark:bg-neutral-700/80 mx-1" />

              {/* Aspect Ratio */}
              <div className="relative">
                <button
                  onClick={() => setToolbarDropdown(toolbarDropdown === 'ratio' ? null : 'ratio')}
                  title="Aspect Ratio"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${toolbarDropdown === 'ratio' ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300'}`}
                >
                  <Proportions size={15} />
                </button>
                {toolbarDropdown === 'ratio' && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 dark:border-neutral-700/60 py-1.5 min-w-[140px] z-50">
                    {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((r) => (
                      <button key={r} onClick={() => { setAspectRatio(r); setToolbarDropdown(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${aspectRatio === r ? 'font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Device */}
              <div className="relative">
                <button
                  onClick={() => setToolbarDropdown(toolbarDropdown === 'device' ? null : 'device')}
                  title="Device"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${toolbarDropdown === 'device' ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300'}`}
                >
                  <Smartphone size={15} />
                </button>
                {toolbarDropdown === 'device' && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 dark:border-neutral-700/60 py-1.5 min-w-[150px] z-50">
                    {([['iphone', 'iPhone'], ['android', 'Android'], ['ipad', 'iPad'], ['android_tablet', 'Tab'], ['desktop', 'Desktop']] as const).map(([key, label]) => (
                      <button key={key} onClick={() => { setDeviceType(key as typeof deviceType); setToolbarDropdown(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${deviceType === key ? 'font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid columns */}
              <div className="relative">
                <button
                  onClick={() => setToolbarDropdown(toolbarDropdown === 'grid' ? null : 'grid')}
                  title="Grid Columns"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${toolbarDropdown === 'grid' ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300'}`}
                >
                  <Columns3 size={15} />
                </button>
                {toolbarDropdown === 'grid' && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 dark:border-neutral-700/60 py-1.5 min-w-[140px] z-50">
                    {[1, 2, 3, 4].map((n) => (
                      <button key={n} onClick={() => { setGridCols(n); setToolbarDropdown(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${gridCols === n ? 'font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-neutral-800' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300'}`}
                      >
                        {n} {n === 1 ? t("design.column") : t("design.columns")}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-4 bg-slate-200/80 dark:bg-neutral-700/80 mx-1" />

              {/* Reorder */}
              <button
                onClick={() => {
                  if (pendingReorder) {
                    setPendingReorder(false);
                    return;
                  }
                  if (activeMode === 'reorder') {
                    setActiveMode('default');
                  } else if (postsStatus === 'CanLoadMore') {
                    // Need to load all posts first — pendingReorder triggers useEffect loop
                    setPendingReorder(true);
                    setToolbarDropdown(null);
                    if (selectMode) setSelectedPosts([]);
                  } else {
                    setActiveMode('reorder');
                  }
                  setToolbarDropdown(null);
                  if (selectMode) setSelectedPosts([]);
                }}
                disabled={pendingReorder}
                title="Reorder"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${reorderMode ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm' : pendingReorder ? 'text-slate-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300'}`}
              >
                {pendingReorder ? <Loader2 size={15} className="animate-spin" /> : <ArrowUpDown size={15} />}
              </button>

              {/* Select & Download */}
              <button
                onClick={() => {
                  if (selectMode) { setSelectedPosts([]); setActiveMode('default'); }
                  else { setActiveMode('select'); }
                  setToolbarDropdown(null);
                }}
                title="Select & Download"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectMode ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300'}`}
              >
                <Download size={15} />
              </button>
            </div>
          </nav>
        </div>

        <div className="flex-1 relative overflow-hidden">
        <main
        className="h-full overflow-y-auto p-3 md:p-6 pb-40"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest?.('[data-toolbar-portal]')) return;
          if ((e.target as HTMLElement).closest?.('[data-contextual-toolbar]')) return;
          if ((e.target as HTMLElement).closest?.('[data-post-card]')) return;
          if (selectedPostId) setSelectedPostId(null);
          if (editMode) setSelectedId(null);
        }}
      >
        {/* Subscription banners */}
        {usage?.isExpired && (
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-lg px-3 md:px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-red-600 text-sm font-medium">{t("design.planExpired", { plan: usage.plan || "" })}</span>
              <span className="text-red-500 text-xs sm:text-sm">{t("design.renewToContinue")}</span>
            </div>
            <Link href="/pricing" className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition font-medium shrink-0">
              {t("design.renewPlan")}
            </Link>
          </div>
        )}
        {usage?.isExpiringSoon && !usage?.isExpired && (
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 md:px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-amber-700 text-sm font-medium">{t("design.planExpiresSoon", { days: String(usage.daysLeft) })}</span>
              <span className="text-amber-600 text-xs sm:text-sm">{t("design.postsUsed", { used: String(usage.postsUsed), limit: String(usage.postsLimit) })}</span>
            </div>
            <Link href="/pricing" className="text-sm bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 transition font-medium shrink-0">
              {t("design.renewNow")}
            </Link>
          </div>
        )}
        {usage?.status === "none" && (
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 md:px-4 py-3">
            <span className="text-blue-700 text-sm font-medium">{t("design.noPlanMessage")}</span>
            <Link href="/pricing" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium shrink-0">
              {t("design.viewPlans")}
            </Link>
          </div>
        )}

        {collections !== undefined && collections.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-500 dark:text-neutral-400 mb-2">{t("design.noCollections")}</h2>
              <p className="text-sm text-gray-400">{t("design.createCollection")}</p>
            </div>
          </div>
        ) : postsStatus === "LoadingFirstPage" ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
          </div>
        ) : posts.length === 0 && generatedPosts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-500 dark:text-neutral-400 mb-2">{t("design.noPosts")}</h2>
              <p className="text-sm text-gray-400">{t("design.useGenerate")}</p>
            </div>
          </div>
        ) : (
          <DeviceContext.Provider value={deviceType}>
          <EditContext.Provider value={editMode}>
          <AspectRatioContext.Provider value={aspectRatio}>
          <SelectedIdContext.Provider value={selectedId}>
          <SetSelectedIdContext.Provider value={handleSetSelectedId}>
          <HiddenComponentsContext.Provider value={hiddenComponents}>
          <SetHiddenComponentsContext.Provider value={handleSetHiddenComponents}>
            <PostGrid
              allPostIds={allPostIds}
              posts={posts}
              generatedPosts={generatedPosts}
              setGeneratedPosts={setGeneratedPosts}
              viewMode={viewMode}
              gridCols={gridCols}
              editMode={editMode}
              aspectRatio={aspectRatio}
              reorderMode={reorderMode}
              selectMode={selectMode}
              selectedPosts={selectedPosts}
              draggingId={draggingId}
              codeViewPosts={codeViewPosts}
              postRefs={postRefs}
              dragItem={dragItem}
              setDraggingId={setDraggingId}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
              onTogglePostSelection={togglePostSelection}
              onToggleCodeView={toggleCodeView}
              onUpdatePostCode={updatePostCode}
              onUpdatePostCodeForRatio={updatePostCodeForRatio}
              onRemovePost={removePost}
              selectedPostId={selectedPostId}
              onSelectPost={setSelectedPostId}
              onAdaptRatio={handleAdaptSingleRatio}
              assets={assets as { _id: string; url: string | null; type: string; fileName: string }[]}
              postsStatus={postsStatus}
              onLoadMore={() => loadMore(18)}
            />
          </SetHiddenComponentsContext.Provider>
          </HiddenComponentsContext.Provider>
          </SetSelectedIdContext.Provider>
          </SelectedIdContext.Provider>
          </AspectRatioContext.Provider>
          </EditContext.Provider>
          </DeviceContext.Provider>
        )}

        {/* Floating chat — Quick or Agent mode */}
          {chatMode === 'agent' ? (
          <AgentChatPanel
            workspaceId={workspaceId}
            workspace={workspace ? { name: workspace.name, website: workspace.website, industry: workspace.industry, defaultLanguage: workspace.defaultLanguage, websiteInfo: workspace.websiteInfo as Record<string, unknown> | undefined } : null}
            branding={branding ? { brandName: branding.brandName, tagline: branding.tagline, colors: branding.colors, fonts: branding.fonts } : null}
            posts={(posts || []).map(p => ({ _id: p._id, title: p.title, componentCode: p.componentCode, order: p.order }))}
            assets={(assets || []).map(a => ({ _id: a._id, url: a.url ?? null, type: a.type, fileName: a.fileName, label: a.label, description: a.description, aiAnalysis: a.aiAnalysis }))}
            logoUrl={logoUrl}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            onPostsGenerated={async (codes, captions, imageKeywords, usage) => {
              if (usage) {
                try {
                  const usageResult = await logAndIncrement({
                    workspaceId: workspaceId || undefined,
                    category: "generation",
                    model: (usage.model as string) || "gemini-3.1-flash-lite-preview",
                    promptTokens: (usage.promptTokens as number) || 0,
                    completionTokens: (usage.completionTokens as number) || 0,
                    totalTokens: (usage.totalTokens as number) || 0,
                    endpoint: "/api/agent",
                    postsGenerated: codes.length,
                  });
                  if (usageResult?.limitReached) setShowLimitModal(true);
                } catch (e) {
                  const msg = e instanceof Error ? e.message : '';
                  if (msg.includes('expired') || msg.includes('No active subscription')) {
                    setUsageWarning(msg.includes('expired') ? "Your subscription has expired." : "No active subscription found.");
                  }
                }
              }
              if (workspaceId && user) {
                let collectionId = activeCollectionId;
                if (!collectionId) {
                  collectionId = await createCollection({ workspaceId, name: "Generated Posts", mode: "social_grid", language: workspace?.defaultLanguage || "ar", aspectRatio: "1:1" });
                }
                const newPostIds = await createPostBatch({
                  collectionId, workspaceId, language: workspace?.defaultLanguage || "ar",
                  posts: codes.map((code, i) => ({ title: `Agent generated (${i + 1}/${codes.length})`, componentCode: code, device: "none" as const, caption: captions[i] || undefined, imageKeywords: imageKeywords[i]?.length ? imageKeywords[i] : undefined })),
                });
                // Prepend new post IDs to localOrder so they appear at the top immediately
                if (newPostIds.length > 0) {
                  setLocalOrder(prev => {
                    const newIdSet = new Set(newPostIds as string[]);
                    const filtered = prev.filter(id => !newIdSet.has(id));
                    return [...(newPostIds as string[]), ...filtered];
                  });
                }
              }
            }}
            onPostEdited={async (postIndex, newCode, postId) => {
              const id = postId || posts?.[postIndex]?._id;
              if (id) await updatePostCode({ id: id as Id<"posts">, componentCode: newCode });
            }}
            onPostsDeleted={async (postIndices, postIds) => {
              if (postIds && postIds.length > 0) {
                for (const id of postIds) {
                  await removePost({ id: id as Id<"posts"> });
                }
              } else {
                for (const idx of postIndices) {
                  const post = posts?.[idx];
                  if (post) await removePost({ id: post._id as Id<"posts"> });
                }
              }
            }}
            onBrandUpdated={async (updates) => {
              if (!workspaceId || !branding) return;
              let newTheme = { ...currentTheme };
              if (updates.colors) {
                const mergedColors = { ...branding.colors, ...updates.colors };
                await updateBrandingField({ workspaceId, field: "colors", value: mergedColors });
                newTheme = { ...newTheme, ...mergedColors };
              }
              if (updates.fonts) {
                const mergedFonts = { ...branding.fonts, ...updates.fonts };
                await updateBrandingField({ workspaceId, field: "fonts", value: mergedFonts });
                if (updates.fonts.heading) newTheme = { ...newTheme, font: `'${updates.fonts.heading}', sans-serif` };
              }
              if (updates.brandName) await updateBrandingField({ workspaceId, field: "brandName", value: updates.brandName });
              if (updates.tagline) await updateBrandingField({ workspaceId, field: "tagline", value: updates.tagline });
              setTheme(newTheme);
            }}
            onAdaptRatio={async (postIndices, ratios, postIds) => {
              for (let j = 0; j < postIndices.length; j++) {
                const id = postIds?.[j] || posts?.[postIndices[j]]?._id;
                const post = id ? posts?.find(p => p._id === id) || posts?.[postIndices[j]] : posts?.[postIndices[j]];
                if (!post) continue;
                for (const ratio of ratios) {
                  try {
                    const res = await fetch('/api/adapt-ratio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: post.componentCode, targetRatio: ratio }) });
                    if (res.ok) { const data = await res.json(); if (data.code) await updatePostCodeForRatio({ id: post._id as Id<"posts">, ratio: ratio as AspectRatioType, componentCode: data.code }); }
                  } catch (err) { console.error(`Failed to adapt post ${j + 1} to ${ratio}:`, err); }
                }
              }
            }}
            contextPosts={contextPosts}
            setContextPosts={setContextPosts}
            contextAssets={contextAssets}
            setContextAssets={setContextAssets}
            chatImages={chatImages}
            setChatImages={setChatImages}
            onChatImageUpload={handleChatImageUpload}
            chatImageInputRef={chatImageInputRef}
            generateModel={generateModel}
            setGenerateModel={setGenerateModel}
            generateCount={generateCount}
            setGenerateCount={setGenerateCount}
            generateVersion={generateVersion}
            setGenerateVersion={setGenerateVersion}
            adaptingRatios={adaptingRatios}
            usageWarning={usageWarning}
            onSwitchToQuick={() => setChatMode('quick')}
          />
          ) : (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-full max-w-3xl px-0 md:px-4 z-[110]">
            <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && generatePrompt.trim() && !generating) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder={t("design.describePlaceholder")}
                rows={2}
                className="w-full px-5 pt-4 pb-2 text-base md:text-sm text-slate-900 dark:text-white resize-none focus:outline-none placeholder:text-slate-400 bg-transparent"
              />
              {/* Context chips (posts + assets) */}
              {(contextPosts.length > 0 || contextAssets.length > 0) && (
                <div className="flex items-center gap-1.5 px-4 pb-1 pt-1 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Context:</span>
                  {contextPosts.map((cp) => (
                    <span key={cp.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <Sparkles size={9} />
                      Post
                      <button
                        onClick={() => setContextPosts(prev => prev.filter(p => p.id !== cp.id))}
                        className="ml-0.5 hover:text-red-500 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {contextAssets.map((ca) => (
                    <span key={ca.id} className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                      <img src={ca.url} alt={ca.label || ca.type} className="w-5 h-5 rounded-full object-cover" />
                      <span className="pr-1">{ca.type}</span>
                      <button
                        onClick={() => setContextAssets(prev => prev.filter(a => a.id !== ca.id))}
                        className="mr-0.5 hover:text-red-500 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => { setContextPosts([]); setContextAssets([]); }}
                    className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    {t("design.clearAll")}
                  </button>
                </div>
              )}
              {/* Image previews */}
              {chatImages.length > 0 && (
                <div className="flex items-center gap-2 px-4 pb-2 pt-1 overflow-x-auto">
                  {chatImages.map((img, i) => (
                    <div key={i} className="relative flex-shrink-0 group">
                      <img src={img.preview} alt={`Reference ${i + 1}`} className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-neutral-700" />
                      <button
                        onClick={() => setChatImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between px-4 pb-3">
                {/* Left: attachment + model */}
                <div className="flex items-center gap-1.5">
                  <div className="relative" ref={assetPickerRef}>
                    <button
                      onClick={() => setShowAssetPicker(prev => !prev)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                        showAssetPicker
                          ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-slate-200 dark:border-neutral-700 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <Paperclip size={16} />
                    </button>
                    <input ref={chatImageInputRef} type="file" accept="image/*" multiple onChange={(e) => { handleChatImageUpload(e); setShowAssetPicker(false); }} className="hidden" />

                    {/* Asset picker popup */}
                    {showAssetPicker && (
                      <div className="absolute bottom-12 left-0 w-72 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-[120] overflow-hidden">
                        {/* Upload option */}
                        <button
                          onClick={() => { chatImageInputRef.current?.click(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors border-b border-slate-100 dark:border-neutral-800"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                            <ArrowUp size={14} className="text-slate-500" />
                          </div>
                          Upload image
                        </button>

                        {/* Assets grid */}
                        <div className="px-3 pt-2 pb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace Assets</span>
                        </div>
                        <div className="px-3 pb-3 max-h-52 overflow-y-auto">
                          {assets && assets.filter((a) => a.url && !a.archived).length > 0 ? (
                            <div className="grid grid-cols-4 gap-1.5">
                              {assets.filter((a): a is typeof a & { url: string } => !!a.url && !a.archived).map((asset) => {
                                const isSelected = contextAssetIds.has(asset._id);
                                return (
                                  <button
                                    key={asset._id}
                                    onClick={() => handleToggleAssetContext(asset)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                      isSelected
                                        ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                                        : 'border-transparent hover:border-slate-300 dark:hover:border-neutral-600'
                                    }`}
                                  >
                                    <img src={asset.url} alt={asset.description || asset.fileName || ''} className="w-full h-full object-cover" />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                          <Check size={10} className="text-white" />
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-neutral-500 py-4 text-center">No assets uploaded yet</p>
                          )}
                        </div>
                        {contextAssets.length > 0 && (
                          <div className="px-3 pb-2 border-t border-slate-100 dark:border-neutral-800 pt-2">
                            <span className="text-[10px] text-slate-400">{contextAssets.length}/8 assets selected</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Model dropdown hidden — defaults to Flash Lite */}
                  {/* Agent mode toggle */}
                  <button
                    onClick={() => setChatMode('agent')}
                    title="Switch to Agent mode"
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-400 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <Bot size={14} />
                  </button>
                </div>

                {/* Right: options + send */}
                <div className="flex items-center gap-1">
                  {/* Post count — desktop pills */}
                  <div className="hidden md:flex items-center bg-slate-100 dark:bg-neutral-800 rounded-full p-0.5">
                    {[1, 2, 4, 6, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setGenerateCount(n)}
                        className={`w-6 h-7 rounded-full text-xs font-bold transition-colors ${
                          generateCount === n
                            ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  {/* Post count — mobile dropdown */}
                  <div className="relative md:hidden" ref={quickCountRef}>
                    <button
                      onClick={() => setShowQuickCountDropdown(prev => !prev)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-bold text-slate-700 dark:text-neutral-300"
                    >
                      {generateCount}x
                      <ChevronDown size={12} />
                    </button>
                    {showQuickCountDropdown && (
                      <div className="absolute bottom-9 right-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-2xl z-[120] overflow-hidden py-1 min-w-[48px]">
                        {[1, 2, 4, 6, 8].map((n) => (
                          <button
                            key={n}
                            onClick={() => { setGenerateCount(n); setShowQuickCountDropdown(false); }}
                            className={`w-full px-4 py-2 text-xs font-semibold text-center transition-colors ${
                              generateCount === n
                                ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Style selector — desktop pills */}
                  <div className="hidden md:flex items-center bg-slate-100 dark:bg-neutral-800 rounded-full p-0.5 ml-1">
                    {([
                      { v: 4 as const, label: 'Social Media', title: 'Social Media' },
                      { v: 8 as const, label: 'SaaS', title: 'SaaS — typography-driven, CSS-only' },
                      { v: 7 as const, label: 'App Store', title: 'App Store Preview' },
                    ]).map(({ v, label, title }) => (
                      <button
                        key={v}
                        onClick={() => setGenerateVersion(v)}
                        title={title}
                        className={`px-2.5 h-7 rounded-full text-[10px] font-bold transition-colors whitespace-nowrap ${
                          generateVersion === v
                            ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Style selector — mobile dropdown */}
                  <div className="relative md:hidden ml-1" ref={quickStyleRef}>
                    <button
                      onClick={() => setShowQuickStyleDropdown(prev => !prev)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-bold text-slate-700 dark:text-neutral-300"
                    >
                      {generateVersion === 4 ? 'Social' : generateVersion === 8 ? 'SaaS' : 'App'}
                      <ChevronDown size={12} />
                    </button>
                    {showQuickStyleDropdown && (
                      <div className="absolute bottom-9 right-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-2xl z-[120] overflow-hidden py-1 min-w-[120px]">
                        {([
                          { v: 4 as const, label: 'Social Media' },
                          { v: 8 as const, label: 'SaaS' },
                          { v: 7 as const, label: 'App Store' },
                        ]).map(({ v, label }) => (
                          <button
                            key={v}
                            onClick={() => { setGenerateVersion(v); setShowQuickStyleDropdown(false); }}
                            className={`w-full px-4 py-2 text-xs font-semibold text-left transition-colors ${
                              generateVersion === v
                                ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ratio selector — desktop pills */}
                  <div className="hidden md:flex items-center bg-slate-100 dark:bg-neutral-800 rounded-full p-0.5 ml-1">
                    {(['1:1', '9:16', '3:4', '4:3', '16:9'] as AspectRatioType[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setAspectRatio(r)}
                        title={r}
                        className={`px-1.5 h-7 rounded-full text-[10px] font-bold transition-colors ${
                          aspectRatio === r
                            ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  {/* Ratio selector — mobile dropdown */}
                  <div className="relative md:hidden ml-1" ref={quickRatioRef}>
                    <button
                      onClick={() => setShowQuickRatioDropdown(prev => !prev)}
                      className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-bold text-slate-700 dark:text-neutral-300"
                    >
                      {aspectRatio}
                      <ChevronDown size={12} />
                    </button>
                    {showQuickRatioDropdown && (
                      <div className="absolute bottom-9 right-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-2xl z-[120] overflow-hidden py-1">
                        {(['1:1', '9:16', '3:4', '4:3', '16:9'] as AspectRatioType[]).map((r) => (
                          <button
                            key={r}
                            onClick={() => { setAspectRatio(r); setShowQuickRatioDropdown(false); }}
                            className={`w-full px-4 py-2 text-xs font-semibold text-left transition-colors ${
                              aspectRatio === r
                                ? 'bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !generatePrompt.trim()}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ml-1 ${
                      generating || !generatePrompt.trim()
                        ? 'bg-slate-200 dark:bg-neutral-700 text-slate-400'
                        : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F]'
                    }`}
                  >
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
                  </button>
                </div>
              </div>
            </div>
            {adaptingRatios && (
              <p className="text-xs text-slate-500 font-medium mt-2 text-center flex items-center justify-center gap-1.5">
                <Loader2 size={12} className="animate-spin" /> Adapting to {targetRatios.filter(r => r !== '1:1').join(', ')}...
              </p>
            )}
            {generateError && (
              <p className="text-xs text-red-500 font-medium mt-2 text-center">{generateError}</p>
            )}
            {usageWarning && !generateError && (
              <p className="text-xs text-amber-600 font-medium mt-2 text-center">{usageWarning}</p>
            )}
          </div>
          )}

      </main>
      </div>
      </div>}

      {/* Properties side panel — commented out for now
      {selectedPostId && (() => {
        const selectedPost = posts?.find(p => p._id === selectedPostId);
        if (!selectedPost || codeViewPosts.has(selectedPostId)) return null;
        return (
          <div
            className="hidden md:block w-72 shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Properties</h3>
            </div>
            <PostPropertiesPanel
              code={(aspectRatio !== '1:1' && selectedPost.ratioOverrides?.["r" + aspectRatio.replace(":", "_") as keyof typeof selectedPost.ratioOverrides]) || selectedPost.componentCode}
              onCodeChange={(newCode) => updatePostCodeForRatio({ id: selectedPost._id, ratio: aspectRatio, componentCode: newCode })}
              onUploadImage={async (file) => {
                try {
                  const uploadUrl = await generateUploadUrl();
                  const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
                  const { storageId } = await res.json();
                  const url = await getStorageUrl({ storageId });
                  return url ?? null;
                } catch {
                  return null;
                }
              }}
            />
          </div>
        );
      })()} */}

      {/* Floating download bar */}
      {selectMode && selectedPosts.length > 0 && (
        <DownloadBar
          selectedCount={selectedPosts.length}
          downloading={downloading}
          downloadProgress={downloadProgress}
          currentRatio={aspectRatio}
          onClear={() => setSelectedPosts([])}
          onDownload={handleDownloadSelected}
          onAddToContext={handleAddToContext}
          onDeleteSelected={handleDeleteSelected}
        />
      )}

      {/* Usage Limit Modal */}
      {showLimitModal && usage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setShowLimitModal(false)} />
          <div className="relative bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-neutral-700/60 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.12)] max-w-sm w-full overflow-hidden">

            {/* Close */}
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors z-10"
            >
              <X size={14} className="text-slate-500" />
            </button>

            {/* Content */}
            <div className="px-7 pt-8 pb-7">
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Limit reached</h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-neutral-400 mt-2 mb-6">
                Your <span className="font-semibold text-slate-700 dark:text-neutral-300 capitalize">{usage.plan === "trial" ? "Free Trial" : usage.plan}</span> plan credits have been used up.
              </p>

              {/* Usage cards */}
              <div className="space-y-3 mb-5">
                {/* AI Tokens */}
                <div className="bg-slate-50 dark:bg-neutral-800 rounded-2xl px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-neutral-300">AI Tokens</span>
                    <span className={`text-[13px] font-bold tabular-nums ${usage.aiTokensUsed >= usage.aiTokensLimit ? 'text-red-500' : 'text-slate-500 dark:text-neutral-400'}`}>
                      {(usage.aiTokensUsed).toLocaleString()} <span className="text-slate-300 dark:text-neutral-600 font-normal">/</span> {(usage.aiTokensLimit).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usage.aiTokensUsed >= usage.aiTokensLimit ? 'bg-red-400' : 'bg-slate-900'
                      }`}
                      style={{ width: `${Math.min(100, (usage.aiTokensUsed / usage.aiTokensLimit) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Posts */}
                <div className="bg-slate-50 dark:bg-neutral-800 rounded-2xl px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-neutral-300">Posts</span>
                    <span className={`text-[13px] font-bold tabular-nums ${usage.postsUsed >= usage.postsLimit ? 'text-red-500' : 'text-slate-500 dark:text-neutral-400'}`}>
                      {usage.postsUsed} <span className="text-slate-300 dark:text-neutral-600 font-normal">/</span> {usage.postsLimit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usage.postsUsed >= usage.postsLimit ? 'bg-red-400' : 'bg-slate-900'
                      }`}
                      style={{ width: `${Math.min(100, (usage.postsUsed / usage.postsLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Renewal info */}
              {usage.expiresAt && usage.daysLeft > 0 && (
                <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-neutral-800 rounded-xl px-4 py-3 mb-6">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <p className="text-[13px] text-slate-500 dark:text-neutral-400">
                    Resets in <span className="font-bold text-slate-700 dark:text-neutral-300">{usage.daysLeft}d</span>
                    <span className="text-slate-300 dark:text-neutral-600 mx-1.5">&middot;</span>
                    {new Date(usage.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Actions */}
              <Link
                href="/pricing"
                onClick={() => setShowLimitModal(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-full font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Upgrade Plan
                <ChevronRight size={16} />
              </Link>
              {usage.daysLeft > 0 && (
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 text-[13px] font-semibold transition-colors mt-1"
                >
                  Wait for renewal ({usage.daysLeft}d left)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
