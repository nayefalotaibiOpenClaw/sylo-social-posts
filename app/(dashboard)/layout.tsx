"use client";

import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import { localizeHref } from "@/lib/i18n/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const { locale } = useLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(localizeHref("/login", locale));
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
