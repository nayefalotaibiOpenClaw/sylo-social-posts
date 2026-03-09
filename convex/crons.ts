import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check for expired subscriptions every hour
crons.interval(
  "expire stale subscriptions",
  { hours: 1 },
  internal.subscriptions.expireStale
);

export default crons;
