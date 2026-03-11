"use client";

import React, { memo, useCallback, useRef, useState } from "react";
import { Code, Eye, Trash2, Scaling, Loader2, Check } from "lucide-react";
import { AspectRatioType } from "@/contexts/EditContext";
import DynamicPost from "@/app/components/DynamicPost";
import PostWrapper from "@/app/components/PostWrapper";
import { Id } from "@/convex/_generated/dataModel";

const ALL_RATIOS: AspectRatioType[] = ['1:1', '9:16', '3:4', '4:3', '16:9'];

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
}: PostGridProps) {
  // Store modes in refs so handlers never need to be recreated
  const modeRef = useRef({ reorderMode, selectMode, selectedPostId });
  modeRef.current = { reorderMode, selectMode, selectedPostId };

  // Resize dropdown state
  const [resizeOpenId, setResizeOpenId] = useState<string | null>(null);
  const [adaptingMap, setAdaptingMap] = useState<Record<string, Set<string>>>({});

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
            {/* Post toolbar - above the post */}
            <div className="flex items-center justify-between mb-1 px-0.5 opacity-0 group-hover:opacity-100 transition-opacity h-7">
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleCodeView(id); }}
                  className="text-gray-500 p-1 rounded hover:bg-gray-100 hover:text-gray-700 transition-all"
                  title={codeViewPosts.has(id) ? 'Show Preview' : 'Show Code'}
                >
                  {codeViewPosts.has(id) ? <Eye size={14} /> : <Code size={14} />}
                </button>
                {/* Resize — adapt to other ratios */}
                {post && onAdaptRatio && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setResizeOpenId(resizeOpenId === id ? null : id);
                      }}
                      className={`p-1 rounded transition-all ${
                        resizeOpenId === id
                          ? 'text-[#1B4332] bg-green-50'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      title="Resize — adapt to other sizes"
                    >
                      <Scaling size={14} />
                    </button>
                    {resizeOpenId === id && (
                      <div
                        className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-30 min-w-[140px]"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
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
                )}
                {post && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this post?')) {
                        onRemovePost({ id: post._id });
                      }
                    }}
                    className="text-red-400 p-1 rounded hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Delete post"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="flex gap-1" data-toolbar-right />
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
              <MemoizedPostContent code={code} aspectRatio={aspectRatio} filename={post?.title || id} />
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
    </div>
  );
}
