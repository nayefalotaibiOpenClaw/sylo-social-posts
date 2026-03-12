"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useLocale } from "@/lib/i18n/context";
import LanguageSwitcher from "@/lib/i18n/LanguageSwitcher";
import type { TranslationKey } from "@/lib/i18n/types";
import { Shield } from "lucide-react";

type ActivePage = "home" | "pricing" | "workspaces" | "channels" | "publish" | "blogs" | "contact";

interface FloatingNavProps {
  variant?: "light" | "dark";
  activePage?: ActivePage;
}

const NAV_LINKS: { key: ActivePage; href: string; labelKey: TranslationKey; enabled: boolean }[] = [
  { key: "home", href: "/", labelKey: "nav.home", enabled: true },
  { key: "workspaces", href: "/workspaces", labelKey: "nav.workspaces", enabled: true },
  { key: "channels", href: "/channels", labelKey: "nav.channels", enabled: false },
  { key: "publish", href: "/publish", labelKey: "nav.publish", enabled: false },
  { key: "pricing", href: "/pricing", labelKey: "nav.pricing", enabled: true },
  { key: "blogs", href: "/blogs", labelKey: "nav.blogs", enabled: false },
  { key: "contact", href: "/contact", labelKey: "nav.contact", enabled: false },
];

export default function FloatingNav({ variant = "light", activePage = "home" }: FloatingNavProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const isAdmin = useQuery(api.admin.isAdmin);
  const { signOut } = useAuthActions();
  const { t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = variant === "dark";

  const navBg = isDark
    ? "bg-neutral-900/80 border-neutral-700/50 shadow-black/30"
    : "bg-white/80 border-slate-200/50 shadow-slate-200/50";
  const linkColor = isDark ? "text-neutral-400" : "text-slate-500";
  const activeColor = isDark ? "text-white" : "text-slate-900";
  const brandColor = isDark ? "text-white" : "text-slate-900";
  const avatarFallbackBg = isDark ? "bg-neutral-700" : "bg-slate-200";
  const avatarFallbackText = isDark ? "text-neutral-200" : "text-slate-600";
  const signOutBtnClass = isDark
    ? "hover:bg-neutral-800 text-neutral-500 hover:text-white"
    : "hover:bg-slate-100 text-slate-400 hover:text-slate-900";
  const ctaBg = isDark
    ? "bg-white text-black"
    : "bg-slate-900 text-white";
  const menuBtnClass = isDark
    ? "text-neutral-400 hover:text-white"
    : "text-slate-500 hover:text-slate-900";

  const avatar = user?.image ? (
    <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
  ) : (
    <div className={`w-8 h-8 ${avatarFallbackBg} rounded-full flex items-center justify-center`}>
      <span className={`${avatarFallbackText} font-bold text-xs`}>
        {(user?.name || user?.email || "U")[0].toUpperCase()}
      </span>
    </div>
  );

  const renderNavLink = (link: typeof NAV_LINKS[number], className: string, activeClassName: string, disabledClassName: string, onClick?: () => void) => {
    if (activePage === link.key) {
      return <span key={link.key} className={activeClassName}>{t(link.labelKey)}</span>;
    }
    if (!link.enabled) {
      return <span key={link.key} className={disabledClassName}>{t(link.labelKey)}</span>;
    }
    return (
      <Link key={link.key} href={link.href} className={className} onClick={onClick}>
        {t(link.labelKey)}
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <div className={`backdrop-blur-xl border rounded-full px-6 py-3 flex items-center justify-between shadow-2xl ${navBg}`}>
          <div className="flex items-center gap-6">
            <Link href="/" className={`font-black text-lg tracking-tight ${brandColor}`}>oDesigns</Link>
            <div className={`hidden md:flex items-center gap-6 text-sm font-semibold ${linkColor}`}>
              {NAV_LINKS.map((link) =>
                renderNavLink(
                  link,
                  `hover:${activeColor} transition-colors`,
                  activeColor,
                  `${linkColor} cursor-default opacity-50`
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {isLoading ? (
                <div className="w-20 h-8 bg-slate-100 rounded-full animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={`p-2 rounded-full transition-colors ${signOutBtnClass}`}
                      title="Admin"
                    >
                      <Shield className="w-4 h-4" />
                    </Link>
                  )}
                  {avatar}
                  <button
                    onClick={() => void signOut()}
                    className={`p-2 rounded-full transition-colors ${signOutBtnClass}`}
                    title={t("nav.signOut")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={`px-5 py-2 rounded-full ${ctaBg} font-bold text-sm hover:scale-105 transition-all active:scale-95`}
                >
                  {t("nav.joinFree")}
                </Link>
              )}
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden p-2 rounded-full transition-colors ${menuBtnClass}`}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col">
          <div className="flex items-center justify-between px-6 py-5">
            <span className="font-black text-lg tracking-tight text-slate-900">oDesigns</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-8 gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = activePage === link.key;
              if (!link.enabled) {
                return (
                  <span key={link.key} className="text-3xl font-black text-slate-300 py-3">
                    {t(link.labelKey)}
                  </span>
                );
              }
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-3xl font-black py-3 transition-colors ${
                    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="px-8 pb-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <LanguageSwitcher />
              {!isLoading && isAuthenticated && (
                <div className="flex items-center gap-3">
                  {avatar}
                  <button
                    onClick={() => { void signOut(); setMobileOpen(false); }}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                    title={t("nav.signOut")}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {!isLoading && !isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-center text-lg hover:bg-slate-800 transition-colors"
              >
                {t("nav.joinFree")}
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
