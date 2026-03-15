"use client";

import React, { useState, useRef, useEffect } from "react";
import { Loader2, FolderOpen, FileText, Plus, ArrowLeft, Save, Globe, Clock, Tag, Trash2, Pencil, Eye } from "lucide-react";
import Link from "@/lib/i18n/LocaleLink";
import { useLocale } from "@/lib/i18n/context";
import { useSearchParams, useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { localizeHref } from "@/lib/i18n/utils";
import Sidebar, { type SidebarTab } from "@/features/design-editor/components/Sidebar";
import BlogAgentChatPanel from "@/features/blog-editor/components/BlogAgentChatPanel";
import BlogContentEditor from "@/features/blog-editor/components/BlogContentEditor";

// ─── Inline Markdown Preview (lightweight, for blog list cards) ───

function BlogCardMarkdownPreview({ content, maxChars = 200 }: { content: string; maxChars?: number }) {
  const truncated = content.slice(0, maxChars);
  const lines = truncated.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Skip headings — just show paragraph text
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith(">")) continue;
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) continue;
    if (trimmed.match(/^!\[/)) continue;

    // Render as plain text, strip bold/italic markers
    const clean = trimmed.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
    elements.push(
      <span key={key++}>{clean} </span>
    );
  }

  if (elements.length === 0) return null;

  return (
    <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed line-clamp-3">
      {elements}
      {content.length > maxChars && <span className="text-slate-400">...</span>}
    </p>
  );
}

