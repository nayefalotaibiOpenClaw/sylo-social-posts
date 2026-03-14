"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Suspense, useEffect, useState, useRef } from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const params = useSearchParams();
  // UPayments appends its params with `?` instead of `&` after our returnUrl,
  // so values like `plan=pro?payment_id=100...` need to be cleaned
  const rawPlan = params.get("plan");
  const plan = rawPlan?.split("?")[0] as "starter" | "pro" | null;
  const orderId = params.get("orderId")?.split("?")[0] ?? null;
  const trackId = params.get("track_id");

  const user = useQuery(api.users.currentUser);
  const activateSub = useMutation(api.subscriptions.activate);
  const verifyAndMarkPaid = useAction(api.payments.verifyAndMarkPaid);

  const [status, setStatus] = useState<"verifying" | "activating" | "done" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const processedRef = useRef(false);

  useEffect(() => {
    if (!user || processedRef.current) return;

    // Missing required params — show error immediately
    if (!orderId || !plan) {
      setStatus("error");
      setErrorMsg("Missing order information. Please contact support.");
      return;
    }
    if (plan !== "starter" && plan !== "pro") {
      setStatus("error");
      setErrorMsg("Invalid plan. Please contact support.");
      return;
    }
    // track_id is required for payment verification
    if (!trackId) {
      setStatus("error");
      setErrorMsg("Payment verification failed — please contact support.");
      return;
    }

    processedRef.current = true;

    const process = async () => {
      try {
        // Step 1: Verify with UPayments and mark as paid (server-side verification)
        setStatus("verifying");
        await verifyAndMarkPaid({ orderId, trackId });

        // Step 2: Activate subscription
        setStatus("activating");

        // Fetch payment details for currency
        const verifyRes = await fetch(`/api/payments/verify?track_id=${trackId}`);
        const verifyData = await verifyRes.json();

        await activateSub({
          plan,
          orderId,
          paymentId: trackId || undefined,
          currency: verifyData.currency || "USD",
        });

        setStatus("done");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // If already activated by webhook, treat as success
        if (message.toLowerCase().includes("already") || message.toLowerCase().includes("duplicate")) {
          console.log("Activation already done (likely by webhook):", message);
          setStatus("done");
        } else {
          console.error("Activation error:", err);
          setStatus("error");
          setErrorMsg(message || "Something went wrong. Please contact support.");
        }
      }
    };

    process();
  }, [user, orderId, plan, trackId, activateSub, verifyAndMarkPaid]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-3">Payment Issue</h1>
          <p className="text-neutral-400 mb-8">{errorMsg}</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
            >
              Try Again
            </Link>
            <Link
              href="/workspaces"
              className="bg-neutral-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-700 transition"
            >
              Back to Workspaces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {status !== "done" ? (
          <>
            <Loader2 className="w-12 h-12 text-neutral-400 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-2">
              {status === "verifying" ? "Verifying payment..." : "Activating your plan..."}
            </h1>
            <p className="text-neutral-400">Please wait a moment.</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>
            <p className="text-neutral-400 mb-2">
              Your <span className="text-white font-medium capitalize">{plan}</span> plan is now active.
            </p>
            <p className="text-neutral-500 text-sm mb-8">Order: {orderId}</p>
            <Link
              href="/workspaces"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
            >
              Start Creating
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
