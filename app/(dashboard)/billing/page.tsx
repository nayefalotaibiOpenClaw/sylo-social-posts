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
import Link from "@/lib/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/context";

export default function BillingPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { t } = useLocale();
  const user = useQuery(api.users.currentUser);
  const usage = useQuery(api.subscriptions.getUsage);
  const activeSub = useQuery(api.subscriptions.getActive);
  const payments = useQuery(api.payments.listMine);
  const subHistory = useQuery(api.subscriptions.list);
  const cancelSub = useMutation(api.subscriptions.cancel);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auth handled by dashboard layout

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
          <h1 className="text-2xl font-bold mb-3">{t("billing.pleaseLogIn")}</h1>
          <p className="text-neutral-400 mb-6">{t("billing.needLogin")}</p>
          <Link
            href="/login"
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
          >
            {t("billing.goToLogin")}
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
      setToast({ type: "success", message: t("billing.cancelSuccess") });
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : t("billing.cancelError") });
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
          <CheckCircle className="w-3 h-3" /> {t("billing.active")}
        </span>
      );
    if (status === "cancelled")
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-950/50 text-amber-400 border border-amber-800/30 px-2.5 py-1 rounded-full">
          <XCircle className="w-3 h-3" /> {t("billing.cancelledStatus")}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700 px-2.5 py-1 rounded-full">
        <Clock className="w-3 h-3" /> {t("billing.expired")}
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
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 end-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300`}>
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-sm max-w-sm border ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-800/50 text-emerald-200"
              : "bg-red-950/90 border-red-800/50 text-red-200"
          }`}>
            {toast.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition shrink-0">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/workspaces"
            className="text-sm text-neutral-400 hover:text-white transition mb-6 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t("billing.backToWorkspaces")}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{t("billing.title")}</h1>
          <p className="text-neutral-400 mt-2">{t("billing.subtitle")}</p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {planIcon(usage?.plan ?? null)}
              <div>
                <h2 className="text-lg font-semibold capitalize">
                  {usage?.plan || t("billing.noPlan")} {activeSub?.billingPeriod && (
                    <span className="text-sm text-neutral-500 font-normal capitalize">({activeSub.billingPeriod === "yearly" ? t("billing.annually") : t("billing.monthly")})</span>
                  )}
                </h2>
                {activeSub && (
                  <p className="text-sm text-neutral-400">
                    {activeSub.amountPaid > 0 ? `$${activeSub.amountPaid} ${activeSub.currency}` : t("billing.free")} &middot; {statusBadge(activeSub.status)}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-sm bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition font-medium"
            >
              {t("billing.changePlan")}
            </Link>
          </div>

          {/* Dates */}
          {activeSub && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5" /> {t("billing.started")}
                </div>
                <p className="text-sm font-medium">{formatDate(activeSub.startsAt)}</p>
              </div>
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5" /> {activeSub.status === "cancelled" ? t("billing.wasSetToExpire") : t("billing.expires")}
                </div>
                <p className="text-sm font-medium">
                  {formatDate(activeSub.expiresAt)}
                  {usage && usage.daysLeft > 0 && activeSub.status === "active" && (
                    <span className={`ml-2 text-xs ${usage.isExpiringSoon ? "text-amber-400" : "text-neutral-500"}`}>
                      ({usage.daysLeft} {t("billing.daysLeft")})
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
              {t("billing.cancelSubscription")}
            </button>
          )}
        </div>

        {/* Usage Stats */}
        {usage && usage.status !== "none" && (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-neutral-400" />
              <h3 className="font-semibold">{t("billing.usage")}</h3>
            </div>

            <div className="space-y-5">
              {/* Posts */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-400">{t("billing.adsGenerated")}</span>
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
                  <span className="text-neutral-400">{t("billing.aiTokens")}</span>
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
              <h3 className="font-semibold">{t("billing.paymentHistory")}</h3>
            </div>

            <div className="space-y-3">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{p.plan} — {p.billingPeriod === "yearly" ? t("billing.annually") : t("billing.monthly")}</p>
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
              <h3 className="font-semibold">{t("billing.subscriptionHistory")}</h3>
            </div>

            <div className="space-y-3">
              {subHistory.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {s.plan} {s.billingPeriod && <span className="text-neutral-500 text-xs">({s.billingPeriod === "yearly" ? t("billing.annually") : t("billing.monthly")})</span>}
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
                <h3 className="text-xl font-bold">{t("billing.cancelTitle")}</h3>
              </div>
              <p className="text-neutral-400 text-sm mb-2">
                {t("billing.cancelConfirm")}{" "}
                <span className="text-white font-medium capitalize">{activeSub?.plan}</span> {t("billing.cancelPlan")}
              </p>
              <p className="text-neutral-500 text-xs mb-6">
                {t("billing.cancelWarning")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition"
                >
                  {t("billing.keepPlan")}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition flex items-center justify-center gap-2"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : t("billing.cancelTitle")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
