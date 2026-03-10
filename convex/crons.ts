import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for expired subscriptions every hour
crons.interval(
  "expire stale subscriptions",
  { hours: 1 },
  internal.subscriptions.expireStale
);

// Refresh social account tokens expiring within 7 days (daily)
crons.interval(
  "refresh social tokens",
  { hours: 24 },
  internal.tokenRefresh.refreshExpiring
);

// Process scheduled social posts (every minute)
crons.interval(
  "process scheduled posts",
  { minutes: 1 },
  internal.publishing.processScheduledPosts
);

export default crons;
