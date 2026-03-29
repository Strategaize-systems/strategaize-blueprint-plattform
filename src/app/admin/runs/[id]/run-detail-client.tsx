"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { ProgressIndicator } from "@/components/progress-indicator";
import { EventHistory } from "@/components/event-history";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Question {
  id: string;
  frage_id: string;
  block: string;
  ebene: string;
  unterbereich: string;
  fragetext: string;
  position: number;
  ko_hart: boolean;
  ko_soft: boolean;
  latest_answer: string | null;
  event_count: number;
  evidence_count: number;
}

interface Run {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  submitted_at: string | null;
  questions: Question[];
}

export function RunDetailClient({
  runId,
  email,
}: {
  runId: string;
  email: string;
}) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [locking, setLocking] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const loadRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/runs/${runId}`);
      if (res.ok) {
        const data = await res.json();
        setRun(data.run);
      }
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    loadRun();
  }, [loadRun]);

  async function handleExport() {
    setExporting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/runs/${runId}/export`);
      if (!res.ok) {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Export fehlgeschlagen", type: "error" });
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `export_${runId}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ text: "Export heruntergeladen", type: "success" });
    } catch {
      setMessage({ text: "Netzwerkfehler — Export fehlgeschlagen", type: "error" });
    } finally {
      setExporting(false);
    }
  }

  async function handleLock() {
    setLocking(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/runs/${runId}/lock`, {
        method: "PATCH",
      });
      if (res.ok) {
        setMessage({ text: "Run wurde gesperrt", type: "success" });
        await loadRun();
      } else {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Sperren fehlgeschlagen", type: "error" });
      }
    } catch {
      setMessage({ text: "Netzwerkfehler", type: "error" });
    } finally {
      setLocking(false);
    }
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!run) {
    return (
      <div>
        <p className="text-muted-foreground">Run nicht gefunden.</p>
        <Link href="/admin/runs" className="text-sm underline mt-2 inline-block">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const blocks = Array.from(new Set(run.questions.map((q) => q.block))).sort();
  const questionsByBlock = new Map<string, Question[]>();
  blocks.forEach((b) => {
    questionsByBlock.set(b, run.questions.filter((q) => q.block === b));
  });

  const answered = run.questions.filter((q) => q.latest_answer).length;
  const total = run.questions.length;
  const isLocked = run.status === "locked";
  const activeQ = run.questions.find((q) => q.id === activeQuestion);

  return (
    <div>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin/runs"
                className="text-sm text-slate-500 hover:text-brand-primary hover:underline"
              >
                Alle Runs
              </Link>
              <span className="text-slate-400">/</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900">{run.title}</h2>
              <StatusBadge status={run.status} />
            </div>
            {run.description && (
              <p className="text-sm text-muted-foreground mt-1">{run.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exportiert..." : "Export ZIP"}
            </Button>
            {!isLocked && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={locking}>
                    {locking ? "Wird gesperrt..." : "Run sperren"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Run sperren?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden. Nach dem
                      Sperren kann der Tenant keine Antworten oder Evidence mehr
                      hinzufügen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLock}>
                      Ja, sperren
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className="mb-4"
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Stats — Premium KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-primary-dark to-brand-primary" />
            <div className="px-5 pt-5 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fragen</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-brand-primary-dark to-brand-primary bg-clip-text text-transparent mt-1">{total}</p>
            </div>
          </div>
          <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-success-dark to-brand-success" />
            <div className="px-5 pt-5 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Beantwortet</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-brand-success-dark to-brand-success bg-clip-text text-transparent mt-1">{answered}</p>
            </div>
          </div>
          <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-primary-dark to-brand-primary" />
            <div className="px-5 pt-5 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evidence</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-brand-primary-dark to-brand-primary bg-clip-text text-transparent mt-1">
                {run.questions.reduce((sum, q) => sum + q.evidence_count, 0)}
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-300" />
            <div className="px-5 pt-5 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Erstellt</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {new Date(run.created_at).toLocaleDateString("de-DE")}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <ProgressIndicator answered={answered} total={total} className="mb-6" />

        {/* Questions by block */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Tabs defaultValue={blocks[0]} className="w-full">
              <TabsList className="flex flex-wrap h-auto">
                {blocks.map((b) => (
                  <TabsTrigger key={b} value={b} className="text-xs">
                    Block {b}
                  </TabsTrigger>
                ))}
              </TabsList>
              {blocks.map((b) => (
                <TabsContent key={b} value={b} className="space-y-2 mt-2">
                  {(questionsByBlock.get(b) ?? []).map((q) => (
                    <Card
                      key={q.id}
                      className={`cursor-pointer transition-colors ${
                        activeQuestion === q.id
                          ? "border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setActiveQuestion(q.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-mono text-muted-foreground">
                                {q.frage_id}
                              </p>
                              {q.ko_hart && (
                                <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                  KO-hart
                                </Badge>
                              )}
                              {q.ko_soft && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                  KO-soft
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm line-clamp-2">{q.fragetext}</p>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-1">
                            {q.evidence_count > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {q.evidence_count}
                              </Badge>
                            )}
                            {q.latest_answer ? (
                              <Badge variant="default" className="text-xs">
                                Beantwortet
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Offen
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Question detail (read-only for admin) */}
          <div className="lg:col-span-2">
            {activeQ ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono">{activeQ.frage_id}</span>
                    <span>Block {activeQ.block}</span>
                    <Badge variant="outline" className="text-xs">
                      {activeQ.ebene}
                    </Badge>
                    {activeQ.ko_hart && (
                      <Badge variant="destructive" className="text-xs">KO-hart</Badge>
                    )}
                    {activeQ.ko_soft && (
                      <Badge variant="secondary" className="text-xs">KO-soft</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{activeQ.fragetext}</CardTitle>
                  <CardDescription>{activeQ.unterbereich}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeQ.latest_answer && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Aktuelle Antwort</p>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm whitespace-pre-wrap text-slate-800 leading-relaxed">
                        {activeQ.latest_answer}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Alle Antworten &amp; Verlauf</p>
                    <EventHistory
                      runId={run.id}
                      questionId={activeQ.id}
                      isAdmin
                    />
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>{activeQ.evidence_count} Evidence</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Wählen Sie eine Frage aus der Liste aus.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
