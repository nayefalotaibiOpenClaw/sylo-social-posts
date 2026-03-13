"use client";

import React, { memo, useCallback, useRef, useState } from "react";
import { Code, Eye, Trash2, Scaling, Loader2, Check, Paintbrush, ImagePlus, Search, Copy, MessageSquare, Tag, Smartphone } from "lucide-react";
import { AspectRatioType, PostScopeContext } from "@/contexts/EditContext";
import DynamicPost from "@/app/components/DynamicPost";
import PostWrapper from "@/app/components/PostWrapper";
import { Id } from "@/convex/_generated/dataModel";

const ALL_RATIOS: AspectRatioType[] = ['1:1', '9:16', '3:4', '4:3', '16:9'];

/* ── Image utilities ── */

/** Extract all unique image URLs from post code */
function extractImageUrls(code: string): string[] {
  const urlPattern = /https?:\/\/[^\s"'`)\]}>]+\.(?:png|jpg|jpeg|gif|webp|svg|avif)(?:[^\s"'`)\]}>]*)?|https?:\/\/[^\s"'`)\]}>]*\/api\/storage\/[^\s"'`)\]}>]+|https?:\/\/images\.unsplash\.com\/[^\s"'`)\]}>]+/gi;
  const matches = code.match(urlPattern) || [];
  return [...new Set(matches)];
}

/** Replace one URL with another everywhere in the code */
function replaceImageUrl(code: string, oldUrl: string, newUrl: string): string {
  return code.split(oldUrl).join(newUrl);
}

/** Check if post code contains a device mockup */
function hasMockup(code: string): boolean {
  return /MockupFrame|IPhoneMockup|IPadMockup|DesktopMockup|AndroidPhoneMockup|AndroidTabletMockup/.test(code);
}

/** Inject a MockupFrame into post code — absolute positioned so it overlays without breaking layout */
function injectMockup(code: string, src: string): string {
  // Absolute-positioned mockup that overlays the post center — won't break existing layout
  const mockupSnippet = '\n        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">\n          <div className="pointer-events-auto">\n            <MockupFrame id="mockup" src="' + src + '" />\n          </div>\n        </div>\n';

  // Insert inside the first "relative z-10" content wrapper (the main content div)
  const contentWrapperMatch = code.match(/className="[^"]*relative\s+z-10[^"]*"/);
  if (contentWrapperMatch && contentWrapperMatch.index !== undefined) {
    // Find the closing > of this div tag
    const tagClose = code.indexOf('>', contentWrapperMatch.index);
    if (tagClose !== -1) {
      return code.slice(0, tagClose + 1) + mockupSnippet + code.slice(tagClose + 1);
    }
  }

  // Fallback: insert after the first opening child of root (after second >)
  let firstChild = code.indexOf('>');
  if (firstChild !== -1) {
    const secondTag = code.indexOf('>', firstChild + 1);
    if (secondTag !== -1) {
      return code.slice(0, secondTag + 1) + mockupSnippet + code.slice(secondTag + 1);
    }
  }

  return code;
}

