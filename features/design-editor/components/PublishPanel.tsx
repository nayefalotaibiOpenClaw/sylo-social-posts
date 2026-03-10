"use client";

import React, { useState } from "react";
import {
  Instagram,
  Facebook,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface PublishPanelProps {
  workspaceId: Id<"workspaces">;
  userId: Id<"users">;
  posts: Array<{
    _id: Id<"posts">;
    title: string;
    componentCode: string;
  }> | undefined;
  postRefs: React.RefObject<Map<string, HTMLDivElement>>;
}

type PublishStep = "select-account" | "compose" | "publishing" | "done";

export default function PublishPanel({
  workspaceId,
  userId,
  posts,
  postRefs,
}: PublishPanelProps) {
  const socialAccounts = useQuery(api.socialAccounts.listByWorkspace, {
    workspaceId,
  });
  const disconnectAccount = useMutation(api.socialAccounts.disconnect);
  const publishAction = useAction(api.publishing.publishToSocial);
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);

  const [step, setStep] = useState<PublishStep>("select-account");
  const [selectedAccountId, setSelectedAccountId] =
    useState<Id<"socialAccounts"> | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<Id<"posts"> | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    postUrl?: string;
    error?: string;
  } | null>(null);

  const activeAccounts = socialAccounts?.filter((a) => a.status === "active");

  const handleConnect = (provider: "instagram" | "facebook") => {
    const params = new URLSearchParams({
      workspaceId: workspaceId,
      userId: userId,
    });
    window.location.href = `/api/social-auth/${provider}/authorize?${params.toString()}`;
  };

  const handleDisconnect = async (accountId: Id<"socialAccounts">) => {
    if (!confirm("Disconnect this account?")) return;
    await disconnectAccount({ id: accountId });
  };

  const handlePublish = async () => {
    if (!selectedAccountId || !selectedPostId) return;
    setPublishing(true);
    setStep("publishing");
    setPublishResult(null);

    try {
      // Capture the post as PNG
      const postEl = postRefs.current?.get(selectedPostId);
      if (!postEl) throw new Error("Post element not found");

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(postEl, { pixelRatio: 2 });

      // Convert to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: blob,
      });
      const { storageId } = await uploadRes.json();

      // Publish via Convex action
      const result = await publishAction({
        storageId,
        socialAccountId: selectedAccountId,
        caption,
        contentType: "image",
        postId: selectedPostId,
        workspaceId,
      });

      setPublishResult({
        success: true,
        postUrl: result.postUrl,
      });
      setStep("done");
    } catch (err) {
      setPublishResult({
        success: false,
        error: err instanceof Error ? err.message : "Publishing failed",
      });
      setStep("done");
    } finally {
      setPublishing(false);
    }
  };

  const resetFlow = () => {
    setStep("select-account");
    setSelectedAccountId(null);
    setSelectedPostId(null);
    setCaption("");
    setPublishResult(null);
  };

  const providerIcon = (provider: string) => {
    if (provider === "instagram") return <Instagram size={16} />;
    if (provider === "facebook") return <Facebook size={16} />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
          Connected Accounts
        </label>

        {socialAccounts === undefined ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={16} className="animate-spin text-gray-400" />
          </div>
        ) : activeAccounts && activeAccounts.length > 0 ? (
          <div className="space-y-2">
            {activeAccounts.map((account) => (
              <div
                key={account._id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedAccountId === account._id
                    ? "bg-slate-900/5 border-slate-900"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setSelectedAccountId(account._id);
                  if (step === "select-account") setStep("compose");
                }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  {providerIcon(account.provider)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {account.providerAccountName}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {account.provider}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisconnect(account._id);
                  }}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Disconnect account"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No accounts connected yet.</p>
        )}

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handleConnect("instagram")}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border border-dashed border-gray-300 text-gray-500 hover:border-pink-500 hover:text-pink-600 transition-all"
          >
            <Instagram size={14} />
            Instagram
          </button>
          <button
            onClick={() => handleConnect("facebook")}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            <Facebook size={14} />
            Facebook
          </button>
        </div>
      </div>

      {/* Compose */}
      {step !== "select-account" && selectedAccountId && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
            Select Post
          </label>

          {posts && posts.length > 0 ? (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {posts.map((post) => (
                <button
                  key={post._id}
                  onClick={() => setSelectedPostId(post._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    selectedPostId === post._id
                      ? "bg-slate-900/5 border-slate-900 text-slate-900"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {post.title.slice(0, 60)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              No posts in this collection.
            </p>
          )}

          {selectedPostId && (
            <>
              <label
                htmlFor="publish-caption"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 mt-4"
              >
                Caption
              </label>
              <textarea
                id="publish-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption..."
                rows={4}
                maxLength={2200}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 resize-none focus:outline-none focus:border-slate-900 transition-colors"
              />
              <p className={`text-[10px] mt-1 ${caption.length > 2000 ? "text-amber-500" : "text-gray-400"}`}>
                {caption.length}/2200 characters
              </p>

              <button
                onClick={handlePublish}
                disabled={publishing || !caption.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {publishing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  providerIcon(
                    activeAccounts?.find((a) => a._id === selectedAccountId)
                      ?.provider || ""
                  )
                )}
                Publish Now
              </button>
            </>
          )}
        </div>
      )}

      {/* Publishing Status */}
      {step === "publishing" && (
        <div className="flex flex-col items-center py-6" role="status" aria-label="Publishing post">
          <Loader2 size={24} className="animate-spin text-slate-900 mb-3" />
          <p className="text-xs font-medium text-gray-600">Publishing...</p>
          <p className="text-[10px] text-gray-400 mt-1">
            This may take a moment
          </p>
        </div>
      )}

      {/* Result */}
      {step === "done" && publishResult && (
        <div
          className={`p-4 rounded-lg border ${
            publishResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-2">
            {publishResult.success ? (
              <CheckCircle size={16} className="text-green-600 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
            )}
            <div>
              <p
                className={`text-xs font-bold ${publishResult.success ? "text-green-800" : "text-red-800"}`}
              >
                {publishResult.success
                  ? "Published successfully!"
                  : "Publishing failed"}
              </p>
              {publishResult.postUrl && (
                <a
                  href={publishResult.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-green-600 hover:underline flex items-center gap-1 mt-1"
                >
                  View post <ExternalLink size={10} />
                </a>
              )}
              {publishResult.error && (
                <p className="text-[10px] text-red-600 mt-1">
                  {publishResult.error}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={resetFlow}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={12} />
            Publish Another
          </button>
        </div>
      )}

      {/* Publish History (compact) */}
      <PublishHistorySection workspaceId={workspaceId} />
    </div>
  );
}

function PublishHistorySection({
  workspaceId,
}: {
  workspaceId: Id<"workspaces">;
}) {
  const history = useQuery(api.publishing.listHistory, { workspaceId });

  if (!history || history.length === 0) return null;

  const recent = history.slice(0, 5);

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-3">
        Recent Publishes
      </label>
      <div className="space-y-2">
        {recent.map((entry) => (
          <div
            key={entry._id}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                entry.status === "published"
                  ? "bg-green-400"
                  : entry.status === "failed"
                    ? "bg-red-400"
                    : "bg-gray-400"
              }`}
            />
            <span className="text-[10px] text-gray-500 capitalize flex-1">
              {entry.provider} · {entry.contentType}
            </span>
            <span className="text-[10px] text-gray-400">
              {new Date(entry.publishedAt).toLocaleDateString()}
            </span>
            {entry.providerPostUrl && (
              <a
                href={entry.providerPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
