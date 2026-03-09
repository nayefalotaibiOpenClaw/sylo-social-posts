"use client";

import React from "react";
import { Folder, Pencil, Trash2, Globe, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import WorkspaceStats from "./WorkspaceStats";

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
  return (
    <div className="group bg-[#151921] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all relative">
      {/* Delete Confirmation */}
      {deleteConfirm === ws._id && (
        <div className="absolute inset-0 bg-[#151921]/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-4">
          <p className="text-sm font-bold mb-4 text-center">Delete &ldquo;{ws.name}&rdquo;?<br /><span className="text-slate-500 font-medium">This will remove all collections & posts.</span></p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 border border-white/10 rounded-lg text-sm font-bold hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(ws._id)}
              className="px-4 py-2 bg-red-600 rounded-lg text-sm font-bold hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
          <Folder className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(ws)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            onClick={() => setDeleteConfirm(ws._id)}
            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400" />
          </button>
        </div>
      </div>

      <Link href={`/design?workspace=${ws._id}`} className="block">
        <h3 className="text-base font-black mb-1 tracking-tight">{ws.name}</h3>
        <p className="text-xs text-slate-500 font-mono mb-3">/{ws.slug}</p>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
          {ws.industry && (
            <span className="flex items-center gap-1">
              <LayoutGrid className="w-3 h-3" />
              {ws.industry}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {ws.defaultLanguage === "ar" ? "Arabic" : "English"}
          </span>
        </div>
      </Link>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
        <WorkspaceStats workspaceId={ws._id} />
      </div>
    </div>
  );
}
