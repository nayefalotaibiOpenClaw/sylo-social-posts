"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isAdmin = useQuery(
    api.admin.isAdmin,
    // Skip the query until auth is ready — otherwise it returns false before auth resolves
    isAuthenticated ? {} : "skip"
  );
  const router = useRouter();
  const { t, dir } = useLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    // Only redirect if we're authenticated AND the query has resolved to exactly false
    if (!isLoading && isAuthenticated && isAdmin === false) {
      router.push("/workspaces");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  // Show loading while auth or admin check is pending
  if (isLoading || !isAuthenticated || isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 dark:text-neutral-500 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div dir={dir} className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-neutral-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/workspaces"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-neutral-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.backToApp")}
          </Link>
          <span className="text-slate-300 dark:text-neutral-700">|</span>
          <span className="text-sm font-bold text-slate-500 dark:text-neutral-400">{t("admin.title")}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
