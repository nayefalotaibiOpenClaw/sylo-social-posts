"use client";

import React from "react";
import { Settings, Palette, Upload, Sparkles, X } from "lucide-react";
import Link from "next/link";

export type SidebarTab = 'settings' | 'theme' | 'assets' | 'generate' | null;

const SIDEBAR_ITEMS: { id: SidebarTab; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'theme', icon: Palette, label: 'Theme' },
  { id: 'assets', icon: Upload, label: 'Assets' },
  { id: 'generate', icon: Sparkles, label: 'Generate' },
];

interface SidebarProps {
  activeTab: SidebarTab;
  onTabClick: (tab: SidebarTab) => void;
  children: React.ReactNode;
}

export default function Sidebar({ activeTab, onTabClick, children }: SidebarProps) {
  const panelOpen = activeTab !== null;

  return (
    <>
      {/* Icon Rail */}
      <div className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1 shrink-0">
        <Link href="/workspaces" className="w-10 h-10 bg-[#1B4332] rounded-xl flex items-center justify-center mb-4" title="Back to Workspaces">
          <span className="text-white font-black text-sm">S</span>
        </Link>
        {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabClick(id)}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-[10px] font-medium ${
              activeTab === id
                ? 'bg-[#1B4332] text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>

      {/* Expandable Panel */}
      <div
        className={`bg-white border-r border-gray-200 overflow-y-auto shrink-0 transition-all duration-300 ${
          panelOpen ? 'w-[280px]' : 'w-0'
        }`}
      >
        {panelOpen && (
          <div className="w-[280px] p-5">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900 capitalize">{activeTab}</h2>
              <button onClick={() => onTabClick(null)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            {children}
          </div>
        )}
      </div>
    </>
  );
}
