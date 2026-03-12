"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Send, X, Building2, LayoutGrid, LinkIcon, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export type SidebarTab = 'brand' | 'design' | 'theme' | 'assets' | 'generate' | 'publish' | 'channels' | null;

export const SIDEBAR_ITEMS: { id: SidebarTab; icon: React.ComponentType<{ size?: number }>; label: string; fullPage?: boolean }[] = [
  { id: 'brand', icon: Building2, label: 'Brand', fullPage: true },
  { id: 'design', icon: LayoutGrid, label: 'Design', fullPage: true },
  // theme tab removed — included in Brand page
  { id: 'assets', icon: Upload, label: 'Assets', fullPage: true },
  // generate is now a sub-tab inside Design page
  { id: 'publish', icon: Send, label: 'Publish', fullPage: true },
  { id: 'channels', icon: LinkIcon, label: 'Channels', fullPage: true },
];

interface WorkspaceItem {
  _id: string;
  name: string;
}

interface SidebarProps {
  activeTab: SidebarTab;
  onTabClick: (tab: SidebarTab) => void;
  children: React.ReactNode;
  workspaces?: WorkspaceItem[];
  currentWorkspaceId?: string;
  currentWorkspaceName?: string;
}

export default function Sidebar({ activeTab, onTabClick, children, workspaces, currentWorkspaceId, currentWorkspaceName }: SidebarProps) {
  const activeItem = SIDEBAR_ITEMS.find(i => i.id === activeTab);
  const panelOpen = activeTab !== null && activeTab !== 'generate' && !activeItem?.fullPage;
  const [hoveredTab, setHoveredTab] = useState<SidebarTab>(null);
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    if (!showWorkspaces) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowWorkspaces(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showWorkspaces]);

  const initial = currentWorkspaceName?.charAt(0)?.toUpperCase() || "S";

  return (
    <>
      {/* Desktop Icon Rail - hidden on mobile */}
      <div className="hidden md:flex w-[68px] bg-white dark:bg-neutral-900 flex-col items-center justify-center shrink-0 relative h-full pl-2 z-[70]">
        {/* Top: Workspace switcher */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2" ref={dropdownRef}>
          <button
            onClick={() => setShowWorkspaces(!showWorkspaces)}
            className={`w-[42px] h-[42px] rounded-full border flex items-center justify-center transition-colors ${
              showWorkspaces ? 'border-[#1B4332] shadow-md' : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
            }`}
            title={currentWorkspaceName || "Switch Workspace"}
          >
            <span className="w-8 h-8 bg-[#1B4332] rounded-full flex items-center justify-center">
              <span className="text-white font-black text-xs">{initial}</span>
            </span>
          </button>

          {/* Workspace dropdown */}
          {showWorkspaces && workspaces && workspaces.length > 0 && (
            <div className="absolute left-full ml-3 top-0 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-700 py-2 z-50">
              <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Workspaces</p>
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    setShowWorkspaces(false);
                    if (ws._id !== currentWorkspaceId) {
                      router.push(`/design?workspace=${ws._id}`);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors ${
                    ws._id === currentWorkspaceId ? 'bg-slate-50 dark:bg-neutral-800' : ''
                  }`}
                >
                  <span className="w-7 h-7 bg-[#1B4332] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[10px]">{ws.name.charAt(0).toUpperCase()}</span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-neutral-300 truncate flex-1">{ws.name}</span>
                  {ws._id === currentWorkspaceId && (
                    <Check size={14} className="text-[#1B4332] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Pill nav container */}
        <div className="border border-gray-200 dark:border-neutral-700 rounded-full flex flex-col items-center py-1.5 px-1.5 gap-0">
          {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
            <div key={id} className="relative">
              <button
                onClick={() => onTabClick(id)}
                onMouseEnter={() => setHoveredTab(id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  activeTab === id || (id === 'design' && (activeTab === null || activeTab === 'generate'))
                    ? 'bg-gray-200/70 dark:bg-neutral-700 text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
              >
                <Icon size={18} />
              </button>
              {/* Tooltip */}
              {hoveredTab === id && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  {label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Expandable Panel - hidden on mobile */}
      <div
        className={`hidden md:block bg-white dark:bg-neutral-900 overflow-y-auto shrink-0 transition-all duration-300 ${
          panelOpen ? 'w-[280px]' : 'w-0'
        }`}
      >
        {panelOpen && (
          <div className="w-[280px] p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
              <button onClick={() => onTabClick(null)} className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300">
                <X size={16} />
              </button>
            </div>
            {children}
          </div>
        )}
      </div>

      {/* Mobile Panel - slides up as overlay */}
      {panelOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={() => onTabClick(null)} />
          {/* Panel */}
          <div className="bg-white dark:bg-neutral-900 rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up safe-area-bottom">
            <div className="sticky top-0 bg-white dark:bg-neutral-900 z-10 px-5 pt-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
              <div className="w-10 h-1 bg-gray-300 dark:bg-neutral-600 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h2>
                <button onClick={() => onTabClick(null)} className="text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-5">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
