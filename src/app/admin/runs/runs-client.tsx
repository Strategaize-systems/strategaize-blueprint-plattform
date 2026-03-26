"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { ProgressIndicator } from "@/components/progress-indicator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Run {
  id: string;
  tenant_id: string;
  tenant_name: string | null;
  title: string;
  status: string;
  catalog_version: string | null;
  question_count: number;
  answered_count: number;
  evidence_count: number;
  created_at: string;
  submitted_at: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

interface Snapshot {
  id: string;
  version: string;
  question_count: number;
}

export function RunsClient({ email }: { email: string }) {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Create run state
  const [createOpen, setCreateOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [newTenantId, setNewTenantId] = useState("");
  const [newSnapshotId, setNewSnapshotId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const loadRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/runs");
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  async function openCreateDialog() {
    setCreateOpen(true);
    // Load tenants + snapshots for the form
    const [tRes, sRes] = await Promise.all([
      fetch("/api/admin/tenants"),
      fetch("/api/admin/catalog/snapshots"),
    ]);
    if (tRes.ok) {
      const data = await tRes.json();
      setTenants(data.tenants ?? []);
    }
    if (sRes.ok) {
      const data = await sRes.json();
      setSnapshots(data.snapshots ?? []);
    }
  }

  async function handleCreateRun() {
    if (!newTenantId || !newSnapshotId || !newTitle.trim()) return;
    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: newTenantId,
          catalog_snapshot_id: newSnapshotId,
          title: newTitle.trim(),
        }),
      });

      if (res.ok) {
        setMessage({ text: `Run "${newTitle.trim()}" erstellt`, type: "success" });
        setNewTenantId("");
        setNewSnapshotId("");
        setNewTitle("");
        setCreateOpen(false);
        await loadRuns();
      } else {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Fehler beim Erstellen", type: "error" });
      }
    } catch {
      setMessage({ text: "Netzwerkfehler", type: "error" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Alle Runs</h2>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>Neuer Run</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Run erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Assessment-Run für einen Tenant.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tenant</Label>
                  <Select value={newTenantId} onValueChange={setNewTenantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tenant wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fragenkatalog</Label>
                  <Select value={newSnapshotId} onValueChange={setNewSnapshotId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Katalog wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {snapshots.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          v{s.version} ({s.question_count} Fragen)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="run-title">Titel</Label>
                  <Input
                    id="run-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="z.B. Assessment Q1 2026"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateRun()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreateRun}
                  disabled={creating || !newTenantId || !newSnapshotId || !newTitle.trim()}
                >
                  {creating ? "Wird erstellt..." : "Run erstellen"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <Alert
            variant={message.type === "error" ? "destructive" : "default"}
            className="mb-4"
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : runs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Noch keine Runs erstellt. Erstellen Sie zuerst einen Tenant und importieren Sie einen Katalog.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <Link key={run.id} href={`/admin/runs/${run.id}`}>
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{run.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {run.tenant_name ?? "Unbekannt"} &middot; Katalog v{run.catalog_version}
                        </p>
                      </div>
                      <StatusBadge status={run.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProgressIndicator
                      answered={run.answered_count}
                      total={run.question_count}
                    />
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>{run.evidence_count} Evidence-Dokumente</span>
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
      </div>
    </div>
  );
}
