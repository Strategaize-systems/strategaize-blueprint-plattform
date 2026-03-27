"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, Menu, X } from "lucide-react";

const EVIDENCE_LABELS = [
  { value: "policy", label: "Policy" },
  { value: "process", label: "Prozess" },
  { value: "template", label: "Vorlage" },
  { value: "contract", label: "Vertrag" },
  { value: "financial", label: "Finanzen" },
  { value: "legal", label: "Recht" },
  { value: "system", label: "System" },
  { value: "org", label: "Org" },
  { value: "kpi", label: "KPI" },
  { value: "other", label: "Sonstiges" },
];

const EVIDENCE_RELATIONS = [
  { value: "proof", label: "Nachweis (proof)" },
  { value: "supports", label: "Unterstützt (supports)" },
  { value: "example", label: "Beispiel (example)" },
  { value: "supersedes", label: "Ersetzt (supersedes)" },
];

interface Question {
  id: string;
  frage_id: string;
  block: string;
  ebene: string;
  unterbereich: string;
  fragetext: string;
  position: number;
  latest_answer: string | null;
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

interface EvidenceItem {
  id: string;
  item_type: "file" | "note";
  label: string;
  file_name: string | null;
  file_size_bytes: number | null;
  file_mime_type: string | null;
  note_text: string | null;
  sha256: string | null;
  created_at: string;
  relation?: string | null;
}

const BLOCK_NAMES: Record<string, string> = {
  A: "Grundverständnis",
  B: "Markt & Wettbewerb",
  C: "Finanzen",
  D: "Organisation",
  E: "Prozesse",
  F: "IT & Systeme",
  G: "Recht & Compliance",
  H: "Strategie",
  I: "Exit-Readiness",
};

export function RunWorkspaceClient({
  runId,
  isAdmin,
}: {
  runId: string;
  isAdmin: boolean;
}) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitNote, setSubmitNote] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [openBlocks, setOpenBlocks] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Evidence state
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploadRelation, setUploadRelation] = useState("supports");
  const [uploading, setUploading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteLabel, setNoteLabel] = useState("");
  const [noteRelation, setNoteRelation] = useState("supports");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [eventKey, setEventKey] = useState(0);

  const loadRun = useCallback(async () => {
    try {
      const endpoint = isAdmin
        ? `/api/admin/runs/${runId}`
        : `/api/tenant/runs/${runId}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setRun(data.run);
        // Auto-open the first block
        if (data.run?.questions?.length > 0) {
          const firstBlock = data.run.questions[0].block;
          setOpenBlocks(new Set([firstBlock]));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [runId, isAdmin]);

  const loadEvidence = useCallback(async (questionId: string) => {
    setEvidenceLoading(true);
    try {
      const res = await fetch(
        `/api/tenant/runs/${runId}/evidence?question_id=${questionId}`
      );
      if (res.ok) {
        const data = await res.json();
        setEvidenceItems(data.evidence_items ?? []);
      }
    } finally {
      setEvidenceLoading(false);
    }
  }, [runId]);

  useEffect(() => { loadRun(); }, [loadRun]);

  useEffect(() => {
    if (activeQuestion && !isAdmin) {
      loadEvidence(activeQuestion);
    } else {
      setEvidenceItems([]);
    }
  }, [activeQuestion, isAdmin, loadEvidence]);

  function selectQuestion(q: Question) {
    setActiveQuestion(q.id);
    setAnswerText(q.latest_answer ?? "");
    setMessage(null);
    setSidebarOpen(false);
  }

  function toggleBlock(block: string) {
    setOpenBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(block)) next.delete(block);
      else next.add(block);
      return next;
    });
  }

  async function saveAnswer() {
    if (!activeQuestion || !answerText.trim() || !run) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/tenant/runs/${runId}/questions/${activeQuestion}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_event_id: crypto.randomUUID(),
            event_type: "answer_submitted",
            payload: { text: answerText },
          }),
        }
      );
      if (res.ok) {
        setMessage({ text: "Antwort gespeichert", type: "success" });
        setEventKey((k) => k + 1);
        await loadRun();
      } else {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Unbekannter Fehler", type: "error" });
      }
    } catch {
      setMessage({ text: "Netzwerkfehler — bitte erneut versuchen", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !activeQuestion || !uploadLabel) return;
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", uploadLabel);
      formData.append("question_id", activeQuestion);
      formData.append("relation", uploadRelation);
      const res = await fetch(`/api/tenant/runs/${runId}/evidence`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage({ text: "Datei hochgeladen", type: "success" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadLabel("");
        setEventKey((k) => k + 1);
        await loadEvidence(activeQuestion);
        await loadRun();
      } else {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Unbekannter Fehler", type: "error" });
      }
    } catch {
      setMessage({ text: "Netzwerkfehler — bitte erneut versuchen", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleNoteSubmit() {
    if (!noteText.trim() || !activeQuestion || !noteLabel) return;
    setUploading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/tenant/runs/${runId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type: "note",
          note_text: noteText,
          label: noteLabel,
          question_id: activeQuestion,
          relation: noteRelation,
        }),
      });
      if (res.ok) {
        setMessage({ text: "Notiz hinzugefügt", type: "success" });
        setNoteText("");
        setNoteLabel("");
        setEventKey((k) => k + 1);
        await loadEvidence(activeQuestion);
        await loadRun();
      } else {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Unbekannter Fehler", type: "error" });
      }
    } catch {
      setMessage({ text: "Netzwerkfehler — bitte erneut versuchen", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function downloadEvidence(evidenceId: string) {
    try {
      const res = await fetch(
        `/api/tenant/runs/${runId}/evidence/${evidenceId}/download`
      );
      if (res.ok) {
        const data = await res.json();
        window.open(data.download_url, "_blank");
      }
    } catch {
      setMessage({ text: "Download fehlgeschlagen", type: "error" });
    }
  }

  async function submitRun() {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/tenant/runs/${runId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitNote.trim() ? { note: submitNote.trim() } : {}),
      });
      if (res.ok) {
        setMessage({ text: "Checkpoint erfolgreich eingereicht", type: "success" });
        setSubmitNote("");
        await loadRun();
      } else {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Unbekannter Fehler", type: "error" });
      }
    } catch {
      setMessage({ text: "Netzwerkfehler — bitte erneut versuchen", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Skeleton className="mb-4 h-8 w-64 rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Run nicht gefunden.</p>
      </div>
    );
  }

  // Group questions by block
  const blocks = Array.from(new Set(run.questions.map((q) => q.block))).sort();
  const questionsByBlock = new Map<string, Question[]>();
  blocks.forEach((b) => {
    questionsByBlock.set(b, run.questions.filter((q) => q.block === b));
  });

  const answered = run.questions.filter((q) => q.latest_answer).length;
  const total = run.questions.length;
  const isLocked = run.status === "locked";
  const activeQ = run.questions.find((q) => q.id === activeQuestion);

  function formatFileSize(bytes: number | null) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Group questions by unterbereich within a block
  function groupByUnterbereich(questions: Question[]) {
    const groups: { label: string; questions: Question[] }[] = [];
    let currentLabel = "";
    let currentGroup: Question[] = [];
    for (const q of questions) {
      if (q.unterbereich !== currentLabel) {
        if (currentGroup.length > 0) groups.push({ label: currentLabel, questions: currentGroup });
        currentLabel = q.unterbereich;
        currentGroup = [q];
      } else {
        currentGroup.push(q);
      }
    }
    if (currentGroup.length > 0) groups.push({ label: currentLabel, questions: currentGroup });
    return groups;
  }

  // ─── Sidebar: dark theme matching Figma mockup ─────────────────────────
  const sidebar = (
    <div className="flex h-full flex-col" style={{ background: "var(--gradient-sidebar)" }}>
      {/* Brand header — full logo in lighter container */}
      <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/50 border border-white/[0.06] px-5 pt-6 pb-5 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-full.svg" alt="StrategAIze" className="mx-auto h-12 w-auto mb-4" />
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mt-3">
          <div className="text-sm font-bold text-white">Blueprint Assessment</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Strategische Unternehmensanalyse</div>
        </div>
      </div>
      <div className="h-4" />

      {/* Block groups */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {blocks.map((block) => {
          const questions = questionsByBlock.get(block) ?? [];
          const blockAnswered = questions.filter((q) => q.latest_answer).length;
          const isOpen = openBlocks.has(block);
          const hasActiveQuestion = questions.some((q) => q.id === activeQuestion);
          const untergruppen = groupByUnterbereich(questions);

          return (
            <div key={block} className="mb-1.5">
              <button
                onClick={() => toggleBlock(block)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${
                  isOpen || hasActiveQuestion
                    ? "bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white shadow-[0_8px_16px_-4px_rgba(68,84,184,0.35)]"
                    : "text-slate-300 hover:bg-white/[0.06]"
                }`}
              >
                <div
                  className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    blockAnswered === questions.length && questions.length > 0
                      ? "bg-gradient-to-br from-brand-success-dark to-brand-success shadow-[0_0_8px_rgba(0,168,79,0.5)]"
                      : blockAnswered > 0
                        ? "bg-gradient-to-br from-brand-warning-dark to-brand-warning shadow-[0_0_8px_rgba(242,183,5,0.5)]"
                        : "bg-slate-600"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold leading-snug">
                    Block {block}: {BLOCK_NAMES[block] ?? ""}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${isOpen || hasActiveQuestion ? "text-white/50" : "text-slate-500"}`}>
                      Analyse
                    </span>
                    <span className={`text-[10px] ${isOpen || hasActiveQuestion ? "text-white/30" : "text-slate-600"}`}>&bull;</span>
                    <span className={`text-[10px] tabular-nums font-bold ${isOpen || hasActiveQuestion ? "text-white/50" : "text-slate-500"}`}>
                      {blockAnswered}/{questions.length}
                    </span>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-white/40" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-600" />
                )}
              </button>

              {isOpen && (
                <div className="py-2 pl-3">
                  {untergruppen.map((group) => (
                    <div key={group.label} className="mb-2">
                      {/* Category label — colored like mockup */}
                      <div className="px-3 py-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                          {group.label}
                        </span>
                      </div>
                      {/* Questions */}
                      {group.questions.map((q) => {
                        const isActive = activeQuestion === q.id;
                        const hasAnswer = !!q.latest_answer;
                        return (
                          <button
                            key={q.id}
                            onClick={() => selectQuestion(q)}
                            className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-150 ${
                              isActive
                                ? "bg-brand-primary/20 text-white"
                                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-300"
                            }`}
                          >
                            <div
                              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                                hasAnswer
                                  ? "bg-brand-success shadow-[0_0_6px_rgba(0,168,79,0.5)]"
                                  : "bg-slate-600"
                              }`}
                            />
                            <p className={`text-xs leading-snug line-clamp-2 flex-1 ${isActive ? "font-medium" : ""}`}>
                              {q.fragetext}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Abmelden */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary/20 to-brand-primary-dark/20 px-3 py-3 text-sm font-semibold text-slate-300 transition-all hover:from-brand-primary/30 hover:to-brand-primary-dark/30 hover:text-white"
        >
          Abmelden
        </Link>
      </div>
    </div>
  );

  // ─── Main layout ──────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar toggle */}
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
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        {/* Header — Dual Progress */}
        <header className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between gap-8 px-8 py-5">
            {/* LEFT: Title + Breadcrumb */}
            <div className="flex-shrink-0 min-w-0 pl-10 lg:pl-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 truncate">
                {run.title}
              </h1>
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                {activeQ ? (
                  <>
                    <span className="font-semibold truncate">Block {activeQ.block}: {BLOCK_NAMES[activeQ.block] ?? ""}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-medium truncate">{activeQ.unterbereich}</span>
                  </>
                ) : (
                  <span className="text-slate-400">Frage auswählen um zu beginnen</span>
                )}
              </div>
            </div>

            {/* CENTER: Dual Progress */}
            <div className="flex-1 max-w-sm space-y-2.5 hidden md:block">
              {/* Gesamt */}
              <div className="flex items-center gap-4">
                <div className="w-16 text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gesamt</span>
                </div>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-success-dark to-brand-success transition-all duration-700 ease-out"
                    style={{ width: `${total > 0 ? Math.round((answered / total) * 100) : 0}%` }}
                  />
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {total > 0 ? Math.round((answered / total) * 100) : 0}%
                  </span>
                </div>
              </div>
              {/* Block */}
              {(() => {
                const currentBlock = activeQ?.block;
                if (!currentBlock) return null;
                const blockQuestions = questionsByBlock.get(currentBlock) ?? [];
                const blockAnswered = blockQuestions.filter((q) => q.latest_answer).length;
                const blockTotal = blockQuestions.length;
                const blockPercent = blockTotal > 0 ? Math.round((blockAnswered / blockTotal) * 100) : 0;
                return (
                  <div className="flex items-center gap-4">
                    <div className="w-16 text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Block</span>
                    </div>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dark transition-all duration-700 ease-out"
                        style={{ width: `${blockPercent}%` }}
                      />
                    </div>
                    <div className="w-12 text-right">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{blockPercent}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* RIGHT: Status + Action — same size, horizontal */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
                {run.status === "collecting" ? "In Bearbeitung" : run.status === "submitted" ? "Eingereicht" : "Gesperrt"}
              </div>
              {!isAdmin && !isLocked && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={submitting || answered === 0}
                      className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-brand-success-dark to-brand-success text-white shadow-md text-xs font-bold uppercase tracking-wider disabled:opacity-50 hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                      {submitting ? "Wird eingereicht..." : "Checkpoint einreichen"}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Checkpoint einreichen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sie haben {answered} von {total} Fragen beantwortet.
                        {total - answered > 0 && (
                          <> Es sind noch {total - answered} Fragen offen.</>
                        )}
                        {" "}Nach dem Einreichen können Sie weiterhin Antworten und
                        Evidence ergänzen, bis der Run gesperrt wird.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                      <Label htmlFor="submit-note">Optionale Notiz</Label>
                      <Textarea
                        id="submit-note"
                        value={submitNote}
                        onChange={(e) => setSubmitNote(e.target.value)}
                        placeholder="Hinweis zum Einreichungsstatus (optional)..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={submitRun}>
                        Ja, einreichen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </header>

        {/* Message bar */}
        {message && (
          <div className="flex-shrink-0 px-6 pt-3">
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Content: scrollable main workspace */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeQ ? (
            <div className="mx-auto max-w-3xl space-y-6">
              {/* ── Markante Fragekarte (Style Guide 14.2) ── */}
              <div className="relative bg-white rounded-3xl border-2 border-slate-300 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary-dark via-brand-primary to-brand-success-dark" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/20 pointer-events-none" />
                <div className="relative p-8 lg:p-12">
                  {/* Meta row */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary-dark via-brand-primary to-brand-primary-dark text-white shadow-xl shadow-brand-primary/40">
                      <span className="text-sm font-bold tracking-tight">{activeQ.frage_id}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                      {activeQ.unterbereich}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="h-6 w-px bg-slate-200" />
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 uppercase tracking-wide">
                        {activeQ.ebene}
                      </span>
                    </div>
                  </div>
                  {/* Question text */}
                  <h2 className="text-2xl font-bold text-slate-900 leading-[1.4] tracking-tight">
                    {activeQ.fragetext}
                  </h2>
                </div>
              </div>

              {/* ── Answer Editor with Action Bar (Style Guide 14.4) ── */}
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                {/* Header */}
                <div className="px-8 py-4 border-b border-slate-200 bg-slate-50/50">
                  <label className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-brand-primary-dark to-brand-primary" />
                    Ihre Antwort
                  </label>
                </div>
                {/* Textarea */}
                <div className="p-8 max-h-80 overflow-y-auto">
                  <textarea
                    id="answer"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Beschreiben Sie hier Ihre Antwort ausführlich und konkret."
                    disabled={isLocked || isAdmin}
                    className="w-full min-h-[20rem] px-0 py-0 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 border-0 outline-none resize-none bg-transparent focus:ring-0"
                  />
                </div>
                {/* Action bar */}
                {!isAdmin && !isLocked && (
                  <div className="px-8 py-5 border-t-2 border-slate-100 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500 tabular-nums">
                        {answerText.length} Zeichen
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          disabled
                          className="px-5 py-3 rounded-xl bg-white border-2 border-slate-200 text-sm font-semibold text-slate-400 cursor-not-allowed"
                          title="Spracheingabe (V2)"
                        >
                          Sprechen
                        </button>
                        <button
                          onClick={saveAnswer}
                          disabled={saving || !answerText.trim()}
                          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary-dark via-brand-primary to-brand-primary-dark text-white font-bold shadow-xl shadow-brand-primary/30 hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                        >
                          {saving ? "Wird gespeichert..." : "Antwort speichern"}
                          {!saving && <span>&#10003;</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── History Panel (Style Guide 14.5) ── */}
              {!isAdmin && activeQuestion && (
                <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                  <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      Antwort-Verlauf
                    </h3>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                    <div className="p-6">
                      <EventHistory
                        key={`${activeQuestion}-${eventKey}`}
                        runId={runId}
                        questionId={activeQuestion}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Evidence + Checkpoints Grid (Style Guide 14.6) ── */}
              {!isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT: Evidence / Nachweise */}
                  <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary-dark to-brand-primary flex items-center justify-center shadow-md">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        Hochgeladene Nachweise
                        <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-600">
                          {evidenceItems.filter((e) => e.item_type === "file").length}
                        </span>
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {evidenceLoading ? (
                        <Skeleton className="h-16 w-full rounded-xl" />
                      ) : evidenceItems.filter((e) => e.item_type === "file").length > 0 ? (
                        evidenceItems.filter((e) => e.item_type === "file").map((item) => {
                          const ext = item.file_name?.split(".").pop()?.toUpperCase() ?? "FILE";
                          return (
                            <div
                              key={item.id}
                              className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary-dark to-brand-primary flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                  {ext}
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">{item.file_name}</div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{formatFileSize(item.file_size_bytes)}</span>
                                    <span>&bull;</span>
                                    <span>{new Date(item.created_at).toLocaleDateString("de-DE")}</span>
                                    <span>&bull;</span>
                                    <span className="font-medium">{item.label}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-400 py-3 text-center">Keine Dateien hochgeladen.</p>
                      )}

                      {/* Upload — compact */}
                      {!isLocked && (
                        <>
                          <Separator className="my-3" />
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2">
                              <Input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                                disabled={uploading}
                              />
                              <Select value={uploadLabel} onValueChange={setUploadLabel}>
                                <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
                                <SelectContent>
                                  {EVIDENCE_LABELS.map((l) => (
                                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={handleFileUpload}
                              disabled={uploading || !uploadLabel || !fileInputRef.current?.files?.length}
                              size="sm"
                              className="w-full"
                            >
                              {uploading ? "Wird hochgeladen..." : "Datei hochladen"}
                            </Button>
                          </div>
                          <Separator className="my-3" />
                          <div className="space-y-2">
                            <Textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Textnotiz eingeben..."
                              rows={2}
                              disabled={uploading}
                            />
                            <div className="flex gap-2">
                              <Select value={noteLabel} onValueChange={setNoteLabel}>
                                <SelectTrigger><SelectValue placeholder="Kategorie" /></SelectTrigger>
                                <SelectContent>
                                  {EVIDENCE_LABELS.map((l) => (
                                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={handleNoteSubmit}
                                disabled={uploading || !noteText.trim() || !noteLabel}
                                size="sm"
                                variant="outline"
                              >
                                Notiz speichern
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Eingereichte Checkpoints */}
                  <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-success-dark to-brand-success flex items-center justify-center shadow-md">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        Eingereichte Checkpoints
                        <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-600">
                          {run.submitted_at ? "1" : "0"}
                        </span>
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {run.submitted_at ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-slate-600">
                              {new Date(run.submitted_at).toLocaleString("de-DE")}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">v1</span>
                            <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                              Eingereicht
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {answered}/{total} Fragen beantwortet
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-sm text-slate-400">Noch kein Checkpoint eingereicht.</p>
                          <p className="text-xs text-slate-400 mt-1">Beantworten Sie Fragen und reichen Sie einen Checkpoint ein.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-lg font-semibold text-slate-400">
                  Frage auswählen
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Wählen Sie eine Frage aus der Navigation links.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
