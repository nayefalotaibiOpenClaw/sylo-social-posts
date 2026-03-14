"use client";

import { useState } from "react";
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
  Pencil,
  Check,
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
  imageUrl?: string | null;
}

interface SocialAccount {
  _id: Id<"socialAccounts">;
  provider: "facebook" | "instagram" | "tiktok" | "twitter" | "threads";
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
  onUpdate,
}: {
  post: ScheduledPost;
  accounts: SocialAccount[];
  onCancel: (id: Id<"scheduledPosts">) => void;
  onUpdate?: (id: Id<"scheduledPosts">, caption: string) => void;
}) {
  const account = accounts.find((a) => a._id === post.socialAccountId);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);

  const handleSave = () => {
    if (onUpdate && editCaption !== post.caption) {
      onUpdate(post._id, editCaption);
    }
    setEditing(false);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-neutral-700 transition-colors">
      {post.imageUrl ? (
        <div className="h-32 bg-neutral-800 overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post preview"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
          <Grid3X3 className="w-8 h-8 text-slate-300 dark:text-neutral-600" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-neutral-200 resize-none focus:outline-none focus:border-neutral-500"
              rows={3}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setEditCaption(post.caption); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <p className="text-sm text-slate-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
              {post.caption || "No caption"}
            </p>
            {post.status === "scheduled" && onUpdate && (
              <button
                onClick={() => setEditing(true)}
                className="absolute -top-1 -right-1 p-1 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

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
