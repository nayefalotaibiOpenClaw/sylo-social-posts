"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle, ShieldCheck, Key } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

export default function ReviewAccessPage() {
  const { t } = useLocale();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const access = useQuery(api.reviewAccess.checkAccess);
  const redeemCode = useMutation(api.reviewAccess.redeemCode);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <ShieldCheck className="mx-auto mb-4 text-zinc-500" size={48} />
          <p className="text-white text-lg font-semibold mb-2">{t("reviewAccess.authRequired")}</p>
          <p className="text-zinc-400 mb-6">{t("reviewAccess.authMessage")}</p>
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {t("reviewAccess.logIn")}
          </a>
        </div>
      </div>
    );
  }

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await redeemCode({ code: code.trim() });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("reviewAccess.redeemError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="text-blue-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("reviewAccess.title")}</h1>
          <p className="text-zinc-400 text-sm">
            {t("reviewAccess.subtitle")}
          </p>
        </div>

        {/* Current Status */}
        {access && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
            <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">{t("reviewAccess.currentAccount")}</p>
            <p className="text-sm text-white">{access.email || "No email"}</p>
            <p className="text-sm text-zinc-400 mt-1">
              {t("reviewAccess.plan")} <span className="font-semibold text-white capitalize">{access.plan}</span>
              {access.expiresAt && (
                <span className="text-zinc-500 ml-2">
                  ({t("reviewAccess.expires", { date: new Date(access.expiresAt).toLocaleDateString() })})
                </span>
              )}
            </p>
          </div>
        )}

        {/* Code Input */}
        <div className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
            placeholder={t("reviewAccess.placeholder")}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />

          <button
            onClick={handleRedeem}
            disabled={!code.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            {loading ? t("reviewAccess.activating") : t("reviewAccess.activate")}
          </button>
        </div>

        {/* Success */}
        {result && (
          <div className="mt-6 bg-green-900/30 border border-green-700 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="text-green-400 shrink-0" size={20} />
            <p className="text-green-300 text-sm">{result.message}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="text-red-400 shrink-0" size={20} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <p className="text-zinc-600 text-xs text-center mt-8">
          {t("reviewAccess.disclaimer")}
        </p>
      </div>
    </div>
  );
}
