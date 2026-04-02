"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { StatusBadge } from "@/components/status-badge";
import { ProgressIndicator } from "@/components/progress-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, FileText, Play, Menu, X, User } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { HelpButton } from "@/components/help-button";
import { LearningCenterPanel } from "@/components/learning-center/learning-center-panel";

interface Profile {
  id: string;
  tenant_id: string | null;
  email: string;
  role: string;
}

interface Run {
  id: string;
  title: string;
  description: string | null;
  status: string;
  question_count: number;
  answered_count: number;
  evidence_count: number;
  created_at: string;
  submitted_at: string | null;
}

export function DashboardClient({ profile }: { profile: Profile }) {
  const t = useTranslations();
  const locale = useLocale();
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [learningCenterOpen, setLearningCenterOpen] = useState(false);

  useEffect(() => {
    async function loadRuns() {
      try {
        const res = await fetch("/api/tenant/runs");
        if (res.ok) {
          const data = await res.json();
          setRuns(data.runs ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    loadRuns();
  }, []);

  async function handleLogout() {
    await logout();
  }

  // ─── Sidebar ──────────────────────────────────────────────────────────
  const sidebar = (
    <div className="flex h-full flex-col" style={{ background: "var(--gradient-sidebar)" }}>
      {/* Logo block — with rounded frame like Cockpit */}
      <div className="mx-3 mt-3 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/50 border border-white/[0.06] px-5 py-5 text-center">
        <div className="mx-auto w-fit rounded-2xl bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-full.png" alt="StrategAIze" className="h-12 w-auto" />
        </div>
      </div>
      {/* Blueprint Assessment block */}
      <div className="mx-3 mt-2 rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/50 border border-white/[0.06] px-5 py-4 text-center">
        <div className="text-sm font-bold text-white">Blueprint Assessment</div>
        <div className="text-[11px] text-slate-500 mt-0.5">{t("sidebar.subtitle")}</div>
      </div>
      <div className="h-3" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        <Link
          href="/dashboard"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white shadow-[0_8px_16px_-4px_rgba(68,84,184,0.35)]"
        >
          <Play className="h-4 w-4" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold leading-snug">{t("sidebar.runs")}</div>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-white/50 mt-0.5">
              {t("sidebar.runsDescription")}
            </div>
          </div>
        </Link>
      </div>

      {/* User + Profil + Abmelden */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="mb-2 truncate px-2 text-xs text-slate-500" title={profile.email}>
          {profile.email}
        </div>
        <Link
          href="/profile"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary/10 to-brand-primary-dark/10 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:from-brand-primary/20 hover:to-brand-primary-dark/20 hover:text-white mb-2"
        >
          <User className="h-4 w-4" />
          {t("profile.editProfile")}
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary/20 to-brand-primary-dark/20 px-3 py-3 text-sm font-semibold text-slate-300 transition-all hover:from-brand-primary/30 hover:to-brand-primary-dark/30 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {t("common.logout")}
        </button>
      </div>
    </div>
  );

  // ─── Main layout ──────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between px-8 py-5 pl-14 lg:pl-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("dashboard.title")}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{t("dashboard.subtitle")}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-4xl">
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : runs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{t("dashboard.emptyTitle")}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t("dashboard.emptyDescription")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {runs.map((run) => (
                  <Link key={run.id} href={`/runs/${run.id}`}>
                    <Card className="relative overflow-hidden cursor-pointer">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary-dark to-brand-primary" />
                      <CardHeader className="pb-3 pt-5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-brand-primary-dark">{run.title}</CardTitle>
                          <StatusBadge status={run.status} />
                        </div>
                        {run.description && (
                          <CardDescription>{run.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ProgressIndicator
                          answered={run.answered_count}
                          total={run.question_count}
                        />
                        <div className="flex gap-4 text-xs text-slate-500 mt-3">
                          <span>
                            <span className="font-semibold text-brand-primary">{run.evidence_count}</span> {t("dashboard.evidenceLabel")}
                          </span>
                          <span>
                            {t("dashboard.created", { date: new Date(run.created_at).toLocaleDateString(locale) })}
                          </span>
                          {run.submitted_at && (
                            <span>
                              {t("dashboard.submitted", { date: new Date(run.submitted_at).toLocaleDateString(locale) })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Center */}
      <HelpButton onClick={() => setLearningCenterOpen(true)} />
      <LearningCenterPanel
        open={learningCenterOpen}
        onOpenChange={setLearningCenterOpen}
      />
    </div>
  );
}
