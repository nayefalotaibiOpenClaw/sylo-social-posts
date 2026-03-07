"use client";

import React, { useState, useCallback, useRef } from "react";
import { LayoutGrid, List, Sparkles, Palette, ArrowUpDown, Pencil } from "lucide-react";
import { EditContext, AspectRatioContext, AspectRatioType, SelectedIdContext, SetSelectedIdContext } from "./components/EditContext";
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
import WasteReductionPost from "./components/WasteReductionPost";
import QualityControlPost from "./components/QualityControlPost";
import IntegratedPaymentsPost from "./components/IntegratedPaymentsPost";
import RegionalScalabilityPost from "./components/RegionalScalabilityPost";
import CustomerInsightsPost from "./components/CustomerInsightsPost";
import TableOrderingPost from "./components/TableOrderingPost";
import MenuManagementPost from "./components/MenuManagementPost";
import DashboardOverviewPost from "./components/DashboardOverviewPost";
import ReportsExportPost from "./components/ReportsExportPost";
import ProfitCenterPost from "./components/ProfitCenterPost";
import SmartWorkflowsPost from "./components/SmartWorkflowsPost";
import OnlineOrderingPost from "./components/OnlineOrderingPost";
import PostWrapper from "./components/PostWrapper";

const POST_REGISTRY: { id: string; filename: string; component: React.ComponentType }[] = [
  { id: "profit-center", filename: "profit-center", component: ProfitCenterPost },
  { id: "smart-workflows", filename: "smart-workflows", component: SmartWorkflowsPost },
  { id: "online-ordering", filename: "online-ordering", component: OnlineOrderingPost },
  { id: "table-ordering", filename: "table-ordering", component: TableOrderingPost },
  { id: "menu-management", filename: "menu-management", component: MenuManagementPost },
  { id: "dashboard-overview", filename: "dashboard-overview", component: DashboardOverviewPost },
  { id: "reports-export", filename: "reports-export", component: ReportsExportPost },
  { id: "customer-insights", filename: "customer-insights", component: CustomerInsightsPost },
  { id: "waste-reduction", filename: "waste-reduction", component: WasteReductionPost },
  { id: "quality-control", filename: "quality-control", component: QualityControlPost },
  { id: "integrated-payments", filename: "integrated-payments", component: IntegratedPaymentsPost },
  { id: "regional-scalability", filename: "regional-scalability", component: RegionalScalabilityPost },
  { id: "mobile-dashboard", filename: "mobile-dashboard", component: MobileDashboardPost },
  { id: "staff-management", filename: "staff-management", component: StaffManagementPost },
  { id: "inventory-stock", filename: "inventory-stock", component: InventoryStockPost },
  { id: "menu-performance", filename: "menu-performance", component: MenuPerformancePost },
  { id: "inventory", filename: "inventory", component: InventoryPost },
  { id: "accounting", filename: "accounting", component: AccountingPost },
  { id: "ai-insights", filename: "ai-insights", component: AIInsightsPost },
  { id: "multi-branch", filename: "multi-branch", component: MultiBranchPost },
  { id: "delivery-integration", filename: "delivery-integration", component: DeliveryIntegrationPost },
  { id: "hr-attendance", filename: "hr-attendance", component: HRAttendancePost },
  { id: "task-management", filename: "task-management", component: TaskManagementPost },
  { id: "loyalty", filename: "loyalty", component: LoyaltyPost },
  { id: "kitchen-display", filename: "kitchen-display", component: KitchenDisplayPost },
  { id: "analytics", filename: "analytics", component: AnalyticsPost },
  { id: "online-store", filename: "online-store", component: OnlineStorePost },
  { id: "offline-mode", filename: "offline-mode", component: OfflineModePost },
  { id: "one-platform", filename: "one-platform", component: OnePlatformPost },
  { id: "summer-offer", filename: "summer-offer", component: SummerOfferPost },
  { id: "relax", filename: "relax", component: RelaxPost },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editMode, setEditMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
  const [gridCols, setGridCols] = useState(3);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleSetSelectedId = useCallback((id: string | null) => setSelectedId(id), []);
  const [postOrder, setPostOrder] = useState(() => POST_REGISTRY.map(p => p.id));
  const [reorderMode, setReorderMode] = useState(false);
  const dragItem = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragEnter = useCallback((targetId: string) => {
    if (!dragItem.current || dragItem.current === targetId) return;
    setPostOrder(prev => {
      const newOrder = [...prev];
      const fromIdx = newOrder.indexOf(dragItem.current!);
      const toIdx = newOrder.indexOf(targetId);
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, dragItem.current!);
      return newOrder;
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8" onClick={() => editMode && setSelectedId(null)}>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border shadow-sm transition-all ${
              editMode
                ? 'bg-yellow-400 text-yellow-900 border-yellow-500'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Pencil size={16} />
            {editMode ? 'Editing' : 'Edit Mode'}
          </button>
          <button
            onClick={() => setReorderMode(!reorderMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border shadow-sm transition-all ${
              reorderMode
                ? 'bg-[#1B4332] text-white border-[#1B4332]'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ArrowUpDown size={16} />
            Reorder
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
            {[2, 3, 4].map((cols) => (
              <button
                key={cols}
                onClick={() => { setGridCols(cols); setViewMode('grid'); }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'grid' && gridCols === cols
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {cols}
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
      <EditContext.Provider value={editMode}>
      <AspectRatioContext.Provider value={aspectRatio}>
      <SelectedIdContext.Provider value={selectedId}>
      <SetSelectedIdContext.Provider value={handleSetSelectedId}>
      <div
        className={`
          mx-auto transition-all duration-500
          ${viewMode === 'list' ? 'flex flex-col items-center space-y-12' : 'gap-6'}
          ${editMode ? 'edit-mode' : ''}
        `}
        style={viewMode === 'grid' ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        } : undefined}
      >
          {postOrder.map((id) => {
            const post = POST_REGISTRY.find(p => p.id === id);
            if (!post) return null;
            const PostComponent = post.component;
            return (
              <div
                key={id}
                draggable={reorderMode}
                onDragStart={reorderMode ? (e) => {
                  dragItem.current = id;
                  setDraggingId(id);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', id);
                } : undefined}
                onDragOver={reorderMode ? (e) => {
                  e.preventDefault();
                } : undefined}
                onDragEnter={reorderMode ? () => {
                  handleDragEnter(id);
                } : undefined}
                onDragEnd={reorderMode ? () => {
                  dragItem.current = null;
                  setDraggingId(null);
                } : undefined}
                className="relative"
                style={{
                  opacity: draggingId === id ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                  cursor: reorderMode ? 'grab' : undefined,
                }}
              >
                <PostWrapper aspectRatio={aspectRatio} filename={post.filename}>
                  <PostComponent />
                </PostWrapper>
                {reorderMode && <div className="absolute inset-0 z-10 rounded-xl border-2 border-dashed border-transparent hover:border-[#1B4332]/30 transition-colors" />}
              </div>
            );
          })}
      </div>
      </SetSelectedIdContext.Provider>
      </SelectedIdContext.Provider>
      </AspectRatioContext.Provider>
      </EditContext.Provider>
    </main>
  );
}
