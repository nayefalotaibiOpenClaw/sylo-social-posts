"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  ArrowUp,
  Paperclip,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Paintbrush,
  Trash2,
  Pencil,
  List,
  Eye,
  Scaling,
} from "lucide-react";
import type { AspectRatioType } from "@/contexts/EditContext";
import type { Id } from "@/convex/_generated/dataModel";

// ─── Types ────────────────────────────────────────────────────────

interface ToolCallResult {
  tool: string;
  args: Record<string, unknown>;
  result?: string;
  status: "running" | "done" | "error";
  data?: Record<string, unknown>;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  toolCalls?: ToolCallResult[];
  status?: "thinking" | "done" | "error";
  images?: string[]; // preview URLs for user-attached images
}

interface PostData {
  _id: string;
  title: string;
  componentCode: string;
  order: number;
}

interface AssetData {
  _id: string;
  url: string | null;
  type: string;
  fileName: string;
  label?: string;
  description?: string;
  aiAnalysis?: string;
}

interface AgentChatPanelProps {
  // Workspace context
  workspaceId: Id<"workspaces"> | null;
  workspace: { name: string; website?: string; industry?: string; defaultLanguage: "en" | "ar"; websiteInfo?: Record<string, unknown> } | null;
  branding: {
    brandName: string;
    tagline?: string;
    colors: Record<string, string>;
    fonts: { heading: string; body: string };
  } | null;
  posts: PostData[];
  assets: AssetData[];
  logoUrl: string | null;

  // Settings
  aspectRatio: AspectRatioType;
  setAspectRatio: (r: AspectRatioType) => void;

  // Mutations (callbacks)
  onPostsGenerated: (codes: string[], captions: string[], imageKeywords: string[][], usage: Record<string, unknown>) => Promise<void>;
  onPostEdited: (postIndex: number, newCode: string, postId?: string) => Promise<void>;
  onPostsDeleted: (postIndices: number[], postIds?: string[]) => Promise<void>;
  onBrandUpdated: (updates: { colors?: Record<string, string>; fonts?: Record<string, string>; brandName?: string; tagline?: string }) => Promise<void>;
  onAdaptRatio: (postIndices: number[], ratios: string[], postIds?: string[]) => Promise<void>;

  // Context posts/assets from selection
  contextPosts: { id: string; code: string }[];
  setContextPosts: React.Dispatch<React.SetStateAction<{ id: string; code: string }[]>>;
  contextAssets: { id: string; url: string; type: string; label?: string; description?: string; aiAnalysis?: string }[];
  setContextAssets: React.Dispatch<React.SetStateAction<{ id: string; url: string; type: string; label?: string; description?: string; aiAnalysis?: string }[]>>;

  // Image uploads
  chatImages: { base64: string; mimeType: string; preview: string }[];
  setChatImages: React.Dispatch<React.SetStateAction<{ base64: string; mimeType: string; preview: string }[]>>;
  onChatImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  chatImageInputRef: React.RefObject<HTMLInputElement | null>;

  // Generate settings
  generateModel: string;
  setGenerateModel: (m: string) => void;
  generateCount: number;
  setGenerateCount: (n: number) => void;
  generateVersion: 4 | 5 | 7 | 8;
  setGenerateVersion: (v: 4 | 5 | 7 | 8) => void;

  // Adapting state
  adaptingRatios: boolean;

  // Usage
  usageWarning: string | null;

  // Mode switch
  onSwitchToQuick: () => void;
}

// ─── Tool Icons ───────────────────────────────────────────────────

const TOOL_ICONS: Record<string, React.ReactNode> = {
  generate_posts: <Sparkles size={12} />,
  edit_post: <Pencil size={12} />,
  list_posts: <List size={12} />,
  read_post: <Eye size={12} />,
  delete_posts: <Trash2 size={12} />,
  update_brand: <Paintbrush size={12} />,
  adapt_ratio: <Scaling size={12} />,
};

const TOOL_LABELS: Record<string, string> = {
  generate_posts: "Generating posts",
  edit_post: "Editing post",
  list_posts: "Listing posts",
  read_post: "Reading post",
  delete_posts: "Deleting posts",
  update_brand: "Updating brand",
  adapt_ratio: "Adapting ratios",
};

// ─── Component ────────────────────────────────────────────────────

