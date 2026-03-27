"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { StatusBadge } from "@/components/status-badge";
import { ProgressIndicator } from "@/components/progress-indicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, FileText } from "lucide-react";

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
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-symbol.svg" alt="StrategAIze" className="h-9 w-9 rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">StrategAIze</h1>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Ihre Runs</h2>
          <p className="mt-1 text-sm text-slate-500">Ihre zugewiesenen Assessment-Runs</p>
        </div>

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
              <p className="text-lg font-semibold text-slate-900">Noch keine Runs zugewiesen</p>
              <p className="mt-1 text-sm text-slate-500">
                Bitte warten Sie auf eine Zuweisung durch StrategAIze.
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
                        <span className="font-semibold text-brand-primary">{run.evidence_count}</span> Evidence-Dokumente
                      </span>
                      <span>
                        Erstellt: {new Date(run.created_at).toLocaleDateString("de-DE")}
                      </span>
                      {run.submitted_at && (
                        <span>
                          Eingereicht:{" "}
                          {new Date(run.submitted_at).toLocaleDateString("de-DE")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
