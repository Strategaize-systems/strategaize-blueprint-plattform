# Data Model — StrategAIze Kundenplattform v1.0

> Append-only gilt fuer Event-Tabellen: Tenant-User duerfen dort keine Datensaetze loeschen oder ueberschreiben.
> Alle Tabellen sind tenant-scoped und run-scoped.
> Source of Truth = `question_events` (Event-Log). "Aktuelle Antwort" ist immer abgeleitet.
> Backend: Supabase self-hosted (PostgreSQL + GoTrue Auth + S3-kompatibles Storage) auf Hetzner.

---

## Core Principles

1. **Append-only (Event-Tabellen):** Kein `UPDATE` oder `DELETE` durch Tenant-User auf `question_events`, `evidence_items`, `evidence_links`, `run_submissions`, `admin_events`. Jede Aenderung ist eine neue Zeile (Event).
2. **Status-Transitions (runs):** Die `runs`-Tabelle erlaubt definierte Status-Aenderungen (`collecting` -> `submitted` -> `locked`), aber NUR ueber serverseitige Logik / definierte API-Endpoints. Tenant darf `runs` NICHT frei updaten.
3. **Source of Truth = Event-Log:** `question_events` ist die einzige Wahrheit fuer Antworten. Alles andere (z.B. `latest_answer`) wird daraus berechnet.
4. **Tenant Isolation:** Jede Tabelle mit Nutzerdaten hat `tenant_id` FK. RLS-Policies erzwingen dies.
5. **Vordefinierter Katalog:** Fragen kommen aus dem Exit Ready Blueprint Master (73 Fragen, 9 Bloecke). Admin erstellt keine Fragen manuell.
6. **Derived Convenience:** Eine "aktuelle Antwort" pro Frage wird als SQL VIEW berechnet (juengstes `answer_submitted` Event). Es gibt KEIN Feld, das der Tenant direkt ueberschreibt. Materialized Tables sind NICHT Teil von MVP-1.
7. **Audit Trail:** `created_at` + `created_by` auf jeder Tabelle.
8. **Invite-only Auth:** Kein offener Self-Signup. Zugang nur ueber Admin-Einladung.
9. **Idempotency:** `question_events.client_event_id` (UUID, vom Client generiert) + Unique Constraint `(run_id, client_event_id)` verhindert doppelte Events bei Netzwerk-Retries.

---

## Tables

