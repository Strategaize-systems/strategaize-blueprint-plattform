# API Endpoints — StrategAIze Kundenplattform v1.0

> Alle Endpoints sind Next.js App Router Route Handlers unter `src/app/api/`.
> Alle Requests benötigen ein gültiges Supabase Session Cookie (httpOnly).
> Backend: Supabase self-hosted (PostgreSQL + GoTrue Auth + Storage) auf Hetzner.
> **Tenant schreibt NUR Events (POST). Es gibt KEINEN "update answer" Endpoint.**
> "Aktuelle Antwort" wird serverseitig aus Events berechnet (derived).

---

## Authentication

Auth wird ueber Supabase GoTrue (self-hosted) abgewickelt:
- **MVP-1: Invite-only.** Kein offener Self-Signup. Admin erstellt Tenant und laedt User per Einladungslink ein.
- Sessions werden von `@supabase/ssr` server-seitig ueber Cookies verwaltet.
- Bei Einladungs-Annahme wird automatisch ein `profiles`-Eintrag mit `role = 'tenant_owner'` und korrekter `tenant_id` erstellt.
- GoTrue-Konfiguration: Self-Signup ist deaktiviert (`GOTRUE_DISABLE_SIGNUP=true`).

### Invite Flow (technisch)

```
1. Admin:  POST /api/admin/tenants/{tenantId}/invite  { email }
           → Next.js API Route (service_role key) ruft auf:
             POST http://supabase-auth:9999/admin/users
             Body: { email, email_confirm: false,
                     user_metadata: { tenant_id, role: "tenant_owner" } }
           → GoTrue sendet Invite-Email mit einmaligem Token

2. User:   Klickt Link → /auth/callback?token=...&type=invite
           → supabase.auth.verifyOtp({ token, type: "invite" })
           → User setzt Passwort

3. Trigger: handle_new_user() INSERT on auth.users
           → Liest raw_user_meta_data.tenant_id + .role
           → INSERT into profiles (SECURITY DEFINER, bypasses RLS)

4. Redirect: window.location.href = "/tenant/dashboard"
             (window.location.href, nicht router.push — Supabase Auth Best Practice)
```

**Sicherheits-Garantien:**
- `tenant_id` und `role` im profiles-Eintrag kommen ausschließlich aus `raw_user_meta_data` (Admin-gesetzt)
- Invite-Token ist one-time-use (GoTrue verwaltet Expiry + Invalidierung)
- Self-Signup ist auf DB-Ebene deaktiviert

### Session-Verwaltung
- `@supabase/ssr` verwaltet Sessions via httpOnly Cookies (server-seitig)
- Alle API Routes lesen Session via `createServerClient()`
- `supabase.auth.getUser()` statt `getSession()` für server-seitige Validierung

---

## Admin Endpoints

Alle Admin-Routes erfordern `profiles.role = 'strategaize_admin'`. Middleware prüft bei jedem Request.

---

### Tenants

#### `GET /api/admin/tenants`
Alle Tenants auflisten.

**Response 200:**
```json
{
  "tenants": [
    { "id": "uuid", "name": "string", "created_at": "ISO", "run_count": 2, "owner_email": "string" }
  ]
}
```

#### `POST /api/admin/tenants`
Neuen Tenant anlegen.

**Body:** `{ "name": "string" }`
**Validation:** `name` min 2, max 100 Zeichen.
**Response 201:** `{ "tenant": { "id", "name", "created_at" } }`

#### `POST /api/admin/tenants/{tenantId}/invite`
Tenant-User per E-Mail einladen.

**Body:** `{ "email": "string" }`
**Response 200:** `{ "message": "Invite sent to user@example.com" }`
**Error 409:** E-Mail bereits registriert.

---

### Fragenkatalog

#### `GET /api/admin/catalog/snapshots`
Alle Katalog-Snapshots auflisten.

**Response 200:**
```json
{
  "snapshots": [
    { "id": "uuid", "version": "1.0", "blueprint_version": "1.0", "question_count": 73, "created_at": "ISO" }
  ]
}
```

#### `POST /api/admin/catalog/snapshots`
Neuen Katalog-Snapshot importieren (aus Blueprint Master Excel).

**Body:** `multipart/form-data` mit Excel-Datei ODER `application/json` mit Fragen-Array.
**Response 201:** `{ "snapshot": { "id", "version", "question_count", "hash" } }`

#### `GET /api/admin/catalog/snapshots/{snapshotId}/questions`
Alle Fragen eines Snapshots auflisten.

