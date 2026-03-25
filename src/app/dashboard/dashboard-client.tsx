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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">StrategAIze</h1>
            <p className="text-sm text-muted-foreground">
              {profile.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Abmelden
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold">Ihre Runs</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Noch keine Runs zugewiesen. Bitte warten Sie auf eine
              Zuweisung durch StrategAIze.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {runs.map((run) => (
              <Link key={run.id} href={`/runs/${run.id}`}>
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{run.title}</CardTitle>
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
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>{run.evidence_count} Evidence-Dokumente</span>
                      {run.submitted_at && (
                        <span>
                          Zuletzt eingereicht:{" "}
                          {new Date(run.submitted_at).toLocaleDateString(
                            "de-DE"
                          )}
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