export default function BlogsPage() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const workspaceId = searchParams.get("workspace") as Id<"workspaces"> | null;
  const blogIdParam = searchParams.get("blog") as Id<"workspaceBlogPosts"> | null;

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const hasBeta = useQuery(api.users.hasBetaFeature, { feature: "blog_engine" });
  const isAdmin = useQuery(api.admin.isAdmin);
  const workspaces = useQuery(api.workspaces.listByUser, user ? {} : "skip");
  const workspace = useQuery(api.workspaces.get, workspaceId ? { id: workspaceId } : "skip");
  const branding = useQuery(api.branding.getByWorkspace, workspaceId ? { workspaceId } : "skip");
  const blogs = useQuery(api.workspaceBlogPosts.listByWorkspace, workspaceId ? { workspaceId } : "skip");
  const currentBlog = useQuery(api.workspaceBlogPosts.get, blogIdParam ? { id: blogIdParam } : "skip");
  const assets = useQuery(api.assets.listForWorkspace, workspaceId && user ? { workspaceId } : "skip");

  const createBlog = useMutation(api.workspaceBlogPosts.create);
  const updateBlog = useMutation(api.workspaceBlogPosts.update);
  const publishBlog = useMutation(api.workspaceBlogPosts.publish);
  const unpublishBlog = useMutation(api.workspaceBlogPosts.unpublish);
  const removeBlog = useMutation(api.workspaceBlogPosts.remove);
  const logAndIncrement = useMutation(api.aiUsage.logAndIncrement);
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl);
  const getStorageUrl = useMutation(api.assets.getStorageUrl);
  const publishToSite = useMutation(api.blogs.publishToSite);

  const [activeTab, setActiveTab] = useState<SidebarTab>('blogs');
  const [saving, setSaving] = useState(false);
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");
  const [localExcerpt, setLocalExcerpt] = useState("");
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [localSeoTitle, setLocalSeoTitle] = useState("");
  const [localSeoDescription, setLocalSeoDescription] = useState("");
  const [showPreview, setShowPreview] = useState(true); // Default to rendered view
  const [generateModel, setGenerateModel] = useState("gemini-3.1-flash-lite-preview");
  const [chatImages, setChatImages] = useState<{ base64: string; mimeType: string; preview: string }[]>([]);
  const chatImageInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with current blog
  useEffect(() => {
    if (currentBlog) {
      setLocalTitle(currentBlog.title);
      setLocalContent(currentBlog.content);
      setLocalExcerpt(currentBlog.excerpt || "");
      setLocalTags(currentBlog.tags);
      setLocalSeoTitle(currentBlog.seoTitle || "");
      setLocalSeoDescription(currentBlog.seoDescription || "");
    }
  }, [currentBlog?._id]);

  const handleTabClick = (tab: SidebarTab) => {
    // Blog editor only handles 'blogs' tab — navigate to design page for other tabs
    if (tab && tab !== 'blogs' && workspaceId) {
      router.push(localizeHref(`/design?workspace=${workspaceId}`, locale));
      return;
    }
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const handleCreateBlog = async () => {
    if (!workspaceId) return;
    const id = await createBlog({
      workspaceId,
      title: "Untitled Blog Post",
    });
    router.push(localizeHref(`/blog-editor?workspace=${workspaceId}&blog=${id}`, locale));
  };

  const handleSave = async () => {
    if (!blogIdParam || saving) return;
    setSaving(true);
    try {
      await updateBlog({
        id: blogIdParam,
        title: localTitle,
        content: localContent,
        excerpt: localExcerpt,
        tags: localTags,
        seoTitle: localSeoTitle,
        seoDescription: localSeoDescription,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!blogIdParam) return;
    await handleSave();
    await publishBlog({ id: blogIdParam });
  };

  const handleUnpublish = async () => {
    if (!blogIdParam) return;
    await unpublishBlog({ id: blogIdParam });
  };

  const handleDelete = async () => {
    if (!blogIdParam || !workspaceId) return;
    await removeBlog({ id: blogIdParam });
    router.push(localizeHref(`/blog-editor?workspace=${workspaceId}`, locale));
  };

  const [publishingToSite, setPublishingToSite] = useState(false);
  const [publishedToSite, setPublishedToSite] = useState(false);

  const handlePublishToSite = async () => {
    if (!blogIdParam || publishingToSite) return;
    setPublishingToSite(true);
    try {
      await handleSave();
      await publishBlog({ id: blogIdParam });
      await publishToSite({ workspaceBlogId: blogIdParam });
      setPublishedToSite(true);
      setTimeout(() => setPublishedToSite(false), 3000);
    } catch (e) {
      console.error("Publish to site failed:", e);
    } finally {
      setPublishingToSite(false);
    }
  };

  const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1] || result;
        setChatImages(prev => [...prev, { base64, mimeType: file.type, preview: result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleUploadBlogImage = async (file: File): Promise<string | null> => {
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) return null;
      const { storageId } = await res.json();
      const url = await getStorageUrl({ storageId });
      return url || null;
    } catch (e) {
      console.error("Blog image upload failed:", e);
      return null;
    }
  };

  // ─── Multi-blog generation handler ──────────────────────────
  const handleMultipleBlogsGenerated = async (
    generatedBlogs: Array<{ title: string; content: string; excerpt: string; tags: string[]; seoTitle: string; seoDescription: string }>
  ) => {
    if (!workspaceId) return;
    for (const blog of generatedBlogs) {
      const id = await createBlog({
        workspaceId,
        title: blog.title,
        content: blog.content,
        tags: blog.tags,
      });
      // Update with excerpt and SEO fields not accepted by create
      if (blog.excerpt || blog.seoTitle || blog.seoDescription) {
        await updateBlog({
          id,
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          tags: blog.tags,
          seoTitle: blog.seoTitle,
          seoDescription: blog.seoDescription,
        });
      }
    }
  };

  // Auth loading
  if (authLoading || user === undefined) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  // Beta gate
  if (hasBeta === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 dark:text-neutral-300 mb-2">Blog Engine</h2>
          <p className="text-sm text-gray-400">This feature is currently in beta. Contact us for early access.</p>
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-700 dark:text-neutral-300 mb-2">{t("design.noWorkspace")}</h2>
          <p className="text-sm text-gray-400 mb-6">{t("design.selectWorkspace")}</p>
          <Link href="/workspaces" className="px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-black text-white rounded-xl font-bold text-sm hover:scale-105 transition-all active:scale-95">
            {t("design.goToWorkspaces")}
          </Link>
        </div>
      </div>
    );
  }

  // Blog Editor View
  if (blogIdParam && currentBlog) {
    return (
      <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
        <Sidebar
          activeTab={activeTab}
          onTabClick={handleTabClick}
          workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))}
          currentWorkspaceId={workspaceId ?? undefined}
          currentWorkspaceName={workspace?.name}
          hasBlogBeta={true}
        >
          {null}
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top nav bar */}
          <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
            <nav className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-4">
              <button
                onClick={() => router.push(localizeHref(`/blog-editor?workspace=${workspaceId}`, locale))}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-neutral-300 transition-all"
              >
                <ArrowLeft size={15} />
              </button>

              <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />

              <span className="hidden md:flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white shrink-0">
                <FileText size={14} />
                Blog
              </span>

              <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />

              {/* Status badge */}
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                currentBlog.status === 'published'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : currentBlog.status === 'archived'
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {currentBlog.status}
              </span>

              <div className="flex-1" />

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Toggle between Edit and Preview */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    !showPreview
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {showPreview ? (
                    <>
                      <Pencil size={12} />
                      Edit
                    </>
                  ) : (
                    <>
                      <Eye size={12} />
                      Preview
                    </>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save
                </button>

                {currentBlog.status === 'published' ? (
                  <button
                    onClick={handleUnpublish}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                  >
                    Unpublish
                  </button>
                ) : (
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-all"
                  >
                    Publish
                  </button>
                )}

                {/* Admin: Publish to public site */}
                {isAdmin && (
                  <button
                    onClick={handlePublishToSite}
                    disabled={publishingToSite}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg hover:scale-105 transition-all active:scale-95 ${
                      publishedToSite
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-900 dark:bg-white text-white dark:text-black'
                    }`}
                  >
                    {publishingToSite ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                    {publishedToSite ? 'Live!' : 'Publish to Site'}
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </nav>
          </div>

          {/* Main content area */}
          <div className="flex-1 relative overflow-hidden">
            <div className="h-full overflow-y-auto p-3 md:p-6 pb-40">
              <div className="max-w-3xl mx-auto">
                <BlogContentEditor
                  title={localTitle}
                  setTitle={setLocalTitle}
                  content={localContent}
                  setContent={setLocalContent}
                  excerpt={localExcerpt}
                  setExcerpt={setLocalExcerpt}
                  tags={localTags}
                  setTags={setLocalTags}
                  seoTitle={localSeoTitle}
                  setSeoTitle={setLocalSeoTitle}
                  seoDescription={localSeoDescription}
                  setSeoDescription={setLocalSeoDescription}
                  showPreview={showPreview}
                  onUploadImage={handleUploadBlogImage}
                />
              </div>
            </div>

            {/* Blog AI Chat Panel */}
            <BlogAgentChatPanel
              workspaceId={workspaceId}
              workspace={workspace ? { name: workspace.name, website: workspace.website, industry: workspace.industry, defaultLanguage: workspace.defaultLanguage, websiteInfo: workspace.websiteInfo as Record<string, unknown> | undefined } : null}
              branding={branding ? { brandName: branding.brandName, tagline: branding.tagline, colors: branding.colors, fonts: branding.fonts } : null}
              blogTitle={localTitle}
              blogContent={localContent}
              blogExcerpt={localExcerpt}
              blogTags={localTags}
              allBlogs={(blogs || []).map(b => ({ title: b.title, status: b.status, excerpt: b.excerpt, tags: b.tags, updatedAt: b.updatedAt }))}
              assets={(assets || []).map(a => ({ _id: a._id, url: a.url ?? null, type: a.type, fileName: a.fileName, label: a.label, description: a.description, aiAnalysis: a.aiAnalysis }))}
              onBlogUpdated={(updates) => {
                if (updates.title !== undefined) setLocalTitle(updates.title);
                if (updates.content !== undefined) setLocalContent(updates.content);
                if (updates.excerpt !== undefined) setLocalExcerpt(updates.excerpt);
                if (updates.tags !== undefined) setLocalTags(updates.tags);
                if (updates.seoTitle !== undefined) setLocalSeoTitle(updates.seoTitle);
                if (updates.seoDescription !== undefined) setLocalSeoDescription(updates.seoDescription);
              }}
              onMultipleBlogsGenerated={handleMultipleBlogsGenerated}
              onUsageLog={async (usage) => {
                try {
                  await logAndIncrement({
                    workspaceId: workspaceId || undefined,
                    category: "blog_generation",
                    model: usage.model || "gemini-3.1-flash-lite-preview",
                    promptTokens: usage.promptTokens || 0,
                    completionTokens: usage.completionTokens || 0,
                    totalTokens: usage.totalTokens || 0,
                    endpoint: "/api/generate-blog",
                  });
                } catch (e) {
                  console.error("Usage log failed:", e);
                }
              }}
              generateModel={generateModel}
              setGenerateModel={setGenerateModel}
              chatImages={chatImages}
              setChatImages={setChatImages}
              onChatImageUpload={handleChatImageUpload}
              chatImageInputRef={chatImageInputRef}
            />
          </div>
        </div>
      </div>
    );
  }

  // Blog List View — rendered blog previews
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
      <Sidebar
        activeTab={activeTab}
        onTabClick={handleTabClick}
        workspaces={workspaces?.map(w => ({ _id: w._id, name: w.name }))}
        currentWorkspaceId={workspaceId ?? undefined}
        currentWorkspaceName={workspace?.name}
        hasBlogBeta={true}
      >
        {null}
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav */}
        <div className="shrink-0 pt-4 pb-2 px-6 relative z-[90]">
          <nav className="max-w-4xl mx-auto bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-neutral-700/50 rounded-full shadow-sm px-5 h-14 flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white shrink-0">
              <FileText size={14} />
              Blog Posts
            </span>
            <div className="w-px h-5 bg-slate-200 dark:bg-neutral-700" />
            <span className="text-xs font-medium text-slate-400">{blogs?.length || 0} post{(blogs?.length || 0) !== 1 ? 's' : ''}</span>
            <div className="flex-1" />
            <button
              onClick={handleCreateBlog}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-all active:scale-95"
            >
              <Plus size={12} />
              New Post
            </button>
          </nav>
        </div>

        {/* Blog list */}
        <div className="flex-1 relative overflow-hidden">
        <main className="h-full overflow-y-auto p-3 md:p-6 pb-40">
          {blogs === undefined ? (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-neutral-600 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-gray-500 dark:text-neutral-400 mb-2">No blog posts yet</h2>
                <p className="text-sm text-gray-400 mb-6">Use the chat below to generate AI-powered blog posts</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {blogs.map((blog) => {
                const blogWordCount = blog.content?.split(/\s+/).filter(Boolean).length || 0;
                const blogReadTime = Math.max(1, Math.round(blogWordCount / 200));

                return (
                  <button
                    key={blog._id}
                    onClick={() => router.push(localizeHref(`/blog-editor?workspace=${workspaceId}&blog=${blog._id}`, locale))}
                    className="w-full text-left bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl p-6 md:p-8 hover:shadow-lg hover:border-slate-300 dark:hover:border-neutral-600 transition-all group"
                  >
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-4">
                      {blog.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 rounded-full"
                        >
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                      {blog.tags.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{blog.tags.length - 4}</span>
                      )}
                      <div className="flex-1" />
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : blog.status === 'archived'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {blog.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight mb-3 text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-neutral-200 transition-colors">
                      {blog.title}
                    </h2>

                    {/* Content preview */}
                    {blog.content && (
                      <div className="mb-4">
                        <BlogCardMarkdownPreview content={blog.content} />
                      </div>
                    )}

                    {/* Meta line */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-3 border-t border-slate-100 dark:border-neutral-800">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(blog.updatedAt).toLocaleDateString()}
                      </span>
                      {blogWordCount > 0 && (
                        <>
                          <span>{blogWordCount} words</span>
                          <span>{blogReadTime} min read</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* Blog AI Chat Panel — available on list page too */}
        <BlogAgentChatPanel
          workspaceId={workspaceId}
          workspace={workspace ? { name: workspace.name, website: workspace.website, industry: workspace.industry, defaultLanguage: workspace.defaultLanguage, websiteInfo: workspace.websiteInfo as Record<string, unknown> | undefined } : null}
          branding={branding ? { brandName: branding.brandName, tagline: branding.tagline, colors: branding.colors, fonts: branding.fonts } : null}
          blogTitle=""
          blogContent=""
          blogExcerpt=""
          blogTags={[]}
          allBlogs={(blogs || []).map(b => ({ title: b.title, status: b.status, excerpt: b.excerpt, tags: b.tags, updatedAt: b.updatedAt }))}
          assets={(assets || []).map(a => ({ _id: a._id, url: a.url ?? null, type: a.type, fileName: a.fileName, label: a.label, description: a.description, aiAnalysis: a.aiAnalysis }))}
          onBlogUpdated={() => {}}
          onMultipleBlogsGenerated={handleMultipleBlogsGenerated}
          onUsageLog={async (usage) => {
            try {
              await logAndIncrement({
                workspaceId: workspaceId || undefined,
                category: "blog_generation",
                model: usage.model || "gemini-3.1-flash-lite-preview",
                promptTokens: usage.promptTokens || 0,
                completionTokens: usage.completionTokens || 0,
                totalTokens: usage.totalTokens || 0,
                endpoint: "/api/blog-agent",
              });
            } catch (e) {
              console.error("Usage log failed:", e);
            }
          }}
          generateModel={generateModel}
          setGenerateModel={setGenerateModel}
          chatImages={chatImages}
          setChatImages={setChatImages}
          onChatImageUpload={handleChatImageUpload}
          chatImageInputRef={chatImageInputRef}
        />
        </div>
      </div>
    </div>
  );
}
