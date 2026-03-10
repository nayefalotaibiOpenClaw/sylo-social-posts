"use client";

import React from "react";
import { Code, Eye, Trash2 } from "lucide-react";
import { AspectRatioType } from "@/contexts/EditContext";
import DynamicPost from "@/app/components/DynamicPost";
import PostWrapper from "@/app/components/PostWrapper";
import { Id } from "@/convex/_generated/dataModel";

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
}: PostGridProps) {
  return (
    <div
      className={`
        w-full mx-auto transition-all duration-500
        ${viewMode === 'list' ? 'flex flex-col items-center space-y-12' : 'gap-3 md:gap-6 post-grid-responsive'}
        ${editMode ? 'edit-mode' : ''}
      `}
      style={viewMode === 'grid' ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
      } : undefined}
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

        return (
          <div
            key={id}
            data-post-card
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
              onDragEnter(id);
            } : undefined}
            onDragEnd={reorderMode ? () => {
              onDragEnd();
            } : undefined}
            onClick={selectMode ? (e) => { e.stopPropagation(); onTogglePostSelection(id); } : !reorderMode ? (e) => {
              e.stopPropagation();
              onSelectPost(isPostSelected ? null : id);
            } : undefined}
            className={`relative group ${isPostSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
            style={{
              opacity: draggingId === id ? 0.4 : 1,
              transition: 'opacity 0.2s, box-shadow 0.2s',
              cursor: reorderMode ? 'grab' : selectMode ? 'pointer' : 'pointer',
            }}
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
              <PostWrapper aspectRatio={aspectRatio} filename={post?.title || id}>
                <DynamicPost code={code} />
              </PostWrapper>
            )}
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
  );
}
