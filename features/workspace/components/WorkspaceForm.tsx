"use client";

import React from "react";
import { X, Search } from "lucide-react";
import { useLocale } from "@/lib/i18n/context";

export interface WorkspaceFormData {
  name: string;
  slug: string;
  industry: string;
  website: string;
  defaultLanguage: "en" | "ar";
}

interface WorkspaceFormProps {
  form: WorkspaceFormData;
  setForm: React.Dispatch<React.SetStateAction<WorkspaceFormData>>;
  editingId: string | null;
  searchWebsite: boolean;
  setSearchWebsite: (v: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function WorkspaceForm({
  form, setForm, editingId,
  searchWebsite, setSearchWebsite,
  onSubmit, onCancel,
}: WorkspaceFormProps) {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {editingId ? t("workspaceForm.editWorkspace") : t("workspaceForm.newWorkspace")}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ms-1 block mb-1.5">
              {t("workspaceForm.projectName")}
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
              placeholder={t("workspaceForm.namePlaceholder")}
              className="w-full h-11 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-400 dark:focus:ring-neutral-500/30 dark:focus:border-neutral-500 text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ms-1 block mb-1.5">
              {t("workspaceForm.slug")}
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated-from-name"
              className="w-full h-11 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-400 dark:focus:ring-neutral-500/30 dark:focus:border-neutral-500 text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ms-1 block mb-1.5">
                {t("workspaceForm.industry")}
              </label>
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full h-11 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-400 dark:focus:ring-neutral-500/30 dark:focus:border-neutral-500 text-sm appearance-none"
              >
                <option value="">{t("workspaceForm.select")}</option>
                <option value="restaurant">{t("workspaceForm.restaurant")}</option>
                <option value="saas">{t("workspaceForm.saas")}</option>
                <option value="retail">{t("workspaceForm.retail")}</option>
                <option value="healthcare">{t("workspaceForm.healthcare")}</option>
                <option value="finance">{t("workspaceForm.finance")}</option>
                <option value="education">{t("workspaceForm.education")}</option>
                <option value="ecommerce">{t("workspaceForm.ecommerce")}</option>
                <option value="other">{t("workspaceForm.other")}</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ms-1 block mb-1.5">
                {t("workspaceForm.language")}
              </label>
              <div className="flex h-11 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setForm({ ...form, defaultLanguage: "ar" })}
                  className={`flex-1 text-sm font-bold transition-colors ${form.defaultLanguage === "ar" ? "bg-slate-900 text-white dark:bg-white dark:text-black" : "text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"}`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setForm({ ...form, defaultLanguage: "en" })}
                  className={`flex-1 text-sm font-bold transition-colors ${form.defaultLanguage === "en" ? "bg-slate-900 text-white dark:bg-white dark:text-black" : "text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ms-1 block mb-1.5">
              {t("workspaceForm.website")}
            </label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full h-11 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl px-4 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-400 dark:focus:ring-neutral-500/30 dark:focus:border-neutral-500 text-sm"
            />
            {form.website.trim() && (
              <label className="flex items-center gap-2.5 mt-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={searchWebsite}
                  onChange={(e) => setSearchWebsite(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-500/50 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">{t("workspaceForm.analyzeWebsite")}</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500">{t("workspaceForm.auto")}</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 h-11 border border-slate-200 dark:border-neutral-700 rounded-xl font-bold text-sm text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {t("workspaceForm.cancel")}
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.name.trim()}
            className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {editingId ? t("workspaceForm.saveChanges") : t("workspaceForm.createWorkspace")}
          </button>
        </div>
      </div>
    </div>
  );
}
