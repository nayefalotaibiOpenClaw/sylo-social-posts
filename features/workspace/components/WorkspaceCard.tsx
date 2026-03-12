"use client";

import React from "react";
import { Folder, Pencil, Trash2, Globe, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import WorkspaceStats from "./WorkspaceStats";
import { useLocale } from "@/lib/i18n/context";

interface Workspace {
  _id: Id<"workspaces">;
  name: string;
  slug: string;
  industry?: string;
  website?: string;
  defaultLanguage: "en" | "ar";
}

interface WorkspaceCardProps {
  ws: Workspace;
  deleteConfirm: Id<"workspaces"> | null;
  setDeleteConfirm: (id: Id<"workspaces"> | null) => void;
  onEdit: (ws: Workspace) => void;
  onDelete: (id: Id<"workspaces">) => void;
}

export default function WorkspaceCard({
  ws, deleteConfirm, setDeleteConfirm, onEdit, onDelete,
}: WorkspaceCardProps) {
  const { t } = useLocale();

  return (
    <div className="group bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-neutral-600 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-slate-900 transition-all relative">
      {/* Delete Confirmation */}
      {deleteConfirm === ws._id && (
        <div className="absolute inset-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-4">
          <p className="text-sm font-bold mb-4 text-center text-slate-900 dark:text-white">{t("workspaceCard.deleteConfirm", { name: ws.name })}<br /><span className="text-slate-400 font-medium">{t("workspaceCard.deleteWarning")}</span></p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400"
            >
              {t("workspaceCard.cancel")}
            </button>
            <button
              onClick={() => onDelete(ws._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-500"
            >
              {t("workspaceCard.delete")}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl flex items-center justify-center">
          <Folder className="w-5 h-5 text-slate-500 dark:text-neutral-400" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(ws)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title={t("workspaceCard.edit")}
          >
            <Pencil className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setDeleteConfirm(ws._id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title={t("workspaceCard.delete")}
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      <Link href={`/design?workspace=${ws._id}`} className="block">
        <h3 className="text-base font-black mb-1 tracking-tight text-slate-900 dark:text-white">{ws.name}</h3>
        <p className="text-xs text-slate-400 dark:text-neutral-500 font-mono mb-3">/{ws.slug}</p>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          {ws.industry && (
            <span className="flex items-center gap-1">
              <LayoutGrid className="w-3 h-3" />
              {ws.industry}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {ws.defaultLanguage === "ar" ? t("workspaceCard.arabic") : t("workspaceCard.english")}
          </span>
        </div>
      </Link>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-2">
        <WorkspaceStats workspaceId={ws._id} />
      </div>
    </div>
  );
}
