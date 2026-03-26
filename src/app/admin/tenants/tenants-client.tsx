"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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

interface Tenant {
  id: string;
  name: string;
  created_at: string;
  owner_email: string | null;
  run_count: number;
}

export function TenantsClient({ email }: { email: string }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Create tenant state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Invite state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTenantId, setInviteTenantId] = useState<string | null>(null);
  const [inviteTenantName, setInviteTenantName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const loadTenants = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tenants");
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  async function handleCreateTenant() {
    if (!newName.trim()) return;
    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (res.ok) {
        setMessage({ text: `Tenant "${newName.trim()}" erstellt`, type: "success" });
        setNewName("");
        setCreateOpen(false);
        await loadTenants();
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

  function openInvite(tenantId: string, tenantName: string) {
    setInviteTenantId(tenantId);
    setInviteTenantName(tenantName);
    setInviteEmail("");
    setInviteOpen(true);
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !inviteTenantId) return;
    setInviting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/tenants/${inviteTenantId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ text: data.message, type: "success" });
        setInviteOpen(false);
        await loadTenants();
      } else {
        const data = await res.json();
        setMessage({ text: data.error?.message ?? "Fehler beim Einladen", type: "error" });
      }
    } catch {
      setMessage({ text: "Netzwerkfehler", type: "error" });
    } finally {
      setInviting(false);
    }
  }

  return (
    <div>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Tenant-Verwaltung</h2>
            <p className="mt-1 text-sm text-slate-500">Unternehmen und Benutzer verwalten</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>Neuer Tenant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neuen Tenant erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie ein neues Unternehmen (Tenant) in der Plattform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-name">Unternehmensname</Label>
                  <Input
                    id="tenant-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="z.B. Muster GmbH"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTenant()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleCreateTenant}
                  disabled={creating || !newName.trim()}
                >
                  {creating ? "Wird erstellt..." : "Erstellen"}
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
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Noch keine Tenants erstellt. Klicken Sie auf &quot;Neuer Tenant&quot; um zu beginnen.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id} className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-primary-dark to-brand-primary" />
                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-brand-primary-dark">{tenant.name}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInvite(tenant.id, tenant.name)}
                    >
                      Einladen
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6 text-sm">
                    <span className="text-slate-600">
                      Owner: <span className="font-medium text-slate-900">{tenant.owner_email ?? "Kein Owner eingeladen"}</span>
                    </span>
                    <span className="text-slate-600">
                      <span className="font-bold text-brand-primary">{tenant.run_count}</span> Runs
                    </span>
                    <span className="text-slate-500">
                      Erstellt: {new Date(tenant.created_at).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Invite Dialog */}
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User einladen</DialogTitle>
              <DialogDescription>
                Senden Sie eine Einladung an einen User für &quot;{inviteTenantName}&quot;.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@unternehmen.de"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? "Wird gesendet..." : "Einladung senden"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
