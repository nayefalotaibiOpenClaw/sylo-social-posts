"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import {
  Loader2,
  CreditCard,
  Calendar,
  BarChart3,
  Zap,
  Crown,
  Sparkles,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const usage = useQuery(api.subscriptions.getUsage);
  const activeSub = useQuery(api.subscriptions.getActive);
  const payments = useQuery(api.payments.listMine);
  const subHistory = useQuery(api.subscriptions.list);
  const cancelSub = useMutation(api.subscriptions.cancel);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && process.env.NODE_ENV !== "development") {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || user === undefined || usage === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-3">Please log in</h1>
          <p className="text-neutral-400 mb-6">You need to be logged in to manage billing.</p>
          <Link
            href="/login"
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelSub();
      setShowCancelConfirm(false);
      alert("Subscription cancelled successfully.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const planIcon = (plan: string | null) => {
    if (plan === "pro") return <Crown className="w-5 h-5 text-amber-400" />;
    if (plan === "starter") return <Zap className="w-5 h-5 text-blue-400" />;
    return <Sparkles className="w-5 h-5 text-emerald-400" />;
  };

  const statusBadge = (status: string) => {
    if (status === "active")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/30 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" /> Active
        </span>
      );
    if (status === "cancelled")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-950/50 text-amber-400 border border-amber-800/30 px-2.5 py-1 rounded-full">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700 px-2.5 py-1 rounded-full">
        <Clock className="w-3 h-3" /> Expired
      </span>
    );
  };

  const paymentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-emerald-950/50 text-emerald-400 border-emerald-800/30",
      pending: "bg-amber-950/50 text-amber-400 border-amber-800/30",
      failed: "bg-red-950/50 text-red-400 border-red-800/30",
      refunded: "bg-blue-950/50 text-blue-400 border-blue-800/30",
    };
    return (
      <span
        className={`inline-flex text-xs font-medium border px-2 py-0.5 rounded-full capitalize ${styles[status] || styles.pending}`}
      >
        {status}
      </span>
    );
  };

  const postsPercent = usage ? Math.min(100, Math.round((usage.postsUsed / Math.max(1, usage.postsLimit)) * 100)) : 0;
  const tokensPercent = usage ? Math.min(100, Math.round((usage.aiTokensUsed / Math.max(1, usage.aiTokensLimit)) * 100)) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/workspaces"
            className="text-sm text-neutral-400 hover:text-white transition mb-6 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to workspaces
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-neutral-400 mt-2">Manage your plan, usage, and payment history.</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {planIcon(usage?.plan ?? null)}
              <div>
                <h2 className="text-lg font-semibold capitalize">
                  {usage?.plan || "No Plan"} {activeSub?.billingPeriod && (
                    <span className="text-sm text-neutral-500 font-normal capitalize">({activeSub.billingPeriod})</span>
                  )}
                </h2>
                {activeSub && (
                  <p className="text-sm text-neutral-400">
                    {activeSub.amountPaid > 0 ? `$${activeSub.amountPaid} ${activeSub.currency}` : "Free"} &middot; {statusBadge(activeSub.status)}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-sm bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition font-medium"
            >
              Change Plan
            </Link>
          </div>

          {/* Dates */}
          {activeSub && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Started
                </div>
                <p className="text-sm font-medium">{formatDate(activeSub.startsAt)}</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5" /> {activeSub.status === "cancelled" ? "Was set to expire" : "Expires"}
                </div>
                <p className="text-sm font-medium">
                  {formatDate(activeSub.expiresAt)}
                  {usage && usage.daysLeft > 0 && activeSub.status === "active" && (
                    <span className={`ml-2 text-xs ${usage.isExpiringSoon ? "text-amber-400" : "text-neutral-500"}`}>
                      ({usage.daysLeft} days left)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Cancel button */}
          {activeSub && activeSub.status === "active" && activeSub.plan !== "trial" && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-sm text-red-400 hover:text-red-300 transition"
            >
              Cancel subscription
            </button>
          )}
        </div>

        {/* Usage Stats */}
        {usage && usage.status !== "none" && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-neutral-400" />
              <h3 className="font-semibold">Usage</h3>
            </div>

            <div className="space-y-5">
              {/* Posts */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-400">Ads generated</span>
                  <span className="text-white font-medium">
                    {usage.postsUsed} / {usage.postsLimit}
                  </span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${postsPercent > 90 ? "bg-red-500" : postsPercent > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${postsPercent}%` }}
                  />
                </div>
              </div>

              {/* AI Tokens */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-400">AI tokens</span>
                  <span className="text-white font-medium">
                    {(usage.aiTokensUsed / 1000).toFixed(0)}K / {(usage.aiTokensLimit / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${tokensPercent > 90 ? "bg-red-500" : tokensPercent > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${tokensPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments && payments.length > 0 && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-neutral-400" />
              <h3 className="font-semibold">Payment History</h3>
            </div>

            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{p.plan} — {p.billingPeriod || "monthly"}</p>
                    <p className="text-xs text-neutral-500">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">${p.amount} {p.currency}</span>
                    {paymentStatusBadge(p.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription History */}
        {subHistory && subHistory.length > 1 && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-neutral-400" />
              <h3 className="font-semibold">Subscription History</h3>
            </div>

            <div className="space-y-3">
              {subHistory.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {s.plan} {s.billingPeriod && <span className="text-neutral-500 text-xs">({s.billingPeriod})</span>}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDate(s.startsAt)} — {formatDate(s.expiresAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.amountPaid > 0 && <span className="text-xs text-neutral-500">${s.amountPaid}</span>}
                    {statusBadge(s.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-950/50">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-bold">Cancel Subscription</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-2">
                Are you sure you want to cancel your{" "}
                <span className="text-white font-medium capitalize">{activeSub?.plan}</span> plan?
              </p>
              <p className="text-neutral-500 text-xs mb-6">
                Your subscription will be marked as cancelled. When auto-renewal is enabled in the future,
                cancelling will prevent renewal at the end of the billing period.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition"
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition flex items-center justify-center gap-2"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Subscription"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
