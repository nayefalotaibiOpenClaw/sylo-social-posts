"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Loader2, FolderOpen, Image as ImageIcon } from "lucide-react";
import { downloadPostsAsZip } from "@/lib/export/download";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "@/contexts/EditContext";
import { useTheme, useSetTheme, type Theme } from "@/contexts/ThemeContext";
import DynamicPost from "@/app/components/DynamicPost";
import PostWrapper from "@/app/components/PostWrapper";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import PostPropertiesPanel from "@/app/components/PostPropertiesPanel";

import Sidebar, { type SidebarTab } from "@/features/design-editor/components/Sidebar";
import SettingsPanel from "@/features/design-editor/components/SettingsPanel";
import ThemePanel from "@/features/design-editor/components/ThemePanel";
import AssetsPanel, { type AssetTypeValue } from "@/features/design-editor/components/AssetsPanel";
import GeneratePanel from "@/features/design-editor/components/GeneratePanel";
import PostGrid from "@/features/design-editor/components/PostGrid";
import DownloadBar from "@/features/design-editor/components/DownloadBar";

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
  const [generateCount, setGenerateCount] = useState(2);
  const [generateVersion, setGenerateVersion] = useState<1 | 2 | 3>(1);
  const [codeViewPosts, setCodeViewPosts] = useState<Set<string>>(new Set());
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const codes: string[] = data.codes || [data.code];

      // Track AI token usage in subscription
      if (data.usage) {
        try {
          await incrementUsage({
            tokensUsed: data.usage.totalTokens || 0,
            postsGenerated: data.usage.postsGenerated || codes.length,
          });
        } catch (e) {
          console.warn("Usage tracking failed (no active subscription?):", e);
        }
      }

      // Save generated posts to Convex
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
      const postEntries = selectedPosts.map(id => {
        const post = posts?.find(p => p._id === id);
        return { id, filename: post?.title || id };
      });
      await downloadPostsAsZip(
        postRefs.current,
        selectedPosts,
        postEntries,
        `posts-${selectedPosts.length}.zip`,
      );
    } catch (err) {
      console.error("Failed to download posts:", err);
    } finally {
      setDownloading(false);
    }
  }, [selectedPosts, posts]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
      <Sidebar activeTab={activeTab} onTabClick={handleTabClick}>
        {activeTab === 'settings' && (
          <SettingsPanel
            editMode={editMode} setEditMode={setEditMode}
            reorderMode={reorderMode} setReorderMode={setReorderMode}
            selectMode={selectMode} setSelectMode={setSelectMode}
            setSelectedPosts={setSelectedPosts}
            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
            gridCols={gridCols} setGridCols={setGridCols}
            viewMode={viewMode} setViewMode={setViewMode}
            collections={collections} activeCollectionId={activeCollectionId}
            workspaceId={workspaceId} postCount={posts?.length ?? 0}
          />
        )}
        {activeTab === 'theme' && (
          <ThemePanel currentTheme={currentTheme} setTheme={setTheme} />
        )}
        {activeTab === 'assets' && (
          <AssetsPanel
            assets={assets}
            pendingFiles={pendingFiles} setPendingFiles={setPendingFiles}
            showAssetUploadDialog={showAssetUploadDialog} setShowAssetUploadDialog={setShowAssetUploadDialog}
            assetTypeSelect={assetTypeSelect} setAssetTypeSelect={setAssetTypeSelect}
            assetScope={assetScope} setAssetScope={setAssetScope}
            uploadingAsset={uploadingAsset}
            onFileSelect={handleFileSelect}
            onAssetUpload={handleAssetUpload}
            onRemoveAsset={(id) => removeAsset({ id: id as Id<"assets"> })}
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
        {activeTab === 'generate' && (
          <GeneratePanel
            workspace={workspace} branding={branding} assets={assets}
            generatePrompt={generatePrompt} setGeneratePrompt={setGeneratePrompt}
            generating={generating} generateError={generateError}
            generateCount={generateCount} setGenerateCount={setGenerateCount}
            generateVersion={generateVersion} setGenerateVersion={setGenerateVersion}
            generatedPosts={generatedPosts} setGeneratedPosts={setGeneratedPosts}
            setLocalOrder={setLocalOrder}
            onGenerate={handleGenerate}
            fetchingWebsite={fetchingWebsite} onRetryWebsiteFetch={handleRetryWebsiteFetch}
            websiteScreenshot={websiteScreenshot} setWebsiteScreenshot={setWebsiteScreenshot}
            websiteScreenshotRef={websiteScreenshotRef} onWebsiteScreenshot={handleWebsiteScreenshot}
          />
        )}
      </Sidebar>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto flex flex-col p-6"
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
          <div className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-sm font-medium">Your {usage.plan} plan has expired.</span>
              <span className="text-red-500 text-sm">Renew to continue generating posts.</span>
            </div>
            <Link href="/pricing" className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition font-medium">
              Renew Plan
            </Link>
          </div>
        )}
        {usage?.isExpiringSoon && !usage?.isExpired && (
          <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 text-sm font-medium">Your plan expires in {usage.daysLeft} day{usage.daysLeft !== 1 ? 's' : ''}.</span>
              <span className="text-amber-600 text-sm">{usage.postsUsed}/{usage.postsLimit} posts used.</span>
            </div>
            <Link href="/pricing" className="text-sm bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 transition font-medium">
              Renew Now
            </Link>
          </div>
        )}
        {usage?.status === "none" && (
          <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <span className="text-blue-700 text-sm font-medium">No active plan. Subscribe to start generating AI posts.</span>
            <Link href="/pricing" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium">
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
              onRemovePost={removePost}
              selectedPostId={selectedPostId}
              onSelectPost={setSelectedPostId}
            />
          </SetSelectedIdContext.Provider>
          </SelectedIdContext.Provider>
          </AspectRatioContext.Provider>
          </EditContext.Provider>
        )}
      </main>

      {/* Properties side panel */}
      {selectedPostId && (() => {
        const selectedPost = posts?.find(p => p._id === selectedPostId);
        if (!selectedPost || codeViewPosts.has(selectedPostId)) return null;
        return (
          <div
            className="w-72 shrink-0 bg-white border-l border-gray-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Properties</h3>
            </div>
            <PostPropertiesPanel
              code={selectedPost.componentCode}
              onCodeChange={(newCode) => updatePostCode({ id: selectedPost._id, componentCode: newCode })}
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
      })()}

      {/* Floating download bar */}
      {selectMode && selectedPosts.length > 0 && (
        <DownloadBar
          selectedCount={selectedPosts.length}
          downloading={downloading}
          onClear={() => setSelectedPosts([])}
          onDownload={handleDownloadSelected}
        />
      )}
    </div>
  );
}
