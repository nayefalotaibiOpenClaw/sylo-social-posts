"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FloatingNav from "@/app/components/FloatingNav";
import {
  Instagram,
  Facebook,
  Video,
  Briefcase,
  MessageCircle,
  Cloud,
  Youtube,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Zap,
  LinkIcon,
} from "lucide-react";

const PROVIDERS = [
  { id: "instagram" as const, name: "Instagram", icon: Instagram, color: "from-pink-500 to-rose-600", available: true },
  { id: "facebook" as const, name: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700", available: true },
  { id: "tiktok" as const, name: "TikTok", icon: Video, color: "from-neutral-800 to-neutral-900", available: false },
  { id: "linkedin" as const, name: "LinkedIn", icon: Briefcase, color: "from-blue-700 to-blue-800", available: false },
  { id: "threads" as const, name: "Threads", icon: MessageCircle, color: "from-neutral-700 to-neutral-800", available: false },
  { id: "bluesky" as const, name: "Bluesky", icon: Cloud, color: "from-sky-500 to-sky-600", available: false },
  { id: "youtube" as const, name: "YouTube", icon: Youtube, color: "from-red-600 to-red-700", available: false },
];

export default function ChannelsPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(api.workspaces.listByUser, user ? { userId: user._id } : "skip");

  const workspaceParam = searchParams.get("workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<Id<"workspaces"> | null>(
    workspaceParam as Id<"workspaces"> | null
  );

  // Auto-select first workspace
  useEffect(() => {
    if (!selectedWorkspaceId && workspaces && workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0]._id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const socialAccounts = useQuery(
    api.socialAccounts.listByWorkspace,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );
  const disconnectAccount = useMutation(api.socialAccounts.disconnect);

  // Toast notifications from OAuth callbacks
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  useEffect(() => {
    const success = searchParams.get("social_success");
    const error = searchParams.get("social_error");
    if (success) setToast({ type: "success", message: decodeURIComponent(success) });
    else if (error) setToast({ type: "error", message: decodeURIComponent(error) });
  }, [searchParams]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleConnect = (provider: "instagram" | "facebook") => {
    if (!selectedWorkspaceId || !user) return;
    const params = new URLSearchParams({
      workspaceId: selectedWorkspaceId,
      userId: user._id,
    });
    window.location.href = `/api/social-auth/${provider}/authorize?${params.toString()}`;
  };

  const handleDisconnect = async (accountId: Id<"socialAccounts">) => {
    if (!confirm("Disconnect this account?")) return;
    try {
      await disconnectAccount({ id: accountId });
      setToast({ type: "success", message: "Account disconnected" });
    } catch {
      setToast({ type: "error", message: "Failed to disconnect account" });
    }
  };

  const activeAccounts = socialAccounts?.filter((a) => a.status === "active") || [];
  const connectedProviders = new Set(activeAccounts.map((a) => a.provider));

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300 dark:text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <FloatingNav />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border flex items-center gap-3 shadow-2xl max-w-lg ${
          toast.type === "success"
            ? "bg-green-50 dark:bg-green-950/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
            : "bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Channels</h1>
            <p className="text-sm text-slate-500 dark:text-neutral-500 mt-1">Connect your social media accounts</p>
          </div>

          {/* Workspace Selector */}
          {workspaces && workspaces.length > 0 && (
            <select
              value={selectedWorkspaceId || ""}
              onChange={(e) => setSelectedWorkspaceId(e.target.value as Id<"workspaces">)}
              className="bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-neutral-600"
            >
              {workspaces.map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          )}
        </div>

        {!selectedWorkspaceId ? (
          <div className="text-center py-20">
            <LinkIcon className="w-10 h-10 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-neutral-500">Select a workspace to manage channels</p>
          </div>
        ) : (
          <>
            {/* Connected Accounts */}
            {activeAccounts.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                  Connected ({activeAccounts.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeAccounts.map((account) => {
                    const provider = PROVIDERS.find((p) => p.id === account.provider);
                    const Icon = provider?.icon || LinkIcon;
                    return (
                      <div
                        key={account._id}
                        className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4 group hover:border-slate-300 dark:hover:border-neutral-600 transition-colors"
                      >
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${provider?.color || "from-neutral-700 to-neutral-800"} flex items-center justify-center flex-shrink-0`}>
                          {account.providerAccountImage ? (
                            <img
                              src={account.providerAccountImage}
                              alt=""
                              className="w-11 h-11 rounded-full"
                            />
                          ) : (
                            <Icon size={20} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {account.providerAccountName}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-neutral-500 capitalize">{account.provider}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <button
                            onClick={() => handleDisconnect(account._id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 dark:text-neutral-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Connect New */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
                Connect a Channel
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PROVIDERS.map((provider) => {
                  const isConnected = connectedProviders.has(provider.id as "facebook" | "instagram" | "tiktok" | "twitter");
                  const Icon = provider.icon;

                  if (isConnected) return null;

                  return (
                    <button
                      key={provider.id}
                      onClick={() => {
                        if (provider.available) {
                          handleConnect(provider.id as "instagram" | "facebook");
                        }
                      }}
                      disabled={!provider.available}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        provider.available
                          ? "bg-white dark:bg-neutral-900/50 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-900 cursor-pointer"
                          : "bg-slate-50 dark:bg-neutral-950/50 border-slate-100 dark:border-neutral-900 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${provider.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{provider.name}</p>
                        <p className="text-xs text-slate-400 dark:text-neutral-500">
                          {provider.available ? "Click to connect" : "Coming soon"}
                        </p>
                      </div>
                      {provider.available ? (
                        <Zap size={14} className="text-slate-300 dark:text-neutral-600" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-600 uppercase">Soon</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
