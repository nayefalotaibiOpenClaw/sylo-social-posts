"use client";

import React, { useState, useCallback, useRef } from "react";
import { X, Check, Download, Loader2, Settings, Palette, Rocket } from "lucide-react";
import { downloadPostsAsZip } from "@/lib/export/download";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "@/contexts/EditContext";
import { useTheme, useSetTheme, Theme, defaultTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import ODesignsServicePost from "@/app/components/ODesignsServicePost";
import PostWrapper from "@/app/components/PostWrapper";

const ODESIGNS_POSTS = [
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57] as const).map(v => ({
    id: `odesigns-v-${v}`,
    filename: `odesigns-agency-post-${v}`,
    component: () => <ODesignsServicePost variant={v} />
  }))
];

const ODESIGNS_PALETTE: Theme = {
  ...defaultTheme,
  primary: "#0F172A", // Slate 900
  primaryLight: "#F1F5F9", // Slate 100
  primaryDark: "#020617", // Slate 950
  accent: "#06B6D4", // Cyan 500
  accentLight: "#67E8F9", // Cyan 300
  accentLime: "#22D3EE", // Cyan 400
  border: "#1E293B", // Slate 800
  font: "var(--font-cairo), 'Cairo', sans-serif"
};

export default function ODesignsPage() {
  const [editMode, setEditMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [activeTab, setActiveTab] = useState<'settings' | 'theme' | null>('theme');
  const currentTheme = useTheme();
  const setTheme = useSetTheme();

  React.useEffect(() => {
    setTheme(ODESIGNS_PALETTE);
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedPosts.length === 0) return;
    setDownloading(true);
    try {
      await downloadPostsAsZip(
        postRefs.current,
        selectedPosts,
        selectedPosts.map(id => ({ id })),
        `odesigns-agency-posts.zip`,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }, [selectedPosts]);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="w-[72px] bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-1 shrink-0">
        <Link href="/" className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <span className="text-white font-black text-sm">O</span>
        </Link>
        <button onClick={() => setActiveTab('settings')} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab === 'settings' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Settings size={20} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
        <button onClick={() => setActiveTab('theme')} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab === 'theme' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
          <Palette size={20} />
          <span className="text-[10px] font-medium">Theme</span>
        </button>
      </div>

      {activeTab && (
        <div className="w-[280px] bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-neutral-800 p-5 overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{activeTab}</h2>
            <button onClick={() => setActiveTab(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-300"><X size={16} /></button>
          </div>
          {activeTab === 'settings' && (
            <div className="space-y-6">
               <button onClick={() => setEditMode(!editMode)} className={`w-full py-2.5 rounded-lg text-xs font-bold border ${editMode ? 'bg-cyan-100 text-cyan-900 border-cyan-200' : 'bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-800'}`}>
                 {editMode ? 'Disable Editing' : 'Enable Editing'}
               </button>
               <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                  <div className="flex gap-1">
                    {(['1:1', '9:16', '3:4'] as const).map((ratio) => (
                      <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${aspectRatio === ratio ? 'bg-cyan-500 text-white' : 'bg-slate-50 dark:bg-neutral-900 text-slate-400'}`}>
                        {ratio}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'theme' && (
            <div className="space-y-4">
               <p className="text-xs text-slate-500 dark:text-neutral-400">Agency theme for oDesigns.</p>
               <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentTheme).filter(([k]) => k !== 'font').map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800">
                      <input type="color" value={value as string} onChange={(e) => setTheme({ ...currentTheme, [key]: e.target.value })} className="w-6 h-6 rounded cursor-pointer" />
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-neutral-400 truncate">{key}</span>
                    </label>
                  ))}
               </div>
            </div>
          )}
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <Rocket className="text-cyan-500" size={32} />
                 <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">oDesigns Agency</h1>
              </div>
              <p className="text-slate-500 dark:text-neutral-400 font-bold ml-1">Premium Social Media Content & Management Engine</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => setSelectedPosts(ODESIGNS_POSTS.map(p => p.id))} className="px-4 py-2 text-slate-600 dark:text-neutral-400 font-bold text-sm">Select All</button>
              <button onClick={handleDownloadSelected} disabled={downloading || selectedPosts.length === 0} className="px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-black rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-xl">
                 {downloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                 Download {selectedPosts.length > 0 ? `(${selectedPosts.length})` : ''}
              </button>
           </div>
        </div>

        <EditContext.Provider value={editMode}>
        <AspectRatioContext.Provider value={aspectRatio}>
        <SelectedIdContext.Provider value={selectedId}>
        <SetSelectedIdContext.Provider value={handleSetSelectedId}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ODESIGNS_POSTS.map(({ id, component: Post }) => {
              const isSelected = selectedPosts.includes(id);
              return (
                <div key={id} ref={(el) => { if (el) postRefs.current.set(id, el); }} onClick={() => setSelectedPosts(prev => isSelected ? prev.filter(p => p !== id) : [...prev, id])} className={`relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-cyan-500 rounded-2xl p-1 bg-cyan-50 scale-[0.98]' : 'hover:scale-[1.01]'}`}>
                  <PostWrapper aspectRatio={aspectRatio} filename={id}>
                    <Post />
                  </PostWrapper>
                  {isSelected && <div className="absolute top-4 right-4 bg-cyan-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-50"><Check size={20} /></div>}
                </div>
              );
            })}
          </div>
        </SetSelectedIdContext.Provider>
        </SelectedIdContext.Provider>
        </AspectRatioContext.Provider>
        </EditContext.Provider>
      </main>
    </div>
  );
}
