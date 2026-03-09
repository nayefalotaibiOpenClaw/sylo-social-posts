"use client";

import React, { useState, useCallback, useRef } from "react";
import { X, Check, Download, Loader2, Settings, Palette } from "lucide-react";
import { toPng } from "html-to-image";
import { downloadPostsAsZip } from "@/lib/export/download";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "@/contexts/EditContext";
import { useTheme, useSetTheme, Theme, defaultTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import SeasonsHeroPost from "@/app/components/SeasonsHeroPost";
import SeasonsGiftPost from "@/app/components/SeasonsGiftPost";
import SeasonsSubscriptionPost from "@/app/components/SeasonsSubscriptionPost";
import SeasonsNewbornPost from "@/app/components/SeasonsNewbornPost";
import SeasonsMultiBrandPost from "@/app/components/SeasonsMultiBrandPost";
import SeasonsExpressPost from "@/app/components/SeasonsExpressPost";
import SeasonsCustomTrayPost from "@/app/components/SeasonsCustomTrayPost";
import SeasonsOfferPost from "@/app/components/SeasonsOfferPost";
import SeasonsCarePost from "@/app/components/SeasonsCarePost";
import SeasonsRomancePost from "@/app/components/SeasonsRomancePost";
import SeasonsCakePost from "@/app/components/SeasonsCakePost";
import SeasonsCorporatePost from "@/app/components/SeasonsCorporatePost";
import SeasonsChocolatePost from "@/app/components/SeasonsChocolatePost";
import SeasonsAppExperiencePost from "@/app/components/SeasonsAppExperiencePost";
import SeasonsGetWellSoonPost from "@/app/components/SeasonsGetWellSoonPost";
import SeasonsThankYouPost from "@/app/components/SeasonsThankYouPost";
import SeasonsSubscriptionBenefitPost from "@/app/components/SeasonsSubscriptionBenefitPost";
import SeasonsGiftCardPost from "@/app/components/SeasonsGiftCardPost";
import SeasonsWorkshopPost from "@/app/components/SeasonsWorkshopPost";
import SeasonsModernBouquetPost from "@/app/components/SeasonsModernBouquetPost";
import SeasonsVaseCollectionPost from "@/app/components/SeasonsVaseCollectionPost";
import SeasonsLuxuryBoxPost from "@/app/components/SeasonsLuxuryBoxPost";
import SeasonsElegantArrangementPost from "@/app/components/SeasonsElegantArrangementPost";
import SeasonsSeasonalPost from "@/app/components/SeasonsSeasonalPost";
import SeasonsPremiumWhitePost from "@/app/components/SeasonsPremiumWhitePost";
import SeasonsFlowerBasketPost from "@/app/components/SeasonsFlowerBasketPost";
import SeasonsBrightVibePost from "@/app/components/SeasonsBrightVibePost";
import PostWrapper from "@/app/components/PostWrapper";

const SEASONS_POSTS = [
  { id: "seasons-hero", filename: "seasons-hero", component: SeasonsHeroPost },
  { id: "seasons-gift", filename: "seasons-gift", component: SeasonsGiftPost },
  { id: "seasons-sub", filename: "seasons-sub", component: SeasonsSubscriptionPost },
  { id: "seasons-modern", filename: "seasons-modern", component: SeasonsModernBouquetPost },
  { id: "seasons-vase", filename: "seasons-vase", component: SeasonsVaseCollectionPost },
  { id: "seasons-luxury", filename: "seasons-luxury", component: SeasonsLuxuryBoxPost },
  { id: "seasons-elegant", filename: "seasons-elegant", component: SeasonsElegantArrangementPost },
  { id: "seasons-seasonal", filename: "seasons-seasonal", component: SeasonsSeasonalPost },
  { id: "seasons-white", filename: "seasons-white", component: SeasonsPremiumWhitePost },
  { id: "seasons-basket", filename: "seasons-basket", component: SeasonsFlowerBasketPost },
  { id: "seasons-bright", filename: "seasons-bright", component: SeasonsBrightVibePost },
  { id: "seasons-romance", filename: "seasons-romance", component: SeasonsRomancePost },
  { id: "seasons-newborn", filename: "seasons-newborn", component: SeasonsNewbornPost },
  { id: "seasons-express", filename: "seasons-express", component: SeasonsExpressPost },
  { id: "seasons-cake", filename: "seasons-cake", component: SeasonsCakePost },
  { id: "seasons-choc", filename: "seasons-choc", component: SeasonsChocolatePost },
  { id: "seasons-corp", filename: "seasons-corp", component: SeasonsCorporatePost },
  { id: "seasons-multi", filename: "seasons-multi", component: SeasonsMultiBrandPost },
  { id: "seasons-app", filename: "seasons-app", component: SeasonsAppExperiencePost },
  { id: "seasons-gw", filename: "seasons-gw", component: SeasonsGetWellSoonPost },
  { id: "seasons-ty", filename: "seasons-ty", component: SeasonsThankYouPost },
  { id: "seasons-sub-ben", filename: "seasons-sub-ben", component: SeasonsSubscriptionBenefitPost },
  { id: "seasons-custom", filename: "seasons-custom", component: SeasonsCustomTrayPost },
  { id: "seasons-offer", filename: "seasons-offer", component: SeasonsOfferPost },
  { id: "seasons-card", filename: "seasons-card", component: SeasonsGiftCardPost },
  { id: "seasons-work", filename: "seasons-work", component: SeasonsWorkshopPost },
  { id: "seasons-care", filename: "seasons-care", component: SeasonsCarePost },
];

const SEASONS_PALETTE: Theme = {
  ...defaultTheme,
  primary: "#4C0519",
  primaryLight: "#FFF1F2",
  primaryDark: "#2D0310",
  accent: "#BE123C",
  accentLight: "#FB7185",
  accentLime: "#FDA4AF",
  border: "#881337",
  font: "var(--font-cairo), 'Cairo', sans-serif"
};

export default function SeasonsPage() {
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
    setTheme(SEASONS_PALETTE);
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedPosts.length === 0) return;
    setDownloading(true);
    try {
      await downloadPostsAsZip(
        postRefs.current,
        selectedPosts,
        selectedPosts.map(id => ({ id })),
        `seasons-posts-${selectedPosts.length}.zip`,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }, [selectedPosts]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <div className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0">
        <Link href="/" className="w-10 h-10 bg-rose-900 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-black text-sm">S</span>
        </Link>
        <button onClick={() => setActiveTab('settings')} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab === 'settings' ? 'bg-rose-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Settings size={20} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
        <button onClick={() => setActiveTab('theme')} className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab === 'theme' ? 'bg-rose-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Palette size={20} />
          <span className="text-[10px] font-medium">Theme</span>
        </button>
      </div>

      {activeTab && (
        <div className="w-[280px] bg-white border-r border-gray-200 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900 capitalize">{activeTab}</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          {activeTab === 'settings' && (
            <div className="space-y-6">
               <button onClick={() => setEditMode(!editMode)} className={`w-full py-2.5 rounded-lg text-xs font-bold border ${editMode ? 'bg-rose-100 text-rose-900 border-rose-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                 {editMode ? 'Disable Editing' : 'Enable Editing'}
               </button>
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                  <div className="flex gap-1">
                    {(['1:1', '9:16', '3:4'] as const).map((ratio) => (
                      <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${aspectRatio === ratio ? 'bg-rose-900 text-white' : 'bg-gray-50 text-gray-400'}`}>
                        {ratio}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'theme' && (
            <div className="space-y-4">
               <p className="text-xs text-gray-500">Theme optimized for Seasons.</p>
               <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentTheme).filter(([k]) => k !== 'font').map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                      <input type="color" value={value as string} onChange={(e) => setTheme({ ...currentTheme, [key]: e.target.value })} className="w-6 h-6 rounded cursor-pointer" />
                      <span className="text-[10px] font-semibold text-gray-500 truncate">{key}</span>
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
              <h1 className="text-4xl font-black text-rose-950">Seasons Flowers</h1>
              <p className="text-rose-900/60 font-bold mt-2">Custom posts for tryseasons.co</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => setSelectedPosts(SEASONS_POSTS.map(p => p.id))} className="px-4 py-2 text-rose-900 font-bold text-sm">Select All</button>
              <button onClick={handleDownloadSelected} disabled={downloading || selectedPosts.length === 0} className="px-6 py-3 bg-rose-900 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95">
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
            {SEASONS_POSTS.map(({ id, component: Post }) => {
              const isSelected = selectedPosts.includes(id);
              return (
                <div key={id} ref={(el) => { if (el) postRefs.current.set(id, el); }} onClick={() => setSelectedPosts(prev => isSelected ? prev.filter(p => p !== id) : [...prev, id])} className={`relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-rose-500 rounded-2xl p-1 bg-rose-50 scale-[0.98]' : 'hover:scale-[1.01]'}`}>
                  <PostWrapper aspectRatio={aspectRatio} filename={id}>
                    <Post />
                  </PostWrapper>
                  {isSelected && <div className="absolute top-4 right-4 bg-rose-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-50"><Check size={20} /></div>}
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