export default function AgentChatPanel({
  workspaceId,
  workspace,
  branding,
  posts,
  assets,
  logoUrl,
  aspectRatio,
  setAspectRatio,
  onPostsGenerated,
  onPostEdited,
  onPostsDeleted,
  onBrandUpdated,
  onAdaptRatio,
  contextPosts,
  setContextPosts,
  contextAssets,
  setContextAssets,
  chatImages,
  setChatImages,
  onChatImageUpload,
  chatImageInputRef,
  generateModel,
  setGenerateModel,
  generateCount,
  setGenerateCount,
  generateVersion,
  setGenerateVersion,
  adaptingRatios,
  usageWarning,
  onSwitchToQuick,
}: AgentChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  // 'full' = all messages, 'last' = last response only, 'collapsed' = hidden
  const [chatView, setChatView] = useState<'full' | 'last' | 'collapsed'>('collapsed');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [showCountDropdown, setShowCountDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);

  const ratioDropdownRef = useRef<HTMLDivElement>(null);
  const countDropdownRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const assetPickerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const contextAssetIds = new Set(contextAssets.map((a) => a.id));

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatView !== 'collapsed' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatView]);

  // Close asset picker on click outside
  useEffect(() => {
    if (!showAssetPicker) return;
    const handler = (e: MouseEvent) => {
      if (assetPickerRef.current && !assetPickerRef.current.contains(e.target as Node)) {
        setShowAssetPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showAssetPicker]);

  // Close mobile dropdowns on click outside
  useEffect(() => {
    if (!showRatioDropdown && !showCountDropdown && !showStyleDropdown) return;
    const handler = (e: MouseEvent) => {
      if (showRatioDropdown && ratioDropdownRef.current && !ratioDropdownRef.current.contains(e.target as Node)) {
        setShowRatioDropdown(false);
      }
      if (showCountDropdown && countDropdownRef.current && !countDropdownRef.current.contains(e.target as Node)) {
        setShowCountDropdown(false);
      }
      if (showStyleDropdown && styleDropdownRef.current && !styleDropdownRef.current.contains(e.target as Node)) {
        setShowStyleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showRatioDropdown, showCountDropdown, showStyleDropdown]);

  // Auto-expand when first message is sent
  const expandOnFirstMessage = useCallback(() => {
    if (messages.length === 0) setChatView('last');
  }, [messages.length]);

  const handleToggleAssetContext = (asset: AssetData) => {
    if (!asset.url) return;
    setContextAssets((prev) => {
      const exists = prev.find((a) => a.id === asset._id);
      if (exists) return prev.filter((a) => a.id !== asset._id);
      if (prev.length >= 8) return prev;
      return [...prev, { id: asset._id, url: asset.url!, type: asset.type, label: asset.label, description: asset.description, aiAnalysis: asset.aiAnalysis }];
    });
  };

  // ─── Send Message ─────────────────────────────────────────────

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isProcessing) return;

    expandOnFirstMessage();
    setChatView('last');
    setError(null);

    // Add user message (with image previews if any)
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
      images: chatImages.length > 0 ? chatImages.map((img) => img.preview) : undefined,
    };

    // Add thinking placeholder
    const thinkingMsg: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "thinking",
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInputValue("");
    setChatImages([]); // Clear from input immediately — they're now shown in the chat bubble
    setIsProcessing(true);

    try {
      // Build lightweight summaries of ALL posts (for AI awareness)
      const postSummaries = posts.map((p, i) => ({
        index: i + 1,
        title: p.title,
        texts: extractVisibleTexts(p.componentCode),
        components: extractComponents(p.componentCode),
        hasImage: /<img\s/.test(p.componentCode) || /MockupFrame/.test(p.componentCode),
        layout: /items-center/.test(p.componentCode) ? "centered" : /text-left/.test(p.componentCode) ? "left-aligned" : "default",
      }));

      // Send full code for newest 6 posts (sorted by order, newest first) + context-selected posts
      const WINDOW_SIZE = 6;
      const contextPostIds = new Set(contextPosts.map((cp) => cp.id));
      const postCodes: { index: number; code: string }[] = [];
      posts.forEach((p, i) => {
        if (i < WINDOW_SIZE || contextPostIds.has(p._id)) {
          postCodes.push({ index: i + 1, code: p.componentCode });
        }
      });

      // Build conversation history (exclude the thinking message)
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
        toolCalls: m.toolCalls?.map((tc) => ({
          tool: tc.tool,
          args: tc.args,
          result: tc.result,
        })),
      }));

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          context: {
            brandName: branding?.brandName || workspace?.name,
            tagline: branding?.tagline,
            website: workspace?.website,
            industry: workspace?.industry,
            language: workspace?.defaultLanguage || "ar",
            logoUrl: logoUrl || undefined,
            websiteInfo: workspace?.websiteInfo,
            assets: (assets || [])
              .filter((a) => a.url)
              .map((a) => ({ id: a._id, url: a.url!, type: a.type, label: a.label || a.fileName, description: a.description, aiAnalysis: a.aiAnalysis })),
            themeColors: branding?.colors ? {
              primary: branding.colors.primary,
              primaryLight: branding.colors.primaryLight,
              primaryDark: branding.colors.primaryDark,
              accent: branding.colors.accent,
              accentLight: branding.colors.accentLight,
              accentLime: branding.colors.accentLime,
              accentGold: branding.colors.accentGold,
              accentOrange: branding.colors.accentOrange,
              border: branding.colors.border,
            } : undefined,
          },
          posts: postSummaries,
          postCodes,
          model: generateModel,
          generateVersion,
          targetRatio: aspectRatio,
          referenceImages: chatImages.length > 0 ? chatImages.map(img => ({ base64: img.base64, mimeType: img.mimeType })) : undefined,
          contextPosts: contextPosts.length > 0 ? contextPosts.map(p => p.code) : undefined,
          contextAssets: contextAssets.length > 0 ? contextAssets.map(a => ({ url: a.url, type: a.type, label: a.label, description: a.description, aiAnalysis: a.aiAnalysis })) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Snapshot post IDs at request time to avoid race conditions
      // (posts array may change via real-time Convex updates before callbacks run)
      const snapshotPostIds = posts.map((p) => p._id);

      // Process tool call results (execute client-side actions)
      const toolCalls: ToolCallResult[] = (data.toolCalls || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tc: any) => ({
          ...tc,
          status: tc.status || "done",
        })
      );

      // Execute client-side actions from tool results
      for (const tc of toolCalls) {
        if (!tc.data) continue;
        const action = tc.data.action as string;

        try {
          switch (action) {
            case "generate": {
              const codes = tc.data.codes as string[];
              const captions = (tc.data.captions as string[]) || [];
              const imageKeywords = (tc.data.imageKeywords as string[][]) || [];
              const usage = (tc.data.usage as Record<string, unknown>) || {};
              await onPostsGenerated(codes, captions, imageKeywords, usage);
              break;
            }
            case "edit": {
              const postIndex = tc.data.postIndex as number;
              const postId = snapshotPostIds[postIndex];
              const newCode = tc.data.newCode as string;
              if (postId) await onPostEdited(postIndex, newCode, postId);
              break;
            }
            case "delete": {
              const postIndices = tc.data.postIndices as number[];
              const postIds = postIndices.map((i) => snapshotPostIds[i]).filter(Boolean) as string[];
              await onPostsDeleted(postIndices, postIds);
              break;
            }
            case "update_brand": {
              const updates: Record<string, unknown> = {};
              if (tc.data.colors !== undefined) updates.colors = tc.data.colors;
              if (tc.data.fonts !== undefined) updates.fonts = tc.data.fonts;
              if (tc.data.brandName !== undefined) updates.brandName = tc.data.brandName;
              if (tc.data.tagline !== undefined) updates.tagline = tc.data.tagline;
              await onBrandUpdated(updates as Parameters<typeof onBrandUpdated>[0]);
              break;
            }
            case "adapt_ratio": {
              const postIndices = tc.data.postIndices as number[];
              const postIds = postIndices.map((i) => snapshotPostIds[i]).filter(Boolean) as string[];
              const ratios = tc.data.ratios as string[];
              await onAdaptRatio(postIndices, ratios, postIds);
              break;
            }
          }
        } catch (err) {
          console.error(`Failed to execute ${action}:`, err);
          tc.status = "error";
          tc.result = `Failed: ${err instanceof Error ? err.message : "Unknown error"}`;
        }
      }

      // Update the thinking message with the actual response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsg.id
            ? {
                ...m,
                content: data.text || "Done.",
                toolCalls,
                status: "done",
              }
            : m
        )
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMsg);
      // Update thinking message to error state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingMsg.id
            ? { ...m, content: errorMsg, status: "error" }
            : m
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-full max-w-3xl px-0 md:px-4 z-[110]">
      <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-visible">
        {/* Chat history — 3 states: full, last, collapsed */}
        {messages.length > 0 && chatView === 'collapsed' && (
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-neutral-800">
            <button
              onClick={() => setChatView('last')}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1.5"
            >
              {messages.filter((m) => m.role === "user").length} messages
              <ChevronUp size={10} />
            </button>
            <button
              onClick={() => { setMessages([]); setChatView('collapsed'); }}
              className="text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-0.5"
            >
              Clear
            </button>
          </div>
        )}

        {messages.length > 0 && chatView !== 'collapsed' && (
          <div className="border-b border-slate-100 dark:border-neutral-800">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-1">
                {chatView === 'last' && (
                  <button
                    onClick={() => setChatView('full')}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1"
                  >
                    {messages.filter((m) => m.role === "user").length} messages
                    <ChevronUp size={10} />
                  </button>
                )}
                {chatView === 'full' && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400">
                    {messages.filter((m) => m.role === "user").length} messages
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setMessages([]); setChatView('collapsed'); }}
                  className="text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors px-2 py-0.5"
                >
                  Clear
                </button>
                <button
                  onClick={() => setChatView(chatView === 'full' ? 'last' : 'collapsed')}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className={`overflow-y-auto px-4 py-3 space-y-3 ${chatView === 'full' ? "max-h-[50vh]" : "max-h-[160px]"}`}
            >
              {(chatView === 'full' ? messages : messages.slice(-2)).map((msg) => (
                <div key={msg.id}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-[#1B4332] text-white px-3.5 py-2 rounded-2xl rounded-br-md text-sm">
                        {msg.content}
                        {msg.images && msg.images.length > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            {msg.images.map((src, i) => (
                              <img key={i} src={src} alt={`Ref ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-white/20" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] space-y-1.5">
                        {/* Tool call indicators */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {msg.toolCalls.map((tc, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  tc.status === "error"
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                                    : tc.status === "running"
                                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                }`}
                              >
                                {tc.status === "running" ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  TOOL_ICONS[tc.tool] || <Sparkles size={10} />
                                )}
                                {TOOL_LABELS[tc.tool] || tc.tool}
                                {tc.status === "done" && <Check size={9} />}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Message content */}
                        {msg.status === "thinking" ? (
                          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 dark:bg-neutral-800 rounded-2xl rounded-bl-md">
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                            <span className="text-sm text-slate-400">Thinking...</span>
                          </div>
                        ) : msg.content ? (
                          <div
                            className={`px-3.5 py-2 rounded-2xl rounded-bl-md text-sm whitespace-pre-wrap ${
                              msg.status === "error"
                                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                : "bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200"
                            }`}
                          >
                            {msg.content}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input area */}
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && inputValue.trim() && !isProcessing) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Describe the post you want to generate..."
          rows={2}
          className="w-full px-5 pt-4 pb-2 text-base sm:text-sm text-slate-900 dark:text-white resize-none focus:outline-none placeholder:text-slate-400 bg-transparent"
        />

        {/* Context chips */}
        {(contextPosts.length > 0 || contextAssets.length > 0) && (
          <div className="flex items-center gap-1.5 px-4 pb-1 pt-1 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Context:
            </span>
            {contextPosts.map((cp) => (
              <span
                key={cp.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0"
              >
                <Sparkles size={9} />
                Post
                <button
                  onClick={() => setContextPosts((prev) => prev.filter((p) => p.id !== cp.id))}
                  className="ml-0.5 hover:text-red-500 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {contextAssets.map((ca) => (
              <span
                key={ca.id}
                className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0"
              >
                <img src={ca.url} alt={ca.label || ca.type} className="w-5 h-5 rounded-full object-cover" />
                <span className="pr-1">{ca.type}</span>
                <button
                  onClick={() => setContextAssets((prev) => prev.filter((a) => a.id !== ca.id))}
                  className="mr-0.5 hover:text-red-500 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setContextPosts([]);
                setContextAssets([]);
              }}
              className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Image previews */}
        {chatImages.length > 0 && (
          <div className="flex items-center gap-2 px-4 pb-2 pt-1 overflow-x-auto">
            {chatImages.map((img, i) => (
              <div key={i} className="relative flex-shrink-0 group">
                <img
                  src={img.preview}
                  alt={`Reference ${i + 1}`}
                  className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-neutral-700"
                />
                <button
                  onClick={() => setChatImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom controls */}
        <div className="flex items-center justify-between px-4 pb-3">
          {/* Left: attachment + model */}
          <div className="flex items-center gap-1.5">
            <div className="relative" ref={assetPickerRef}>
              <button
                onClick={() => setShowAssetPicker((prev) => !prev)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                  showAssetPicker
                    ? "border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-slate-200 dark:border-neutral-700 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-600"
                }`}
              >
                <Paperclip size={16} />
              </button>
              <input
                ref={chatImageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  onChatImageUpload(e);
                  setShowAssetPicker(false);
                }}
                className="hidden"
              />

              {/* Asset picker popup */}
              {showAssetPicker && (
                <div className="absolute bottom-12 left-0 w-72 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-2xl shadow-2xl z-[120] overflow-hidden">
                  <button
                    onClick={() => chatImageInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors border-b border-slate-100 dark:border-neutral-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
                      <ArrowUp size={14} className="text-slate-500" />
                    </div>
                    Upload image
                  </button>
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Workspace Assets
                    </span>
                  </div>
                  <div className="px-3 pb-3 max-h-52 overflow-y-auto">
                    {assets && assets.filter((a) => a.url).length > 0 ? (
                      <div className="grid grid-cols-4 gap-1.5">
                        {assets
                          .filter((a): a is typeof a & { url: string } => !!a.url)
                          .map((asset) => {
                            const isSelected = contextAssetIds.has(asset._id);
                            return (
                              <button
                                key={asset._id}
                                onClick={() => handleToggleAssetContext(asset)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                  isSelected
                                    ? "border-emerald-500 ring-1 ring-emerald-500/30"
                                    : "border-transparent hover:border-slate-300 dark:hover:border-neutral-600"
                                }`}
                              >
                                <img
                                  src={asset.url}
                                  alt={asset.description || asset.fileName || ""}
                                  className="w-full h-full object-cover"
                                />
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
                      <p className="text-xs text-slate-400 dark:text-neutral-500 py-4 text-center">
                        No assets uploaded yet
                      </p>
                    )}
                  </div>
                  {contextAssets.length > 0 && (
                    <div className="px-3 pb-2 border-t border-slate-100 dark:border-neutral-800 pt-2">
                      <span className="text-[10px] text-slate-400">
                        {contextAssets.length}/8 assets selected
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Model dropdown hidden — defaults to Flash Lite */}
            {/* Switch to Quick mode */}
            <button
              onClick={onSwitchToQuick}
              title="Switch to Quick mode"
              className="h-7 px-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1"
            >
              Agent
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
                      ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {/* Post count — mobile dropdown */}
            <div className="relative md:hidden" ref={countDropdownRef}>
              <button
                onClick={() => setShowCountDropdown((prev) => !prev)}
                className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-bold text-slate-700 dark:text-neutral-300"
              >
                {generateCount}x
                <ChevronDown size={12} />
              </button>
              {showCountDropdown && (
                <div className="absolute bottom-9 right-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-2xl z-[120] overflow-hidden py-1 min-w-[48px]">
                  {[1, 2, 4, 6, 8].map((n) => (
                    <button
                      key={n}
                      onClick={() => { setGenerateCount(n); setShowCountDropdown(false); }}
                      className={`w-full px-4 py-2 text-xs font-semibold text-center transition-colors ${
                        generateCount === n
                          ? "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800 dark:text-neutral-400"
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
                { v: 4 as const, label: "Social Media", title: "Social Media" },
                { v: 8 as const, label: "SaaS", title: "SaaS — typography-driven, CSS-only" },
                { v: 7 as const, label: "App Store", title: "App Store Preview" },
              ]).map(({ v, label, title }) => (
                <button
                  key={v}
                  onClick={() => setGenerateVersion(v)}
                  title={title}
                  className={`px-2.5 h-7 rounded-full text-[10px] font-bold transition-colors whitespace-nowrap ${
                    generateVersion === v
                      ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Style selector — mobile dropdown */}
            <div className="relative md:hidden ml-1" ref={styleDropdownRef}>
              <button
                onClick={() => setShowStyleDropdown((prev) => !prev)}
                className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-bold text-slate-700 dark:text-neutral-300"
              >
                {generateVersion === 4 ? "Social" : generateVersion === 8 ? "SaaS" : "App"}
                <ChevronDown size={12} />
              </button>
              {showStyleDropdown && (
                <div className="absolute bottom-9 right-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-2xl z-[120] overflow-hidden py-1 min-w-[120px]">
                  {([
                    { v: 4 as const, label: "Social Media" },
                    { v: 8 as const, label: "SaaS" },
                    { v: 7 as const, label: "App Store" },
                  ]).map(({ v, label }) => (
                    <button
                      key={v}
                      onClick={() => { setGenerateVersion(v); setShowStyleDropdown(false); }}
                      className={`w-full px-4 py-2 text-xs font-semibold text-left transition-colors ${
                        generateVersion === v
                          ? "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800 dark:text-neutral-400"
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
              {(["1:1", "9:16", "3:4", "4:3", "16:9"] as AspectRatioType[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  title={r}
                  className={`px-1.5 h-7 rounded-full text-[10px] font-bold transition-colors ${
                    aspectRatio === r
                      ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {/* Ratio selector — mobile dropdown */}
            <div className="relative md:hidden ml-1" ref={ratioDropdownRef}>
              <button
                onClick={() => setShowRatioDropdown((prev) => !prev)}
                className="flex items-center gap-1 h-7 px-2.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-bold text-slate-700 dark:text-neutral-300"
              >
                {aspectRatio}
                <ChevronDown size={12} />
              </button>
              {showRatioDropdown && (
                <div className="absolute bottom-9 right-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-2xl z-[120] overflow-hidden py-1">
                  {(["1:1", "9:16", "3:4", "4:3", "16:9"] as AspectRatioType[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setAspectRatio(r); setShowRatioDropdown(false); }}
                      className={`w-full px-4 py-2 text-xs font-semibold text-left transition-colors ${
                        aspectRatio === r
                          ? "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800 dark:text-neutral-400"
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
              onClick={handleSend}
              disabled={isProcessing || !inputValue.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ml-1 ${
                isProcessing || !inputValue.trim()
                  ? "bg-slate-200 dark:bg-neutral-700 text-slate-400"
                  : "bg-[#1B4332] text-white hover:bg-[#2D6A4F]"
              }`}
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Status messages below */}
      {adaptingRatios && (
        <p className="text-xs text-slate-500 font-medium mt-2 text-center flex items-center justify-center gap-1.5">
          <Loader2 size={12} className="animate-spin" /> Adapting ratios...
        </p>
      )}
      {error && !isProcessing && (
        <p className="text-xs text-red-500 font-medium mt-2 text-center">{error}</p>
      )}
      {usageWarning && !error && (
        <p className="text-xs text-amber-600 font-medium mt-2 text-center">{usageWarning}</p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

/** Extract visible text from EditableText components */
function extractVisibleTexts(code: string): string[] {
  const texts: string[] = [];
  const pattern = /<EditableText[^>]*>\s*([\s\S]*?)\s*<\/EditableText>/g;
  let match;
  while ((match = pattern.exec(code)) !== null) {
    const text = match[1]
      .replace(/\{[^}]*\}/g, "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (text.length > 0) texts.push(text.slice(0, 60));
  }
  return texts.slice(0, 5); // Max 5 text snippets
}

/** Extract key components used in the post */
function extractComponents(code: string): string[] {
  const components: string[] = [];
  if (/MockupFrame/.test(code)) components.push("MockupFrame");
  if (/FloatingCard/.test(code)) components.push("FloatingCard");
  if (/PostHeader/.test(code)) components.push("PostHeader");
  if (/PostFooter/.test(code)) components.push("PostFooter");
  if (/<img\s/.test(code)) components.push("Image");
  if (/linear-gradient/.test(code)) components.push("Gradient");
  return components;
}
