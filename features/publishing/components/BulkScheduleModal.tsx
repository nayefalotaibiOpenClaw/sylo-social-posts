"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import DynamicPost from "@/app/components/DynamicPost";
import PostWrapper from "@/app/components/PostWrapper";
import {
  Grid3X3,
  Instagram,
  Facebook,
  Send,
  ChevronRight,
  X,
  Check,
  Loader2,
  Image,
  Images,
  Film,
  Square,
  CheckCheck,
} from "lucide-react";

interface SocialAccount {
  _id: Id<"socialAccounts">;
  provider: "facebook" | "instagram" | "tiktok" | "twitter";
  providerAccountName: string;
  status: "active" | "expired" | "revoked";
}

type ContentType = "image" | "carousel" | "story" | "reel";
type BulkStep = "select" | "type" | "schedule" | "channels" | "caption" | "preview";

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "image", label: "Post", icon: <Image className="w-5 h-5" />, desc: "Single image post" },
  { value: "carousel", label: "Carousel", icon: <Images className="w-5 h-5" />, desc: "Multi-slide carousel (2-10 images)" },
  { value: "story", label: "Story", icon: <Square className="w-5 h-5" />, desc: "24-hour story" },
  { value: "reel", label: "Reel", icon: <Film className="w-5 h-5" />, desc: "Short-form video" },
];

function getProviderIcon(provider: string) {
  switch (provider) {
    case "instagram": return <Instagram className="w-4 h-4 text-pink-500" />;
    case "facebook": return <Facebook className="w-4 h-4 text-blue-500" />;
    default: return <Send className="w-4 h-4 text-gray-400" />;
  }
}

/** Theme-aware color classes */
function c(inline: boolean) {
  return inline ? {
    bg: "bg-white",
    bgSub: "bg-gray-50",
    bgHover: "hover:bg-gray-100",
    border: "border-gray-200",
    borderHover: "hover:border-gray-300",
    text: "text-gray-900",
    textSub: "text-gray-600",
    textMuted: "text-gray-400",
    input: "bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500",
    card: "border-gray-200 bg-gray-50/50 hover:border-gray-300",
    cardSelected: "border-blue-500 bg-blue-50",
    pill: "bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300",
    pillActive: "bg-blue-50 text-blue-600 border border-blue-200",
    stepDone: "text-gray-600 hover:bg-gray-100",
    stepInactive: "text-gray-400",
    stepBgInactive: "bg-gray-200 text-gray-500",
    separator: "border-gray-200",
    timeline: "bg-gray-50 border border-gray-200",
  } : {
    bg: "bg-neutral-900",
    bgSub: "bg-neutral-800",
    bgHover: "hover:bg-neutral-800",
    border: "border-neutral-800",
    borderHover: "hover:border-neutral-700",
    text: "text-white",
    textSub: "text-neutral-400",
    textMuted: "text-neutral-600",
    input: "bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500",
    card: "border-neutral-800 bg-neutral-800/50 hover:border-neutral-700",
    cardSelected: "border-blue-500 bg-blue-500/10",
    pill: "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600",
    pillActive: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    stepDone: "text-neutral-300 hover:bg-neutral-800",
    stepInactive: "text-neutral-600",
    stepBgInactive: "bg-neutral-700 text-neutral-400",
    separator: "border-neutral-800",
    timeline: "bg-neutral-800 border border-neutral-700/50",
  };
}

