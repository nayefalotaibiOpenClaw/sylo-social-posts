"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { Check, Sparkles, Zap, Crown, Loader2, LogOut, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import LanguageSwitcher from "@/lib/i18n/LanguageSwitcher";
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
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const usage = useQuery(api.subscriptions.getUsage);
  const createPayment = useMutation(api.payments.createPending);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const { t, locale } = useLocale();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || user === undefined) {
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
          <h1 className="text-2xl font-bold mb-3">{t("pricing.pleaseLogIn")}</h1>
          <p className="text-neutral-400 mb-6">{t("pricing.needLogin")}</p>
          <Link
            href="/login"
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
          >
            {t("pricing.goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSubscribe = async (planId: "starter" | "pro") => {
    if (!user) return;
    setLoadingPlan(planId);

    try {
      const plan = PLANS.find((p) => p.id === planId)!;
      const pricing = plan[billingPeriod];
      const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Step 1: Create pending payment in DB FIRST
      await createPayment({
        plan: planId,
        billingPeriod,
        orderId,
        amount: pricing.price,
        currency: "USD",
      });

      // Step 2: Create UPayments charge
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

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Payment error:", err);
      setToast(t("pricing.error"));
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = usage?.plan;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {toast && <Toast message={toast} onClose={dismissToast} />}

      {/* Nav bar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-[10px]">oD</span>
              </div>
              <span className="font-black text-lg tracking-tight text-white">oDesigns</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-400">
              <span className="text-white">{t("nav.pricing")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/workspaces"
              className="px-5 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all active:scale-95"
            >
              {t("nav.dashboard")}
            </Link>
            <div className="flex items-center gap-2">
              {user?.image ? (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : user && (
                <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                  <span className="text-neutral-200 font-bold text-xs">{(user.name || user.email || "U")[0].toUpperCase()}</span>
                </div>
              )}
              <button
                onClick={() => void signOut()}
                className="p-2 rounded-full hover:bg-neutral-800 transition-colors text-neutral-500 hover:text-white"
                title={t("nav.signOut")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

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

        {/* Trial banner */}
        {currentPlan === "trial" && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 bg-emerald-950/50 border border-emerald-800/50 rounded-xl px-6 py-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div className="text-start">
                <p className="text-emerald-300 font-medium text-sm">{t("pricing.freeTrial")}</p>
                <p className="text-emerald-200/60 text-xs">
                  {usage?.postsUsed}/{usage?.postsLimit} {t("pricing.trialUsage")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
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

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || loadingPlan !== null}
                  className={`w-full py-3 px-6 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                      : plan.popular
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "bg-neutral-800 text-white hover:bg-neutral-700"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    t("pricing.getCurrentPlan")
                  ) : (
                    t("pricing.getStarted")
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
