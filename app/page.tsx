"use client";

import { useState } from "react";
import { LayoutGrid, List, Pencil, Sparkles, Palette } from "lucide-react";
import { EditContext, AspectRatioContext, AspectRatioType } from "./components/EditContext";
import { ThemeProvider } from "./components/ThemeContext";
import Link from "next/link";
import SummerOfferPost from "./components/SummerOffer";
import RelaxPost from "./components/RelaxPost";
import OfflineModePost from "./components/OfflineModePost";
import OnePlatformPost from "./components/OnePlatformPost";
import KitchenDisplayPost from "./components/KitchenDisplayPost";
import AnalyticsPost from "./components/AnalyticsPost";
import OnlineStorePost from "./components/OnlineStorePost";
import DeliveryIntegrationPost from "./components/DeliveryIntegrationPost";
import HRAttendancePost from "./components/HRAttendancePost";
import TaskManagementPost from "./components/TaskManagementPost";
import LoyaltyPost from "./components/LoyaltyPost";
import InventoryPost from "./components/InventoryPost";
import AccountingPost from "./components/AccountingPost";
import AIInsightsPost from "./components/AIInsightsPost";
import MultiBranchPost from "./components/MultiBranchPost";
import MobileDashboardPost from "./components/MobileDashboardPost";
import StaffManagementPost from "./components/StaffManagementPost";
import InventoryStockPost from "./components/InventoryStockPost";
import MenuPerformancePost from "./components/MenuPerformancePost";
import PostWrapper from "./components/PostWrapper";

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editMode, setEditMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Controls Header */}
      <div className="max-w-[1920px] mx-auto flex justify-between items-center mb-12">
        <h1 className="text-2xl font-black text-[#1B4332]">Social Media Kit</h1>
        
        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <Sparkles size={16} />
            Generate
          </Link>
          <Link
            href="/customize"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50"
          >
            <Palette size={16} />
            Theme
          </Link>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              editMode
                ? 'bg-yellow-400 text-yellow-900 shadow-md'
                : 'bg-white text-gray-500 border border-gray-200 shadow-sm hover:bg-gray-50'
            }`}
          >
            <Pencil size={16} />
            {editMode ? 'Editing' : 'Edit Mode'}
          </button>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex gap-1">
            {(['1:1', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  aspectRatio === ratio
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-[#1B4332] text-white shadow-sm' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-[#1B4332] text-white shadow-sm' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title="List View"
          >
            <List size={20} />
          </button>
        </div>
        </div>
      </div>

      {/* Content Grid/List */}
      <ThemeProvider>
      <EditContext.Provider value={editMode}>
      <AspectRatioContext.Provider value={aspectRatio}>
      <div className={`
        mx-auto transition-all duration-500 justify-center
        ${viewMode === 'grid'
          ? 'flex flex-wrap gap-8'
          : 'flex flex-col items-center space-y-12'
        }
      `}>
          <PostWrapper aspectRatio={aspectRatio} filename="mobile-dashboard"><MobileDashboardPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="staff-management"><StaffManagementPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="inventory-stock"><InventoryStockPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="menu-performance"><MenuPerformancePost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="inventory"><InventoryPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="accounting"><AccountingPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="ai-insights"><AIInsightsPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="multi-branch"><MultiBranchPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="delivery-integration"><DeliveryIntegrationPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="hr-attendance"><HRAttendancePost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="task-management"><TaskManagementPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="loyalty"><LoyaltyPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="kitchen-display"><KitchenDisplayPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="analytics"><AnalyticsPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="online-store"><OnlineStorePost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="offline-mode"><OfflineModePost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="one-platform"><OnePlatformPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="summer-offer"><SummerOfferPost /></PostWrapper>
          <PostWrapper aspectRatio={aspectRatio} filename="relax"><RelaxPost /></PostWrapper>
      </div>
      </AspectRatioContext.Provider>
      </EditContext.Provider>
      </ThemeProvider>
    </main>
  );
}
