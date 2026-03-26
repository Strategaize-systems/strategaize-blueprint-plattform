"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { LayoutDashboard, Users, BookOpen, Play, LogOut, Menu, X } from "lucide-react";
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
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-brand-primary-dark to-brand-primary">
          <LayoutDashboard className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">StrategAIze</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Admin
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
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
                  ? "bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white shadow-[0_10px_15px_-3px_rgba(68,84,184,0.25)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-white/10 px-3 py-4">
        {email && (
          <div className="mb-3 truncate px-2 text-xs text-slate-500" title={email}>
            {email}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white"
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
