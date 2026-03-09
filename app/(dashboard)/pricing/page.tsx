"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    monthly: { price: 40, ads: 100 },
    yearly: { price: 384, ads: 1200, monthlyEquiv: 32 },
    description: "Perfect for small businesses getting started",
    features: [
      "AI-generated ads",
      "All post templates",
      "PNG & ZIP export",
      "All aspect ratios",
      "Brand customization",
    ],
    icon: Zap,
    popular: false,
  },
  {
    id: "pro" as const,
    name: "Pro",
    monthly: { price: 100, ads: 250 },
    yearly: { price: 960, ads: 3000, monthlyEquiv: 80 },
    description: "For growing brands that need more volume",
    features: [
      "AI-generated ads",
      "All post templates",
      "PNG & ZIP export",
      "All aspect ratios",
      "Brand customization",
      "Priority generation",
    ],
    icon: Crown,
    popular: true,
  },
];

export default function PricingPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const usage = useQuery(api.subscriptions.getUsage);
  const createPayment = useMutation(api.payments.createPending);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

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
          <h1 className="text-2xl font-bold mb-3">Please log in</h1>
          <p className="text-neutral-400 mb-6">You need to be logged in to view pricing plans.</p>
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
        alert(data.error || "Failed to create payment");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = usage?.plan;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/workspaces"
            className="text-sm text-neutral-400 hover:text-white transition mb-8 inline-block"
          >
            &larr; Back to workspaces
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Choose your plan
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Generate stunning AI-powered social media ads for your brand.
          </p>

          {/* Current usage banner */}
          {usage && currentPlan && (
            <div className="mt-8 inline-flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-neutral-300">
                Current plan: <span className="text-white font-medium capitalize">{currentPlan}</span>
                {" · "}
                {usage.postsUsed}/{usage.postsLimit} ads used
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
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              billingPeriod === "yearly"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            Yearly
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              billingPeriod === "yearly"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-900/50 text-emerald-400"
            }`}>
              Save 20%
            </span>
          </button>
        </div>

        {/* Trial banner */}
        {currentPlan === "trial" && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 bg-emerald-950/50 border border-emerald-800/50 rounded-xl px-6 py-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <p className="text-emerald-300 font-medium text-sm">Free Trial</p>
                <p className="text-emerald-200/60 text-xs">
                  {usage?.postsUsed}/{usage?.postsLimit} generations used. Upgrade for more.
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
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${plan.popular ? "bg-white/10" : "bg-neutral-800"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>

                <div className="mb-2">
                  {billingPeriod === "yearly" ? (
                    <>
                      <span className="text-4xl font-bold">${pricing.price}</span>
                      <span className="text-neutral-400 ml-1">/ year</span>
                      <p className="text-sm text-neutral-500 mt-1">
                        ${"monthlyEquiv" in pricing ? pricing.monthlyEquiv : Math.round(pricing.price / 12)}/mo
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">${pricing.price}</span>
                      <span className="text-neutral-400 ml-1">/ month</span>
                    </>
                  )}
                </div>
                <p className="text-neutral-400 text-sm mb-8">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-white font-medium">
                      {adsCount.toLocaleString()} AI-generated ads{billingPeriod === "yearly" ? "/yr" : "/mo"}
                    </span>
                  </li>
                  {plan.features.slice(1).map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-neutral-300">{feature}</span>
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
                    "Current Plan"
                  ) : (
                    "Get Started"
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