/** Replace first backgroundColor value */
function replaceBackgroundColor(code: string, newColor: string): string {
  return code.replace(
    /(backgroundColor:\s*)(?:t\.\w+|['"]?#[0-9a-fA-F]{3,8}['"]?)/,
    `$1'${newColor}'`
  );
}

/** Detect the root div background color */
function detectBgColor(code: string): string | null {
  const themeMatch = code.match(/backgroundColor:\s*(t\.\w+)/);
  if (themeMatch) return themeMatch[1];
  const hexMatch = code.match(/backgroundColor:\s*['"]?(#[0-9a-fA-F]{3,8})['"]?/);
  if (hexMatch) return hexMatch[1];
  return null;
}

/** Unsplash photo result */
interface UnsplashPhoto {
  id: string;
  thumb: string;
  regular: string;
  url: string;
  photographer: string;
  photographerUrl: string;
  downloadLocation: string;
  alt: string;
}

async function searchUnsplash(query: string): Promise<UnsplashPhoto[]> {
  const res = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}&per_page=12`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.photos || [];
}

function trackUnsplashDownload(downloadLocation: string) {
  fetch("/api/unsplash", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ downloadLocation }),
  }).catch(() => {});
}

const MemoizedPostContent = memo(function MemoizedPostContent({ code, aspectRatio, filename }: { code: string; aspectRatio: AspectRatioType; filename: string }) {
  return (
    <PostWrapper aspectRatio={aspectRatio} filename={filename}>
      <DynamicPost code={code} />
    </PostWrapper>
  );
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PostRecord = any;

interface PostGridProps {
  allPostIds: string[];
  posts: PostRecord[] | undefined;
  generatedPosts: { id: string; code: string }[];
  setGeneratedPosts: React.Dispatch<React.SetStateAction<{ id: string; code: string }[]>>;
  viewMode: "grid" | "list";
  gridCols: number;
  editMode: boolean;
  aspectRatio: AspectRatioType;
  reorderMode: boolean;
  selectMode: boolean;
  selectedPosts: string[];
  draggingId: string | null;
  codeViewPosts: Set<string>;
  postRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  dragItem: React.MutableRefObject<string | null>;
  setDraggingId: (id: string | null) => void;
  onDragEnter: (targetId: string) => void;
  onDragEnd: () => void;
  onTogglePostSelection: (id: string) => void;
  onToggleCodeView: (id: string) => void;
  onUpdatePostCode: (args: { id: Id<"posts">; componentCode: string }) => void;
  onUpdatePostCodeForRatio?: (args: { id: Id<"posts">; ratio: string; componentCode: string }) => void;
  onRemovePost: (args: { id: Id<"posts"> }) => void;
  selectedPostId: string | null;
  onSelectPost: (id: string | null) => void;
  onAdaptRatio?: (postId: Id<"posts">, baseCode: string, targetRatio: AspectRatioType) => Promise<void>;
  assets?: { _id: string; url: string | null; type: string; fileName: string }[];
}

export default function PostGrid({
  allPostIds, posts, generatedPosts, setGeneratedPosts,
  viewMode, gridCols, editMode, aspectRatio,
  reorderMode, selectMode, selectedPosts,
  draggingId, codeViewPosts,
  postRefs, dragItem, setDraggingId,
  onDragEnter, onDragEnd,
  onTogglePostSelection, onToggleCodeView,
  onUpdatePostCode, onUpdatePostCodeForRatio, onRemovePost,
  selectedPostId, onSelectPost,
  onAdaptRatio,
  assets,
}: PostGridProps) {
  // Store modes in refs so handlers never need to be recreated
  const modeRef = useRef({ reorderMode, selectMode, selectedPostId });
  modeRef.current = { reorderMode, selectMode, selectedPostId };

  // Resize dropdown state
  const [resizeOpenId, setResizeOpenId] = useState<string | null>(null);
  const [adaptingMap, setAdaptingMap] = useState<Record<string, Set<string>>>({});
  // Caption dropdown state
  const [captionOpenId, setCaptionOpenId] = useState<string | null>(null);
  const [captionCopied, setCaptionCopied] = useState(false);
  // Background/image editor state
  const [bgOpenId, setBgOpenId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const bgTargetRef = useRef<{ postId: string; oldUrl: string } | null>(null);
  // Track all URLs that have ever been used in each post (so user can swap back)
  const [imageHistory, setImageHistory] = useState<Record<string, Set<string>>>({});
  // Unsplash search
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const [imageTab, setImageTab] = useState<'assets' | 'unsplash'>('assets');

  const updateCode = useCallback((id: string, newCode: string) => {
    const post = posts?.find((p: PostRecord) => p._id === id);
    if (post) {
      if (onUpdatePostCodeForRatio && aspectRatio !== '1:1') {
        onUpdatePostCodeForRatio({ id: post._id, ratio: aspectRatio, componentCode: newCode });
      } else {
        onUpdatePostCode({ id: post._id, componentCode: newCode });
      }
    } else {
      setGeneratedPosts(prev => prev.map(p => p.id === id ? { ...p, code: newCode } : p));
    }
  }, [posts, aspectRatio, onUpdatePostCode, onUpdatePostCodeForRatio, setGeneratedPosts]);

  const handleUnsplashSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setUnsplashLoading(true);
    const results = await searchUnsplash(query);
    setUnsplashResults(results);
    setUnsplashLoading(false);
  }, []);

  const handleSwapImage = useCallback((postId: string, code: string, oldUrl: string, newUrl: string, unsplashDownloadLocation?: string) => {
    // Track Unsplash download if applicable (required by API Terms Section 6)
    if (unsplashDownloadLocation) {
      trackUnsplashDownload(unsplashDownloadLocation);
    }
    // Save the old URL to history before replacing
    setImageHistory(prev => {
      const set = new Set(prev[postId] || []);
      set.add(oldUrl);
      set.add(newUrl);
      return { ...prev, [postId]: set };
    });
    updateCode(postId, replaceImageUrl(code, oldUrl, newUrl));
    setSelectedImageUrl(newUrl);
  }, [updateCode]);

  const handleBgColor = useCallback((id: string, code: string, color: string) => {
    updateCode(id, replaceBackgroundColor(code, color));
  }, [updateCode]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = bgTargetRef.current;
    if (!file || !target) return;
    const reader = new FileReader();
    reader.onload = () => {
      const post = posts?.find((p: PostRecord) => p._id === target.postId);
      const gen = generatedPosts.find(gp => gp.id === target.postId);
      const code = post
        ? (aspectRatio !== '1:1' && post.ratioOverrides?.["r" + aspectRatio.replace(":", "_")]) || post.componentCode
        : gen?.code;
      if (!code) return;
      updateCode(target.postId, replaceImageUrl(code, target.oldUrl, reader.result as string));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [posts, generatedPosts, aspectRatio, updateCode]);

  const handleAdapt = useCallback(async (postId: string, baseCode: string, ratio: AspectRatioType) => {
    if (!onAdaptRatio) return;
    setAdaptingMap(prev => {
      const set = new Set(prev[postId] || []);
      set.add(ratio);
      return { ...prev, [postId]: set };
    });
    try {
      await onAdaptRatio(postId as Id<"posts">, baseCode, ratio);
    } catch (err) {
      console.error(`Adapt ${ratio} failed:`, err);
    } finally {
      setAdaptingMap(prev => {
        const set = new Set(prev[postId] || []);
        set.delete(ratio);
        const next = { ...prev };
        if (set.size === 0) delete next[postId];
        else next[postId] = set;
        return next;
      });
    }
  }, [onAdaptRatio]);

  const handleCardClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { selectMode, reorderMode, selectedPostId } = modeRef.current;
    if (selectMode) {
      onTogglePostSelection(id);
    } else if (!reorderMode) {
      onSelectPost(selectedPostId === id ? null : id);
    }
  }, [onTogglePostSelection, onSelectPost]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!modeRef.current.reorderMode) return;
    dragItem.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, [dragItem, setDraggingId]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (modeRef.current.reorderMode) e.preventDefault();
  }, []);

  const handleDragEnterCb = useCallback((id: string) => {
    if (modeRef.current.reorderMode) onDragEnter(id);
  }, [onDragEnter]);

  const handleDragEndCb = useCallback(() => {
    if (modeRef.current.reorderMode) onDragEnd();
  }, [onDragEnd]);

  // Determine data-mode for CSS-driven cursor/overlay
  const dataMode = reorderMode ? 'reorder' : selectMode ? 'select' : 'default';

  return (
    <div
      data-mode={dataMode}
      className={`
        w-full mx-auto
        ${viewMode === 'list' ? 'flex flex-col items-center space-y-12' : 'gap-3 md:gap-6 post-grid-responsive'}
        ${editMode ? 'edit-mode' : ''}
      `}
      style={viewMode === 'grid' ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        '--grid-cols': gridCols,
      } as React.CSSProperties : undefined}
    >
      {allPostIds.map((id) => {
        const post = posts?.find((p: PostRecord) => p._id === id);
        const generatedPost = generatedPosts.find(gp => gp.id === id);
        if (!post && !generatedPost) return null;

        const code = post
          ? (aspectRatio !== '1:1' && post.ratioOverrides?.["r" + aspectRatio.replace(":", "_") as keyof typeof post.ratioOverrides]) || post.componentCode
          : generatedPost?.code;
        if (!code) return null;

        const selectionIndex = selectedPosts.indexOf(id);
        const isSelected = selectionIndex !== -1;
        const isPostSelected = selectedPostId === id;

        // Which ratios already have overrides for this post
        const existingRatios = new Set<string>(['1:1']);
        if (post?.ratioOverrides) {
          for (const key of Object.keys(post.ratioOverrides)) {
            if (post.ratioOverrides[key]) {
              existingRatios.add(key.replace('r', '').replace('_', ':'));
            }
          }
        }

        return (
          <div
            key={id}
            data-post-card
            data-post-id={id}
            ref={(el) => { if (el) postRefs.current.set(id, el); else postRefs.current.delete(id); }}
            draggable={reorderMode}
            onDragStart={(e) => handleDragStart(e, id)}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnterCb(id)}
            onDragEnd={handleDragEndCb}
            onClick={(e) => handleCardClick(e, id)}
            className={`relative group post-card ${isPostSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
            style={draggingId === id ? { opacity: 0.4, transition: 'opacity 0.2s' } : undefined}
          >
            {/* Post toolbar — floating pill, matches DraggableWrapper toolbar style */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-0.5 bg-white rounded-2xl shadow-xl border border-gray-200 px-1.5 py-1"
                   onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleCodeView(id); }}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
                  title={codeViewPosts.has(id) ? 'Show Preview' : 'Show Code'}
                >
                  {codeViewPosts.has(id) ? <Eye size={14} /> : <Code size={14} />}
                </button>

                {/* Background editor */}
                <div className="w-px h-5 bg-gray-200" />
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const opening = bgOpenId !== id;
                      setBgOpenId(opening ? id : null);
                      if (!opening) setSelectedImageUrl(null);
                      // Seed history with current URLs when opening
                      if (opening) {
                        const urls = extractImageUrls(code);
                        if (urls.length > 0) {
                          setImageHistory(prev => {
                            const set = new Set(prev[id] || []);
                            urls.forEach(u => set.add(u));
                            return { ...prev, [id]: set };
                          });
                        }
                        // Pre-populate Unsplash with AI-suggested keywords
                        if (post?.imageKeywords?.length) {
                          const kw = post.imageKeywords[0];
                          setUnsplashQuery(kw);
                          handleUnsplashSearch(kw);
                        }
                      }
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      bgOpenId === id ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Change background"
                  >
                    <Paintbrush size={14} />
                  </button>
                  {bgOpenId === id && (() => {
                    const imageUrls = extractImageUrls(code);
                    const bgColor = detectBgColor(code);
                    const activeUrl = selectedImageUrl && imageUrls.includes(selectedImageUrl) ? selectedImageUrl : null;
                    const availableAssets = assets?.filter(a => a.url) || [];
                    // Previous URLs no longer in code (swapped out) — user can pick them to swap back
                    const historyUrls = Array.from(imageHistory[id] || []).filter(u => !imageUrls.includes(u));
                    return (
                      <div
                        className="absolute top-full left-1/2 mt-2 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 p-3 z-30 w-[360px] max-h-[420px] overflow-y-auto -translate-x-1/2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Background color */}
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Background Color</p>
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="color"
                            defaultValue={bgColor?.startsWith('#') ? bgColor : '#1B4332'}
                            onChange={(e) => handleBgColor(id, code, e.target.value)}
                            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                          />
                          <span className="text-[11px] text-gray-500 font-mono">{bgColor || 'Theme'}</span>
                        </div>

                        {/* Images in this post */}
                        {imageUrls.length > 0 && (
                          <>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Images in Post — {activeUrl ? 'select replacement below' : 'tap to replace'}
                            </p>
                            <div className="grid grid-cols-3 gap-1.5 mb-3">
                              {imageUrls.map((url, i) => (
                                <button
                                  key={i}
                                  onClick={() => setSelectedImageUrl(activeUrl === url ? null : url)}
                                  className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                                    activeUrl === url
                                      ? 'border-blue-500 ring-2 ring-blue-200'
                                      : 'border-gray-200 hover:border-gray-400'
                                  }`}
                                >
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Replace with: tabs + content */}
                        {activeUrl && (
                          <>
                            {/* Upload + Previous */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <button
                                onClick={() => {
                                  bgTargetRef.current = { postId: id, oldUrl: activeUrl };
                                  bgFileRef.current?.click();
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                              >
                                <ImagePlus size={12} />
                                Upload
                              </button>
                            </div>

                            {/* Previous images (history) */}
                            {historyUrls.length > 0 && (
                              <>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Previous</p>
                                <div className="grid grid-cols-3 gap-1.5 mb-2">
                                  {historyUrls.map((url, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleSwapImage(id, code, activeUrl, url)}
                                      className="rounded-lg overflow-hidden border border-amber-300 hover:border-amber-500 hover:shadow-sm transition-all aspect-square"
                                      title="Restore this image"
                                    >
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* Tabs: Assets / Unsplash */}
                            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 mb-2">
                              <button
                                onClick={() => setImageTab('assets')}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                                  imageTab === 'assets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Assets
                              </button>
                              <button
                                onClick={() => setImageTab('unsplash')}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                                  imageTab === 'unsplash' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Unsplash
                              </button>
                            </div>

                            {/* Assets tab */}
                            {imageTab === 'assets' && availableAssets.length > 0 && (
                              <div className="grid grid-cols-3 gap-1.5">
                                {availableAssets.map((asset) => (
                                  <button
                                    key={asset._id}
                                    onClick={() => handleSwapImage(id, code, activeUrl, asset.url!)}
                                    className="rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all aspect-square"
                                    title={asset.fileName}
                                  >
                                    <img src={asset.url!} alt={asset.fileName} className="w-full h-full object-cover" />
                                  </button>
                                ))}
                              </div>
                            )}
                            {imageTab === 'assets' && (!availableAssets.length) && (
                              <p className="text-[11px] text-gray-400 text-center py-4">No assets uploaded yet</p>
                            )}

                            {/* Unsplash tab */}
                            {imageTab === 'unsplash' && (
                              <div>
                                {/* AI keyword chips */}
                                {post?.imageKeywords && post.imageKeywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {post.imageKeywords.map((kw: string, ki: number) => (
                                      <button
                                        key={ki}
                                        onClick={() => {
                                          setUnsplashQuery(kw);
                                          handleUnsplashSearch(kw);
                                        }}
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-colors ${
                                          unsplashQuery === kw
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {kw}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Search input */}
                                <div className="flex gap-1 mb-2">
                                  <div className="flex-1 flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2">
                                    <Search size={12} className="text-gray-400 shrink-0" />
                                    <input
                                      type="text"
                                      value={unsplashQuery}
                                      onChange={(e) => setUnsplashQuery(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleUnsplashSearch(unsplashQuery); }}
                                      placeholder="Search photos..."
                                      className="w-full py-1.5 text-[11px] bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleUnsplashSearch(unsplashQuery)}
                                    disabled={unsplashLoading}
                                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                  >
                                    {unsplashLoading ? <Loader2 size={12} className="animate-spin" /> : 'Go'}
                                  </button>
                                </div>

                                {/* Results */}
                                {unsplashResults.length > 0 && (
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {unsplashResults.map((photo) => (
                                      <div key={photo.id} className="relative group/photo">
                                        <button
                                          onClick={() => handleSwapImage(id, code, activeUrl, photo.url, photo.downloadLocation)}
                                          className="rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all aspect-square w-full"
                                          title={`Photo by ${photo.photographer}`}
                                        >
                                          <img src={photo.thumb} alt={photo.alt} className="w-full h-full object-cover" />
                                        </button>
                                        {/* Attribution — required by Unsplash API Terms Section 9 */}
                                        <a
                                          href={photo.photographerUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-[8px] text-white/90 px-1.5 pt-3 pb-1 truncate"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {photo.photographer}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {unsplashResults.length === 0 && !unsplashLoading && (
                                  <p className="text-[11px] text-gray-400 text-center py-4">Search Unsplash for free photos</p>
                                )}

                                {/* Unsplash attribution */}
                                <p className="text-[8px] text-gray-400 text-center mt-2">
                                  Photos by <a href="https://unsplash.com/?utm_source=sylo&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Add Mockup — only show if post has no mockup */}
                {!hasMockup(code) && (
                  <>
                    <div className="w-px h-5 bg-gray-200" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Find first screenshot asset URL, or use placeholder
                        const screenshotAsset = assets?.find(a => a.url && ['iphone', 'ipad', 'desktop', 'screenshot'].includes(a.type));
                        const mockupSrc = screenshotAsset?.url || '/1.jpg';
                        console.log('[AddMockup] code length:', code.length, 'src:', mockupSrc);
                        const newCode = injectMockup(code, mockupSrc);
                        console.log('[AddMockup] changed:', newCode !== code, 'new length:', newCode.length);
                        updateCode(id, newCode);
                      }}
                      className="p-2 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Add device mockup"
                    >
                      <Smartphone size={14} />
                    </button>
                  </>
                )}

                {/* Caption & Keywords */}
                {post?.caption && (
                  <>
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCaptionOpenId(captionOpenId === id ? null : id);
                          setCaptionCopied(false);
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          captionOpenId === id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Caption & keywords"
                      >
                        <MessageSquare size={14} />
                      </button>
                      {captionOpenId === id && (
                        <div
                          className="absolute top-full left-1/2 mt-2 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 p-3 z-30 w-[360px] -translate-x-1/2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Caption */}
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Caption</p>
                          <div className="relative mb-3">
                            <p className="text-[12px] text-gray-700 leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(post.caption || '');
                                setCaptionCopied(true);
                                setTimeout(() => setCaptionCopied(false), 2000);
                              }}
                              className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors"
                            >
                              {captionCopied ? <><Check size={10} className="text-green-500" /> Copied</> : <><Copy size={10} /> Copy caption</>}
                            </button>
                          </div>

                          {/* Image Keywords */}
                          {post.imageKeywords && post.imageKeywords.length > 0 && (
                            <>
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Suggested Keywords</p>
                              <div className="flex flex-wrap gap-1">
                                {post.imageKeywords.map((kw: string, ki: number) => (
                                  <button
                                    key={ki}
                                    onClick={() => {
                                      setUnsplashQuery(kw);
                                      handleUnsplashSearch(kw);
                                      setCaptionOpenId(null);
                                      setBgOpenId(id);
                                      setImageTab('unsplash');
                                      // Select first image if any
                                      const urls = extractImageUrls(code);
                                      if (urls.length > 0) setSelectedImageUrl(urls[0]);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                                  >
                                    <Tag size={9} />
                                    {kw}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Resize — adapt to other ratios */}
                {post && onAdaptRatio && (
                  <>
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResizeOpenId(resizeOpenId === id ? null : id);
                        }}
                        className={`p-2 rounded-xl transition-colors ${
                          resizeOpenId === id
                            ? 'bg-green-50 text-[#1B4332]'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Resize — adapt to other sizes"
                      >
                        <Scaling size={14} />
                      </button>
                      {resizeOpenId === id && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-200/60 py-1.5 z-30 min-w-[140px]">
                          <p className="px-3 pb-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Adapt to</p>
                          {ALL_RATIOS.filter(r => r !== '1:1').map((r) => {
                            const hasIt = existingRatios.has(r);
                            const isAdapting = adaptingMap[id]?.has(r);
                            return (
                              <button
                                key={r}
                                onClick={() => {
                                  if (!isAdapting && !hasIt) {
                                    handleAdapt(id, post.componentCode, r);
                                  }
                                }}
                                disabled={isAdapting}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                                  hasIt
                                    ? 'text-green-600 bg-green-50/50'
                                    : isAdapting
                                      ? 'text-gray-400'
                                      : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className="font-semibold">{r}</span>
                                {isAdapting && <Loader2 size={12} className="animate-spin text-gray-400" />}
                                {hasIt && !isAdapting && <Check size={12} className="text-green-500" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Delete post */}
                {post && (
                  <>
                    <div className="w-px h-5 bg-gray-200" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this post?')) {
                          onRemovePost({ id: post._id });
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                      title="Delete post"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {codeViewPosts.has(id) ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-[#1e1e1e]" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}>
                <textarea
                  value={code}
                  onChange={(e) => {
                    if (post) {
                      if (onUpdatePostCodeForRatio) {
                        onUpdatePostCodeForRatio({ id: post._id, ratio: aspectRatio, componentCode: e.target.value });
                      } else {
                        onUpdatePostCode({ id: post._id, componentCode: e.target.value });
                      }
                    } else if (generatedPost) {
                      setGeneratedPosts(prev => prev.map(p => p.id === id ? { ...p, code: e.target.value } : p));
                    }
                  }}
                  className="w-full h-full p-4 text-xs font-mono text-green-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            ) : (
              <PostScopeContext.Provider value={id}>
                <MemoizedPostContent code={code} aspectRatio={aspectRatio} filename={post?.title || id} />
              </PostScopeContext.Provider>
            )}
            {reorderMode && <div className="absolute inset-0 z-10 border-2 border-dashed border-transparent hover:border-[#1B4332]/30 transition-colors" />}
            {selectMode && (
              <div className={`absolute inset-0 z-20 rounded-xl transition-all ${isSelected ? 'ring-2 ring-gray-900 bg-gray-900/5' : 'hover:bg-black/5'}`}>
                <div className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isSelected ? 'bg-gray-900 text-white shadow-sm' : 'bg-white/80 backdrop-blur-sm text-gray-400 border border-gray-300'
                }`}>
                  {isSelected ? selectionIndex + 1 : ''}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <input ref={bgFileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  );
}
