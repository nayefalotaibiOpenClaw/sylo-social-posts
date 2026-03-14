"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Folder, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import WorkspaceCard from "@/features/workspace/components/WorkspaceCard";
import WorkspaceForm, { type WorkspaceFormData } from "@/features/workspace/components/WorkspaceForm";
import { useLocale } from "@/lib/i18n/context";
import { localizeHref } from "@/lib/i18n/utils";
import FloatingNav from "@/app/components/FloatingNav";

export default function WorkspacesPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(
    api.workspaces.listByUser,
    user ? {} : "skip"
  );
  const createWorkspace = useMutation(api.workspaces.create);
  const deleteWorkspace = useMutation(api.workspaces.remove);
  const updateWorkspace = useMutation(api.workspaces.update);
  const updateWebsiteInfo = useMutation(api.workspaces.updateWebsiteInfo);
  const logAndIncrement = useMutation(api.aiUsage.logAndIncrement);
  const { t, locale } = useLocale();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<Id<"workspaces"> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"workspaces"> | null>(null);
  const [searchWebsite, setSearchWebsite] = useState(true);
  const [form, setForm] = useState<WorkspaceFormData>({
    name: "",
    slug: "",
    industry: "",
    website: "",
    defaultLanguage: "ar",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && process.env.NODE_ENV !== "development") {
      router.push(localizeHref("/login", locale));
    }
  }, [authLoading, isAuthenticated, router]);

  const resetForm = () => {
    setForm({ name: "", slug: "", industry: "", website: "", defaultLanguage: "ar" });
    setShowCreate(false);
    setEditingId(null);
  };

  // Fetch website and save info to workspace (client-side)
  const fetchAndSaveWebsiteInfo = async (wsId: Id<"workspaces">, url: string) => {
    try {
      const res = await fetch('/api/fetch-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) return;
      const data = await res.json();
      await updateWebsiteInfo({
        id: wsId,
        websiteInfo: {
          companyName: data.companyName || "",
          description: data.description || "",
          industry: data.industry || "",
          features: data.features || [],
          targetAudience: data.targetAudience || undefined,
          tone: data.tone || undefined,
          contact: data.contact ? {
            phone: data.contact.phone || undefined,
            email: data.contact.email || undefined,
            address: data.contact.address || undefined,
            socialMedia: data.contact.socialMedia || undefined,
          } : undefined,
          ogImage: data.ogImage || undefined,
          rawContent: data.rawContent || "",
          fetchedAt: Date.now(),
        },
      });
      // Log website analysis usage
      if (data.usage) {
        logAndIncrement({
          workspaceId: wsId,
          category: "website_analysis",
          model: data.usage.model || "gemini-3.1-flash-lite-preview",
          promptTokens: data.usage.promptTokens || 0,
          completionTokens: data.usage.completionTokens || 0,
          totalTokens: data.usage.totalTokens || 0,
          endpoint: "/api/fetch-website",
        }).catch(() => { /* silently fail */ });
      }
    } catch {
      // silently fail — website info is optional
    }
  };

  const handleCreate = async () => {
    if (!user || !form.name.trim()) return;
    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const websiteUrl = form.website.trim() || undefined;
    const workspaceId = await createWorkspace({
      name: form.name.trim(),
      slug,
      industry: form.industry || undefined,
      website: websiteUrl,
      defaultLanguage: form.defaultLanguage,
    });
    if (searchWebsite && websiteUrl) {
      fetchAndSaveWebsiteInfo(workspaceId, websiteUrl);
    }
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) return;
    const websiteUrl = form.website.trim() || undefined;
    await updateWorkspace({
      id: editingId,
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      industry: form.industry || undefined,
      website: websiteUrl,
      defaultLanguage: form.defaultLanguage,
    });
    if (searchWebsite && websiteUrl) {
      fetchAndSaveWebsiteInfo(editingId, websiteUrl);
    }
    resetForm();
  };

  const handleDelete = async (id: Id<"workspaces">) => {
    await deleteWorkspace({ id });
    setDeleteConfirm(null);
  };

  const startEdit = (ws: { _id: Id<"workspaces">; name: string; slug: string; industry?: string; website?: string; defaultLanguage: "en" | "ar" }) => {
    setEditingId(ws._id);
    setForm({
      name: ws.name,
      slug: ws.slug,
      industry: ws.industry ?? "",
      website: ws.website ?? "",
      defaultLanguage: ws.defaultLanguage,
    });
    setShowCreate(true);
  };

  if (authLoading || (!user && process.env.NODE_ENV !== "development")) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans selection:bg-indigo-100">
      <FloatingNav activePage="workspaces" />

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-1">{t("workspaces.title")}</h1>
            <p className="text-slate-400 text-sm font-medium">
              {workspaces?.length ?? 0} {(workspaces?.length ?? 0) !== 1 ? t("workspaces.projects") : t("workspaces.project")}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t("workspaces.newWorkspace")}
          </button>
        </div>

        {/* Create/Edit Modal */}
        {showCreate && (
          <WorkspaceForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            searchWebsite={searchWebsite}
            setSearchWebsite={setSearchWebsite}
            onSubmit={editingId ? handleUpdate : handleCreate}
            onCancel={resetForm}
          />
        )}

        {/* Workspace Grid */}
        {!workspaces ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 dark:text-neutral-400 mb-2">{t("workspaces.noWorkspaces")}</h3>
            <p className="text-sm text-slate-400 mb-6">{t("workspaces.createFirst")}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition-all active:scale-95"
            >
              {t("workspaces.createWorkspace")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws._id}
                ws={ws}
                deleteConfirm={deleteConfirm}
                setDeleteConfirm={setDeleteConfirm}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}

            {/* New Workspace Card */}
            <button
              onClick={() => { resetForm(); setShowCreate(true); }}
              className="border-2 border-dashed border-slate-200 dark:border-neutral-700 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-slate-300 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all min-h-[200px]"
            >
              <div className="w-11 h-11 bg-slate-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-sm font-bold text-slate-400">{t("workspaces.newWorkspace")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
