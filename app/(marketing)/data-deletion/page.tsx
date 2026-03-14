"use client";

import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import FloatingNav from "@/app/components/FloatingNav";
import { useLocale } from "@/lib/i18n/context";

export default function DataDeletionPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const { t, dir } = useLocale();

  return (
    <div dir={dir} className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <FloatingNav />
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto mb-4 text-green-500" size={48} />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {t("dataDeletion.title")}
          </h1>
        </div>

        {code ? (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
            <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
              {t("dataDeletion.processed")}
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm">
              {t("dataDeletion.confirmationCode")} <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded font-mono">{code}</code>
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
            <p className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
              {t("dataDeletion.infoTitle")}
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {t("dataDeletion.infoDesc")}
            </p>
          </div>
        )}

        <div className="space-y-6 text-slate-600 dark:text-neutral-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t("dataDeletion.whatDeleted")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("dataDeletion.deletedItem1")}</li>
              <li>{t("dataDeletion.deletedItem2")}</li>
              <li>{t("dataDeletion.deletedItem3")}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t("dataDeletion.whatRetained")}</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("dataDeletion.retainedItem1")}</li>
              <li>{t("dataDeletion.retainedItem2")}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t("dataDeletion.needHelp")}</h2>
            <p>
              {t("dataDeletion.helpText")}{" "}
              <a href="mailto:hi@oagents.app" className="text-blue-600 dark:text-blue-400 underline">
                hi@oagents.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
