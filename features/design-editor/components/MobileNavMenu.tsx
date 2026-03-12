"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { SIDEBAR_ITEMS, type SidebarTab } from "./Sidebar";

interface WorkspaceItem {
  _id: string;
  name: string;
}

interface MobileNavMenuProps {
  activeTab: SidebarTab;
  onTabClick: (tab: SidebarTab) => void;
  workspaces?: WorkspaceItem[];
  currentWorkspaceId?: string;
  currentWorkspaceName?: string;
}

export default function MobileNavMenu({ activeTab, onTabClick, workspaces, currentWorkspaceId, currentWorkspaceName }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = SIDEBAR_ITEMS.find(i => i.id === activeTab) || SIDEBAR_ITEMS.find(i => i.id === 'design');
  const Icon = current?.icon;
  const initial = currentWorkspaceName?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="md:hidden relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          open ? 'bg-gray-200/70 dark:bg-neutral-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-neutral-400 active:bg-gray-100 dark:active:bg-slate-800'
        }`}
      >
        {open ? <X size={16} /> : Icon ? <Icon size={16} /> : null}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-700 py-2 min-w-[200px] z-[100]">
          {/* Workspace switcher */}
          {workspaces && workspaces.length > 0 && (
            <>
              <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Workspace</p>
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    setOpen(false);
                    if (ws._id !== currentWorkspaceId) {
                      router.push(`/design?workspace=${ws._id}`);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    ws._id === currentWorkspaceId ? 'bg-slate-50 dark:bg-neutral-800' : 'hover:bg-slate-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="w-6 h-6 bg-[#1B4332] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[9px]">{ws.name.charAt(0).toUpperCase()}</span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-neutral-300 truncate flex-1">{ws.name}</span>
                  {ws._id === currentWorkspaceId && (
                    <Check size={14} className="text-[#1B4332] shrink-0" />
                  )}
                </button>
              ))}
              <div className="mx-3 my-1.5 border-t border-slate-100 dark:border-neutral-800" />
            </>
          )}

          {/* Navigation items */}
          <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">Navigate</p>
          {SIDEBAR_ITEMS.map(({ id, icon: ItemIcon, label }) => (
            <button
              key={id}
              onClick={() => {
                onTabClick(id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                activeTab === id || (id === 'design' && activeTab === null)
                  ? 'bg-slate-50 dark:bg-neutral-800 font-semibold text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:text-slate-700 dark:hover:text-neutral-300'
              }`}
            >
              <ItemIcon size={16} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
