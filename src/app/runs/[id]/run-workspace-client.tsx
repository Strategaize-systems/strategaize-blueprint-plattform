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

  // Event history refresh key
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

  useEffect(() => {
    loadRun();
  }, [loadRun]);

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Run nicht gefunden.</p>
      </div>
    );
  }

  // Group questions by block
  const blocks = Array.from(new Set(run.questions.map((q) => q.block))).sort();
  const questionsByBlock = new Map<string, Question[]>();
  blocks.forEach((b) => {
    questionsByBlock.set(
      b,
      run.questions.filter((q) => q.block === b)
    );
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Premium Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-brand-primary hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <h1 className="text-lg font-bold text-slate-900">{run.title}</h1>
            <StatusBadge status={run.status} />
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && !isLocked && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={submitting || answered === 0}>
                    {submitting ? "Wird eingereicht..." : "Checkpoint einreichen"}
                  </Button>
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

      {/* Progress bar */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <ProgressIndicator answered={answered} total={total} />
      </div>

      {message && (
        <div className="mx-auto max-w-7xl px-6">
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className="mb-2"
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Question list by block */}
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
                      onClick={() => selectQuestion(q)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-mono text-muted-foreground">
                              {q.frage_id}
                            </p>
                            <p className="text-sm line-clamp-2">
                              {q.fragetext}
                            </p>
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

          {/* Right: Question detail + answer + evidence + history */}
          <div className="lg:col-span-2 space-y-4">
            {activeQ ? (
              <>
                {/* Answer Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono">{activeQ.frage_id}</span>
                      <span>Block {activeQ.block}</span>
                      <Badge variant="outline" className="text-xs">
                        {activeQ.ebene}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      {activeQ.fragetext}
                    </CardTitle>
                    <CardDescription>{activeQ.unterbereich}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="answer">Ihre Antwort</Label>
                      <Textarea
                        id="answer"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Geben Sie Ihre Antwort ein..."
                        rows={8}
                        disabled={isLocked || isAdmin}
                        className="resize-y"
                      />
                    </div>
                    {!isAdmin && !isLocked && (
                      <Button
                        onClick={saveAnswer}
                        disabled={saving || !answerText.trim()}
                      >
                        {saving ? "Wird gespeichert..." : "Antwort speichern"}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Event History */}
                {!isAdmin && activeQuestion && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Verlauf</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EventHistory
                        key={`${activeQuestion}-${eventKey}`}
                        runId={runId}
                        questionId={activeQuestion}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Evidence Section */}
                {!isAdmin && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Evidence / Nachweise</CardTitle>
                      <CardDescription>
                        Dateien oder Notizen als Nachweis verknüpfen
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Evidence list */}
                      {evidenceLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : evidenceItems.length > 0 ? (
                        <div className="space-y-2">
                          {evidenceItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-md border p-3"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {item.label}
                                  </Badge>
                                  {item.relation && (
                                    <Badge variant="secondary" className="text-xs">
                                      {item.relation}
                                    </Badge>
                                  )}
                                </div>
                                {item.item_type === "file" ? (
                                  <p className="mt-1 text-sm truncate">
                                    {item.file_name}{" "}
                                    <span className="text-muted-foreground">
                                      ({formatFileSize(item.file_size_bytes)})
                                    </span>
                                  </p>
                                ) : (
                                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                    {item.note_text}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(item.created_at).toLocaleString("de-DE")}
                                </p>
                              </div>
                              {item.item_type === "file" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => downloadEvidence(item.id)}
                                >
                                  Download
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Noch keine Nachweise verknüpft.
                        </p>
                      )}

                      {!isLocked && (
                        <>
                          <Separator />

                          {/* File upload */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Datei hochladen</Label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <Input
                                  ref={fileInputRef}
                                  type="file"
                                  accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                                  disabled={uploading}
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                  PDF, DOCX, Excel, PNG, JPG (max 200 MB)
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Select value={uploadLabel} onValueChange={setUploadLabel}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Label wählen" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {EVIDENCE_LABELS.map((l) => (
                                      <SelectItem key={l.value} value={l.value}>
                                        {l.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select value={uploadRelation} onValueChange={setUploadRelation}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Relation wählen" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {EVIDENCE_RELATIONS.map((r) => (
                                      <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              onClick={handleFileUpload}
                              disabled={uploading || !uploadLabel || !fileInputRef.current?.files?.length}
                              size="sm"
                            >
                              {uploading ? "Wird hochgeladen..." : "Datei hochladen"}
                            </Button>
                          </div>

                          <Separator />

                          {/* Text note */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Textnotiz hinzufügen</Label>
                            <Textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Ergänzende Notiz eingeben..."
                              rows={3}
                              disabled={uploading}
                            />
                            <div className="flex gap-2">
                              <Select value={noteLabel} onValueChange={setNoteLabel}>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Label wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                  {EVIDENCE_LABELS.map((l) => (
                                    <SelectItem key={l.value} value={l.value}>
                                      {l.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select value={noteRelation} onValueChange={setNoteRelation}>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Relation wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                  {EVIDENCE_RELATIONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                      {r.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              onClick={handleNoteSubmit}
                              disabled={uploading || !noteText.trim() || !noteLabel}
                              size="sm"
                              variant="outline"
                            >
                              {uploading ? "Wird gespeichert..." : "Notiz speichern"}
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  Wählen Sie eine Frage aus der Liste aus, um sie zu
                  beantworten.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
