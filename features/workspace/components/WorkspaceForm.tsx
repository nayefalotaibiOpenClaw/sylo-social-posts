"use client";

import React from "react";
import { X, Search } from "lucide-react";

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
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151921] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">
            {editingId ? "Edit Workspace" : "New Workspace"}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
              Project Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
              placeholder="e.g. Sylo, My App"
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
              Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated-from-name"
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
                Industry
              </label>
              <select
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm appearance-none"
              >
                <option value="">Select...</option>
                <option value="restaurant">Restaurant</option>
                <option value="saas">SaaS</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="ecommerce">E-commerce</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
                Language
              </label>
              <div className="flex h-11 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setForm({ ...form, defaultLanguage: "ar" })}
                  className={`flex-1 text-sm font-bold transition-colors ${form.defaultLanguage === "ar" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}
                >
                  العربية
                </button>
                <button
                  onClick={() => setForm({ ...form, defaultLanguage: "en" })}
                  className={`flex-1 text-sm font-bold transition-colors ${form.defaultLanguage === "en" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 block mb-1.5">
              Website
            </label>
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
            />
            {form.website.trim() && (
              <label className="flex items-center gap-2.5 mt-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors">
                <input
                  type="checkbox"
                  checked={searchWebsite}
                  onChange={(e) => setSearchWebsite(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-white/70">AI: Analyze website</span>
                </div>
                <span className="text-[10px] text-white/30">Auto</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 h-11 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!form.name.trim()}
            className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {editingId ? "Save Changes" : "Create Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
