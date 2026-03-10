"use client";

import { useState, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, ChevronRight, X, Instagram, Facebook, Send, Clock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { formatTime, getStatusColor, getCalendarColor, getDaysInMonth, getFirstDayOfMonth, type ScheduleStatus } from "./helpers";

interface ScheduledPost {
  _id: Id<"scheduledPosts">;
  socialAccountId: Id<"socialAccounts">;
  caption: string;
  scheduledFor: number;
  status: ScheduleStatus;
}

interface SocialAccount {
  _id: Id<"socialAccounts">;
  provider: "facebook" | "instagram" | "tiktok" | "twitter";
  providerAccountName: string;
}

function StatusBadge({ status }: { status: ScheduleStatus }) {
  const icons = {
    scheduled: <Clock className="w-3 h-3" />,
    publishing: <Loader2 className="w-3 h-3 animate-spin" />,
    published: <CheckCircle className="w-3 h-3" />,
    failed: <AlertCircle className="w-3 h-3" />,
    cancelled: <X className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function getProviderIcon(provider: string) {
  switch (provider) {
    case "instagram": return <Instagram className="w-3.5 h-3.5 text-pink-400" />;
    case "facebook": return <Facebook className="w-3.5 h-3.5 text-blue-400" />;
    default: return <Send className="w-3.5 h-3.5 text-neutral-400" />;
  }
}

export default function CalendarView({
  scheduledPosts,
  accounts,
}: {
  scheduledPosts: ScheduledPost[];
  accounts: SocialAccount[];
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const postsByDay = useMemo(() => {
    const map: Record<number, ScheduledPost[]> = {};
    for (const post of scheduledPosts) {
      const d = new Date(post.scheduledFor);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(post);
      }
    }
    return map;
  }, [scheduledPosts, year, month]);

  const selectedPosts = selectedDay ? postsByDay[selectedDay] || [] : [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{monthName}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-neutral-500 py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && today.getDate() === day;
            const isSelected = selectedDay === day;
            const dayPosts = postsByDay[day] || [];

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-start gap-1 transition-colors text-sm ${
                  isSelected
                    ? "bg-blue-500/20 border border-blue-500/50"
                    : isToday
                      ? "bg-neutral-800 border border-neutral-600"
                      : "hover:bg-neutral-800/50 border border-transparent"
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? "text-blue-400" : isSelected ? "text-white" : "text-neutral-400"}`}>
                  {day}
                </span>
                {dayPosts.length > 0 && (
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {dayPosts.slice(0, 3).map((p) => {
                      const acct = accounts.find((a) => a._id === p.socialAccountId);
                      return (
                        <div key={p._id} className={`w-1.5 h-1.5 rounded-full ${getCalendarColor(acct?.provider || "")}`} />
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <span className="text-[9px] text-neutral-500">+{dayPosts.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay !== null && (
        <div className="lg:w-80 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">
              {new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                weekday: "long", month: "short", day: "numeric",
              })}
            </h3>
            <button onClick={() => setSelectedDay(null)} className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedPosts.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">No posts scheduled</p>
          ) : (
            <div className="space-y-3">
              {selectedPosts.map((post) => {
                const acct = accounts.find((a) => a._id === post.socialAccountId);
                return (
                  <div key={post._id} className="bg-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">{formatTime(post.scheduledFor)}</span>
                      <StatusBadge status={post.status} />
                    </div>
                    <p className="text-sm text-neutral-300 line-clamp-2">{post.caption || "No caption"}</p>
                    {acct && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        {getProviderIcon(acct.provider)}
                        <span>{acct.providerAccountName}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
