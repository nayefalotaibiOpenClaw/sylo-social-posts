"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
}

function PaymentCancelContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">Payment Cancelled</h1>
        <p className="text-neutral-400 mb-2">
          No worries — you weren&apos;t charged. You can try again anytime.
        </p>
        {orderId && (
          <p className="text-neutral-500 text-sm mb-8">Reference: {orderId}</p>
        )}
        {!orderId && <div className="mb-8" />}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition"
          >
            View Plans
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