**Response 200:**
```json
{
  "questions": [
    {
      "id": "uuid", "frage_id": "F-BP-001", "block": "A", "ebene": "Kern",
      "unterbereich": "Block A / A1 Grundverständnis",
      "fragetext": "Was macht Ihr Unternehmen heute ganz konkret?",
      "owner_dependency": false, "deal_blocker": true, "sop_trigger": true,
      "ko_hart": true, "ko_soft": false, "block_weight": 1.2, "position": 1
    }
  ]
}
```

---

### Runs

#### `GET /api/admin/runs`
Alle Runs auflisten. Optional filterbar.

**Query params:** `tenant_id`, `status` (collecting|submitted|locked)

**Response 200:**
```json
{
  "runs": [
    {
      "id": "uuid", "tenant_id": "uuid", "tenant_name": "string", "title": "string",
      "status": "collecting", "catalog_version": "1.0", "question_count": 73,
      "answered_count": 12, "evidence_count": 5,
      "created_at": "ISO", "submitted_at": "ISO|null"
    }
  ]
}
```

> `answered_count` = Anzahl Fragen mit mindestens einem `answer_submitted` Event (derived).

#### `POST /api/admin/runs`
Neuen Run für einen Tenant erstellen.

**Body:**
```json
{
  "tenant_id": "uuid",
  "catalog_snapshot_id": "uuid",
  "title": "string",
  "description": "string"
}
```

**Response 201:** `{ "run": { "id", "tenant_id", "catalog_snapshot_id", "title", "status": "collecting", "contract_version": "v1.0" } }`

#### `GET /api/admin/runs/{runId}`
Run-Details mit allen Fragen und abgeleitetem Antwort-Stand.

**Response 200:**
```json
{
  "run": {
    "id": "uuid", "tenant_id": "uuid", "title": "string", "description": "string",
    "status": "collecting", "catalog_snapshot_id": "uuid", "contract_version": "v1.0",
    "questions": [
      {
        "id": "uuid", "frage_id": "F-BP-001", "block": "A", "ebene": "Kern",
        "fragetext": "...", "position": 1,
        "latest_answer": "string|null", "event_count": 3, "evidence_count": 2,
        "ko_hart": true, "ko_soft": false
      }
    ]
  }
}
```

> `latest_answer` ist derived: `payload.text` des jüngsten `answer_submitted` Events pro Frage.

#### `PATCH /api/admin/runs/{runId}/lock`
Run sperren — keine weiteren Events möglich.

**Response 200:** `{ "run": { "id", "status": "locked" } }`
**Error 422:** Run ist bereits locked.

---

### Export

#### `GET /api/admin/runs/{runId}/export`
Komplettes Export-Paket als ZIP herunterladen. Format gemäß Data Contract v1.0.

**Response 200:** `Content-Type: application/zip`
Siehe [EXPORT.md](./EXPORT.md) für das vollständige Datenformat.

---

## Tenant Endpoints

Alle Tenant-Routes erfordern `profiles.role IN ('tenant_owner', 'tenant_member')`. RLS erzwingt Tenant-Isolation.

**Wichtig:** Tenant hat KEINEN "Update Answer" Endpoint. Jede Interaktion erzeugt ein neues Event.

---

### Runs

#### `GET /api/tenant/runs`
Alle Runs des authentifizierten Tenants.

**Response 200:**
```json
{
  "runs": [
    {
      "id": "uuid", "title": "string", "description": "string",
      "status": "collecting", "question_count": 73, "answered_count": 12,
      "evidence_count": 5, "created_at": "ISO", "submitted_at": "ISO|null"
    }
  ]
}
```

#### `GET /api/tenant/runs/{runId}`
Run-Details mit Fragen und abgeleitetem Antwort-Stand.

**Response 200:**
```json
{
  "run": {
    "id": "uuid", "title": "string", "description": "string", "status": "collecting",
    "questions": [
      {
        "id": "uuid", "frage_id": "F-BP-001", "block": "A", "ebene": "Kern",
        "unterbereich": "Block A / A1 Grundverständnis",
        "fragetext": "...", "position": 1,
        "latest_answer": "string|null", "evidence_count": 2
      }
    ]
  }
}
```

> `latest_answer` = derived aus jüngstem `answer_submitted` Event.

---

### Question Events (einziger Schreib-Weg für Tenants)

#### `POST /api/tenant/runs/{runId}/questions/{questionId}/events`
**Neues Event an eine Frage anhängen.** Dies ist die einzige Schreib-Aktion für Tenants auf Fragen. Es wird immer ein neues Event erstellt, nie ein bestehendes überschrieben.

