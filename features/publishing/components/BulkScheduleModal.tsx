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
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Loader2,
  Image,
  Images,
  Film,
  Square,
  CheckCheck,
  Calendar,
} from "lucide-react";

interface SocialAccount {
  _id: Id<"socialAccounts">;
  provider: "facebook" | "instagram" | "tiktok" | "twitter";
  providerAccountName: string;
  status: "active" | "expired" | "revoked";
}

type ContentType = "image" | "carousel" | "story" | "reel";
type BulkStep = "type" | "select" | "schedule" | "channels" | "preview";

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ReactNode; desc: string; ratio: string }[] = [
  { value: "image", label: "Post", icon: <Image className="w-5 h-5" />, desc: "Single image post", ratio: "1:1" },
  { value: "carousel", label: "Carousel", icon: <Images className="w-5 h-5" />, desc: "Multi-slide carousel (2-10)", ratio: "1:1" },
  { value: "story", label: "Story", icon: <Square className="w-5 h-5" />, desc: "24-hour story", ratio: "9:16" },
  { value: "reel", label: "Reel", icon: <Film className="w-5 h-5" />, desc: "Short-form video", ratio: "9:16" },
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
    bg: "bg-white dark:bg-[#0a0a0a]",
    bgSub: "bg-gray-50 dark:bg-neutral-800",
    bgHover: "hover:bg-gray-100 dark:hover:bg-neutral-800",
    border: "border-gray-200 dark:border-neutral-800",
    borderHover: "hover:border-gray-300 dark:hover:border-neutral-700",
    text: "text-gray-900 dark:text-white",
    textSub: "text-gray-600 dark:text-neutral-400",
    textMuted: "text-gray-400 dark:text-neutral-500",
    input: "bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-emerald-600",
    card: "border-gray-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/50 hover:border-gray-300 dark:hover:border-neutral-700",
    cardSelected: "border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    pill: "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600",
    pillActive: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30",
    stepDone: "text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800",
    stepInactive: "text-gray-400 dark:text-neutral-600",
    stepBgInactive: "bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400",
    separator: "border-gray-200 dark:border-neutral-800",
    timeline: "bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700/50",
  } : {
    bg: "bg-neutral-900",
    bgSub: "bg-neutral-800",
    bgHover: "hover:bg-neutral-800",
    border: "border-neutral-800",
    borderHover: "hover:border-neutral-700",
    text: "text-white",
    textSub: "text-neutral-400",
    textMuted: "text-neutral-600",
    input: "bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500",
    card: "border-neutral-800 bg-neutral-800/50 hover:border-neutral-700",
    cardSelected: "border-emerald-500 bg-emerald-500/10",
    pill: "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600",
    pillActive: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    stepDone: "text-neutral-300 hover:bg-neutral-800",
    stepInactive: "text-neutral-600",
    stepBgInactive: "bg-neutral-700 text-neutral-400",
    separator: "border-neutral-800",
    timeline: "bg-neutral-800 border border-neutral-700/50",
  };
}