### `tenants`
Repräsentiert ein Kundenunternehmen.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text NOT NULL` | Firmenname |
| `created_at` | `timestamptz` | `now()` |
| `created_by` | `uuid` FK -> `auth.users` | Admin der den Tenant erstellt hat |

---

### `profiles`
Eine Zeile pro `auth.users`-Eintrag. Verknüpft User mit Tenant und Rolle. Vorbereitet für Multi-User (MVP-2).

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK FK -> `auth.users` | = `auth.users.id` |
| `tenant_id` | `uuid` FK -> `tenants` | `NULL` für `strategaize_admin` |
| `email` | `text NOT NULL` | Denormalisiert von `auth.users` |
| `role` | `text` CHECK | `'strategaize_admin'` \| `'tenant_owner'` \| `'tenant_member'` |
| `created_at` | `timestamptz` | `now()` |

**Rollen:**
- `strategaize_admin` — Globaler Admin, voller Zugriff auf alle Tenants/Runs
- `tenant_owner` — Erster User eines Tenants (via Einladung); kann spaeter Nutzer einladen (MVP-2)
- `tenant_member` — Weiteres Tenant-Mitglied (via Einladung), kann Fragen beantworten + Evidence hochladen (MVP-2)

---

### `question_catalog_snapshots`
Versionierte Snapshots des Exit Ready Blueprint Fragenkatalogs.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `version` | `text NOT NULL` | z.B. `'1.0'`, `'1.1'` |
| `blueprint_version` | `text NOT NULL` | Version des Blueprint Master |
| `hash` | `text NOT NULL` | SHA256 Hash des Katalog-Inhalts |
| `question_count` | `integer NOT NULL` | z.B. 73 |
| `created_at` | `timestamptz` | |
| `created_by` | `uuid` FK -> `auth.users` | Admin |

**Unique constraint:** `(version)`

---

### `questions`
Fragen aus dem Exit Ready Blueprint, zugeordnet zu einem Katalog-Snapshot.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `catalog_snapshot_id` | `uuid` FK -> `question_catalog_snapshots` NOT NULL | |
| `frage_id` | `text NOT NULL` | Stabile ID aus Blueprint Master, z.B. `F-BP-001` |
| `block` | `text NOT NULL` | `A` bis `I` |
| `ebene` | `text NOT NULL` | `'Kern'` \| `'Workspace'` |
| `unterbereich` | `text NOT NULL` | z.B. `'Block A / A1 Grundverständnis'` |
| `fragetext` | `text NOT NULL` | Die eigentliche Frage |
| `owner_dependency` | `boolean NOT NULL` | OD-Flag |
| `deal_blocker` | `boolean NOT NULL` | DB-Flag |
| `sop_trigger` | `boolean NOT NULL` | SOP-Flag |
| `ko_hart` | `boolean NOT NULL` | KO hart Flag |
| `ko_soft` | `boolean NOT NULL` | KO soft Flag |
| `block_weight` | `numeric(3,1) NOT NULL` | Gewicht des Blocks (z.B. 1.5) |
| `position` | `integer NOT NULL` | Reihenfolge im Katalog |
| `created_at` | `timestamptz` | |

**Index:** `(catalog_snapshot_id, position)` für sortierte Anzeige.
**Unique constraint:** `(catalog_snapshot_id, frage_id)`

---

### `runs`
Ein Assessment-Zyklus, einem Tenant zugeordnet.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` FK -> `tenants` NOT NULL | |
| `catalog_snapshot_id` | `uuid` FK -> `question_catalog_snapshots` NOT NULL | Welcher Fragenkatalog |
| `title` | `text NOT NULL` | Menschenlesbarer Name |
| `description` | `text` | Optionales Briefing |
| `status` | `text` CHECK | `'collecting'` \| `'submitted'` \| `'locked'` — Default `'collecting'` |
| `contract_version` | `text NOT NULL` | `'v1.0'` — Export Data Contract Version |
| `created_at` | `timestamptz` | |
| `created_by` | `uuid` FK -> `auth.users` | Admin |
| `submitted_at` | `timestamptz` | Timestamp des letzten Checkpoints (nullable) |

**Status-Bedeutung und erlaubte Transitions:**

```
collecting  -->  submitted  -->  locked
```

| Von | Nach | Ausgeloest durch | Endpoint |
|-----|------|-----------------|----------|
| `collecting` | `submitted` | Erster Checkpoint vom Tenant | `POST /api/tenant/runs/{runId}/submit` |
| `submitted` | `submitted` | Weitere Checkpoints (Status bleibt) | `POST /api/tenant/runs/{runId}/submit` |
| `submitted` | `locked` | Admin sperrt den Run | `PATCH /api/admin/runs/{runId}/lock` |
| `collecting` | `locked` | Admin sperrt den Run (ohne Checkpoint) | `PATCH /api/admin/runs/{runId}/lock` |

- `collecting` = Tenant arbeitet aktiv, kann Events und Evidence anhaengen
- `submitted` = Mindestens ein Checkpoint gesendet; Run bleibt offen fuer weitere Events
- `locked` = Admin hat den Run gesperrt; keine weiteren Events moeglich

> **Wichtig:** Die `runs.status`-Spalte darf NUR ueber die oben definierten Endpoints geaendert werden. Tenant hat keinen direkten UPDATE-Zugriff auf `runs`. RLS erlaubt Tenant nur SELECT auf `runs`.

---

### `question_events` — SOURCE OF TRUTH
**Append-only Event-Log. Jede Tenant-Interaktion mit einer Frage erzeugt eine neue Zeile. Dies ist die einzige Daten-Wahrheit.**

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `client_event_id` | `uuid NOT NULL` | **Idempotency Key** — vom Client generiert (`crypto.randomUUID()`). Unique Constraint: `(run_id, client_event_id)` |
| `question_id` | `uuid` FK -> `questions` NOT NULL | |
| `run_id` | `uuid` FK -> `runs` NOT NULL | Denormalisiert für schnellere Queries |
| `tenant_id` | `uuid` FK -> `tenants` NOT NULL | Denormalisiert für RLS |
| `event_type` | `text` CHECK | Siehe Event-Typen unten |
| `payload` | `jsonb NOT NULL` | Event-spezifische Daten |
| `created_at` | `timestamptz` | |
| `created_by` | `uuid` FK -> `auth.users` NOT NULL | |