export default function BulkScheduleModal({
  workspaceId,
  accounts,
  onClose,
  inline = false,
}: {
  workspaceId: Id<"workspaces">;
  accounts: SocialAccount[];
  onClose: () => void;
  inline?: boolean;
}) {
  const t = c(inline);

  const [step, setStep] = useState<BulkStep>("select");
  const [selectedPostIds, setSelectedPostIds] = useState<Set<Id<"posts">>>(new Set());
  const [contentType, setContentType] = useState<ContentType>("image");
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
  const [captionMode, setCaptionMode] = useState<"shared" | "per-post">("shared");
  const [sharedCaption, setSharedCaption] = useState("");
  const [perPostCaptions, setPerPostCaptions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const captureRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const allPosts = useQuery(api.posts.listByWorkspace, { workspaceId });
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const scheduleBulk = useMutation(api.publishing.scheduleBulk);

  const togglePost = (id: Id<"posts">) => {
    setSelectedPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!allPosts) return;
    if (selectedPostIds.size === allPosts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(allPosts.map((p) => p._id)));
    }
  };

  const toggleAccount = (id: Id<"socialAccounts">) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectedPosts = useMemo(() => {
    if (!allPosts) return [];
    const ids = Array.from(selectedPostIds);
    return ids.map((id) => allPosts.find((p) => p._id === id)).filter(Boolean) as typeof allPosts;
  }, [allPosts, selectedPostIds]);

  const timeline = useMemo(() => {
    const items: { postIndex: number; postId: Id<"posts">; postTitle: string; dateTime: Date; accountName: string; accountId: Id<"socialAccounts"> }[] = [];
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

        const post = allPosts?.find((p) => p._id === postIds[postIndex]);

        for (const accountId of accountIds) {
          const account = accounts.find((a) => a._id === accountId);
          items.push({
            postIndex: postIndex + 1,
            postId: postIds[postIndex],
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

    const now = Date.now();
    const hasPastDates = timeline.some((item) => item.dateTime.getTime() <= now);
    if (hasPastDates) {
      setError("Some scheduled times are in the past. Please adjust your start date or times.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const postMediaMap = new Map<string, Id<"_storage">[]>();
      const uniquePostIds = Array.from(selectedPostIds);

      setSubmitProgress(`Capturing ${uniquePostIds.length} post images...`);

      const { toPng } = await import("html-to-image");

      for (let i = 0; i < uniquePostIds.length; i++) {
        const postId = uniquePostIds[i];
        setSubmitProgress(`Capturing post ${i + 1} of ${uniquePostIds.length}...`);

        const el = captureRefs.current.get(postId);
        if (!el) {
          throw new Error(`Post element not found for capture. Please try again.`);
        }

        const dataUrl = await toPng(el, { pixelRatio: 2 });
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const uploadUrl = await generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/png" },
          body: blob,
        });
        const { storageId } = await uploadRes.json();
        postMediaMap.set(postId, [storageId]);
      }

      setSubmitProgress("Scheduling posts...");

      const batchId = `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const entries = timeline.map((item) => ({
        postId: item.postId,
        socialAccountId: item.accountId,
        contentType,
        caption: captionMode === "per-post"
          ? (perPostCaptions[item.postId] || sharedCaption)
          : sharedCaption,
        mediaFileIds: postMediaMap.get(item.postId) || [],
        scheduledFor: item.dateTime.getTime(),
        timezone,
      }));

      await scheduleBulk({ workspaceId, batchId, entries });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule posts");
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  }, [isSubmitting, timeline, selectedPostIds, contentType, captionMode, perPostCaptions, sharedCaption, generateUploadUrl, scheduleBulk, workspaceId, timezone, onClose]);

  const steps: { key: BulkStep; label: string }[] = [
    { key: "select", label: "Select Posts" },
    { key: "type", label: "Content Type" },
    { key: "schedule", label: "Schedule" },
    { key: "channels", label: "Channels" },
    { key: "caption", label: "Caption" },
    { key: "preview", label: "Preview" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    switch (step) {
      case "select": return selectedPostIds.size > 0;
      case "type": return true;
      case "schedule": return timesPerDay.length > 0 && startDate;
      case "channels": return selectedAccountIds.size > 0;
      case "caption": return true;
      case "preview": return timeline.length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1].key;
      // Pre-fill per-post captions from AI-generated captions when entering caption step
      if (nextStep === "caption" && Object.keys(perPostCaptions).length === 0) {
        const prefilled: Record<string, string> = {};
        for (const post of selectedPosts) {
          if (post.caption) prefilled[post._id] = post.caption;
        }
        if (Object.keys(prefilled).length > 0) {
          setPerPostCaptions(prefilled);
          setCaptionMode("per-post");
        }
      }
      setStep(nextStep);
    }
  };
  const goPrev = () => {
    if (currentStepIndex > 0) setStep(steps[currentStepIndex - 1].key);
  };

  // Step indicator shared between inline nav and modal header
  const stepIndicator = (
    <div className={`flex items-center gap-1 ${inline ? '' : `px-6 py-3 border-b ${t.separator}`} overflow-x-auto`}>
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <button
            onClick={() => i <= currentStepIndex && setStep(s.key)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              s.key === step ? t.pillActive
                : i < currentStepIndex ? t.stepDone
                : t.stepInactive
            }`}
          >
            <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              s.key === step ? "bg-blue-500 text-white"
                : i < currentStepIndex ? "bg-green-500 text-white"
                : t.stepBgInactive
            }`}>
              {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
          {i < steps.length - 1 && <ChevronRight className={`w-3 h-3 ${t.textMuted} flex-shrink-0`} />}
        </div>
      ))}
    </div>
  );

  if (inline) {
    return (
      <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
        {/* Floating Nav — matches Assets/Publish/Brand page pattern */}
        <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
          <nav className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-3">
            {/* Page title */}
            <div className="flex items-center gap-2 shrink-0">
              <Send size={14} className="text-slate-400 hidden md:block" />
              <span className="text-sm font-black text-slate-900">Schedule</span>
            </div>

            <div className="w-px h-5 bg-slate-200" />

            {/* Step indicator */}
            {stepIndicator}

            <div className="flex-1" />

            {/* Nav actions: Back + Next */}
            <div className="flex items-center gap-2 shrink-0">
              {currentStepIndex > 0 && (
                <button
                  onClick={goPrev}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              )}
              {step === "preview" ? (
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting || timeline.length === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {isSubmitting ? "Scheduling..." : "Confirm"}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </nav>
        </div>

        {/* Error/progress bar */}
        {(error || (isSubmitting && submitProgress)) && (
          <div className="px-6">
            <div className="max-w-6xl mx-auto">
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
              {isSubmitting && submitProgress && <p className="text-xs text-blue-500 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">{submitProgress}</p>}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Step 1: Select Posts */}
          {step === "select" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${t.textSub}`}>
                  Select the posts you want to schedule. ({selectedPostIds.size} selected)
                </p>
                {allPosts && allPosts.length > 0 && (
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {selectedPostIds.size === allPosts.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
              {allPosts === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`w-6 h-6 animate-spin ${t.textMuted}`} />
                </div>
              ) : allPosts.length === 0 ? (
                <div className={`text-center py-12 ${t.textMuted}`}>
                  <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts found in this workspace</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {allPosts.map((post) => {
                    const isSelected = selectedPostIds.has(post._id);
                    return (
                      <div
                        key={post._id}
                        onClick={() => togglePost(post._id)}
                        className={`relative rounded-xl border p-1.5 text-left transition-all cursor-pointer ${
                          isSelected ? t.cardSelected : t.card
                        }`}
                      >
                        <div className={`aspect-square rounded-lg overflow-hidden ${t.bgSub} mb-1.5`}>
                          <div className="w-full h-full" style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}>
                            <DynamicPost code={post.componentCode} />
                          </div>
                        </div>
                        <p className={`text-xs truncate font-medium px-1 ${inline ? 'text-gray-800' : 'text-neutral-300'}`}>{post.title}</p>
                        {post.caption && (
                          <p className={`text-[10px] truncate px-1 mt-0.5 ${t.textMuted}`}>{post.caption}</p>
                        )}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content Type */}
          {step === "type" && (
            <div className="space-y-4">
              <p className={`text-sm ${t.textSub}`}>Choose how these posts will be published.</p>
              <div className="grid grid-cols-2 gap-3">
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = contentType === ct.value;
                  const isDisabled = ct.value === "carousel" && selectedPostIds.size < 2;
                  return (
                    <button
                      key={ct.value}
                      onClick={() => !isDisabled && setContentType(ct.value)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? t.cardSelected + " text-blue-500"
                          : isDisabled
                            ? `${t.card} opacity-50 cursor-not-allowed`
                            : `${t.card} ${inline ? 'text-gray-600' : 'text-neutral-400'}`
                      }`}
                    >
                      {ct.icon}
                      <span className="text-sm font-bold">{ct.label}</span>
                      <span className={`text-[10px] ${t.textMuted}`}>{ct.desc}</span>
                      {isDisabled && (
                        <span className="text-[10px] text-amber-500">Need 2+ posts</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {contentType === "carousel" && (
                <p className={`text-xs ${t.textMuted}`}>
                  All {selectedPostIds.size} selected posts will be combined into a single carousel.
                </p>
              )}
              {contentType === "story" && (
                <p className="text-xs text-amber-500">
                  Note: Stories don&apos;t support captions on Instagram.
                </p>
              )}
            </div>
          )}

          {/* Step 3: Configure Schedule */}
          {step === "schedule" && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${inline ? 'text-gray-700' : 'text-neutral-300'} mb-2`}>Frequency</label>
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
                        frequency === opt.value ? t.pillActive : t.pill
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {frequency === "every_x" && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-sm ${t.textSub}`}>Every</span>
                    <input
                      type="number" min={2} max={30} value={everyXDays}
                      onChange={(e) => setEveryXDays(parseInt(e.target.value) || 2)}
                      className={`w-16 px-3 py-1.5 rounded-lg text-sm text-center ${t.input}`}
                    />
                    <span className={`text-sm ${t.textSub}`}>days</span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${inline ? 'text-gray-700' : 'text-neutral-300'}`}>Times per day</label>
                  <button onClick={() => setTimesPerDay((prev) => [...prev, "12:00"])} className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                    + Add time
                  </button>
                </div>
                <div className="space-y-2">
                  {timesPerDay.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time" value={time}
                        onChange={(e) => setTimesPerDay((prev) => prev.map((t, j) => j === i ? e.target.value : t))}
                        className={`px-3 py-1.5 rounded-lg text-sm ${t.input}`}
                      />
                      {timesPerDay.length > 1 && (
                        <button
                          onClick={() => setTimesPerDay((prev) => prev.filter((_, j) => j !== i))}
                          className={`p-1.5 rounded-lg ${t.textMuted} hover:text-red-400 ${t.bgHover} transition-colors`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${inline ? 'text-gray-700' : 'text-neutral-300'} mb-2`}>Start date</label>
                <input
                  type="date" value={startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${t.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${inline ? 'text-gray-700' : 'text-neutral-300'} mb-2`}>Timezone</label>
                <p className={`text-sm ${t.textSub} ${t.bgSub} rounded-lg px-3 py-2 border ${t.border}`}>{timezone}</p>
              </div>
            </div>
          )}

          {/* Step 4: Select Channels */}
          {step === "channels" && (
            <div className="space-y-4">
              <p className={`text-sm ${t.textSub}`}>Select which accounts to publish to. ({selectedAccountIds.size} selected)</p>
              {accounts.length === 0 ? (
                <div className={`text-center py-12 ${t.textMuted}`}>
                  <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No connected accounts</p>
                  <p className={`text-xs ${t.textMuted} mt-1`}>Connect accounts from the Channels tab first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.filter((a) => a.status === "active").map((account) => {
                    const isSelected = selectedAccountIds.has(account._id);
                    return (
                      <div
                        key={account._id}
                        onClick={() => toggleAccount(account._id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left cursor-pointer ${
                          isSelected ? t.cardSelected : t.card
                        }`}
                      >
                        {getProviderIcon(account.provider)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${inline ? 'text-gray-800' : 'text-neutral-200'}`}>{account.providerAccountName}</p>
                          <p className={`text-xs ${t.textMuted} capitalize`}>{account.provider}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-blue-500 border-blue-500" : inline ? "border-gray-300" : "border-neutral-600"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Caption */}
          {step === "caption" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCaptionMode("shared")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    captionMode === "shared" ? t.pillActive : t.pill
                  }`}
                >
                  Same caption for all
                </button>
                <button
                  onClick={() => setCaptionMode("per-post")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    captionMode === "per-post" ? t.pillActive : t.pill
                  }`}
                >
                  Per-post captions
                </button>
              </div>

              {captionMode === "shared" ? (
                <div>
                  <textarea
                    value={sharedCaption}
                    onChange={(e) => setSharedCaption(e.target.value)}
                    placeholder="Write your caption here... (leave blank for no caption)"
                    rows={6}
                    maxLength={2200}
                    className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${t.input}`}
                  />
                  <p className={`text-xs ${t.textMuted} text-right mt-1`}>{sharedCaption.length}/2200</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedPosts.map((post) => (
                    <div key={post._id} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-md overflow-hidden ${t.bgSub} shrink-0`}>
                          <div className="w-full h-full" style={{ transform: "scale(0.08)", transformOrigin: "top left", width: "1250%", height: "1250%" }}>
                            <DynamicPost code={post.componentCode} />
                          </div>
                        </div>
                        <p className={`text-xs font-medium truncate ${inline ? 'text-gray-700' : 'text-neutral-300'}`}>{post.title}</p>
                      </div>
                      <textarea
                        value={perPostCaptions[post._id] || ""}
                        onChange={(e) => setPerPostCaptions((prev) => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Caption for this post..."
                        rows={3}
                        maxLength={2200}
                        className={`w-full px-3 py-2 rounded-lg text-xs resize-none ${t.input}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Preview Timeline */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${t.textSub}`}>Review the schedule. ({timeline.length} items)</p>
                <span className={`text-xs ${t.textMuted} ${t.bgSub} px-2 py-1 rounded-md capitalize`}>{contentType}</span>
              </div>
              {timeline.length === 0 ? (
                <p className={`text-sm ${t.textMuted} text-center py-8`}>No items. Go back and check settings.</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {timeline.map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${t.timeline}`}>
                        <span className={`text-xs font-mono ${t.textMuted} w-6`}>#{item.postIndex}</span>
                        <div className={`w-8 h-8 rounded-md overflow-hidden ${t.bgSub} shrink-0`}>
                          {(() => {
                            const post = allPosts?.find((p) => p._id === item.postId);
                            if (!post) return <Grid3X3 className={`w-4 h-4 ${t.textMuted} m-auto`} />;
                            return (
                              <div className="w-full h-full" style={{ transform: "scale(0.08)", transformOrigin: "top left", width: "1250%", height: "1250%" }}>
                                <DynamicPost code={post.componentCode} />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${inline ? 'text-gray-800' : 'text-neutral-200'}`}>{item.postTitle}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getProviderIcon(accounts.find((a) => a._id === item.accountId)?.provider || "")}
                          <span className={`text-xs ${t.textSub} whitespace-nowrap`}>
                            {item.dateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                            {item.dateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className={`text-xs ${t.textMuted} mt-3`}>
                    This will create {timeline.length} scheduled post{timeline.length !== 1 ? "s" : ""}. Posts will be captured as images and uploaded before scheduling.
                  </p>
                </>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Hidden render area for capturing post images at full resolution */}
        {(step === "preview" || isSubmitting) && (
          <div
            className="absolute"
            style={{ left: "-9999px", top: 0, width: "1080px", opacity: 0, pointerEvents: "none" }}
            aria-hidden="true"
          >
            {selectedPosts.map((post) => (
              <div
                key={post._id}
                ref={(el) => {
                  if (el) captureRefs.current.set(post._id, el);
                  else captureRefs.current.delete(post._id);
                }}
                style={{ width: "1080px", height: "1080px" }}
              >
                <PostWrapper aspectRatio="1:1" filename={post.title}>
                  <DynamicPost code={post.componentCode} />
                </PostWrapper>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Modal mode (non-inline) ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${t.bg} ${t.border} border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${t.separator}`}>
          <h2 className={`text-lg font-bold ${t.text}`}>Schedule Posts</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        {stepIndicator}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "select" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${t.textSub}`}>
                  Select the posts you want to schedule. ({selectedPostIds.size} selected)
                </p>
                {allPosts && allPosts.length > 0 && (
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {selectedPostIds.size === allPosts.length ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>
              {allPosts === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`w-6 h-6 animate-spin ${t.textMuted}`} />
                </div>
              ) : allPosts.length === 0 ? (
                <div className={`text-center py-12 ${t.textMuted}`}>
                  <Grid3X3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No posts found in this workspace</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allPosts.map((post) => {
                    const isSelected = selectedPostIds.has(post._id);
                    return (
                      <div
                        key={post._id}
                        onClick={() => togglePost(post._id)}
                        className={`relative rounded-xl border p-1.5 text-left transition-all cursor-pointer ${
                          isSelected ? t.cardSelected : t.card
                        }`}
                      >
                        <div className={`aspect-square rounded-lg overflow-hidden ${t.bgSub} mb-1.5`}>
                          <div className="w-full h-full" style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}>
                            <DynamicPost code={post.componentCode} />
                          </div>
                        </div>
                        <p className="text-xs truncate font-medium px-1 text-neutral-300">{post.title}</p>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === "type" && (
            <div className="space-y-4">
              <p className={`text-sm ${t.textSub}`}>Choose how these posts will be published.</p>
              <div className="grid grid-cols-2 gap-3">
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = contentType === ct.value;
                  const isDisabled = ct.value === "carousel" && selectedPostIds.size < 2;
                  return (
                    <button
                      key={ct.value}
                      onClick={() => !isDisabled && setContentType(ct.value)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? t.cardSelected + " text-blue-500"
                          : isDisabled
                            ? `${t.card} opacity-50 cursor-not-allowed`
                            : `${t.card} text-neutral-400`
                      }`}
                    >
                      {ct.icon}
                      <span className="text-sm font-bold">{ct.label}</span>
                      <span className={`text-[10px] ${t.textMuted}`}>{ct.desc}</span>
                      {isDisabled && (
                        <span className="text-[10px] text-amber-500">Need 2+ posts</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                        frequency === opt.value ? t.pillActive : t.pill
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-300">Times per day</label>
                  <button onClick={() => setTimesPerDay((prev) => [...prev, "12:00"])} className="text-xs text-blue-500 hover:text-blue-600 font-medium">+ Add time</button>
                </div>
                <div className="space-y-2">
                  {timesPerDay.map((time, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" value={time} onChange={(e) => setTimesPerDay((prev) => prev.map((t, j) => j === i ? e.target.value : t))} className={`px-3 py-1.5 rounded-lg text-sm ${t.input}`} />
                      {timesPerDay.length > 1 && (
                        <button onClick={() => setTimesPerDay((prev) => prev.filter((_, j) => j !== i))} className={`p-1.5 rounded-lg ${t.textMuted} hover:text-red-400 ${t.bgHover} transition-colors`}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Start date</label>
                <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setStartDate(e.target.value)} className={`px-3 py-1.5 rounded-lg text-sm ${t.input}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Timezone</label>
                <p className={`text-sm ${t.textSub} ${t.bgSub} rounded-lg px-3 py-2 border ${t.border}`}>{timezone}</p>
              </div>
            </div>
          )}

          {step === "channels" && (
            <div className="space-y-4">
              <p className={`text-sm ${t.textSub}`}>Select which accounts to publish to.</p>
              {accounts.length === 0 ? (
                <div className={`text-center py-12 ${t.textMuted}`}>
                  <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No connected accounts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.filter((a) => a.status === "active").map((account) => {
                    const isSelected = selectedAccountIds.has(account._id);
                    return (
                      <div key={account._id} onClick={() => toggleAccount(account._id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left cursor-pointer ${isSelected ? t.cardSelected : t.card}`}>
                        {getProviderIcon(account.provider)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-neutral-200">{account.providerAccountName}</p>
                          <p className={`text-xs ${t.textMuted} capitalize`}>{account.provider}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-blue-500 border-blue-500" : "border-neutral-600"}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === "caption" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setCaptionMode("shared")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${captionMode === "shared" ? t.pillActive : t.pill}`}>Same caption for all</button>
                <button onClick={() => setCaptionMode("per-post")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${captionMode === "per-post" ? t.pillActive : t.pill}`}>Per-post captions</button>
              </div>
              {captionMode === "shared" ? (
                <div>
                  <textarea value={sharedCaption} onChange={(e) => setSharedCaption(e.target.value)} placeholder="Write your caption here..." rows={6} maxLength={2200} className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${t.input}`} />
                  <p className={`text-xs ${t.textMuted} text-right mt-1`}>{sharedCaption.length}/2200</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedPosts.map((post) => (
                    <div key={post._id} className="space-y-1.5">
                      <p className="text-xs font-medium truncate text-neutral-300">{post.title}</p>
                      <textarea value={perPostCaptions[post._id] || ""} onChange={(e) => setPerPostCaptions((prev) => ({ ...prev, [post._id]: e.target.value }))} placeholder="Caption for this post..." rows={3} maxLength={2200} className={`w-full px-3 py-2 rounded-lg text-xs resize-none ${t.input}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${t.textSub}`}>Review the schedule. ({timeline.length} items)</p>
                <span className={`text-xs ${t.textMuted} ${t.bgSub} px-2 py-1 rounded-md capitalize`}>{contentType}</span>
              </div>
              {timeline.length === 0 ? (
                <p className={`text-sm ${t.textMuted} text-center py-8`}>No items. Go back and check settings.</p>
              ) : (
                <div className="space-y-2">
                  {timeline.map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${t.timeline}`}>
                      <span className={`text-xs font-mono ${t.textMuted} w-6`}>#{item.postIndex}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-neutral-200">{item.postTitle}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getProviderIcon(accounts.find((a) => a._id === item.accountId)?.provider || "")}
                        <span className={`text-xs ${t.textSub} whitespace-nowrap`}>
                          {item.dateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                          {item.dateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <p className={`text-xs ${t.textMuted} mt-3`}>
                    This will create {timeline.length} scheduled post{timeline.length !== 1 ? "s" : ""}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${t.separator}`}>
          <div className="flex-1 min-w-0">
            {error && <p className="text-xs text-red-500 truncate">{error}</p>}
            {isSubmitting && submitProgress && <p className="text-xs text-blue-500 truncate">{submitProgress}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={currentStepIndex === 0 ? onClose : goPrev}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
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

      {/* Hidden render area for capturing post images at full resolution */}
      {(step === "preview" || isSubmitting) && (
        <div
          className="fixed"
          style={{ left: "-9999px", top: 0, width: "1080px", opacity: 0, pointerEvents: "none" }}
          aria-hidden="true"
        >
          {selectedPosts.map((post) => (
            <div
              key={post._id}
              ref={(el) => {
                if (el) captureRefs.current.set(post._id, el);
                else captureRefs.current.delete(post._id);
              }}
              style={{ width: "1080px", height: "1080px" }}
            >
              <PostWrapper aspectRatio="1:1" filename={post.title}>
                <DynamicPost code={post.componentCode} />
              </PostWrapper>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
