"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Folder, Loader2, LogOut } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import WorkspaceCard from "@/features/workspace/components/WorkspaceCard";
import WorkspaceForm, { type WorkspaceFormData } from "@/features/workspace/components/WorkspaceForm";
import { useLocale } from "@/lib/i18n/context";
import LanguageSwitcher from "@/lib/i18n/LanguageSwitcher";

export default function WorkspacesPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(
    api.workspaces.listByUser,
    user ? { userId: user._id } : "skip"
  );
  const createWorkspace = useMutation(api.workspaces.create);
  const deleteWorkspace = useMutation(api.workspaces.remove);
  const updateWorkspace = useMutation(api.workspaces.update);
  const updateWebsiteInfo = useMutation(api.workspaces.updateWebsiteInfo);
  const { t } = useLocale();

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
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const resetForm = () => {
    setForm({ name: "", slug: "", industry: "", website: "", defaultLanguage: "ar" });
    setShowCreate(false);
    setEditingId(null);
  };

  // Fetch website and save info to workspace (client-side)
  const fetchAndSaveWebsiteInfo = async (workspaceId: Id<"workspaces">, url: string) => {
    try {
      const res = await fetch('/api/fetch-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) return;
      const data = await res.json();
      await updateWebsiteInfo({
        id: workspaceId,
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
    } catch {
      // silently fail — website info is optional
    }
  };

  const handleCreate = async () => {
    if (!user || !form.name.trim()) return;
    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const websiteUrl = form.website.trim() || undefined;
    const workspaceId = await createWorkspace({
      userId: user._id,
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Floating nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-slate-200/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-[10px]">oD</span>
              </div>
              <span className="font-black text-lg tracking-tight">oDesigns</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
              <span className="text-slate-900">{t("nav.workspaces")}</span>
              <Link href="/pricing" className="hover:text-slate-900">{t("nav.pricing")}</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              {user.image ? (
                <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-600 font-bold text-xs">{user.name?.[0] ?? "?"}</span>
                </div>
              )}
              <button
                onClick={() => void signOut()}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
                title={t("nav.signOut")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

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
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:scale-105 transition-all active:scale-95"
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
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-600 mb-2">{t("workspaces.noWorkspaces")}</h3>
            <p className="text-sm text-slate-400 mb-6">{t("workspaces.createFirst")}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:scale-105 transition-all active:scale-95"
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
              className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-slate-300 hover:bg-slate-50 transition-all min-h-[200px]"
            >
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
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
