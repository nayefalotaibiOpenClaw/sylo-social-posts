"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Loader2, FolderOpen, Image as ImageIcon, Proportions, Smartphone, LayoutGrid, ArrowUpDown, Pencil, MousePointer2, Download, Paperclip, ArrowUp, Sparkles } from "lucide-react";
import MobileNavMenu from "@/features/design-editor/components/MobileNavMenu";
import { downloadPostsAsZip, downloadPostsMultiRatio } from "@/lib/export/download";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "@/contexts/EditContext";
import { DeviceContext } from "@/contexts/DeviceContext";
import { useTheme, useSetTheme, type Theme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
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

export default function DesignPage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspace") as Id<"workspaces"> | null;
  const collectionIdParam = searchParams.get("collection") as Id<"collections"> | null;

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(
    api.workspaces.listByUser,
    user ? { userId: user._id } : "skip"
  );

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
  const updatePostCodeForRatio = useMutation(api.posts.updateCodeForRatio);
  const reorderPosts = useMutation(api.posts.reorder);
  const removePost = useMutation(api.posts.remove);
  const createPost = useMutation(api.posts.create);
  const createPostBatch = useMutation(api.posts.createBatch);
  const createCollection = useMutation(api.collections.create);
  const incrementUsage = useMutation(api.subscriptions.incrementUsage);
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
  const analyzeImage = useAction(api.assets.analyzeImage);
  const assets = useQuery(
    api.assets.listForWorkspace,
    workspaceId && user ? { workspaceId, userId: user._id } : "skip"
  );

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeMode, setActiveMode] = useState<'default' | 'edit' | 'reorder' | 'select'>('default');
  const editMode = activeMode === 'edit';
  const reorderMode = activeMode === 'reorder';
  const selectMode = activeMode === 'select';
  const setEditMode = useCallback((v: boolean) => setActiveMode(v ? 'edit' : 'default'), []);
  const setReorderMode = useCallback((v: boolean) => setActiveMode(v ? 'reorder' : 'default'), []);
  const setSelectMode = useCallback((v: boolean) => setActiveMode(v ? 'select' : 'default'), []);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [deviceType, setDeviceType] = useState<"iphone" | "android" | "ipad" | "android_tablet" | "desktop">("iphone");
  const [gridCols, setGridCols] = useState(3);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
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
  const [generateCount, setGenerateCount] = useState(2);
  const [generateVersion, setGenerateVersion] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [codeViewPosts, setCodeViewPosts] = useState<Set<string>>(new Set());
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [fetchingWebsite, setFetchingWebsite] = useState(false);
  const [websiteScreenshot, setWebsiteScreenshot] = useState<string | null>(null);
  const websiteScreenshotRef = useRef<HTMLInputElement>(null);
  const [targetRatios, setTargetRatios] = useState<AspectRatioType[]>(['1:1']);
  const [adaptingRatios, setAdaptingRatios] = useState(false);

  // Local order state for drag-and-drop (syncs with Convex)
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  useEffect(() => {
    if (posts) {
      setLocalOrder(posts.map(p => p._id));
    }
  }, [posts]);

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
      const base64 = result.split(",")[1] || result;
      setWebsiteScreenshot(base64);
    };
    reader.readAsDataURL(file);
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
      setGenerateError(canGenerateCheck.reason || "Generation not allowed. Please check your subscription.");
      return;
    }

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

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Something went wrong while generating. Please try again or contact support.');
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong while generating. Please try again or contact support.');

      const codes: string[] = data.codes || [data.code];

      // Track AI token usage in subscription — if limit exceeded, still show posts but warn user
      setUsageWarning(null);
      if (data.usage) {
        try {
          await incrementUsage({
            tokensUsed: data.usage.totalTokens || 0,
            postsGenerated: data.usage.postsGenerated || codes.length,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : '';
          if (msg.includes('limit exceeded') || msg.includes('limit reached')) {
            setUsageWarning("You've reached your subscription limit. Upgrade your plan to continue generating.");
          } else if (msg.includes('expired')) {
            setUsageWarning("Your subscription has expired. Please renew to continue generating.");
          } else if (msg.includes('No active subscription')) {
            setUsageWarning("No active subscription found. Please subscribe to continue generating.");
          }
        }
      }

      // Save generated posts to Convex (inserted at top via createBatch)
      if (workspaceId && user) {
        let collectionId = activeCollectionId;

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

        const newPostIds = await createPostBatch({
          collectionId,
          workspaceId,
          userId: user._id,
          language: workspace?.defaultLanguage || "ar",
          posts: codes.map((code, i) => ({
            title: `${generatePrompt.slice(0, 80)} (${i + 1}/${codes.length})`,
            componentCode: code,
            device: "none" as const,
          })),
        });

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
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAllLayouts = async () => {
    if (!generatePrompt.trim() || generating) return;
    if (canGenerateCheck && !canGenerateCheck.allowed) {
      setGenerateError(canGenerateCheck.reason || "Generation not allowed.");
      return;
    }
    setGenerating(true);
    setGenerateError(null);
    try {
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
        body: JSON.stringify({ prompt: generatePrompt, context, allLayouts: true }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Something went wrong while generating. Please try again or contact support.');
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong while generating. Please try again or contact support.');

      const codes: string[] = data.codes || [data.code];

      setUsageWarning(null);
      if (data.usage) {
        try {
          await incrementUsage({
            tokensUsed: data.usage.totalTokens || 0,
            postsGenerated: data.usage.postsGenerated || codes.length,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : '';
          if (msg.includes('limit exceeded') || msg.includes('limit reached')) {
            setUsageWarning("You've reached your subscription limit. Upgrade your plan to continue generating.");
          } else if (msg.includes('expired')) {
            setUsageWarning("Your subscription has expired. Please renew to continue generating.");
          } else if (msg.includes('No active subscription')) {
            setUsageWarning("No active subscription found. Please subscribe to continue generating.");
          }
        }
      }

      if (workspaceId && user) {
        let collectionId = activeCollectionId;
        if (!collectionId) {
          collectionId = await createCollection({
            workspaceId,
            userId: user._id,
            name: "All Layouts",
            mode: "social_grid",
            language: workspace?.defaultLanguage || "ar",
            aspectRatio: "1:1",
          });
        }
        const newPostIds = await createPostBatch({
          collectionId,
          workspaceId,
          userId: user._id,
          language: workspace?.defaultLanguage || "ar",
          posts: codes.map((code, i) => ({
            title: `${generatePrompt.slice(0, 60)} — Layout ${i + 1}/${codes.length}`,
            componentCode: code,
            device: "none" as const,
          })),
        });

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
        const newEntries = codes.map((code, i) => ({
          id: `generated-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          code,
        }));
        setGeneratedPosts(prev => [...newEntries, ...prev]);
        setLocalOrder(prev => [...newEntries.map(e => e.id), ...prev]);
      }
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

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
    await updatePostCodeForRatio({ id: postId, ratio: targetRatio, componentCode: data.code });
  }, [updatePostCodeForRatio]);

  // ── Crawl handlers ──
  const handleCrawlDiscover = async (url: string) => {
    if (!workspaceId || !user) return;
    await upsertCrawl({
      workspaceId,
      userId: user._id,
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
        userId: user._id,
        url,
        status: "ready",
        businessInfo: {
          companyName: wi.companyName || undefined,
          description: wi.description || undefined,
          industry: wi.industry || undefined,
          tone: wi.tone || undefined,
          targetAudience: wi.targetAudience || undefined,
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
    } catch (err) {
      console.error("Crawl discover failed:", err);
      await upsertCrawl({
        workspaceId,
        userId: user._id,
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
      const imgRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(product.imageUrl)}`);
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
        userId: user._id,
        scope: "workspace",
        fileId: storageId,
        fileName: `${product.name.slice(0, 50)}.jpg`,
        type: "product",
        label: product.name,
      });

      analyzeImage({ assetId, storageId, fileName: product.name, assetType: "product" }).catch(console.error);

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
            userId: user._id,
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

  const togglePostSelection = useCallback((id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

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

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated && process.env.NODE_ENV !== "development") {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  // Loading state
  if (authLoading || user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

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

  const allPostIds = localOrder.length > 0 ? localOrder : (posts?.map(p => p._id) ?? []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabClick={handleTabClick}
        workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))}
        currentWorkspaceId={workspaceId ?? undefined}
        currentWorkspaceName={workspace?.name}
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
            }).catch(console.error);
          }}
        />
      )}

      {/* Main Content — Design + Generate merged */}
      {activeTab !== 'brand' && activeTab !== 'publish' && activeTab !== 'channels' && activeTab !== 'assets' && <div className="flex-1 flex flex-col overflow-hidden">
        {/* Nav Header with Design/Generate sub-tab switcher */}
        <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
          <nav className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-4">
            <MobileNavMenu activeTab={activeTab} onTabClick={handleTabClick} workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))} currentWorkspaceId={workspaceId ?? undefined} currentWorkspaceName={workspace?.name} />
            <div className="w-px h-5 bg-slate-200 md:hidden" />

            {/* Sub-tab switcher: Design | Generate — active shows label, inactive icon-only */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5">
              <button
                onClick={() => setActiveTab(null)}
                title="Design"
                className={`group flex items-center gap-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  activeTab !== 'generate'
                    ? 'bg-white text-slate-900 shadow-sm px-3 py-1.5'
                    : 'text-slate-400 hover:text-slate-600 p-1.5'
                }`}
              >
                <LayoutGrid size={14} />
                {activeTab !== 'generate' && <span>Design</span>}
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                title="Generate"
                className={`group flex items-center gap-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  activeTab === 'generate'
                    ? 'bg-white text-slate-900 shadow-sm px-3 py-1.5'
                    : 'text-slate-400 hover:text-slate-600 p-1.5'
                }`}
              >
                <Sparkles size={14} />
                {activeTab === 'generate' && <span>Generate</span>}
              </button>
            </div>

            <div className="w-px h-5 bg-slate-200" />

            {posts && <span className="text-xs font-medium text-slate-400">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>}

            <div className="flex-1" />
          </nav>
        </div>

        <div className="flex-1 relative overflow-hidden">
        <main
        className={`h-full overflow-y-auto p-3 md:p-6 ${activeTab === 'generate' ? 'pb-40' : 'pb-24'}`}
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
              <span className="text-red-600 text-sm font-medium">Your {usage.plan} plan has expired.</span>
              <span className="text-red-500 text-xs sm:text-sm">Renew to continue generating posts.</span>
            </div>
            <Link href="/pricing" className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition font-medium shrink-0">
              Renew Plan
            </Link>
          </div>
        )}
        {usage?.isExpiringSoon && !usage?.isExpired && (
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 md:px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-amber-700 text-sm font-medium">Your plan expires in {usage.daysLeft} day{usage.daysLeft !== 1 ? 's' : ''}.</span>
              <span className="text-amber-600 text-xs sm:text-sm">{usage.postsUsed}/{usage.postsLimit} posts used.</span>
            </div>
            <Link href="/pricing" className="text-sm bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 transition font-medium shrink-0">
              Renew Now
            </Link>
          </div>
        )}
        {usage?.status === "none" && (
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 md:px-4 py-3">
            <span className="text-blue-700 text-sm font-medium">No active plan. Subscribe to start generating AI posts.</span>
            <Link href="/pricing" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium shrink-0">
              View Plans
            </Link>
          </div>
        )}

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
          <DeviceContext.Provider value={deviceType}>
          <EditContext.Provider value={editMode}>
          <AspectRatioContext.Provider value={aspectRatio}>
          <SelectedIdContext.Provider value={selectedId}>
          <SetSelectedIdContext.Provider value={handleSetSelectedId}>
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
            />
          </SetSelectedIdContext.Provider>
          </SelectedIdContext.Provider>
          </AspectRatioContext.Provider>
          </EditContext.Provider>
          </DeviceContext.Provider>
        )}

        {/* Bottom toolbar — only visible in Design mode */}
        {activeTab !== 'generate' && (
        <div ref={toolbarRef} className="fixed bottom-[64px] md:bottom-4 left-1/2 -translate-x-1/2 z-[60]">
          <div className="flex items-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-200/60 px-1.5 py-1.5 gap-0.5">

            {/* Cursor / default mode */}
            <button
              onClick={() => { setActiveMode('default'); setToolbarDropdown(null); if (selectMode) setSelectedPosts([]); }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeMode === 'default' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <MousePointer2 size={18} />
            </button>

            {/* Edit mode */}
            <button
              onClick={() => { setActiveMode(activeMode === 'edit' ? 'default' : 'edit'); setToolbarDropdown(null); if (selectMode) setSelectedPosts([]); }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeMode === 'edit' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Pencil size={18} />
            </button>

            {/* Aspect Ratio */}
            <div className="relative">
              <button
                onClick={() => setToolbarDropdown(toolbarDropdown === 'ratio' ? null : 'ratio')}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${toolbarDropdown === 'ratio' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Proportions size={18} />
              </button>
              {toolbarDropdown === 'ratio' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 min-w-[140px]">
                  {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((r) => (
                    <button key={r} onClick={() => { setAspectRatio(r); setToolbarDropdown(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${aspectRatio === r ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
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
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${toolbarDropdown === 'device' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Smartphone size={18} />
              </button>
              {toolbarDropdown === 'device' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 min-w-[150px]">
                  {([['iphone', 'iPhone'], ['android', 'Android'], ['ipad', 'iPad'], ['android_tablet', 'Tab'], ['desktop', 'Desktop']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => { setDeviceType(key as typeof deviceType); setToolbarDropdown(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${deviceType === key ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
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
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${toolbarDropdown === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <LayoutGrid size={18} />
              </button>
              {toolbarDropdown === 'grid' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 min-w-[140px]">
                  {[1, 2, 3, 4].map((n) => (
                    <button key={n} onClick={() => { setGridCols(n); setToolbarDropdown(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${gridCols === n ? 'font-semibold text-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                    >
                      {n} {n === 1 ? 'Column' : 'Columns'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200/80 mx-0.5" />

            {/* Reorder */}
            <button
              onClick={() => { setActiveMode(activeMode === 'reorder' ? 'default' : 'reorder'); setToolbarDropdown(null); if (selectMode) setSelectedPosts([]); }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${reorderMode ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <ArrowUpDown size={18} />
            </button>

            {/* Select & Download */}
            <button
              onClick={() => {
                if (selectMode) { setSelectedPosts([]); setActiveMode('default'); }
                else { setActiveMode('select'); }
                setToolbarDropdown(null);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${selectMode ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Download size={18} />
            </button>
          </div>
        </div>
        )}

        {/* Floating chat input — only visible in Generate mode */}
        {activeTab === 'generate' && (
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-full max-w-3xl px-0 md:px-4 z-[60]">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && generatePrompt.trim() && !generating) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Describe the post you want to generate..."
                rows={2}
                className="w-full px-5 pt-4 pb-2 text-sm text-slate-900 resize-none focus:outline-none placeholder:text-slate-400 bg-transparent"
              />
              <div className="flex items-center justify-between px-4 pb-3">
                {/* Left: attachment */}
                <label className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 cursor-pointer transition-colors">
                  <Paperclip size={16} />
                  <input ref={websiteScreenshotRef} type="file" accept="image/*" onChange={handleWebsiteScreenshot} className="hidden" />
                </label>

                {/* Right: options + send */}
                <div className="flex items-center gap-1">
                  {/* Post count */}
                  <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-0.5">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        key={n}
                        onClick={() => setGenerateCount(n)}
                        className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                          generateCount === n
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  {/* Style selector */}
                  <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-0.5 ml-1">
                    {([
                      { v: 5 as const, label: 'C', title: 'Classic' },
                      { v: 1 as const, label: 'G', title: 'Guided' },
                      { v: 2 as const, label: 'Cr', title: 'Creative' },
                      { v: 3 as const, label: 'F', title: 'Free' },
                      { v: 4 as const, label: 'W', title: 'Wild' },
                    ]).map(({ v, label, title }) => (
                      <button
                        key={v}
                        onClick={() => setGenerateVersion(v)}
                        title={title}
                        className={`w-7 h-7 rounded-full text-[10px] font-bold transition-colors ${
                          generateVersion === v
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Ratio selector */}
                  <div className="flex items-center bg-slate-100 rounded-full p-0.5 ml-1">
                    {(['1:1', '9:16', '3:4', '4:3', '16:9'] as AspectRatioType[]).map((r) => {
                      const isSelected = targetRatios.includes(r);
                      const isBase = r === '1:1';
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            if (isBase) return;
                            setTargetRatios(prev =>
                              prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
                            );
                          }}
                          title={isBase ? '1:1 (base — always included)' : `${isSelected ? 'Remove' : 'Add'} ${r} variant`}
                          className={`px-1.5 h-7 rounded-full text-[10px] font-bold transition-colors ${
                            isSelected
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                          } ${isBase ? 'opacity-100' : ''}`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !generatePrompt.trim()}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ml-1 ${
                      generating || !generatePrompt.trim()
                        ? 'bg-slate-200 text-slate-400'
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
        />
      )}
    </div>
  );
}
