"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Loader2, Users, CreditCard, TrendingUp, Cpu, DollarSign, UserPlus,
  LayoutGrid, FileText, ChevronDown, ChevronUp, RotateCcw, CalendarPlus,
  Ban, Zap, X, Check, Save, Plus,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/types";

// ── Helpers ──

function fmt$(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(ts: number | undefined, locale: string) {
  if (!ts) return "—";
  const l = locale === "ar" ? "ar-SA" : "en-US";
  return new Date(ts).toLocaleDateString(l, { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateShort(ts: number | undefined, locale: string) {
  if (!ts) return "—";
  const l = locale === "ar" ? "ar-SA" : "en-US";
  return new Date(ts).toLocaleDateString(l, { month: "short", day: "numeric" });
}

function fmtDateInput(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDateInput(s: string): number {
  return new Date(s + "T00:00:00").getTime();
}

function timeAgo(ts: number, t: (key: TranslationKey) => string) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("admin.justNow");
  if (mins < 60) return `${mins}${t("admin.mAgo")}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t("admin.hAgo")}`;
  const days = Math.floor(hrs / 24);
  return `${days}${t("admin.dAgo")}`;
}

function daysLeft(expiresAt: number) {
  const d = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return d > 0 ? d : 0;
}

function pct(used: number, limit: number) {
  if (limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

// ── Plan defaults (must match convex/subscriptions.ts PLANS) ──

const PLAN_DEFAULTS: Record<string, Record<string, { tokens: number; posts: number; days: number }>> = {
  trial:   { monthly: { tokens: 30_000, posts: 6, days: 7 },       yearly: { tokens: 30_000, posts: 6, days: 7 } },
  starter: { monthly: { tokens: 500_000, posts: 100, days: 30 },   yearly: { tokens: 6_000_000, posts: 1_200, days: 365 } },
  pro:     { monthly: { tokens: 1_250_000, posts: 250, days: 30 }, yearly: { tokens: 15_000_000, posts: 3_000, days: 365 } },
};

// ── Stat Card ──

function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string; icon: React.ElementType; accent?: string;
}) {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800/60 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-neutral-700/60 transition-colors">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={`w-8 h-8 ${accent || "bg-slate-100 dark:bg-neutral-800"} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-slate-600 dark:text-neutral-300" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-neutral-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-xl font-black tracking-tight text-slate-900 dark:text-neutral-100">{value}</div>
    </div>
  );
}

// ── Progress Bar ──

function UsageBar({ used, limit, color = "bg-blue-500" }: { used: number; limit: number; color?: string }) {
  const p = pct(used, limit);
  const isOver = used > limit;
  return (
    <div className="h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : color}`}
        style={{ width: `${Math.min(p, 100)}%` }}
      />
    </div>
  );
}

// ── Small input ──

function SmallInput({ label, value, onChange, type = "text", suffix }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; suffix?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 dark:text-neutral-500 block mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-neutral-200 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-500"
        />
        {suffix && <span className="text-[10px] text-slate-400 dark:text-neutral-600 whitespace-nowrap">{suffix}</span>}
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

const PLAN_BADGE: Record<string, string> = {
  pro: "bg-violet-500/15 text-violet-400 border-violet-500/25",
  starter: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  trial: "bg-slate-200/50 dark:bg-neutral-700/40 text-slate-500 dark:text-neutral-400 border-slate-300/50 dark:border-neutral-600/25",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  expired: "bg-red-500/15 text-red-400",
  cancelled: "bg-amber-500/15 text-amber-400",
};

// ── User Row ──

function UserRow({ u, isExpanded, onToggle }: { u: any; isExpanded: boolean; onToggle: () => void }) {
  const { t, locale } = useLocale();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  // Edit state for existing subscription
  const [editing, setEditing] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editTokensLimit, setEditTokensLimit] = useState(0);
  const [editPostsLimit, setEditPostsLimit] = useState(0);
  const [editExpiresAt, setEditExpiresAt] = useState("");

  // Create new sub state
  const [showCreate, setShowCreate] = useState(false);
  const [newPlan, setNewPlan] = useState<"trial" | "starter" | "pro">("starter");
  const [newPeriod, setNewPeriod] = useState<"monthly" | "yearly">("monthly");
  const [newDays, setNewDays] = useState(30);
  const [newTokens, setNewTokens] = useState(500_000);
  const [newPosts, setNewPosts] = useState(100);

  const updateSub = useMutation(api.admin.updateSubscription);
  const createSub = useMutation(api.admin.createSubscription);
  const updateRole = useMutation(api.admin.updateUserRole);

  const sub = u.subscription;
  const isActive = sub?.status === "active" && sub?.expiresAt >= Date.now();

  const run = async (name: string, fn: () => Promise<any>) => {
    setLoading(name);
    try { await fn(); } catch (e) { console.error(e); }
    setLoading(null);
    setConfirm(null);
  };

  const startEdit = () => {
    if (!sub) return;
    setEditPlan(sub.plan);
    setEditPeriod(sub.billingPeriod || "monthly");
    setEditTokensLimit(sub.aiTokensLimit);
    setEditPostsLimit(sub.postsLimit);
    setEditExpiresAt(fmtDateInput(sub.expiresAt));
    setEditing(true);
  };

  const saveEdit = () => {
    if (!sub) return;
    run("save", () => updateSub({
      subscriptionId: sub._id,
      plan: editPlan as any,
      billingPeriod: editPeriod as any,
      aiTokensLimit: editTokensLimit,
      postsLimit: editPostsLimit,
      expiresAt: parseDateInput(editExpiresAt),
    }).then(() => setEditing(false)));
  };

  const applyDefaults = (plan: string, period: string) => {
    const d = PLAN_DEFAULTS[plan]?.[period];
    if (d) {
      setNewTokens(d.tokens);
      setNewPosts(d.posts);
      setNewDays(d.days);
    }
  };

  const openCreate = () => {
    const plan = (u.plan === "pro" || u.plan === "starter") ? u.plan : "starter";
    setNewPlan(plan as any);
    setNewPeriod("monthly");
    applyDefaults(plan, "monthly");
    setShowCreate(true);
  };

  const selectClass = "w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-neutral-200";
  const dateClass = "w-full bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-neutral-200";

  return (
    <div className="border-b border-slate-100 dark:border-neutral-800/50">
      {/* Collapsed row */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-neutral-800/20 transition-colors text-left"
      >
        {u.image ? (
          <img src={u.image} alt="" className="w-9 h-9 rounded-full shrink-0" />
        ) : (
          <div className="w-9 h-9 bg-slate-200 dark:bg-neutral-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 dark:text-neutral-300 shrink-0">
            {(u.name || u.email || "U")[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-900 dark:text-neutral-200 truncate">{u.name || "—"}</div>
          <div className="text-xs text-slate-400 dark:text-neutral-500 truncate">{u.email}</div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
          PLAN_BADGE[u.plan || ""] || "bg-slate-100 dark:bg-neutral-800/50 text-slate-400 dark:text-neutral-500 border-slate-200 dark:border-neutral-700/30"
        }`}>
          {u.plan || t("admin.none")}
        </span>
        <div className="hidden md:flex flex-col gap-1 w-28 shrink-0">
          {sub && isActive ? (
            <>
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-neutral-500">
                <span>{t("admin.tokens")}</span>
                <span className="tabular-nums">{pct(sub.aiTokensUsed, sub.aiTokensLimit)}%</span>
              </div>
              <UsageBar used={sub.aiTokensUsed} limit={sub.aiTokensLimit} />
            </>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-neutral-600">{sub ? sub.status : t("admin.noSub")}</span>
          )}
        </div>
        <div className="hidden md:block text-xs text-slate-400 dark:text-neutral-500 tabular-nums w-12 text-center shrink-0">{u.workspaceCount}</div>
        <div className="hidden md:block text-xs text-slate-400 dark:text-neutral-500 tabular-nums w-20 text-right shrink-0">{fmtDateShort(u.createdAt, locale)}</div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-neutral-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-neutral-600 shrink-0" />}
      </button>

      {/* Expanded */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1">
          <div className="bg-slate-50 dark:bg-neutral-800/30 rounded-xl border border-slate-200 dark:border-neutral-800/50 p-4 space-y-4">

            {/* Subscription section */}
            {sub ? (
              editing ? (
                /* ── Edit mode ── */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-neutral-400">{t("admin.editSubscription")}</span>
                    <button onClick={() => setEditing(false)} className="text-slate-400 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-neutral-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-neutral-500 block mb-1">{t("admin.planLabel")}</label>
                      <select value={editPlan} onChange={e => setEditPlan(e.target.value)} className={selectClass}>
                        <option value="trial">{t("admin.trial")}</option>
                        <option value="starter">{t("admin.starter")}</option>
                        <option value="pro">{t("admin.pro")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-neutral-500 block mb-1">{t("admin.period")}</label>
                      <select value={editPeriod} onChange={e => setEditPeriod(e.target.value)} className={selectClass}>
                        <option value="monthly">{t("admin.monthly")}</option>
                        <option value="yearly">{t("admin.yearly")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-neutral-500 block mb-1">{t("admin.expires")}</label>
                      <input type="date" value={editExpiresAt} onChange={e => setEditExpiresAt(e.target.value)} className={dateClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <SmallInput label={t("admin.tokenLimit")} type="number" value={editTokensLimit}
                      onChange={v => setEditTokensLimit(+v)} suffix={`${(editTokensLimit/1000).toFixed(0)}k`} />
                    <SmallInput label={t("admin.postsLimit")} type="number" value={editPostsLimit}
                      onChange={v => setEditPostsLimit(+v)} />
                  </div>
                  <button onClick={saveEdit} disabled={loading === "save"}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    {loading === "save" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    {t("admin.saveChanges")}
                  </button>
                </div>
              ) : (
                /* ── View mode ── */
                <div className="space-y-3">
                  {/* Status + dates */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[sub.status] || "bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-500"}`}>
                      {sub.status}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${PLAN_BADGE[sub.plan] || ""}`}>
                      {sub.plan}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-neutral-500">{sub.billingPeriod || "—"}</span>
                    <span className="text-xs text-slate-400 dark:text-neutral-600">&middot; {fmt$(sub.amountPaid)} {t("admin.paid")}</span>
                  </div>

                  {/* Start / End dates */}
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-neutral-500">{t("admin.start")}: </span>
                      <span className="text-slate-700 dark:text-neutral-300 tabular-nums">{fmtDate(sub.startsAt, locale)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-neutral-500">{t("admin.end")}: </span>
                      <span className={`tabular-nums ${daysLeft(sub.expiresAt) <= 5 ? "text-amber-400" : "text-slate-700 dark:text-neutral-300"}`}>
                        {fmtDate(sub.expiresAt, locale)}
                      </span>
                      <span className="text-slate-400 dark:text-neutral-600 ms-1">({daysLeft(sub.expiresAt)}{t("admin.daysLeft")})</span>
                    </div>
                  </div>

                  {/* Usage bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-neutral-400">{t("admin.aiTokensLabel")}</span>
                        <span className="text-slate-700 dark:text-neutral-300 tabular-nums font-medium">
                          {(sub.aiTokensUsed / 1000).toFixed(0)}k / {(sub.aiTokensLimit / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <UsageBar used={sub.aiTokensUsed} limit={sub.aiTokensLimit} color="bg-blue-500" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-neutral-400">{t("admin.postsLabel")}</span>
                        <span className="text-slate-700 dark:text-neutral-300 tabular-nums font-medium">{sub.postsUsed} / {sub.postsLimit}</span>
                      </div>
                      <UsageBar used={sub.postsUsed} limit={sub.postsLimit} color="bg-violet-500" />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button onClick={startEdit}
                      className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700/30 border-slate-200 dark:border-neutral-700/30 transition-colors">
                      <Save className="w-3 h-3" /> {t("admin.editSub")}
                    </button>
                    <ConfirmBtn icon={RotateCcw} label={t("admin.resetUsage")} loading={loading === "reset"} active={confirm === "reset"}
                      onAsk={() => setConfirm("reset")} onCancel={() => setConfirm(null)}
                      onDo={() => run("reset", () => updateSub({ subscriptionId: sub._id, aiTokensUsed: 0, postsUsed: 0 }))} />
                    <ConfirmBtn icon={CalendarPlus} label={t("admin.plus7days")} loading={loading === "extend7"} active={confirm === "extend7"}
                      onAsk={() => setConfirm("extend7")} onCancel={() => setConfirm(null)}
                      onDo={() => run("extend7", () => updateSub({
                        subscriptionId: sub._id,
                        expiresAt: Math.max(sub.expiresAt, Date.now()) + 7 * 24 * 60 * 60 * 1000,
                        status: "active",
                      }))} />
                    <ConfirmBtn icon={CalendarPlus} label={t("admin.plus30days")} loading={loading === "extend30"} active={confirm === "extend30"}
                      onAsk={() => setConfirm("extend30")} onCancel={() => setConfirm(null)}
                      onDo={() => run("extend30", () => updateSub({
                        subscriptionId: sub._id,
                        expiresAt: Math.max(sub.expiresAt, Date.now()) + 30 * 24 * 60 * 60 * 1000,
                        status: "active",
                      }))} />
                    {isActive && (
                      <ConfirmBtn icon={Ban} label={t("admin.cancel")} variant="danger" loading={loading === "cancel"} active={confirm === "cancel"}
                        onAsk={() => setConfirm("cancel")} onCancel={() => setConfirm(null)}
                        onDo={() => run("cancel", () => updateSub({ subscriptionId: sub._id, status: "cancelled" }))} />
                    )}
                  </div>
                </div>
              )
            ) : (
              /* ── No subscription ── */
              !showCreate ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-neutral-500">{t("admin.noSubscription")}</span>
                  <button onClick={openCreate}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    <Plus className="w-3 h-3" /> {t("admin.createSubscription")}
                  </button>
                </div>
              ) : (
                /* ── Create form ── */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-neutral-400">{t("admin.createSubscription")}</span>
                    <button onClick={() => setShowCreate(false)} className="text-slate-400 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-neutral-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-neutral-500 block mb-1">{t("admin.planLabel")}</label>
                      <select value={newPlan} onChange={e => { const p = e.target.value as any; setNewPlan(p); applyDefaults(p, newPeriod); }}
                        className={selectClass}>
                        <option value="trial">{t("admin.trial")}</option>
                        <option value="starter">{t("admin.starter")}</option>
                        <option value="pro">{t("admin.pro")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-neutral-500 block mb-1">{t("admin.period")}</label>
                      <select value={newPeriod} onChange={e => { const p = e.target.value as any; setNewPeriod(p); applyDefaults(newPlan, p); }}
                        className={selectClass}>
                        <option value="monthly">{t("admin.monthly")}</option>
                        <option value="yearly">{t("admin.yearly")}</option>
                      </select>
                    </div>
                    <SmallInput label={t("admin.days")} type="number" value={newDays} onChange={v => setNewDays(+v)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <SmallInput label={t("admin.tokenLimit")} type="number" value={newTokens} onChange={v => setNewTokens(+v)}
                      suffix={`${(newTokens/1000).toFixed(0)}k`} />
                    <SmallInput label={t("admin.postsLimit")} type="number" value={newPosts} onChange={v => setNewPosts(+v)} />
                  </div>
                  <button onClick={() => run("create", () => createSub({
                    targetUserId: u._id, plan: newPlan, billingPeriod: newPeriod,
                    durationDays: newDays, aiTokensLimit: newTokens, postsLimit: newPosts,
                  }).then(() => setShowCreate(false)))}
                    disabled={loading === "create"}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5">
                    {loading === "create" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    {t("admin.create")} {newPlan.charAt(0).toUpperCase() + newPlan.slice(1)} ({newDays}d)
                  </button>
                </div>
              )
            )}

            {/* Role toggle */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-neutral-800/30">
              <span className="text-[10px] text-slate-400 dark:text-neutral-600 uppercase tracking-wide">{t("admin.role")}:</span>
              <button
                onClick={() => run("role", () => updateRole({ targetUserId: u._id, role: u.role === "admin" ? "user" : "admin" }))}
                disabled={loading === "role"}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  u.role === "admin"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/25"
                    : "bg-slate-100 dark:bg-neutral-800/50 text-slate-500 dark:text-neutral-500 border-slate-200 dark:border-neutral-700/30 hover:bg-slate-200 dark:hover:bg-neutral-700/40"
                }`}>
                {u.role === "admin" ? t("admin.adminRole") : t("admin.userRole")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Confirm Button ──

function ConfirmBtn({ icon: Icon, label, variant, loading, active, onAsk, onCancel, onDo }: {
  icon: React.ElementType; label: string; variant?: "danger"; loading: boolean;
  active: boolean; onAsk: () => void; onCancel: () => void; onDo: () => void;
}) {
  const { t } = useLocale();
  if (active) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-amber-400 me-1">{t("admin.sure")}</span>
        <button onClick={onDo} disabled={loading}
          className="p-1 rounded-md bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button onClick={onCancel} className="p-1 rounded-md bg-slate-200 dark:bg-neutral-700/30 text-slate-500 dark:text-neutral-500 hover:bg-slate-300 dark:hover:bg-neutral-700/50 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }
  const base = variant === "danger"
    ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border-red-500/10"
    : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-700/30 border-slate-200 dark:border-neutral-700/30";
  return (
    <button onClick={onAsk}
      className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${base}`}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}

// ── Main Page ──

export default function AdminOverviewPage() {
  const { t, dir, locale } = useLocale();
  const overview = useQuery(api.admin.getOverview);
  const allUsers = useQuery(api.admin.listAllUsers);
  const recentUsage = useQuery(api.admin.listRecentUsage);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");

  if (!overview) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-slate-300 dark:text-neutral-600 animate-spin" />
      </div>
    );
  }

  const filteredUsers = allUsers?.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (u.name?.toLowerCase().includes(q)) || (u.email?.toLowerCase().includes(q));
  });

  return (
    <div dir={dir} className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{t("admin.dashboard")}</h1>
        <p className="text-sm text-slate-500 dark:text-neutral-500 mt-1">{t("admin.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t("admin.users")} value={overview.totalUsers.toLocaleString()} icon={Users} accent="bg-blue-600/20" />
        <StatCard label={t("admin.activeSubs")} value={overview.activeSubCount.toLocaleString()} icon={CreditCard} accent="bg-emerald-600/20" />
        <StatCard label={t("admin.mrr")} value={fmt$(overview.mrr)} icon={TrendingUp} accent="bg-violet-600/20" />
        <StatCard label={t("admin.aiCost30d")} value={fmt$(overview.aiCost30d)} icon={Cpu} accent="bg-amber-600/20" />
        <StatCard label={t("admin.revenue")} value={fmt$(overview.totalRevenue)} icon={DollarSign} accent="bg-emerald-600/20" />
        <StatCard label={t("admin.new7d")} value={overview.newUsersLast7d.toLocaleString()} icon={UserPlus} accent="bg-cyan-600/20" />
        <StatCard label={t("admin.workspaces")} value={overview.totalWorkspaces.toLocaleString()} icon={LayoutGrid} accent="bg-pink-600/20" />
        <StatCard label={t("admin.posts")} value={overview.totalPosts.toLocaleString()} icon={FileText} accent="bg-orange-600/20" />
        <StatCard label={t("admin.aiTokens30d")} value={`${(overview.totalAiTokens30d / 1000).toFixed(0)}k`} icon={Zap} accent="bg-blue-600/20" />
      </div>

      {/* Users + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Users */}
        <div className="xl:col-span-3 bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-neutral-800/50 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-700 dark:text-neutral-300">{t("admin.users")} ({allUsers?.length ?? 0})</h2>
            <input type="text" placeholder={t("admin.searchUsers")} value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/40 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-600 w-48 focus:outline-none focus:border-slate-400 dark:focus:border-neutral-600" />
          </div>
          <div className="px-5 py-2 flex items-center gap-4 text-[10px] text-slate-400 dark:text-neutral-600 uppercase tracking-wider border-b border-slate-100 dark:border-neutral-800/30">
            <div className="flex-1">{t("admin.user")}</div>
            <div className="w-16 text-center">{t("admin.plan")}</div>
            <div className="hidden md:block w-28 text-center">{t("admin.usage")}</div>
            <div className="hidden md:block w-12 text-center">{t("admin.ws")}</div>
            <div className="hidden md:block w-20 text-end">{t("admin.joined")}</div>
            <div className="w-5" />
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {filteredUsers?.map(u => (
              <UserRow key={u._id} u={u} isExpanded={expandedUser === u._id}
                onToggle={() => setExpandedUser(expandedUser === u._id ? null : u._id)} />
            ))}
            {filteredUsers?.length === 0 && (
              <div className="px-5 py-10 text-center text-slate-400 dark:text-neutral-600 text-sm">{t("admin.noUsersFound")}</div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="xl:col-span-2 bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-neutral-800/50">
            <h2 className="text-sm font-bold text-slate-700 dark:text-neutral-300">{t("admin.aiActivity")}</h2>
          </div>
          <div className="max-h-[650px] overflow-y-auto">
            {recentUsage?.length === 0 && (
              <div className="px-5 py-10 text-center text-slate-400 dark:text-neutral-600 text-sm">{t("admin.noAiUsage")}</div>
            )}
            {recentUsage?.map((log) => (
              <div key={log._id} className="px-4 py-3 border-b border-slate-100 dark:border-neutral-800/30 hover:bg-slate-50 dark:hover:bg-neutral-800/15 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    CAT_COLORS[log.category] || "bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-700"
                  }`}>
                    {log.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-600 tabular-nums">{timeAgo(log.createdAt, t)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-neutral-400 truncate max-w-[120px]">
                    {log.user?.name || log.user?.email || t("admin.unknown")}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-neutral-500 tabular-nums">
                    <span>{log.totalTokens.toLocaleString()} {t("admin.tok")}</span>
                    <span className="text-slate-300 dark:text-neutral-600">${log.estimatedCostUsd.toFixed(4)}</span>
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