function ratioToKey(ratio: string): string {
  return "r" + ratio.replace(":", "_");
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

  const [step, setStep] = useState<BulkStep>("type");
  const [selectedPostIds, setSelectedPostIds] = useState<Id<"posts">[]>([]);
  const [contentType, setContentType] = useState<ContentType>("image");
  const [frequency, setFrequency] = useState<"daily" | "pick_days">("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // 0=Sun..6=Sat
  const [timesPerDay, setTimesPerDay] = useState(["09:00", "18:00"]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<Id<"socialAccounts">>>(new Set());
  // Per-post captions — initialized from DB, editable in select step
  const [postCaptions, setPostCaptions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Carousel groups — each group is one carousel post with ordered slides
  const [carouselGroups, setCarouselGroups] = useState<Id<"posts">[][]>([[]]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const captureRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const allPosts = useQuery(api.posts.listByWorkspace, { workspaceId });
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const scheduleBulk = useMutation(api.publishing.scheduleBulk);

  // Initialize captions from DB when posts load
  useEffect(() => {
    if (allPosts && Object.keys(postCaptions).length === 0) {
      const initial: Record<string, string> = {};
      for (const post of allPosts) {
        if (post.caption) initial[post._id] = post.caption;
      }
      if (Object.keys(initial).length > 0) setPostCaptions(initial);
    }
  }, [allPosts]); // eslint-disable-line react-hooks/exhaustive-deps

  const isTall = contentType === "story" || contentType === "reel";
  const aspectRatio = isTall ? "9:16" : "1:1";
  const isCarousel = contentType === "carousel";

  // All unique post IDs across all carousel groups (for capture area)
  const allCarouselPostIds = useMemo(() => {
    if (!isCarousel) return [];
    const ids = new Set<Id<"posts">>();
    for (const group of carouselGroups) {
      for (const id of group) ids.add(id);
    }
    return Array.from(ids);
  }, [isCarousel, carouselGroups]);

  // For non-carousel: toggle posts in/out of selectedPostIds
  // For carousel: toggle posts in/out of the active carousel group
  const togglePost = (id: Id<"posts">) => {
    if (isCarousel) {
      setCarouselGroups((prev) => {
        const groups = prev.map((g) => [...g]);
        const group = groups[activeGroupIndex];
        const idx = group.indexOf(id);
        if (idx !== -1) {
          group.splice(idx, 1);
        } else {
          if (group.length >= 10) return prev;
          group.push(id);
        }
        groups[activeGroupIndex] = group;
        return groups;
      });
    } else {
      setSelectedPostIds((prev) => {
        if (prev.includes(id)) return prev.filter((p) => p !== id);
        return [...prev, id];
      });
    }
  };

  const selectAll = () => {
    if (!allPosts) return;
    if (selectedPostIds.length === allPosts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(allPosts.map((p) => p._id));
    }
  };

  const addCarouselGroup = () => {
    setCarouselGroups((prev) => [...prev, []]);
    setActiveGroupIndex(carouselGroups.length);
  };

  const removeCarouselGroup = (index: number) => {
    if (carouselGroups.length <= 1) return;
    setCarouselGroups((prev) => prev.filter((_, i) => i !== index));
    setActiveGroupIndex((prev) => Math.min(prev, carouselGroups.length - 2));
  };

  const toggleAccount = (id: Id<"socialAccounts">) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Valid carousel groups (2+ slides each)
  const validCarouselGroups = useMemo(() =>
    carouselGroups.filter((g) => g.length >= 2),
  [carouselGroups]);

  const selectedPosts = useMemo(() => {
    if (!allPosts) return [];
    const ids = isCarousel ? allCarouselPostIds : selectedPostIds;
    return ids.map((id) => allPosts.find((p) => p._id === id)).filter(Boolean) as typeof allPosts;
  }, [allPosts, selectedPostIds, isCarousel, allCarouselPostIds]);

  /** Get the right code for the current aspect ratio */
  const getPostCode = useCallback((post: { componentCode: string; ratioOverrides?: Record<string, string> }) => {
    if (!isTall) return post.componentCode;
    const key = ratioToKey("9:16");
    return post.ratioOverrides?.[key] || post.componentCode;
  }, [isTall]);

  const skipChannels = accounts.filter((a) => a.status === "active").length === 0;

  const timeline = useMemo(() => {
    const items: { postIndex: number; postId: Id<"posts">; postTitle: string; dateTime: Date; accountName: string; accountId?: Id<"socialAccounts">; carouselGroupIndex?: number }[] = [];
    const accountIds = Array.from(selectedAccountIds);
    const sortedTimes = [...timesPerDay].sort();
    const hasAccounts = accountIds.length > 0;

    if (sortedTimes.length === 0) return items;

    // Helper: push one timeline entry per account (or once with no account for preview)
    const pushForAccounts = (base: Omit<typeof items[number], "accountName" | "accountId">) => {
      if (hasAccounts) {
        for (const accountId of accountIds) {
          const account = accounts.find((a) => a._id === accountId);
          items.push({ ...base, accountName: account?.providerAccountName || "Unknown", accountId });
        }
      } else {
        items.push({ ...base, accountName: "" });
      }
    };

    // Helper: check if a date qualifies based on frequency
    const isValidDay = (date: Date) => {
      if (frequency === "daily") return true;
      return selectedDays.includes(date.getDay());
    };

    // Total items to schedule
    const totalItems = isCarousel ? validCarouselGroups.length : selectedPostIds.length;
    if (totalItems === 0) return items;

    const start = new Date(startDate + "T00:00:00");
    let dayOffset = 0;
    let itemIdx = 0;
    const maxDays = 365; // safety limit

    while (itemIdx < totalItems && dayOffset < maxDays) {
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);
      dayOffset++;

      if (!isValidDay(date)) continue;

      for (const time of sortedTimes) {
        if (itemIdx >= totalItems) break;
        const [hours, minutes] = time.split(":").map(Number);
        const dateTime = new Date(date);
        dateTime.setHours(hours, minutes, 0, 0);

        if (isCarousel) {
          const group = validCarouselGroups[itemIdx];
          const originalIndex = carouselGroups.indexOf(group);
          pushForAccounts({
            postIndex: itemIdx + 1,
            postId: group[0],
            postTitle: `Carousel ${itemIdx + 1} (${group.length} slides)`,
            dateTime,
            carouselGroupIndex: originalIndex,
          });
        } else {
          const post = allPosts?.find((p) => p._id === selectedPostIds[itemIdx]);
          pushForAccounts({
            postIndex: itemIdx + 1,
            postId: selectedPostIds[itemIdx],
            postTitle: post?.title || `Post ${itemIdx + 1}`,
            dateTime,
          });
        }
        itemIdx++;
      }
    }

    return items;
  }, [selectedPostIds, selectedAccountIds, timesPerDay, startDate, frequency, selectedDays, allPosts, accounts, isCarousel, validCarouselGroups, carouselGroups]);

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
      const { toPng } = await import("html-to-image");
      const captureSize = isTall ? { w: 1080, h: 1920 } : { w: 1080, h: 1080 };

      // Helper: capture a post element and upload the image
      const captureAndUpload = async (postId: string, label: string) => {
        const el = captureRefs.current.get(postId);
        if (!el) throw new Error(`Post element not found for capture. Please try again.`);

        const dataUrl = await toPng(el, { pixelRatio: 2, width: captureSize.w, height: captureSize.h });
        const blob = await (await fetch(dataUrl)).blob();

        const uploadUrl = await generateUploadUrl();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/png" },
          body: blob,
        });
        if (!uploadRes.ok) throw new Error(`Failed to upload ${label}. Please try again.`);
        const { storageId } = await uploadRes.json();
        if (!storageId) throw new Error(`Upload returned empty ID for ${label}. Please try again.`);
        return storageId as Id<"_storage">;
      };

      // Only items with a real account can be submitted
      const submittableItems = timeline.filter((item) => item.accountId != null);
      if (submittableItems.length === 0) {
        setError("Connect at least one account before scheduling.");
        return;
      }

      if (isCarousel) {
        // Capture images for each carousel group separately
        const groupMediaMap = new Map<number, Id<"_storage">[]>();
        const totalSlides = validCarouselGroups.reduce((sum, g) => sum + g.length, 0);
        let capturedCount = 0;

        setSubmitProgress(`Capturing ${totalSlides} slides across ${validCarouselGroups.length} carousels...`);

        for (let gi = 0; gi < validCarouselGroups.length; gi++) {
          const group = validCarouselGroups[gi];
          const mediaIds: Id<"_storage">[] = [];

          for (const postId of group) {
            capturedCount++;
            setSubmitProgress(`Capturing slide ${capturedCount} of ${totalSlides}...`);
            mediaIds.push(await captureAndUpload(postId, `slide ${capturedCount}`));
          }

          const originalIndex = carouselGroups.indexOf(group);
          groupMediaMap.set(originalIndex, mediaIds);
        }

        setSubmitProgress("Scheduling carousels...");

        const batchId = `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const entries = submittableItems.map((item) => {
          const gi = item.carouselGroupIndex;
          const group = gi != null ? carouselGroups[gi] : undefined;
          const firstPostId = group?.[0];
          return {
            postId: item.postId,
            socialAccountId: item.accountId!,
            contentType,
            caption: firstPostId ? (postCaptions[firstPostId] || "") : "",
            mediaFileIds: gi != null ? (groupMediaMap.get(gi) || []) : [],
            scheduledFor: item.dateTime.getTime(),
            timezone,
          };
        });

        await scheduleBulk({ workspaceId, batchId, entries });
      } else {
        // Non-carousel: capture each post individually
        const postMediaMap = new Map<string, Id<"_storage">[]>();
        setSubmitProgress(`Capturing ${selectedPostIds.length} post images...`);

        for (let i = 0; i < selectedPostIds.length; i++) {
          const postId = selectedPostIds[i];
          setSubmitProgress(`Capturing post ${i + 1} of ${selectedPostIds.length}...`);
          postMediaMap.set(postId, [await captureAndUpload(postId, `post ${i + 1}`)]);
        }

        setSubmitProgress("Scheduling posts...");

        const batchId = `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const entries = submittableItems.map((item) => ({
          postId: item.postId,
          socialAccountId: item.accountId!,
          contentType,
          caption: postCaptions[item.postId] || "",
          mediaFileIds: postMediaMap.get(item.postId) || [],
          scheduledFor: item.dateTime.getTime(),
          timezone,
        }));

        await scheduleBulk({ workspaceId, batchId, entries });
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule posts");
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  }, [isSubmitting, timeline, selectedPostIds, contentType, postCaptions, generateUploadUrl, scheduleBulk, workspaceId, timezone, onClose, isTall, isCarousel, validCarouselGroups, carouselGroups]);

  const steps: { key: BulkStep; label: string }[] = [
    { key: "type", label: "Type" },
    { key: "select", label: "Select Posts" },
    { key: "schedule", label: "Schedule" },
    { key: "channels", label: "Channels" },
    { key: "preview", label: "Preview" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const canProceed = () => {
    switch (step) {
      case "type": return true;
      case "select": return isCarousel ? validCarouselGroups.length > 0 : selectedPostIds.length > 0;
      case "schedule": return timesPerDay.length > 0 && startDate;
      case "channels": return skipChannels || selectedAccountIds.size > 0;
      case "preview": return timeline.length > 0;
      default: return false;
    }
  };

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      let nextStep = steps[currentStepIndex + 1].key;
      // When switching type, clear selection and refs (ratio changes)
      if (step === "type") {
        setSelectedPostIds([]);
        setCarouselGroups([[]]);
        setActiveGroupIndex(0);
        captureRefs.current.clear();
      }
      // Skip channels step if no accounts connected
      if (nextStep === "channels" && skipChannels) {
        const channelsIdx = steps.findIndex((s) => s.key === "channels");
        if (channelsIdx < steps.length - 1) nextStep = steps[channelsIdx + 1].key;
      }
      setStep(nextStep);
    }
  };
  const goPrev = () => {
    if (currentStepIndex > 0) {
      let prevStep = steps[currentStepIndex - 1].key;
      // Skip channels step if no accounts connected
      if (prevStep === "channels" && skipChannels) {
        const channelsIdx = steps.findIndex((s) => s.key === "channels");
        if (channelsIdx > 0) prevStep = steps[channelsIdx - 1].key;
      }
      setStep(prevStep);
    }
  };

  // ── Step renderers (shared between inline & modal) ──

  const renderTypeStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className={`text-xs font-semibold ${t.textMuted} uppercase tracking-wider mb-4`}>
          What do you want to schedule?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONTENT_TYPES.map((ct) => {
            const isSelected = contentType === ct.value;
            return (
              <button
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                    : `border-gray-200 dark:border-neutral-800 ${t.bgSub} ${inline ? 'text-gray-600 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-neutral-700' : 'text-neutral-400 hover:border-neutral-600'}`
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-emerald-100 dark:bg-emerald-900/30" : inline ? "bg-gray-100 dark:bg-neutral-700" : "bg-neutral-700"
                }`}>
                  {ct.icon}
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold block">{ct.label}</span>
                  <span className={`text-[10px] ${isSelected ? "text-emerald-500" : t.textMuted}`}>{ct.ratio}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info about the selected type */}
      <div className={`rounded-xl p-4 ${inline ? 'bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700' : 'bg-neutral-800 border border-neutral-700'}`}>
        <p className={`text-sm ${inline ? 'text-gray-700 dark:text-neutral-300' : 'text-neutral-300'}`}>
          {contentType === "image" && "Each selected post will be scheduled as a separate image post (1:1)."}
          {contentType === "carousel" && "Create one or more carousel posts (1:1). Each carousel needs 2-10 slides. You can group posts into separate carousels."}
          {contentType === "story" && "Each selected post will be scheduled as a story (9:16). Posts with 9:16 variants will use that version."}
          {contentType === "reel" && "Each selected post will be scheduled as a reel (9:16). Posts with 9:16 variants will use that version."}
        </p>
      </div>
    </div>
  );

  const renderSelectStep = () => {
    const activeGroup = isCarousel ? carouselGroups[activeGroupIndex] || [] : [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${t.textSub}`}>
              {isCarousel
                ? `Add posts to Carousel ${activeGroupIndex + 1}. (${activeGroup.length} slides)`
                : `Select posts to schedule as ${contentType === "image" ? "posts" : contentType + "s"}. (${selectedPostIds.length} selected)`
              }
            </p>
            {isCarousel && (
              <p className={`text-xs ${t.textMuted} mt-1`}>
                Click posts to add/remove from the active carousel. Each carousel needs 2-10 slides.
              </p>
            )}
          </div>
          {!isCarousel && allPosts && allPosts.length > 0 && (
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {selectedPostIds.length === allPosts.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        {/* Carousel group tabs */}
        {isCarousel && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {carouselGroups.map((group, gi) => (
              <button
                key={gi}
                onClick={() => setActiveGroupIndex(gi)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  gi === activeGroupIndex
                    ? "bg-emerald-600 text-white shadow-sm"
                    : group.length >= 2
                      ? `${inline ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`
                      : t.pill
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                Carousel {gi + 1}
                <span className={`text-[10px] ${gi === activeGroupIndex ? 'text-emerald-200' : t.textMuted}`}>
                  ({group.length})
                </span>
                {carouselGroups.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeCarouselGroup(gi); }}
                    className={`ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ${
                      gi === activeGroupIndex ? 'text-emerald-200 hover:text-white' : ''
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={addCarouselGroup}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 border border-dashed border-emerald-300 transition-colors whitespace-nowrap"
            >
              + New Carousel
            </button>
          </div>
        )}

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
          <>
            {/* Post grid */}
            <div className={isTall
              ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
            }>
              {allPosts.map((post) => {
                const code = getPostCode(post);

                // For carousel: check if this post is in the active group
                let isSelected = false;
                let selIndex = -1;
                let inOtherGroup = -1;

                if (isCarousel) {
                  selIndex = activeGroup.indexOf(post._id);
                  isSelected = selIndex !== -1;
                  // Check if in another group
                  if (!isSelected) {
                    for (let gi = 0; gi < carouselGroups.length; gi++) {
                      if (gi !== activeGroupIndex && carouselGroups[gi].includes(post._id)) {
                        inOtherGroup = gi;
                        break;
                      }
                    }
                  }
                } else {
                  selIndex = selectedPostIds.indexOf(post._id);
                  isSelected = selIndex !== -1;
                }

                return (
                  <div
                    key={post._id}
                    onClick={() => {
                      if (inOtherGroup !== -1) return; // Can't select — already in another carousel
                      togglePost(post._id);
                    }}
                    className={`relative rounded-xl border p-1.5 text-left transition-all ${
                      inOtherGroup !== -1
                        ? `${t.card} opacity-40 cursor-not-allowed`
                        : isSelected
                          ? `${t.cardSelected} cursor-pointer`
                          : `${t.card} cursor-pointer`
                    }`}
                  >
                    <div className={`${isTall ? 'aspect-[9/16]' : 'aspect-square'} rounded-lg overflow-hidden ${t.bgSub} mb-1.5`}>
                      <div className="w-full h-full" style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}>
                        <DynamicPost code={code} />
                      </div>
                    </div>
                    <p className={`text-xs truncate font-medium px-1 ${inline ? 'text-gray-800 dark:text-neutral-300' : 'text-neutral-300'}`}>{post.title}</p>
                    {/* Caption: always visible, editable */}
                    <textarea
                      value={postCaptions[post._id] || ""}
                      onChange={(e) => {
                        setPostCaptions((prev) => ({ ...prev, [post._id]: e.target.value }));
                        // Auto-resize
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      onFocus={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Add caption..."
                      rows={1}
                      maxLength={2200}
                      className={`w-full mt-1 px-1.5 py-1 rounded-md text-[10px] leading-relaxed resize-none overflow-hidden ${t.input} border-0 ${
                        isSelected ? (inline ? 'bg-emerald-50' : 'bg-emerald-500/10') : (inline ? 'bg-gray-50' : 'bg-neutral-800/50')
                      }`}
                    />
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
                        {isCarousel ? (
                          <span className="text-[11px] font-bold text-white">{selIndex + 1}</span>
                        ) : (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    )}
                    {/* In another carousel indicator */}
                    {inOtherGroup !== -1 && (
                      <div className={`absolute top-3 right-3 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${inline ? 'bg-gray-200 text-gray-500' : 'bg-neutral-700 text-neutral-400'}`}>
                        C{inOtherGroup + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Carousel groups preview */}
            {isCarousel && carouselGroups.some((g) => g.length > 0) && (
              <div className="space-y-3">
                {carouselGroups.map((group, gi) => {
                  if (group.length === 0) return null;
                  const groupPosts = group.map((id) => allPosts.find((p) => p._id === id)).filter(Boolean) as typeof allPosts;
                  const isValid = group.length >= 2;
                  const isActive = gi === activeGroupIndex;
                  return (
                    <div
                      key={gi}
                      onClick={() => setActiveGroupIndex(gi)}
                      className={`rounded-xl p-3 cursor-pointer transition-colors ${
                        isActive
                          ? inline ? 'bg-emerald-50 border-2 border-emerald-300' : 'bg-emerald-500/10 border-2 border-emerald-500/30'
                          : isValid
                            ? inline ? 'bg-green-50 border border-green-200' : 'bg-green-500/5 border border-green-500/20'
                            : inline ? 'bg-gray-50 border border-gray-200' : 'bg-neutral-800/50 border border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-xs font-semibold ${
                          isActive ? (inline ? 'text-emerald-700' : 'text-emerald-400')
                            : isValid ? (inline ? 'text-green-700' : 'text-green-400')
                            : t.textSub
                        }`}>
                          Carousel {gi + 1} — {group.length} slide{group.length !== 1 ? 's' : ''}
                          {!isValid && <span className="text-amber-500 ml-2">(need {2 - group.length} more)</span>}
                        </p>
                        {isValid && <Check className={`w-3.5 h-3.5 ${inline ? 'text-green-500' : 'text-green-400'}`} />}
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                        {groupPosts.map((post, i) => (
                          <div key={post._id} className="flex items-center gap-1 shrink-0">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-md overflow-hidden ${t.bgSub} border ${
                                isActive ? (inline ? 'border-emerald-200' : 'border-emerald-500/30') : (inline ? 'border-gray-200' : 'border-neutral-600')
                              }`}>
                                <div className="w-full h-full" style={{ transform: "scale(0.1)", transformOrigin: "top left", width: "1000%", height: "1000%" }}>
                                  <DynamicPost code={getPostCode(post)} />
                                </div>
                              </div>
                              <span className={`absolute -top-1 -left-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shadow ${
                                isActive ? 'bg-emerald-600 text-white' : isValid ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                              }`}>
                                {i + 1}
                              </span>
                            </div>
                            {i < groupPosts.length - 1 && (
                              <ChevronRight className={`w-2.5 h-2.5 ${t.textMuted}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderScheduleStep = () => {
    const showFrequency = !isCarousel || validCarouselGroups.length > 1;
    const showMultipleTimes = !isCarousel || validCarouselGroups.length > 1;
    const displayTimes = showMultipleTimes ? timesPerDay : [timesPerDay[0] || "09:00"];

    return (
      <div className="max-w-lg mx-auto">
        {/* Info for carousel */}
        {isCarousel && (
          <div className={`rounded-xl p-3 mb-6 ${inline ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
            <p className={`text-xs ${inline ? 'text-emerald-700' : 'text-emerald-400'}`}>
              {validCarouselGroups.length === 1
                ? `Your carousel (${validCarouselGroups[0].length} slides) will be published as a single post.`
                : `${validCarouselGroups.length} carousels will be scheduled. Each will be a separate post.`
              }
            </p>
          </div>
        )}

        <div className={`rounded-2xl border ${t.border} ${inline ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-800/30'} divide-y ${t.separator}`}>
          {/* Frequency */}
          {showFrequency && (
            <div className="p-4">
              <label className={`block text-xs font-semibold ${t.textMuted} uppercase tracking-wider mb-3`}>Frequency</label>
              <div className="flex gap-2">
                {([
                  { value: "daily" as const, label: "Every day" },
                  { value: "pick_days" as const, label: "Pick days" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFrequency(opt.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      frequency === opt.value ? t.pillActive : t.pill
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {frequency === "pick_days" && (
                <div className="flex gap-1.5 mt-3">
                  {(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map((day, i) => {
                    const isActive = selectedDays.includes(i);
                    return (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDays((prev) =>
                            isActive
                              ? prev.length > 1 ? prev.filter((d) => d !== i) : prev // keep at least 1
                              : [...prev, i].sort()
                          );
                        }}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                          isActive
                            ? "bg-[#1B4332] text-white"
                            : `${t.pill}`
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Times */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className={`text-xs font-semibold ${t.textMuted} uppercase tracking-wider`}>
                {showMultipleTimes ? "Times per day" : "Publish time"}
              </label>
              {showMultipleTimes && (
                <button onClick={() => setTimesPerDay((prev) => [...prev, "12:00"])} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold">
                  + Add
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {displayTimes.map((time, i) => (
                <div key={i} className={`flex items-center gap-1.5 rounded-xl ${inline ? 'bg-gray-50 border border-gray-200' : 'bg-neutral-800 border border-neutral-700'} pl-3 pr-1.5 py-1.5`}>
                  <input
                    type="time" value={time}
                    onChange={(e) => setTimesPerDay((prev) => prev.map((t, j) => j === i ? e.target.value : t))}
                    className={`text-sm font-medium bg-transparent ${inline ? 'text-gray-900 dark:text-white' : 'text-white'} focus:outline-none`}
                    style={{ colorScheme: inline ? 'light' : 'dark' }}
                  />
                  {showMultipleTimes && timesPerDay.length > 1 && (
                    <button
                      onClick={() => setTimesPerDay((prev) => prev.filter((_, j) => j !== i))}
                      className={`p-1 rounded-lg ${t.textMuted} hover:text-red-400 transition-colors`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar + Timezone */}
          <div className="p-4">
            <label className={`block text-xs font-semibold ${t.textMuted} uppercase tracking-wider mb-3`}>
              {isCarousel ? "Publish date" : "Start date"}
            </label>
            {(() => {
              const selected = new Date(startDate + "T00:00:00");
              const today = new Date(); today.setHours(0, 0, 0, 0);
              const [viewYear, viewMonth] = [selected.getFullYear(), selected.getMonth()];

              const firstDay = new Date(viewYear, viewMonth, 1).getDay();
              const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
              const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

              const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];
              // Previous month padding
              for (let i = firstDay - 1; i >= 0; i--) {
                const d = prevMonthDays - i;
                const m = viewMonth === 0 ? 11 : viewMonth - 1;
                const y = viewMonth === 0 ? viewYear - 1 : viewYear;
                cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
              }
              // Current month
              for (let d = 1; d <= daysInMonth; d++) {
                cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
              }
              // Next month padding
              const remaining = 7 - (cells.length % 7);
              if (remaining < 7) {
                for (let d = 1; d <= remaining; d++) {
                  const m = viewMonth === 11 ? 0 : viewMonth + 1;
                  const y = viewMonth === 11 ? viewYear + 1 : viewYear;
                  cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
                }
              }

              const monthName = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

              const goMonth = (delta: number) => {
                const d = new Date(viewYear, viewMonth + delta, 1);
                // Move selected to first valid day of new month
                const newDate = new Date(Math.max(d.getTime(), today.getTime()));
                setStartDate(newDate.toISOString().split("T")[0]);
              };

              return (
                <div>
                  {/* Month nav */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => goMonth(-1)}
                      disabled={viewYear === today.getFullYear() && viewMonth <= today.getMonth()}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${t.bgHover} ${t.textSub}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`text-sm font-semibold ${t.text}`}>{monthName}</span>
                    <button onClick={() => goMonth(1)} className={`p-1.5 rounded-lg transition-colors ${t.bgHover} ${t.textSub}`}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <div key={i} className={`text-center text-[10px] font-semibold ${t.textMuted} py-1`}>{d}</div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7">
                    {cells.map((cell, i) => {
                      const cellDate = new Date(cell.year, cell.month, cell.day);
                      const isPast = cellDate < today;
                      const isSelected = cell.isCurrentMonth && cell.day === selected.getDate() && cell.month === selected.getMonth() && cell.year === selected.getFullYear();
                      const isToday = cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear();

                      return (
                        <button
                          key={i}
                          disabled={isPast || !cell.isCurrentMonth}
                          onClick={() => {
                            const pad = (n: number) => String(n).padStart(2, "0");
                            setStartDate(`${cell.year}-${pad(cell.month + 1)}-${pad(cell.day)}`);
                          }}
                          className={`relative aspect-square flex items-center justify-center text-xs rounded-lg transition-all ${
                            isSelected
                              ? "bg-[#1B4332] text-white font-bold"
                              : isToday
                                ? `font-bold ${inline ? 'text-emerald-700' : 'text-emerald-400'}`
                                : !cell.isCurrentMonth || isPast
                                  ? `${t.textMuted} opacity-30 cursor-not-allowed`
                                  : `${t.textSub} ${t.bgHover} cursor-pointer`
                          }`}
                        >
                          {cell.day}
                          {isToday && !isSelected && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Timezone below calendar */}
            <div className={`flex items-center gap-2 mt-4 pt-3 border-t ${t.separator}`}>
              <span className={`text-[10px] font-semibold ${t.textMuted} uppercase tracking-wider`}>Timezone</span>
              <span className={`text-xs font-medium ${t.textSub}`}>{timezone}</span>
            </div>
          </div>
        </div>

        {/* Quick summary */}
        {showFrequency && (
          <p className={`text-xs ${t.textMuted} mt-4 text-center`}>
            {isCarousel
              ? `${validCarouselGroups.length} carousel${validCarouselGroups.length !== 1 ? 's' : ''}`
              : `${selectedPostIds.length} post${selectedPostIds.length !== 1 ? 's' : ''}`
            }
            {" · "}
            {frequency === "daily" ? "every day" : `${selectedDays.length} day${selectedDays.length !== 1 ? "s" : ""}/week`}
            {" · "}
            {displayTimes.length} time{displayTimes.length !== 1 ? "s" : ""}/day
          </p>
        )}
      </div>
    );
  };

  const renderChannelsStep = () => (
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
                  <p className={`text-sm font-medium truncate ${inline ? 'text-gray-800 dark:text-neutral-200' : 'text-neutral-200'}`}>{account.providerAccountName}</p>
                  <p className={`text-xs ${t.textMuted} capitalize`}>{account.provider}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? "bg-emerald-600 border-emerald-600" : inline ? "border-gray-300" : "border-neutral-600"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPreviewStep = () => {
    // Deduplicate: for carousel, group timeline items by carouselGroupIndex; for posts, by postId
    const previewCards = isCarousel
      ? validCarouselGroups.map((group, gi) => {
          const originalIndex = carouselGroups.indexOf(group);
          const matchingItems = timeline.filter((item) => item.carouselGroupIndex === originalIndex);
          const firstItem = matchingItems[0];
          const groupPosts = group.map((id) => allPosts?.find((p) => p._id === id)).filter(Boolean) as NonNullable<typeof allPosts>;
          const firstPostId = group[0];
          return { key: `carousel-${gi}`, groupPosts, caption: firstPostId ? (postCaptions[firstPostId] || "") : "", dateTime: firstItem?.dateTime, accounts: matchingItems.map((m) => m.accountId).filter(Boolean) as Id<"socialAccounts">[], title: `Carousel ${gi + 1}`, slideCount: group.length };
        })
      : selectedPostIds.map((postId) => {
          const post = allPosts?.find((p) => p._id === postId);
          const matchingItems = timeline.filter((item) => item.postId === postId);
          const firstItem = matchingItems[0];
          return { key: postId, post, caption: postCaptions[postId] || "", dateTime: firstItem?.dateTime, accounts: matchingItems.map((m) => m.accountId).filter(Boolean) as Id<"socialAccounts">[], title: post?.title || "Post" };
        });

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${t.text}`}>
            {timeline.length} scheduled item{timeline.length !== 1 ? "s" : ""}
          </p>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
            contentType === "story" || contentType === "reel"
              ? "bg-purple-50 text-purple-600 border border-purple-200"
              : contentType === "carousel"
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}>
            {contentType}
          </span>
        </div>

        {previewCards.length === 0 ? (
          <p className={`text-sm ${t.textMuted} text-center py-8`}>No items. Go back and select posts.</p>
        ) : (
          <div className={isTall
            ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          }>
            {previewCards.map((card) => (
              <div key={card.key} className={`relative rounded-xl border p-1.5 ${t.card}`}>
                {/* Post preview — same as select step */}
                <div className={`${isTall ? 'aspect-[9/16]' : 'aspect-square'} rounded-lg overflow-hidden ${t.bgSub} mb-1.5`}>
                  {"groupPosts" in card ? (
                    <div className="w-full h-full" style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}>
                      <DynamicPost code={getPostCode(card.groupPosts[0])} />
                    </div>
                  ) : "post" in card && card.post ? (
                    <div className="w-full h-full" style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%", height: "400%" }}>
                      <DynamicPost code={getPostCode(card.post)} />
                    </div>
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${t.bgSub}`}>
                      <Grid3X3 className={`w-8 h-8 ${t.textMuted}`} />
                    </div>
                  )}
                </div>

                {/* Slide count badge for carousel */}
                {"slideCount" in card && (
                  <div className={`absolute top-3 left-3 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${inline ? 'bg-black/60 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                    {card.slideCount} slides
                  </div>
                )}

                {/* Date badge */}
                {card.dateTime && (
                  <div className={`flex items-center gap-1 px-1 mb-1`}>
                    <Calendar className={`w-2.5 h-2.5 ${t.textMuted}`} />
                    <span className={`text-[10px] ${t.textMuted}`}>
                      {card.dateTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })}{" "}
                      {card.dateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                    </span>
                    {card.accounts.length > 0 && (
                      <div className="flex items-center gap-0.5 ml-auto">
                        {card.accounts.map((accId) => {
                          const acc = accounts.find((a) => a._id === accId);
                          return acc ? <span key={accId} className="scale-75">{getProviderIcon(acc.provider)}</span> : null;
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <p className={`text-xs truncate font-medium px-1 ${inline ? 'text-gray-800 dark:text-neutral-300' : 'text-neutral-300'}`}>{card.title}</p>

                {/* Caption */}
                <p className={`text-[10px] leading-relaxed px-1 mt-0.5 ${card.caption ? t.textSub : t.textMuted} ${card.caption ? 'line-clamp-3' : 'italic'}`}>
                  {card.caption || "No caption"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <p className={`text-xs ${t.textMuted}`}>
          {selectedAccountIds.size === 0
            ? "Preview only — connect an account to publish."
            : isCarousel
              ? validCarouselGroups.length === 1
                ? `This carousel (${validCarouselGroups[0].length} slides) will be published to ${selectedAccountIds.size} account${selectedAccountIds.size !== 1 ? "s" : ""}.`
                : `${validCarouselGroups.length} carousels will be scheduled to ${selectedAccountIds.size} account${selectedAccountIds.size !== 1 ? "s" : ""}.`
              : `${timeline.length} ${contentType}${timeline.length !== 1 ? "s" : ""} scheduled.`
          }
        </p>
      </div>
    );
  };

  // Hidden capture area for rendering posts at correct aspect ratio
  const renderCaptureArea = (positionClass: string) => (
    (step === "preview" || isSubmitting) ? (
      <div
        className={positionClass}
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
            style={{ width: "1080px", height: isTall ? "1920px" : "1080px" }}
          >
            <PostWrapper aspectRatio={aspectRatio as "1:1" | "9:16"} filename={post.title}>
              <DynamicPost code={getPostCode(post)} />
            </PostWrapper>
          </div>
        ))}
      </div>
    ) : null
  );

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
              s.key === step ? "bg-emerald-600 text-white"
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

  // ── Inline page mode ──
  if (inline) {
    return (
      <div className="flex-1 bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden relative">
        {/* Floating Nav */}
        <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
          <nav className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Send size={14} className="text-slate-400 dark:text-neutral-500 hidden md:block" />
              <span className="text-sm font-black text-slate-900 dark:text-white">Schedule</span>
            </div>

            <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />

            {stepIndicator}

            <div className="flex-1" />

            <div className="flex items-center gap-2 shrink-0">
              {currentStepIndex > 0 && (
                <button
                  onClick={goPrev}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
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

        {(error || (isSubmitting && submitProgress)) && (
          <div className="px-6">
            <div className="max-w-6xl mx-auto">
              {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">{error}</p>}
              {isSubmitting && submitProgress && <p className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2">{submitProgress}</p>}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {step === "type" && renderTypeStep()}
            {step === "select" && renderSelectStep()}
            {step === "schedule" && renderScheduleStep()}
            {step === "channels" && renderChannelsStep()}
            {step === "preview" && renderPreviewStep()}
          </div>
        </div>

        {renderCaptureArea("absolute")}
      </div>
    );
  }

  // ── Modal mode ──
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`${t.bg} ${t.border} border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${t.separator}`}>
          <h2 className={`text-lg font-bold ${t.text}`}>Schedule Posts</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {stepIndicator}

        <div className="flex-1 overflow-y-auto p-6">
          {step === "type" && renderTypeStep()}
          {step === "select" && renderSelectStep()}
          {step === "schedule" && renderScheduleStep()}
          {step === "channels" && renderChannelsStep()}
          {step === "preview" && renderPreviewStep()}
        </div>

        <div className={`flex items-center justify-between px-6 py-4 border-t ${t.separator}`}>
          <div className="flex-1 min-w-0">
            {error && <p className="text-xs text-red-500 truncate">{error}</p>}
            {isSubmitting && submitProgress && <p className="text-xs text-emerald-600 truncate">{submitProgress}</p>}
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
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? "Scheduling..." : "Confirm & Schedule"}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-[#1B4332] text-white hover:bg-[#2D6A4F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {renderCaptureArea("fixed")}
    </div>
  );
}
