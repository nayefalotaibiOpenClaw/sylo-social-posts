"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Send,
  LinkIcon,
  X,
  Calendar,
  Grid3X3,
  Plus,
  Filter,
  Instagram,
  Facebook,
  Video,
  Briefcase,
  MessageCircle,
  Cloud,
  Youtube,
  Trash2,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import ScheduledPostCard from "@/features/publishing/components/ScheduledPostCard";
import CalendarView from "@/features/publishing/components/CalendarView";
import BulkScheduleModal from "@/features/publishing/components/BulkScheduleModal";
import { type ScheduleStatus } from "@/features/publishing/components/helpers";
import MobileNavMenu from "./MobileNavMenu";
import { type SidebarTab } from "./Sidebar";

type SubTab = "publish" | "channels";
type ViewMode = "grid" | "calendar";

const PROVIDERS = [
  { id: "instagram" as const, name: "Instagram", icon: Instagram, color: "from-pink-500 to-rose-600", available: true },
  { id: "facebook" as const, name: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700", available: true },
  { id: "tiktok" as const, name: "TikTok", icon: Video, color: "from-neutral-800 to-neutral-900", available: false },
  { id: "linkedin" as const, name: "LinkedIn", icon: Briefcase, color: "from-blue-700 to-blue-800", available: false },
  { id: "threads" as const, name: "Threads", icon: MessageCircle, color: "from-neutral-700 to-neutral-800", available: false },
  { id: "bluesky" as const, name: "Bluesky", icon: Cloud, color: "from-sky-500 to-sky-600", available: false },
  { id: "youtube" as const, name: "YouTube", icon: Youtube, color: "from-red-600 to-red-700", available: false },
];

interface PublishChannelsPageProps {
  workspaceId: Id<"workspaces">;
  userId: Id<"users">;
  initialTab?: SubTab;
  onClose: () => void;
  activeTab?: SidebarTab;
  onTabClick?: (tab: SidebarTab) => void;
  workspaces?: { _id: string; name: string }[];
  currentWorkspaceId?: string;
  currentWorkspaceName?: string;
}

export default function PublishChannelsPage({
  workspaceId,
  userId,
  initialTab = "publish",
  onClose,
  activeTab,
  onTabClick,
  workspaces,
  currentWorkspaceId,
  currentWorkspaceName,
}: PublishChannelsPageProps) {
  const [subTab, setSubTab] = useState<SubTab>(initialTab);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync initialTab when sidebar tab changes
  useEffect(() => { setSubTab(initialTab); }, [initialTab]);

  const socialAccounts = useQuery(api.socialAccounts.listByWorkspace, { workspaceId });
  const scheduledPosts = useQuery(api.publishing.listScheduled, { workspaceId });
  const cancelPost = useMutation(api.publishing.cancelScheduled);
  const disconnectAccount = useMutation(api.socialAccounts.disconnect);

  const activeAccounts = socialAccounts?.filter((a) => a.status === "active") || [];
  const connectedProviders = new Set(activeAccounts.map((a) => a.provider));
  const allPosts = scheduledPosts ?? [];

  const filteredPosts = channelFilter === "all"
    ? allPosts
    : allPosts.filter((p) => p.socialAccountId === channelFilter);

  const groupByStatus = (status: ScheduleStatus) =>
    filteredPosts.filter((p) => p.status === status);

  const queued = groupByStatus("scheduled");
  const publishing = groupByStatus("publishing");
  const published = groupByStatus("published");
  const failed = groupByStatus("failed");
  const cancelled = groupByStatus("cancelled");

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCancel = async (id: Id<"scheduledPosts">) => {
    if (!confirm("Cancel this scheduled post?")) return;
    await cancelPost({ id });
  };

  const handleConnect = (provider: "instagram" | "facebook") => {
    const params = new URLSearchParams({ workspaceId, userId });
    window.location.href = `/api/social-auth/${provider}/authorize?${params.toString()}`;
  };

  const handleDisconnect = async (accountId: Id<"socialAccounts">) => {
    if (!confirm("Disconnect this account?")) return;
    try {
      await disconnectAccount({ id: accountId });
      setToast({ type: "success", message: "Account disconnected" });
    } catch {
      setToast({ type: "error", message: "Failed to disconnect account" });
    }
  };

  // When scheduling, render the schedule page as the full content
  if (showBulkModal) {
    return (
      <BulkScheduleModal
        workspaceId={workspaceId}
        accounts={activeAccounts}
        onClose={() => setShowBulkModal(false)}
        inline
      />
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border flex items-center gap-3 shadow-2xl max-w-lg ${
          toast.type === "success"
            ? "bg-green-50 dark:bg-green-950/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
            : "bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating Nav */}
      <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
        <nav className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-4">
          {onTabClick && <MobileNavMenu activeTab={activeTab ?? 'publish'} onTabClick={onTabClick} workspaces={workspaces} currentWorkspaceId={currentWorkspaceId} currentWorkspaceName={currentWorkspaceName} />}
          {onTabClick && <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700 md:hidden" />}
          {/* Page title */}
          <div className="flex items-center gap-2 shrink-0">
            {subTab === "publish" ? <Send size={14} className="text-slate-400 dark:text-neutral-500 hidden md:block" /> : <LinkIcon size={14} className="text-slate-400 dark:text-neutral-500 hidden md:block" />}
            <span className="text-sm font-black text-slate-900 dark:text-white">{subTab === "publish" ? "Publish" : "Channels"}</span>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />

          {/* Publish controls */}
          {subTab === "publish" && (
            <>
              {activeAccounts.length > 0 && (
                <div className="relative">
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-full pl-7 pr-3 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500 appearance-none"
                  >
                    <option value="all">All Channels</option>
                    {activeAccounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.providerAccountName}</option>
                    ))}
                  </select>
                  <Filter className="w-3 h-3 text-slate-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              <div className="flex items-center bg-slate-100 dark:bg-neutral-800 rounded-full p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-full transition-colors ${
                    viewMode === "grid" ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300"
                  }`}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-1.5 rounded-full transition-colors ${
                    viewMode === "calendar" ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300"
                  }`}
                >
                  <Calendar size={14} />
                </button>
              </div>
            </>
          )}

          <div className="flex-1" />

          {subTab === "publish" && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] transition-colors"
            >
              <Plus size={14} />
              Schedule
            </button>
          )}

        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {subTab === "publish" ? (
            /* ── Publish Tab ── */
            viewMode === "calendar" ? (
              <CalendarView scheduledPosts={filteredPosts} accounts={activeAccounts} />
            ) : (
              <div className="space-y-8">
                {queued.length > 0 && (
                  <PostSection title="Queued" posts={queued} accounts={activeAccounts} onCancel={handleCancel} />
                )}
                {publishing.length > 0 && (
                  <PostSection title="Publishing" posts={publishing} accounts={activeAccounts} onCancel={handleCancel} />
                )}
                {published.length > 0 && (
                  <PostSection title="Published" posts={published} accounts={activeAccounts} onCancel={handleCancel} />
                )}
                {failed.length > 0 && (
                  <PostSection title="Failed" posts={failed} accounts={activeAccounts} onCancel={handleCancel} />
                )}
                {cancelled.length > 0 && (
                  <PostSection title="Cancelled" posts={cancelled} accounts={activeAccounts} onCancel={handleCancel} />
                )}

                {allPosts.length === 0 && (
                  <div className="text-center py-20">
                    <Calendar className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-neutral-400 font-medium">No scheduled posts yet</p>
                    <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
                      Click &quot;Schedule&quot; to set up your publishing queue
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            /* ── Channels Tab ── */
            <div className="space-y-8">
              {activeAccounts.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                    Connected ({activeAccounts.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeAccounts.map((account) => {
                      const provider = PROVIDERS.find((p) => p.id === account.provider);
                      const Icon = provider?.icon || LinkIcon;
                      return (
                        <div
                          key={account._id}
                          className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-slate-300 dark:hover:border-neutral-600 transition-colors"
                        >
                          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${provider?.color || "from-slate-400 to-slate-500"} flex items-center justify-center shrink-0`}>
                            {account.providerAccountImage ? (
                              <img src={account.providerAccountImage} alt="" className="w-11 h-11 rounded-full" />
                            ) : (
                              <Icon size={20} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{account.providerAccountName}</p>
                            <p className="text-xs text-slate-400 dark:text-neutral-500 capitalize">{account.provider}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <button
                              onClick={() => handleDisconnect(account._id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 dark:text-neutral-500 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                  Connect a Channel
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PROVIDERS.map((provider) => {
                    const isConnected = connectedProviders.has(provider.id as "facebook" | "instagram" | "tiktok" | "twitter");
                    const Icon = provider.icon;
                    if (isConnected) return null;

                    return (
                      <button
                        key={provider.id}
                        onClick={() => {
                          if (provider.available) handleConnect(provider.id as "instagram" | "facebook");
                        }}
                        disabled={!provider.available}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                          provider.available
                            ? "bg-white dark:bg-neutral-900/50 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600 hover:shadow-sm cursor-pointer"
                            : "bg-slate-50 dark:bg-neutral-950/50 border-slate-100 dark:border-neutral-900 cursor-not-allowed opacity-50"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${provider.color} flex items-center justify-center shrink-0`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{provider.name}</p>
                          <p className="text-xs text-slate-400 dark:text-neutral-500">
                            {provider.available ? "Click to connect" : "Coming soon"}
                          </p>
                        </div>
                        {provider.available ? (
                          <Zap size={14} className="text-slate-300 dark:text-neutral-600" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-600 uppercase">Soon</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function PostSection({
  title,
  posts,
  accounts,
  onCancel,
}: {
  title: string;
  posts: Array<{
    _id: Id<"scheduledPosts">;
    socialAccountId: Id<"socialAccounts">;
    contentType: "image" | "carousel" | "reel" | "story";
    caption: string;
    scheduledFor: number;
    status: ScheduleStatus;
    errorMessage?: string;
  }>;
  accounts: Array<{
    _id: Id<"socialAccounts">;
    provider: "facebook" | "instagram" | "tiktok" | "twitter";
    providerAccountName: string;
  }>;
  onCancel: (id: Id<"scheduledPosts">) => void;
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
        {title} ({posts.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posts.map((post) => (
          <ScheduledPostCard
            key={post._id}
            post={post}
            accounts={accounts}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}