**Event-Typen:**

| `event_type` | Payload | Beschreibung |
|---|---|---|
| `answer_submitted` | `{ "text": "string" }` | Tenant gibt Antwort ab (neues Event, kein Update) |
| `note_added` | `{ "text": "string" }` | Freitext-Notiz zu einer Frage |
| `evidence_attached` | `{ "evidence_item_id": "uuid" }` | Evidence-Item an Frage verknüpft |
| `status_changed` | `{ "from": "string", "to": "string" }` | Optional: pro-Frage Status |

**Indexes:**
- `(run_id, question_id, created_at DESC)` — chronologische Event-Wiedergabe
- `(run_id, question_id, event_type)` — gefilterte Queries
- `UNIQUE (run_id, client_event_id)` — **Idempotency Constraint**

> **STRIKT: Kein UPDATE, kein DELETE für Tenant-User. RLS: INSERT-only.**
> Die "aktuelle Antwort" wird IMMER serverseitig berechnet als `payload.text` des jüngsten `answer_submitted` Events pro `(run_id, question_id)`.

#### Idempotency-Verhalten bei Retries

```
Client generiert: client_event_id = crypto.randomUUID()
Client sendet:    POST /events { client_event_id, event_type, payload }

Erster Request:   INSERT erfolgreich → 201 Created + neues Event
Retry (gleiche ID): INSERT schlägt mit UNIQUE-Fehler fehl
API gibt:         200 OK + bestehendes Event (kein Duplikat, kein Fehler)
```

### Derived View: `v_current_answers` (SQL VIEW, Convenience)

```sql
CREATE VIEW v_current_answers AS
SELECT DISTINCT ON (run_id, question_id)
  id AS event_id,
  run_id, question_id, tenant_id,
  payload->>'text' AS answer_text,
  created_at AS answered_at,
  created_by
FROM question_events
WHERE event_type = 'answer_submitted'
ORDER BY run_id, question_id, created_at DESC;
```

> **Diese View ist eine reine SQL VIEW (nicht MATERIALIZED).** Sie wird nie direkt beschrieben.
> Materialized Views/Tables sind NICHT Teil von MVP-1.
> Die View liefert `event_id` mit, damit abgeleitete Daten (z.B. im Export) auf das Source-Event zurueckverweisen koennen (`derived_from_event_id`).

---

