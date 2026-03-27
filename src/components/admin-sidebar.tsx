"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { Users, BookOpen, Play, LogOut, Menu, X, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/catalog", label: "Katalog", icon: BookOpen },
  { href: "/admin/runs", label: "Runs", icon: Play },
];

export function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
  }

  const sidebarContent = (
    <div className="flex h-full flex-col" style={{ background: "var(--gradient-sidebar)" }}>
      {/* Brand header */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-dark shadow-[0_4px_12px_rgba(68,84,184,0.4)]">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight">StrategAIze</div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Administration
              </span>
            </div>
          </div>
        </div>
        {/* Subtle divider with brand gradient */}
        <div className="mt-4 h-px bg-gradient-to-r from-brand-primary/30 via-brand-primary/10 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Verwaltung
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white shadow-[0_8px_16px_-4px_rgba(68,84,184,0.35)]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-white/[0.06] px-3 py-4">
        {email && (
          <div className="mb-2 truncate px-3 text-xs text-slate-500" title={email}>
            {email}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-slate-300"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-slate-900 p-2 text-white shadow-lg lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
