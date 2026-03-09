"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Folder, ArrowLeft, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import WorkspaceCard from "@/features/workspace/components/WorkspaceCard";
import WorkspaceForm, { type WorkspaceFormData } from "@/features/workspace/components/WorkspaceForm";

export default function WorkspacesPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
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
      <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <span className="text-slate-900 font-black text-lg">S</span>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight">Workspaces</h1>
                <p className="text-xs text-slate-500 font-medium">Manage your projects</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.image && (
              <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm font-bold text-slate-400">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-slate-400 text-sm font-medium">
              {workspaces?.length ?? 0} workspace{workspaces?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Workspace
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
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 mb-2">No workspaces yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first workspace to start designing</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className="border-2 border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-white/20 hover:bg-white/[0.02] transition-all min-h-[200px]"
            >
              <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-sm font-bold text-slate-500">New Workspace</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
