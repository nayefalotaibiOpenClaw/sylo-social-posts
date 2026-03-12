"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Loader2, Users, CreditCard, TrendingUp, Cpu, DollarSign, UserPlus,
  LayoutGrid, FileText, ChevronDown, ChevronUp, RotateCcw, CalendarPlus,
  Ban, Zap, X, Check, AlertTriangle,
} from "lucide-react";

// ── Helpers ──

function fmt$(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(ts: number | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateShort(ts: number | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function daysLeft(expiresAt: number) {
  const d = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return d > 0 ? d : 0;
}

function pct(used: number, limit: number) {
  if (limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

// ── Stat Card ──

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string; icon: React.ElementType; accent?: string;
}) {
  const accentColor = accent || "bg-neutral-800";
  return (
    <div className="bg-neutral-900/80 border border-neutral-800/60 rounded-2xl p-4 hover:border-neutral-700/60 transition-colors">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={`w-8 h-8 ${accentColor} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-neutral-300" />
        </div>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-xl font-black tracking-tight text-neutral-100">{value}</div>
    </div>
  );
}

// ── Progress Bar ──

function UsageBar({ used, limit, color = "bg-blue-500" }: { used: number; limit: number; color?: string }) {
  const p = pct(used, limit);
  const isOver = used > limit;
  return (
    <div className="w-full">
      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : color}`}
          style={{ width: `${Math.min(p, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Category Colors ──

const CAT_COLORS: Record<string, string> = {
  generation: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  adaptation: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  website_analysis: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  image_analysis: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  crawl: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  classification: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  product_extraction: "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

const PLAN_COLORS: Record<string, string> = {
  pro: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  starter: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  trial: "bg-neutral-700/40 text-neutral-400 border-neutral-600/25",
};

// ── User Row (Expandable) ──

function UserRow({ u, isExpanded, onToggle }: {
  u: any; isExpanded: boolean; onToggle: () => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [grantForm, setGrantForm] = useState(false);
  const [grantPlan, setGrantPlan] = useState<"trial" | "starter" | "pro">("starter");
  const [grantDays, setGrantDays] = useState(30);
  const [grantTokens, setGrantTokens] = useState(500000);
  const [grantPosts, setGrantPosts] = useState(100);

  const updateUserPlan = useMutation(api.admin.updateUserPlan);
  const updateUserRole = useMutation(api.admin.updateUserRole);
  const grantSubscription = useMutation(api.admin.grantSubscription);
  const resetUsage = useMutation(api.admin.resetSubscriptionUsage);
  const extendSub = useMutation(api.admin.extendSubscription);
  const cancelSub = useMutation(api.admin.cancelSubscription);

  const sub = u.subscription;
  const isActive = sub?.status === "active" && sub.expiresAt >= Date.now();
  const tokenPct = sub ? pct(sub.aiTokensUsed, sub.aiTokensLimit) : 0;
  const postsPct = sub ? pct(sub.postsUsed, sub.postsLimit) : 0;

  const runAction = async (name: string, fn: () => Promise<any>) => {
    setActionLoading(name);
    try { await fn(); } catch (e) { console.error(e); }
    setActionLoading(null);
    setConfirmAction(null);
  };

  return (
    <div className="border-b border-neutral-800/50">
      {/* Main row */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-neutral-800/20 transition-colors text-left"
      >
        {/* Avatar */}
        {u.image ? (
          <img src={u.image} alt="" className="w-9 h-9 rounded-full shrink-0" />
        ) : (
          <div className="w-9 h-9 bg-neutral-700 rounded-full flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
            {(u.name || u.email || "U")[0].toUpperCase()}
          </div>
        )}

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-neutral-200 truncate">{u.name || "—"}</div>
          <div className="text-xs text-neutral-500 truncate">{u.email}</div>
        </div>

        {/* Plan badge */}
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
          PLAN_COLORS[u.plan || ""] || "bg-neutral-800/50 text-neutral-500 border-neutral-700/30"
        }`}>
          {u.plan || "none"}
        </span>

        {/* Usage bars (compact) */}
        <div className="hidden md:flex flex-col gap-1 w-28 shrink-0">
          {sub ? (
            <>
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>Tokens</span>
                <span className="tabular-nums">{tokenPct}%</span>
              </div>
              <UsageBar used={sub.aiTokensUsed} limit={sub.aiTokensLimit} color="bg-blue-500" />
            </>
          ) : (
            <span className="text-[10px] text-neutral-600">No sub</span>
          )}
        </div>

        {/* Workspaces count */}
        <div className="hidden md:block text-xs text-neutral-500 tabular-nums w-12 text-center shrink-0">
          {u.workspaceCount}
        </div>

        {/* Joined date */}
        <div className="hidden md:block text-xs text-neutral-500 tabular-nums w-20 text-right shrink-0">
          {fmtDateShort(u.createdAt)}
        </div>

        {/* Expand chevron */}
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-600" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1">
          <div className="bg-neutral-800/30 rounded-xl border border-neutral-800/50 p-4">
            {/* Subscription info */}
            {sub ? (
              <div className="space-y-4">
                {/* Status bar */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    {sub.status}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {sub.billingPeriod || "—"} &middot; {fmt$(sub.amountPaid)} paid
                  </span>
                  <span className="text-xs text-neutral-600">
                    Expires {fmtDate(sub.expiresAt)} ({daysLeft(sub.expiresAt)}d left)
                  </span>
                </div>

                {/* Usage details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">AI Tokens</span>
                      <span className="text-neutral-300 tabular-nums font-medium">
                        {(sub.aiTokensUsed / 1000).toFixed(0)}k / {(sub.aiTokensLimit / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <UsageBar used={sub.aiTokensUsed} limit={sub.aiTokensLimit} color="bg-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Posts</span>
                      <span className="text-neutral-300 tabular-nums font-medium">
                        {sub.postsUsed} / {sub.postsLimit}
                      </span>
                    </div>
                    <UsageBar used={sub.postsUsed} limit={sub.postsLimit} color="bg-violet-500" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <ActionBtn
                    icon={RotateCcw} label="Reset Usage" loading={actionLoading === "reset"}
                    confirm={confirmAction === "reset"}
                    onConfirm={() => setConfirmAction("reset")}
                    onExecute={() => runAction("reset", () => resetUsage({
                      subscriptionId: sub._id,
                      resetTokens: true,
                      resetPosts: true,
                    }))}
                    onCancel={() => setConfirmAction(null)}
                  />
                  <ActionBtn
                    icon={CalendarPlus} label="+30 days" loading={actionLoading === "extend"}
                    confirm={confirmAction === "extend"}
                    onConfirm={() => setConfirmAction("extend")}
                    onExecute={() => runAction("extend", () => extendSub({
                      subscriptionId: sub._id,
                      additionalDays: 30,
                    }))}
                    onCancel={() => setConfirmAction(null)}
                  />
                  {isActive && (
                    <ActionBtn
                      icon={Ban} label="Cancel Sub" variant="danger"
                      loading={actionLoading === "cancel"}
                      confirm={confirmAction === "cancel"}
                      onConfirm={() => setConfirmAction("cancel")}
                      onExecute={() => runAction("cancel", () => cancelSub({
                        subscriptionId: sub._id,
                      }))}
                      onCancel={() => setConfirmAction(null)}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 mb-3">No subscription</div>
            )}

            {/* Grant new subscription */}
            {!grantForm ? (
              <button
                onClick={() => setGrantForm(true)}
                className="mt-3 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Grant new subscription
              </button>
            ) : (
              <div className="mt-3 bg-neutral-900/60 rounded-lg border border-neutral-700/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Grant Subscription</span>
                  <button onClick={() => setGrantForm(false)} className="text-neutral-600 hover:text-neutral-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Plan</label>
                    <select
                      value={grantPlan}
                      onChange={e => setGrantPlan(e.target.value as any)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-200"
                    >
                      <option value="trial">Trial</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Days</label>
                    <input
                      type="number" value={grantDays} onChange={e => setGrantDays(+e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Token Limit</label>
                    <input
                      type="number" value={grantTokens} onChange={e => setGrantTokens(+e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 block mb-1">Posts Limit</label>
                    <input
                      type="number" value={grantPosts} onChange={e => setGrantPosts(+e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-200"
                    />
                  </div>
                </div>
                <button
                  onClick={() => runAction("grant", () => grantSubscription({
                    targetUserId: u._id,
                    plan: grantPlan,
                    billingPeriod: "monthly",
                    durationDays: grantDays,
                    aiTokensLimit: grantTokens,
                    postsLimit: grantPosts,
                  }).then(() => setGrantForm(false)))}
                  disabled={actionLoading === "grant"}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading === "grant" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Grant Subscription
                </button>
              </div>
            )}

            {/* Admin role toggle */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-neutral-600 uppercase tracking-wide">Role:</span>
              <button
                onClick={() => runAction("role", () => updateUserRole({
                  targetUserId: u._id,
                  role: u.role === "admin" ? "user" : "admin",
                }))}
                disabled={actionLoading === "role"}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  u.role === "admin"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/25"
                    : "bg-neutral-800/50 text-neutral-500 border-neutral-700/30 hover:bg-neutral-700/40"
                }`}
              >
                {u.role === "admin" ? "admin" : "user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Action Button with confirm ──

function ActionBtn({ icon: Icon, label, variant, loading, confirm, onConfirm, onExecute, onCancel }: {
  icon: React.ElementType; label: string; variant?: "danger"; loading: boolean;
  confirm: boolean; onConfirm: () => void; onExecute: () => void; onCancel: () => void;
}) {
  if (confirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-amber-400 mr-1">Sure?</span>
        <button
          onClick={onExecute}
          disabled={loading}
          className="p-1 rounded-md bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button onClick={onCancel} className="p-1 rounded-md bg-neutral-700/30 text-neutral-500 hover:bg-neutral-700/50 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  const base = variant === "danger"
    ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border-red-500/10"
    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/30 border-neutral-700/30";

  return (
    <button
      onClick={onConfirm}
      className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${base}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}

// ── Main Page ──

export default function AdminOverviewPage() {
  const overview = useQuery(api.admin.getOverview);
  const allUsers = useQuery(api.admin.listAllUsers);
  const recentUsage = useQuery(api.admin.listRecentUsage);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");

  if (!overview) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
      </div>
    );
  }

  const filteredUsers = allUsers?.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (u.name?.toLowerCase().includes(q)) || (u.email?.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Platform overview &amp; user management</p>
      </div>

      {/* Stat Cards — 3x3 grid on large, 3x2 on medium */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Users" value={overview.totalUsers.toLocaleString()} icon={Users} accent="bg-blue-600/20" />
        <StatCard label="Active Subs" value={overview.activeSubCount.toLocaleString()} icon={CreditCard} accent="bg-emerald-600/20" />
        <StatCard label="MRR" value={fmt$(overview.mrr)} icon={TrendingUp} accent="bg-violet-600/20" />
        <StatCard label="AI Cost (30d)" value={fmt$(overview.aiCost30d)} icon={Cpu} accent="bg-amber-600/20" />
        <StatCard label="Revenue" value={fmt$(overview.totalRevenue)} icon={DollarSign} accent="bg-emerald-600/20" />
        <StatCard label="New (7d)" value={overview.newUsersLast7d.toLocaleString()} icon={UserPlus} accent="bg-cyan-600/20" />
        <StatCard label="Workspaces" value={overview.totalWorkspaces.toLocaleString()} icon={LayoutGrid} accent="bg-pink-600/20" />
        <StatCard label="Posts" value={overview.totalPosts.toLocaleString()} icon={FileText} accent="bg-orange-600/20" />
        <StatCard label="AI Tokens (30d)" value={`${(overview.totalAiTokens30d / 1000).toFixed(0)}k`} icon={Zap} accent="bg-blue-600/20" />
      </div>

      {/* Users + Activity side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Users list — takes 3 cols */}
        <div className="xl:col-span-3 bg-neutral-900/60 border border-neutral-800/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800/50 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-neutral-300">Users ({allUsers?.length ?? 0})</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="bg-neutral-800/60 border border-neutral-700/40 rounded-lg px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 w-48 focus:outline-none focus:border-neutral-600"
            />
          </div>

          {/* Table header */}
          <div className="px-5 py-2 flex items-center gap-4 text-[10px] text-neutral-600 uppercase tracking-wider border-b border-neutral-800/30">
            <div className="flex-1">User</div>
            <div className="w-16 text-center">Plan</div>
            <div className="hidden md:block w-28 text-center">Usage</div>
            <div className="hidden md:block w-12 text-center">WS</div>
            <div className="hidden md:block w-20 text-right">Joined</div>
            <div className="w-5" />
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {filteredUsers?.map(u => (
              <UserRow
                key={u._id}
                u={u}
                isExpanded={expandedUser === u._id}
                onToggle={() => setExpandedUser(expandedUser === u._id ? null : u._id)}
              />
            ))}
            {filteredUsers?.length === 0 && (
              <div className="px-5 py-10 text-center text-neutral-600 text-sm">No users found</div>
            )}
          </div>
        </div>

        {/* Activity feed — takes 2 cols */}
        <div className="xl:col-span-2 bg-neutral-900/60 border border-neutral-800/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800/50">
            <h2 className="text-sm font-bold text-neutral-300">AI Activity</h2>
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {recentUsage?.length === 0 && (
              <div className="px-5 py-10 text-center text-neutral-600 text-sm">No AI usage logged yet</div>
            )}
            {recentUsage?.map((log) => (
              <div key={log._id} className="px-4 py-3 border-b border-neutral-800/30 hover:bg-neutral-800/15 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    CAT_COLORS[log.category] || "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}>
                    {log.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-neutral-600 tabular-nums">{timeAgo(log.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 truncate max-w-[120px]">
                    {log.user?.name || log.user?.email || "Unknown"}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 tabular-nums">
                    <span>{log.totalTokens.toLocaleString()} tok</span>
                    <span className="text-neutral-600">${log.estimatedCostUsd.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
