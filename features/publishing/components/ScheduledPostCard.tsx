"use client";

import { Id } from "@/convex/_generated/dataModel";
import {
  Clock,
  Grid3X3,
  Instagram,
  Facebook,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  X,
} from "lucide-react";
import { formatDateTime, getStatusColor, type ScheduleStatus } from "./helpers";

interface ScheduledPost {
  _id: Id<"scheduledPosts">;
  socialAccountId: Id<"socialAccounts">;
  contentType: "image" | "carousel" | "reel" | "story";
  caption: string;
  scheduledFor: number;
  status: ScheduleStatus;
  errorMessage?: string;
}

interface SocialAccount {
  _id: Id<"socialAccounts">;
  provider: "facebook" | "instagram" | "tiktok" | "twitter";
  providerAccountName: string;
}

function getStatusIcon(status: ScheduleStatus) {
  switch (status) {
    case "scheduled":
      return <Clock className="w-3 h-3" />;
    case "publishing":
      return <Loader2 className="w-3 h-3 animate-spin" />;
    case "published":
      return <CheckCircle className="w-3 h-3" />;
    case "failed":
      return <AlertCircle className="w-3 h-3" />;
    case "cancelled":
      return <X className="w-3 h-3" />;
  }
}

function getProviderIcon(provider: string) {
  switch (provider) {
    case "instagram":
      return <Instagram className="w-4 h-4 text-pink-400" />;
    case "facebook":
      return <Facebook className="w-4 h-4 text-blue-400" />;
    default:
      return <Send className="w-4 h-4 text-slate-400 dark:text-neutral-400" />;
  }
}

function StatusBadge({ status }: { status: ScheduleStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
    >
      {getStatusIcon(status)}
      {status}
    </span>
  );
}

function ContentTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

export default function ScheduledPostCard({
  post,
  accounts,
  onCancel,
}: {
  post: ScheduledPost;
  accounts: SocialAccount[];
  onCancel: (id: Id<"scheduledPosts">) => void;
}) {
  const account = accounts.find((a) => a._id === post.socialAccountId);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-neutral-700 transition-colors">
      <div className="h-32 bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
        <Grid3X3 className="w-8 h-8 text-slate-300 dark:text-neutral-600" />
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-slate-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
          {post.caption || "No caption"}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDateTime(post.scheduledFor)}</span>
        </div>

        {account && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
            {getProviderIcon(account.provider)}
            <span>{account.providerAccountName}</span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <ContentTypeBadge type={post.contentType} />
          <StatusBadge status={post.status} />
        </div>

        {post.status === "scheduled" && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onCancel(post._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Cancel
            </button>
          </div>
        )}

        {post.status === "failed" && post.errorMessage && (
          <p className="text-xs text-red-400/80 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
            {post.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
