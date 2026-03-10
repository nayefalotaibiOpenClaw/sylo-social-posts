"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Grid3X3,
  Instagram,
  Facebook,
  Send,
  ChevronRight,
  X,
  Check,
  Loader2,
} from "lucide-react";

interface SocialAccount {
  _id: Id<"socialAccounts">;
  provider: "facebook" | "instagram" | "tiktok" | "twitter";
  providerAccountName: string;
  status: "active" | "expired" | "revoked";
}

type BulkStep = "select" | "schedule" | "channels" | "caption" | "preview";

function getProviderIcon(provider: string) {
  switch (provider) {
    case "instagram": return <Instagram className="w-4 h-4 text-pink-400" />;
    case "facebook": return <Facebook className="w-4 h-4 text-blue-400" />;
    default: return <Send className="w-4 h-4 text-neutral-400" />;
  }
}

export default function BulkScheduleModal({
  workspaceId,
  accounts,
  onClose,
}: {
  workspaceId: Id<"workspaces">;
  accounts: SocialAccount[];
  onClose: () => void;
}) {
  const [step, setStep] = useState<BulkStep>("select");
  const [selectedPostIds, setSelectedPostIds] = useState<Set<Id<"posts">>>(new Set());
  const [frequency, setFrequency] = useState<"daily" | "every_x" | "weekly">("daily");
  const [everyXDays, setEveryXDays] = useState(2);
  const [timesPerDay, setTimesPerDay] = useState(["09:00", "18:00"]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<Id<"socialAccounts">>>(new Set());
  const [captionTemplate, setCaptionTemplate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collections = useQuery(api.collections.listByWorkspace, { workspaceId });
  const collectionIds = collections?.map((c) => c._id) ?? [];

  const col1Posts = useQuery(api.posts.listByCollection, collectionIds[0] ? { collectionId: collectionIds[0] } : "skip");
  const col2Posts = useQuery(api.posts.listByCollection, collectionIds[1] ? { collectionId: collectionIds[1] } : "skip");
  const col3Posts = useQuery(api.posts.listByCollection, collectionIds[2] ? { collectionId: collectionIds[2] } : "skip");

  const allPosts = useMemo(() => {
    const posts = [...(col1Posts ?? []), ...(col2Posts ?? []), ...(col3Posts ?? [])];
    const seen = new Set<string>();
    return posts.filter((p) => {
      if (seen.has(p._id)) return false;
      seen.add(p._id);
      return true;
    });
  }, [col1Posts, col2Posts, col3Posts]);

  const scheduleMutation = useMutation(api.publishing.schedule);

  const togglePost = (id: Id<"posts">) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAccount = (id: Id<"socialAccounts">) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const timeline = useMemo(() => {
    const items: { postIndex: number; postTitle: string; dateTime: Date; accountName: string; accountId: Id<"socialAccounts"> }[] = [];
    const postIds = Array.from(selectedPostIds);
    const accountIds = Array.from(selectedAccountIds);
    const sortedTimes = [...timesPerDay].sort();

    if (postIds.length === 0 || accountIds.length === 0 || sortedTimes.length === 0) return items;

    const start = new Date(startDate + "T00:00:00");
    let dayOffset = 0;
    let postIndex = 0;

    while (postIndex < postIds.length) {
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);

      for (const time of sortedTimes) {
        if (postIndex >= postIds.length) break;
        const [hours, minutes] = time.split(":").map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes, 0, 0);

        const post = allPosts.find((p) => p._id === postIds[postIndex]);

        for (const accountId of accountIds) {
          const account = accounts.find((a) => a._id === accountId);
          items.push({
            postIndex: postIndex + 1,
            postTitle: post?.title || `Post ${postIndex + 1}`,
            dateTime,
            accountName: account?.providerAccountName || "Unknown",
            accountId,
          });
        }
        postIndex++;
      }

      switch (frequency) {
        case "daily": dayOffset += 1; break;
        case "every_x": dayOffset += everyXDays; break;
        case "weekly": dayOffset += 7; break;
      }
    }

    return items;
  }, [selectedPostIds, selectedAccountIds, timesPerDay, startDate, frequency, everyXDays, allPosts, accounts]);

  const handleConfirm = useCallback(async () => {
    if (isSubmitting) return;

    // Check for past dates
    const now = Date.now();
    const hasPastDates = timeline.some((item) => item.dateTime.getTime() <= now);
    if (hasPastDates) {
      setError("Some scheduled times are in the past. Please adjust your start date or times.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      for (const item of timeline) {
        const postId = Array.from(selectedPostIds)[item.postIndex - 1];
        if (!postId) continue;
        await scheduleMutation({
          workspaceId,
          postId,
          socialAccountId: item.accountId,
          contentType: "image" as const,
          caption: captionTemplate,
          mediaFileIds: [], // TODO: capture post images and upload to storage
          scheduledFor: item.dateTime.getTime(),
          timezone,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule posts");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, timeline, selectedPostIds, scheduleMutation, workspaceId, captionTemplate, timezone, onClose]);

  const steps: { key: BulkStep; label: string }[] = [
    { key: "select", label: "Select Posts" },
    { key: "schedule", label: "Schedule" },
    { key: "channels", label: "Channels" },
    { key: "caption", label: "Caption" },
    { key: "preview", label: "Preview" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    switch (step) {
      case "select": return selectedPostIds.size > 0;
      case "schedule": return timesPerDay.length > 0 && startDate;
      case "channels": return selectedAccountIds.size > 0;
      case "caption": return true;
      case "preview": return timeline.length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) setStep(steps[currentStepIndex + 1].key);
  };
  const goPrev = () => {
    if (currentStepIndex > 0) setStep(steps[currentStepIndex - 1].key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Schedule Posts</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-neutral-800 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <button
                onClick={() => i <= currentStepIndex && setStep(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  s.key === step ? "bg-blue-500/20 text-blue-400"
                    : i < currentStepIndex ? "text-neutral-300 hover:bg-neutral-800"
                    : "text-neutral-600"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  s.key === step ? "bg-blue-500 text-white"
                    : i < currentStepIndex ? "bg-green-500 text-white"
                    : "bg-neutral-700 text-neutral-400"
                }`}>
                  {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-neutral-700 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Posts */}
          {step === "select" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">
                Select the posts you want to schedule. ({selectedPostIds.size} selected)
              </p>
              {collections === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
                </div>
              ) : allPosts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts found in this workspace</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allPosts.map((post) => {
                    const isSelected = selectedPostIds.has(post._id);
                    return (
                      <button
                        key={post._id}
                        onClick={() => togglePost(post._id)}
                        className={`relative rounded-xl border p-3 text-left transition-all ${
                          isSelected ? "border-blue-500 bg-blue-500/10" : "border-neutral-800 bg-neutral-800/50 hover:border-neutral-700"
                        }`}
                      >
                        <div className="h-20 bg-neutral-700/50 rounded-lg mb-2 flex items-center justify-center">
                          <Grid3X3 className="w-5 h-5 text-neutral-500" />
                        </div>
                        <p className="text-xs text-neutral-300 truncate font-medium">{post.title}</p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure Schedule */}
          {step === "schedule" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Frequency</label>
                <div className="flex gap-2">
                  {([
                    { value: "daily" as const, label: "Daily" },
                    { value: "every_x" as const, label: "Every X days" },
                    { value: "weekly" as const, label: "Weekly" },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFrequency(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        frequency === opt.value
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {frequency === "every_x" && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-neutral-400">Every</span>
                    <input
                      type="number" min={2} max={30} value={everyXDays}
                      onChange={(e) => setEveryXDays(parseInt(e.target.value) || 2)}
                      className="w-16 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm text-center focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-sm text-neutral-400">days</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-300">Times per day</label>
                  <button onClick={() => setTimesPerDay((prev) => [...prev, "12:00"])} className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    + Add time
                  </button>
                </div>
                <div className="space-y-2">
                  {timesPerDay.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time" value={time}
                        onChange={(e) => setTimesPerDay((prev) => prev.map((t, j) => j === i ? e.target.value : t))}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      {timesPerDay.length > 1 && (
                        <button
                          onClick={() => setTimesPerDay((prev) => prev.filter((_, j) => j !== i))}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Start date</label>
                <input
                  type="date" value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Timezone</label>
                <p className="text-sm text-neutral-400 bg-neutral-800 rounded-lg px-3 py-2 border border-neutral-700">{timezone}</p>
              </div>
            </div>
          )}

          {/* Step 3: Select Channels */}
          {step === "channels" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">Select which accounts to publish to. ({selectedAccountIds.size} selected)</p>
              {accounts.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No connected accounts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.filter((a) => a.status === "active").map((account) => {
                    const isSelected = selectedAccountIds.has(account._id);
                    return (
                      <button
                        key={account._id}
                        onClick={() => toggleAccount(account._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                          isSelected ? "border-blue-500 bg-blue-500/10" : "border-neutral-800 bg-neutral-800/50 hover:border-neutral-700"
                        }`}
                      >
                        {getProviderIcon(account.provider)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-200 truncate">{account.providerAccountName}</p>
                          <p className="text-xs text-neutral-500 capitalize">{account.provider}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-blue-500 border-blue-500" : "border-neutral-600"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Caption */}
          {step === "caption" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">Set a default caption for all posts, or leave blank.</p>
              <textarea
                value={captionTemplate}
                onChange={(e) => setCaptionTemplate(e.target.value)}
                placeholder="Write your caption here..."
                rows={6}
                maxLength={2200}
                className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-neutral-600 text-right">{captionTemplate.length}/2200</p>
            </div>
          )}

          {/* Step 5: Preview Timeline */}
          {step === "preview" && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-400">Review the schedule. ({timeline.length} items)</p>
              {timeline.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-8">No items. Go back and check settings.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {timeline.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-700/50">
                      <span className="text-xs font-mono text-neutral-500 w-8">#{item.postIndex}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-200 truncate">{item.postTitle}</p>
                      </div>
                      <span className="text-xs text-neutral-400 whitespace-nowrap">
                        {item.dateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                        {item.dateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                      <span className="text-xs text-neutral-500 truncate max-w-[100px]">@{item.accountName}</span>
                    </div>
                  ))}
                </div>
                {timeline.length > 0 && (
                  <p className="text-xs text-neutral-500 mt-3">
                    This will create {timeline.length} scheduled post{timeline.length !== 1 ? "s" : ""}.
                  </p>
                )}
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800">
          {error && (
            <p className="text-xs text-red-400 flex-1">{error}</p>
          )}
          <button
            onClick={currentStepIndex === 0 ? onClose : goPrev}
            className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {currentStepIndex === 0 ? "Cancel" : "Back"}
          </button>

          {step === "preview" ? (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || timeline.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSubmitting ? "Scheduling..." : "Confirm & Schedule"}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