**Body:**
```json
{
  "client_event_id": "uuid-v4-from-client",
  "event_type": "answer_submitted",
  "payload": { "text": "Unsere aktuelle Vorgehensweise..." }
}
```

**Idempotency:** `client_event_id` (UUID) wird vom Client generiert (`crypto.randomUUID()`). Bei Retry mit derselben `client_event_id` gibt die API 200 mit dem bestehenden Event zurück (kein Duplikat). Unique Constraint: `(run_id, client_event_id)` in der DB.

**Event-Typen:**

| `event_type` | Pflicht-Felder in `payload` |
|---|---|
| `answer_submitted` | `{ "text": "string" }` |
| `note_added` | `{ "text": "string" }` |
| `evidence_attached` | `{ "evidence_item_id": "uuid" }` |
| `status_changed` | `{ "from": "string", "to": "string" }` |

**Validation:** `client_event_id` (UUID, required), `event_type` (enum), `payload` (Zod-Schema pro Event-Typ), `payload.text` max 10.000 Zeichen. Run darf nicht `locked` sein.
**Response 201:** `{ "event": { "id", "client_event_id", "question_id", "run_id", "event_type", "payload", "created_at" } }`
**Response 200:** Wenn `client_event_id` bereits existiert (idempotent retry).
**Error 403:** Run ist locked.

#### `GET /api/tenant/runs/{runId}/questions/{questionId}/events`
Event-Log einer Frage auflisten (Activity Log / History).

**Response 200:**
```json
{
  "events": [
    { "id": "uuid", "event_type": "answer_submitted", "payload": { "text": "..." }, "created_at": "ISO", "created_by": "uuid" }
  ]
}
```

> Sortiert nach `created_at DESC` (neueste zuerst).

---

### Evidence

#### `POST /api/tenant/runs/{runId}/evidence`
Datei oder Textnotiz als Evidence hochladen.

**Datei-Upload (multipart/form-data):**
```
file: <binary>
label: "policy"           (required)
question_id: "uuid"       (optional, null = Run-Level)
```

**Text-Notiz (application/json):**
```json
{
  "item_type": "note",
  "note_text": "string",
  "label": "process",
  "question_id": "uuid"
}
```

**Validation:**
- Dateien: max 200 MB; erlaubte MIME: pdf, docx, xlsx, xls, png, jpg
- `label`: required, einer der 10 Evidence Labels
- `note_text`: max 10.000 Zeichen

**Response 201:** `{ "evidence_item": { "id", "item_type", "label", "file_name", ... } }`

#### `GET /api/tenant/runs/{runId}/evidence`
Alle Evidence-Items für einen Run.

**Query params:** `question_id` (optional)
**Response 200:** `{ "evidence_items": [...] }`

#### `POST /api/tenant/runs/{runId}/evidence/{evidenceId}/link`
Evidence-Item mit einer Frage verknüpfen (Evidence Link mit Relation).

**Body:**
```json
{
  "link_type": "question",
  "link_id": "uuid",
  "relation": "proof"
}
```

**Response 201:** `{ "evidence_link": { "id", "evidence_item_id", "link_type", "link_id", "relation" } }`

---

### Submission

#### `POST /api/tenant/runs/{runId}/submit`
Checkpoint für den Run absenden. Run bleibt offen.

**Body:** `{ "note": "string (optional)" }`
**Validation:** Run darf nicht `locked` sein. Mindestens ein `question_event` muss existieren.
**Response 201:** `{ "submission": { "id", "run_id", "snapshot_version", "submitted_at" } }`
**Error 422:** Keine Events vorhanden.

---

## Error Response Format

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Beschreibung", "details": {} }
}
```

| HTTP Status | Code | Wann |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Zod-Validation fehlgeschlagen |
| 401 | `UNAUTHORIZED` | Keine gültige Session |
| 403 | `FORBIDDEN` | Falsche Rolle / RLS-Verletzung / Run locked |
| 404 | `NOT_FOUND` | Ressource nicht gefunden |
| 409 | `CONFLICT` | Duplikat |
| 422 | `UNPROCESSABLE` | Business-Rule-Verletzung |
| 500 | `INTERNAL_ERROR` | Unerwarteter Server-Fehler |

---

---

## Admin Events (Audit Log)

Admin-Aktionen werden automatisch in `admin_events` geloggt (SECURITY DEFINER Functions + API Routes). Kein eigener Endpoint nötig — Admin sieht dies direkt in Supabase Studio.

Geloggte Event-Typen: `tenant_created`, `run_created`, `run_locked`, `catalog_imported`, `export_generated`, `invite_sent`.

---

_Updated by /architecture skill on 2026-02-23_
