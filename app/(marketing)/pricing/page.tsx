"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { Check, Sparkles, Zap, Crown, Loader2, X, AlertCircle, ArrowDown, ArrowUp, Gift } from "lucide-react";
import Link from "@/lib/i18n/LocaleLink";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { localizeHref } from "@/lib/i18n/utils";
import FloatingNav from "@/app/components/FloatingNav";
import type { TranslationKey } from "@/lib/i18n/types";

const PLANS = [
  {
    id: "starter" as const,
    nameKey: "pricing.starter" as TranslationKey,
    monthly: { price: 40, ads: 100 },
    yearly: { price: 384, ads: 1200, monthlyEquiv: 32 },
    descKey: "pricing.starterDesc" as TranslationKey,
    featureKeys: [
      "pricing.aiGeneratedAds",
      "pricing.allTemplates",
      "pricing.pngZipExport",
      "pricing.allAspectRatios",
      "pricing.brandCustomization",
    ] as TranslationKey[],
    icon: Zap,
    popular: false,
  },
  {
    id: "pro" as const,
    nameKey: "pricing.pro" as TranslationKey,
    monthly: { price: 100, ads: 250 },
    yearly: { price: 960, ads: 3000, monthlyEquiv: 80 },
    descKey: "pricing.proDesc" as TranslationKey,
    featureKeys: [
      "pricing.aiGeneratedAds",
      "pricing.allTemplates",
      "pricing.pngZipExport",
      "pricing.allAspectRatios",
      "pricing.brandCustomization",
      "pricing.priorityGeneration",
    ] as TranslationKey[],
    icon: Crown,
    popular: true,
  },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 end-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3 bg-red-950/90 border border-red-800/50 text-red-200 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-sm max-w-sm">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-red-400 hover:text-red-200 transition shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();
  const user = useQuery(api.users.currentUser, isAuthenticated ? undefined : "skip");
  const usage = useQuery(api.subscriptions.getUsage, isAuthenticated ? undefined : "skip");
  const activeSub = useQuery(api.subscriptions.getActive, isAuthenticated ? undefined : "skip");
  const createPayment = useMutation(api.payments.createPending);
  const downgradeMut = useMutation(api.subscriptions.downgrade);
  const startTrialMut = useMutation(api.subscriptions.startTrial);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const { t, locale } = useLocale();

  // Determine plan change type (accounts for same-plan period changes)
  const getPlanChangeType = (planId: "starter" | "pro") => {
    if (!activeSub || activeSub.plan === "trial") return "new";
    const rank = { starter: 1, pro: 2 } as const;
    const currentRank = rank[activeSub.plan as "starter" | "pro"] || 0;
    const newRank = rank[planId];
    if (newRank > currentRank) return "upgrade";
    if (newRank < currentRank) return "downgrade";
    // Same plan tier — check if billing period differs (period switch = upgrade)
    if (activeSub.billingPeriod !== billingPeriod) {
      const plan = PLANS.find((p) => p.id === planId)!;
      const newPrice = plan[billingPeriod].price;
      return newPrice > (activeSub.amountPaid || 0) ? "upgrade" : "downgrade";
    }
    return "same";
  };

  // Compute proration credit client-side for display
  const getProrationCredit = () => {
    if (!activeSub || activeSub.plan === "trial" || !activeSub.amountPaid) return 0;
    const totalDays = activeSub.billingPeriod === "yearly" ? 365 : 30;
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysRemaining = Math.max(0, (activeSub.expiresAt - Date.now()) / msPerDay);
    const dailyRate = activeSub.amountPaid / totalDays;
    return Math.round(daysRemaining * dailyRate * 100) / 100;
  };

  const handleSubscribe = async (planId: "starter" | "pro") => {
    if (!user) {
      router.replace(localizeHref("/login", locale));
      return;
    }

    const changeType = getPlanChangeType(planId);

    // Same plan + same period — nothing to do
    if (changeType === "same") return;

    // Handle downgrade separately (no payment needed)
    if (changeType === "downgrade") {
      setShowDowngradeConfirm(planId);
      return;
    }

    setLoadingPlan(planId);

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Step 1: Create pending payment in DB — amount is computed server-side
      await createPayment({
        plan: planId,
        billingPeriod,
        orderId,
        currency: "USD",
      });

      // Step 2: Create UPayments charge (amount comes from the server-stored payment record)
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          billingPeriod,
          orderId,
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (!data.checkoutUrl) {
        setToast(data.error || t("pricing.error"));
        return;
      }

      // Issue 25: Validate checkout URL domain before redirect
      const allowedDomains = ["upayments.com", "sandbox.upayments.com", "sandboxpayment.upayments.com"];
      try {
        const checkoutHost = new URL(data.checkoutUrl).hostname;
        if (!allowedDomains.some((d) => checkoutHost === d || checkoutHost.endsWith(`.${d}`))) {
          setToast(t("pricing.invalidCheckoutUrl"));
          return;
        }
      } catch {
        setToast("Invalid checkout URL");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Payment error:", err);
      setToast(t("pricing.error"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleDowngradeConfirm = async (planId: "starter" | "pro") => {
    setShowDowngradeConfirm(null);
    setLoadingPlan(planId);
    try {
      await downgradeMut({ newPlan: planId, newBillingPeriod: billingPeriod });
      setToast(t("pricing.downgradeSuccess"));
    } catch (err) {
      console.error("Downgrade error:", err);
      setToast(err instanceof Error ? err.message : t("pricing.error"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleStartTrial = async () => {
    if (!user) {
      router.replace(localizeHref("/login", locale));
      return;
    }
    setStartingTrial(true);
    try {
      await startTrialMut();
      setToast(t("pricing.trialStarted"));
    } catch (err) {
      setToast(err instanceof Error ? err.message : t("pricing.error"));
    } finally {
      setStartingTrial(false);
    }
  };

  const currentPlan = usage?.plan;
  const hasAnySub = !!activeSub;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {toast && <Toast message={toast} onClose={dismissToast} />}

      <FloatingNav activePage="pricing" />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t("pricing.title")}
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            {t("pricing.subtitle")}
          </p>

          {/* Current usage banner */}
          {usage && currentPlan && (
            <div className="mt-8 inline-flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-neutral-300">
                {t("pricing.currentPlan")} <span className="text-white font-medium capitalize">{currentPlan}</span>
                {" · "}
                {usage.postsUsed}/{usage.postsLimit} {t("pricing.adsUsed")}
              </span>
            </div>
          )}
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              billingPeriod === "monthly"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {t("pricing.monthly")}
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingPeriod === "yearly"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            {t("pricing.yearly")}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              billingPeriod === "yearly"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-900/50 text-emerald-400"
            }`}>
              {t("pricing.save20")}
            </span>
          </button>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Trial Card */}
          <div
            className={`relative rounded-2xl border p-8 transition-all ${
              currentPlan === "trial"
                ? "border-emerald-700/40 bg-emerald-950/20"
                : "border-neutral-800 bg-neutral-900/40"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-900/50">
                <Gift className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold">{t("pricing.freeTrial")}</h3>
            </div>

            <div className="mb-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-neutral-400 ms-1">{t("pricing.trialDays")}</span>
            </div>
            <p className="text-neutral-400 text-sm mb-8">{t("pricing.trialDesc")}</p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white font-medium">6 {t("pricing.aiGeneratedAds")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-neutral-300">{t("pricing.allTemplates")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-neutral-300">{t("pricing.pngZipExport")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-neutral-300">{t("pricing.allAspectRatios")}</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-neutral-300">{t("pricing.brandCustomization")}</span>
              </li>
            </ul>

            {currentPlan === "trial" ? (
              <div>
                <button
                  disabled
                  className="w-full py-3 px-6 rounded-xl font-medium text-sm bg-neutral-800 text-neutral-500 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {t("pricing.getCurrentPlan")}
                </button>
                <p className="text-xs text-neutral-500 text-center mt-3">
                  {usage?.postsUsed}/{usage?.postsLimit} {t("pricing.adsUsed")}
                  {usage?.daysLeft !== undefined && <> &middot; {usage.daysLeft} {t("pricing.daysLeft")}</>}
                </p>
              </div>
            ) : hasAnySub ? (
              <button
                disabled
                className="w-full py-3 px-6 rounded-xl font-medium text-sm bg-neutral-800 text-neutral-500 cursor-not-allowed"
              >
                {t("pricing.trialUsed")}
              </button>
            ) : (
              <button
                onClick={handleStartTrial}
                disabled={startingTrial}
                className="w-full py-3 px-6 rounded-xl font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
              >
                {startingTrial ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("pricing.startFreeTrial")
                )}
              </button>
            )}
          </div>
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const Icon = plan.icon;
            const pricing = plan[billingPeriod];
            const adsCount = pricing.ads;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 transition-all ${
                  plan.popular
                    ? "border-white/20 bg-neutral-900/80 shadow-lg shadow-white/5"
                    : "border-neutral-800 bg-neutral-900/40"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-semibold px-4 py-1 rounded-full">
                    {t("pricing.mostPopular")}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${plan.popular ? "bg-white/10" : "bg-neutral-800"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{t(plan.nameKey)}</h3>
                </div>

                <div className="mb-2">
                  {billingPeriod === "yearly" ? (
                    <>
                      <span className="text-4xl font-bold">${pricing.price.toLocaleString(locale)}</span>
                      <span className="text-neutral-400 ms-1">{t("pricing.perYear")}</span>
                      <p className="text-sm text-neutral-500 mt-1">
                        ${"monthlyEquiv" in pricing ? pricing.monthlyEquiv : Math.round(pricing.price / 12)}{t("pricing.perMo")}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${pricing.price.toLocaleString(locale)}</span>
                      <span className="text-neutral-400 ms-1">{t("pricing.perMonth")}</span>
                    </>
                  )}
                </div>
                <p className="text-neutral-400 text-sm mb-8">{t(plan.descKey)}</p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-white font-medium">
                      {adsCount.toLocaleString(locale)} {t("pricing.aiGeneratedAds")}{billingPeriod === "yearly" ? t("pricing.perYr") : t("pricing.perMo")}
                    </span>
                  </li>
                  {plan.featureKeys.slice(1).map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-neutral-300">{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>

                {(() => {
                  const changeType = getPlanChangeType(plan.id);
                  const credit = getProrationCredit();
                  const isDowngrade = changeType === "downgrade";
                  const isUpgrade = changeType === "upgrade";
                  const isSame = changeType === "same";
                  const proratedPrice = Math.max(1, Math.round((pricing.price - credit) * 100) / 100);

                  return (
                    <>
                      {/* Proration info */}
                      {isUpgrade && credit > 0 && (
                        <div className="mb-3 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/30 text-xs">
                          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                            <ArrowUp className="w-3 h-3" />
                            <span className="font-medium">{t("pricing.upgradePricing")}</span>
                          </div>
                          <p className="text-emerald-200/60">
                            ${credit.toFixed(2)} {t("pricing.creditApplied")} ${proratedPrice.toFixed(2)}
                          </p>
                        </div>
                      )}
                      {isDowngrade && credit > 0 && (
                        <div className="mb-3 p-3 rounded-lg bg-blue-950/50 border border-blue-800/30 text-xs">
                          <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                            <ArrowDown className="w-3 h-3" />
                            <span className="font-medium">{t("pricing.downgradeLabel")}</span>
                          </div>
                          <p className="text-blue-200/60">
                            ${credit.toFixed(2)} {t("pricing.creditExtended")}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isCurrentPlan || isSame || loadingPlan !== null}
                        className={`w-full py-3 px-6 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                          isCurrentPlan || isSame
                            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                            : plan.popular
                              ? "bg-white text-black hover:bg-neutral-200"
                              : "bg-neutral-800 text-white hover:bg-neutral-700"
                        }`}
                      >
                        {loadingPlan === plan.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrentPlan || isSame ? (
                          t("pricing.getCurrentPlan")
                        ) : isUpgrade ? (
                          `${t("pricing.upgrade")}${credit > 0 ? ` — $${proratedPrice.toFixed(2)}` : ""}`
                        ) : isDowngrade ? (
                          t("pricing.downgradeLabel")
                        ) : (
                          t("pricing.getStarted")
                        )}
                      </button>
                    </>
                  );
                })()}
              </div>
            );
          })}
        </div>

        {/* Manage subscription link */}
        {currentPlan && currentPlan !== "trial" && (
          <div className="text-center mt-8">
            <Link href="/billing" className="text-sm text-neutral-400 hover:text-white transition">
              {t("pricing.manageSubscription")}
            </Link>
          </div>
        )}

        {/* Downgrade confirmation modal */}
        {showDowngradeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-xl font-bold mb-3">{t("pricing.confirmDowngrade")}</h3>
              <p className="text-neutral-400 text-sm mb-2">
                {t("pricing.downgradeConfirmMsg", { credit: `$${getProrationCredit().toFixed(2)}`, plan: showDowngradeConfirm })}
              </p>
              <p className="text-neutral-500 text-xs mb-6">
                {t("pricing.downgradeWarning")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDowngradeConfirm(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition"
                >
                  {t("pricing.cancel")}
                </button>
                <button
                  onClick={() => handleDowngradeConfirm(showDowngradeConfirm as "starter" | "pro")}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition"
                >
                  {t("pricing.confirmDowngrade")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