### `evidence_items`
Dateien und Textnotizen, hochgeladen von Tenant-Usern. Append-only.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` FK -> `tenants` NOT NULL | |
| `run_id` | `uuid` FK -> `runs` NOT NULL | |
| `item_type` | `text` CHECK | `'file'` \| `'note'` |
| `label` | `text` CHECK | Evidence-Label (10 Werte, siehe Evidence Standard) |
| `file_path` | `text` | Supabase Storage Pfad (nullable, nur `item_type = 'file'`) |
| `file_name` | `text` | Original-Dateiname (nullable) |
| `file_size_bytes` | `integer` | (nullable) |
| `file_mime_type` | `text` | (nullable) |
| `sha256` | `text` | SHA256-Hash der Datei (nullable, empfohlen) |
| `note_text` | `text` | Freitext (nullable, nur `item_type = 'note'`) |
| `created_at` | `timestamptz` | |
| `created_by` | `uuid` FK -> `auth.users` | |

**Storage-Pfad-Konvention:** `evidence/{tenant_id}/{run_id}/{evidence_item_id}/{file_name}`
**Erlaubte MIME-Typen:** pdf, docx, xlsx, xls, png, jpg
**Max Dateigröße:** 200 MB (konfigurierbar)

> **Kein UPDATE, kein DELETE für Tenant-User.**

---

### `evidence_links`
Verknüpft `evidence_items` mit Fragen oder dem Run. Append-only.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `evidence_item_id` | `uuid` FK -> `evidence_items` NOT NULL | |
| `link_type` | `text` CHECK | `'question'` \| `'run'` |
| `link_id` | `uuid NOT NULL` | `question_id` oder `run_id` |
| `relation` | `text` CHECK | `'proof'` \| `'supports'` \| `'example'` \| `'supersedes'` |
| `question_event_id` | `uuid` FK -> `question_events` | Nullable |
| `created_at` | `timestamptz` | |

> Kein Update, kein Delete.

---

### `run_submissions`
Checkpoint-Events. Append-only.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `run_id` | `uuid` FK -> `runs` NOT NULL | |
| `tenant_id` | `uuid` FK -> `tenants` NOT NULL | |
| `submitted_by` | `uuid` FK -> `auth.users` NOT NULL | |
| `submitted_at` | `timestamptz` | `now()` |
| `snapshot_version` | `integer NOT NULL` | Auto-Inkrement pro Run (1, 2, 3...) |
| `note` | `text` | Optionaler Kommentar vom Tenant |

---

### `admin_events`
Append-only Audit Log fuer alle Admin-Aktionen. Kein Tenant-Zugriff.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `event_type` | `text` CHECK | `'tenant_created'` \| `'run_created'` \| `'run_locked'` \| `'catalog_imported'` \| `'export_generated'` \| `'invite_sent'` |
| `actor_id` | `uuid` FK -> `auth.users` NOT NULL | Admin der die Aktion ausgeloest hat |
| `tenant_id` | `uuid` FK -> `tenants` | Optional: betroffener Tenant |
| `run_id` | `uuid` FK -> `runs` | Optional: betroffener Run |
| `payload` | `jsonb` NOT NULL | Aktion-spezifische Metadaten |
| `created_at` | `timestamptz` | `now()` |

**Schreibzugriff:** NUR via SECURITY DEFINER Functions (`run_lock()`, `log_admin_event()`) und Next.js API Routes (service_role Key). Kein direkter Tenant-Zugriff.

---

## RLS Policy Summary

| Tabelle | Kategorie | Tenant SELECT | Tenant INSERT | Tenant UPDATE | Tenant DELETE |
|---------|-----------|:---:|:---:|:---:|:---:|
| `tenants` | Admin-verwaltet | Eigene Zeile | x | x | x |
| `profiles` | Admin-verwaltet | Eigene Zeile | Via Trigger | x | x |
| `question_catalog_snapshots` | Admin-verwaltet | Via run | x | x | x |
| `questions` | Admin-verwaltet | Via run's catalog | x | x | x |
| `runs` | **Status-managed** | Eigene `tenant_id` | x | **x** | x |
| `question_events` | **Append-only** | Eigene `tenant_id` | **INSERT-only** | **x** | **x** |
| `evidence_items` | **Append-only** | Eigene `tenant_id` | **INSERT-only** | **x** | **x** |
| `evidence_links` | **Append-only** | Eigene (via evidence) | **INSERT-only** | **x** | **x** |
| `run_submissions` | **Append-only** | Eigene `tenant_id` | Via `run_submit()` | **x** | **x** |
| `admin_events` | **Admin-only** | **x** | Via Functions | **x** | **x** |

**Legende:**
- **Append-only:** Tenant kann NUR INSERT ausfuehren. Kein UPDATE, kein DELETE — niemals.
- **Status-managed:** `runs.status` wird NUR serverseitig ueber definierte Endpoints geaendert (Submit-Checkpoint setzt `submitted`, Admin-Lock setzt `locked`). Tenant hat keinen direkten UPDATE-Zugriff.
- **Admin-verwaltet:** Tenant hat keinen Schreibzugriff. Nur Admin (oder System-Trigger) kann Zeilen erstellen/aendern.

**Rollen:**
- `strategaize_admin` hat vollen Zugriff (SELECT/INSERT/UPDATE/DELETE) auf alle Tabellen.
- `tenant_owner` und `tenant_member` haben identische Rechte in MVP-1 (INSERT-only auf Append-only-Tabellen, SELECT auf eigene Daten).
- Differenzierung tenant_owner vs. tenant_member wird in MVP-2 aktiviert (Einladungen, Rollenvergabe).
- Kein offener Self-Signup — `tenants` und `profiles` werden nur via Admin-Einladung + DB-Trigger erstellt.

---

## MVP-2 Erweiterungen

### Multi-User pro Tenant (MVP-2)
- `tenant_member` Rolle wird aktiv genutzt
- `tenant_owner` kann Nutzer einladen und Rollen vergeben
- Optional später: `scoped_access` (z.B. finance, sales)

### Audio Evidence & Conversation Logs (MVP-2)
- `evidence_items.item_type` erhält neuen Wert `'audio'`
- Whisper (self-hosted) transkribiert async; Transkript wird als Attribut am Event gespeichert
- Neue Tabelle `conversation_logs` für Transkripte und Rohmaterial

---

_Updated by /architecture skill on 2026-02-23_
