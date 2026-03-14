"use client";

import { useState, useEffect } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import FloatingNav from "@/app/components/FloatingNav";
import ScheduledPostCard from "@/features/publishing/components/ScheduledPostCard";
import CalendarView from "@/features/publishing/components/CalendarView";
import BulkScheduleModal from "@/features/publishing/components/BulkScheduleModal";
import { type ScheduleStatus } from "@/features/publishing/components/helpers";
import {
  Calendar,
  Grid3X3,
  Plus,
  Filter,
  Loader2,
  Send,
} from "lucide-react";

type ViewMode = "grid" | "calendar";

export default function PublishPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(
    api.workspaces.listByUser,
    user ? {} : "skip"
  );

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Auto-select first workspace
  useEffect(() => {
    if (!selectedWorkspaceId && workspaces && workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const socialAccounts = useQuery(
    api.socialAccounts.listByWorkspace,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );

  const scheduledPosts = useQuery(
    api.publishing.listScheduled,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );

  const cancelPost = useMutation(api.publishing.cancelScheduled);

  const activeAccounts = socialAccounts?.filter((a) => a.status === "active") || [];
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

  const handleCancel = async (id: Id<"scheduledPosts">) => {
    if (!confirm("Cancel this scheduled post?")) return;
    await cancelPost({ id });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300 dark:text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <FloatingNav />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Publish</h1>
            <p className="text-sm text-slate-500 dark:text-neutral-500 mt-1">
              Schedule and manage your social media posts
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Workspace Selector */}
            {workspaces && workspaces.length > 0 && (
              <select
                value={selectedWorkspaceId || ""}
                onChange={(e) => {
                  setSelectedWorkspaceId(e.target.value as Id<"workspaces">);
                  setChannelFilter("all");
                }}
                className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-neutral-600"
              >
                {workspaces.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
            )}

            {/* Channel Filter */}
            {activeAccounts.length > 0 && (
              <div className="relative">
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg pl-8 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-neutral-600 appearance-none"
                >
                  <option value="all">All Channels</option>
                  {activeAccounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.providerAccountName}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "calendar"
                    ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Bulk Schedule Button */}
            {selectedWorkspaceId && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {!selectedWorkspaceId ? (
          <div className="text-center py-20">
            <Send className="w-10 h-10 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-neutral-500">Select a workspace to manage publishing</p>
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView scheduledPosts={filteredPosts} accounts={activeAccounts} />
        ) : (
          <div className="space-y-8">
            <PostSection
              title="Queued"
              posts={queued}
              accounts={activeAccounts}
              onCancel={handleCancel}
            />
            {publishing.length > 0 && (
              <PostSection
                title="Publishing"
                posts={publishing}
                accounts={activeAccounts}
                onCancel={handleCancel}
              />
            )}
            {published.length > 0 && (
              <PostSection
                title="Published"
                posts={published}
                accounts={activeAccounts}
                onCancel={handleCancel}
              />
            )}
            {failed.length > 0 && (
              <PostSection
                title="Failed"
                posts={failed}
                accounts={activeAccounts}
                onCancel={handleCancel}
              />
            )}
            {cancelled.length > 0 && (
              <PostSection
                title="Cancelled"
                posts={cancelled}
                accounts={activeAccounts}
                onCancel={handleCancel}
              />
            )}

            {allPosts.length === 0 && (
              <div className="text-center py-20">
                <Calendar className="w-10 h-10 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-neutral-500">No scheduled posts yet</p>
                <p className="text-xs text-slate-400 dark:text-neutral-600 mt-1">
                  Click &quot;Schedule&quot; to set up your publishing queue
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Schedule Modal */}
      {showBulkModal && selectedWorkspaceId && (
        <BulkScheduleModal
          workspaceId={selectedWorkspaceId}
          accounts={activeAccounts}
          onClose={() => setShowBulkModal(false)}
        />
      )}
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
    provider: "facebook" | "instagram" | "tiktok" | "twitter" | "threads";
    providerAccountName: string;
  }>;
  onCancel: (id: Id<"scheduledPosts">) => void;
}) {
  if (posts.length === 0) return null;

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
