import type { ReactNode } from "react";

export type ScheduleStatus = "scheduled" | "publishing" | "published" | "failed" | "cancelled";

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(ts: number): string {
  return `${formatDate(ts)} ${formatTime(ts)}`;
}

export function getStatusColor(status: ScheduleStatus) {
  switch (status) {
    case "scheduled":
    case "publishing":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "published":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "failed":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "cancelled":
      return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
  }
}

export function getCalendarColor(provider: string) {
  switch (provider) {
    case "instagram":
      return "bg-pink-500";
    case "facebook":
      return "bg-blue-500";
    default:
      return "bg-neutral-500";
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
