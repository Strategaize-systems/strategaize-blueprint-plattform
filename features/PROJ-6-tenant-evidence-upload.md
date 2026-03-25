# PROJ-6: Tenant — Evidence Upload (Datei + Text + Labels)

## Status: Planned
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

## Dependencies
- Requires: PROJ-4 (Tenant Run Workspace) — Tenant muss im Run Workspace sein
- Requires: PROJ-5 (Fragen beantworten) — Evidence wird an Fragen-Events verknuepft

## User Stories
- Als Tenant-User moechte ich eine Datei (PDF, DOCX, Excel, Bild) als Nachweis fuer eine Frage hochladen, damit ich meine Antwort mit Dokumentation untermauern kann.
- Als Tenant-User moechte ich eine Textnotiz als Nachweis hinzufuegen, damit ich ergaenzenden Kontext ohne Datei liefern kann.
- Als Tenant-User moechte ich ein Label (z.B. "policy", "contract", "financial") zu jedem Evidence-Item auswaehlen, damit der Nachweis korrekt kategorisiert wird.
- Als Tenant-User moechte ich eine Relation (proof, supports, example) fuer die Verknuepfung angeben, damit klar ist, wie das Evidence die Frage belegt.
- Als Tenant-User moechte ich alle Evidence-Items einer Frage sehen, damit ich ueberpruefen kann, was bereits eingereicht wurde.
- Als Tenant-User moechte ich wissen, dass hochgeladene Dateien nicht geloescht werden koennen.

## Append-Only Evidence Model

Evidence ist **append-only**. Es gibt kein Ueberschreiben und kein Loeschen von Evidence-Items.

- Jeder Upload oder jede Textnotiz erzeugt einen neuen `evidence_items`-Eintrag per `INSERT`.
- Wenn ein Tenant ein bestehendes Evidence ersetzen moechte, wird ein **neues** Evidence-Item mit `relation: 'supersedes'` erstellt, das auf die `evidence_id` des ersetzten Items verweist. Das alte Evidence-Item bleibt vollstaendig erhalten.
- Es gibt kein `UPDATE` oder `DELETE` auf `evidence_items` — niemals.

## Acceptance Criteria
- [ ] Jede Fragen-Detailansicht hat einen "Evidence"-Bereich
- [ ] Tenant kann eine Datei hochladen: erlaubte Formate PDF, DOCX, XLSX/XLS, PNG, JPG; max 200 MB
- [ ] Upload-Formular enthaelt ein Pflichtfeld "Label" (Dropdown mit 10 Evidence Labels: policy, process, template, contract, financial, legal, system, org, kpi, other)
- [ ] Datei wird in Supabase Storage (self-hosted) gespeichert: `evidence/{tenantId}/{runId}/{evidenceId}/{fileName}`
- [ ] Ein `evidence_items`-Eintrag wird per `INSERT` erstellt mit allen Metadaten inkl. `label` und optionalem `sha256`
- [ ] Ein `evidence_attached` Event wird in `question_events` per `INSERT` angehaengt
- [ ] Ein `evidence_links`-Eintrag wird per `INSERT` erstellt mit `link_type`, `link_id` und `relation`
- [ ] Relation-Feld im Upload-Formular: Dropdown mit proof, supports, example, supersedes
- [ ] Bei `supersedes`: UI fragt, welches vorherige Evidence-Item ersetzt wird (Dropdown der existierenden Items). Ein neues Evidence-Item wird erstellt, das via `evidence_links` auf das ersetzte Item verweist. Das alte Item bleibt unveraendert.
- [ ] Textnotizen werden ueber "Textnotiz hinzufuegen" erstellt mit Label-Auswahl (INSERT-only)
- [ ] Evidence-Liste pro Frage zeigt: Dateiname, Label-Badge, Relation-Badge, Groesse, Upload-Datum (Dateien) oder Notiz-Vorschau (Text)
- [ ] Klick auf Datei-Evidence oeffnet Download (Signed URL, 15 min gueltig)
- [ ] Upload und Notiz-Formulare sind deaktiviert wenn Run `locked` ist
- [ ] Abgelehnte Dateitypen: Fehler "Nur PDF, DOCX, Excel und Bilddateien werden akzeptiert."
- [ ] Dateien >200 MB: Fehler "Datei ueberschreitet das 200 MB Limit."
- [ ] Run-Level Evidence (ohne `question_id`) wird in einem separaten "Run-Evidence" Bereich angezeigt

## Edge Cases
- Upload schlaegt fehl (Netzwerkabbruch)? -> Partial Upload wird nicht committed; Storage Upload ist atomar. Fehler-Toast. Kein `evidence_items`-Eintrag.
- Duplikat-Dateiname fuer gleiche Frage? -> Erlaubt; `evidence_item_id` macht jeden Upload eindeutig.
- Signed Download URL abgelaufen? -> Erneuter Klick generiert frische Signed URL.
- Evidence auf Run-Level (keine question_id)? -> `evidence_items.question_id` ist NULL; Link mit `link_type = 'run'`.
- Leere Textnotiz? -> Client-Validierung: "Notiz darf nicht leer sein."
- Storage Bucket nicht verfuegbar? -> API gibt 503 "Datei-Upload voruebergehend nicht verfuegbar."
- Tenant waehlt `supersedes` als Relation? -> UI fragt, welches vorherige Evidence ersetzt wird (Dropdown der existierenden Evidence-Items). Ein neues Evidence-Item mit neuer `evidence_id` wird per INSERT erstellt. Das alte Evidence-Item wird nicht veraendert.

## Technical Requirements
- Supabase Storage Bucket: `evidence` (privat, kein oeffentlicher Zugang) — **self-hosted auf Hetzner**
- Signed URLs nur serverseitig generiert (Service Role)
- MIME-Type-Validierung client- und serverseitig
- SHA256-Hash serverseitig berechnet nach Upload (empfohlen laut Evidence Standard)
- Upload via multipart/form-data; JSON-Notizen via application/json
- Kein direkter Browser-zu-Storage Upload in MVP-1 (alles ueber API-Route)
- **Append-only**: Ausschliesslich `INSERT` auf `evidence_items` und `evidence_links`. Kein `UPDATE`, kein `DELETE`.
- **Max. Dateigroesse: 200 MB**
- **Hosting**: Supabase self-hosted auf Hetzner via Coolify + Docker Compose
- **Kein Vercel**: API-Routes laufen im self-hosted Next.js Container

**Evidence Labels (aus Evidence Standard v1.0):**

| Label | Beschreibung |
|-------|-------------|
| `policy` | Richtlinien/Policies |
| `process` | Prozessbeschreibung/SOP |
| `template` | Vorlage/Formular |
| `contract` | Vertraege/AGB/SLA |
| `financial` | Finanzunterlagen |
| `legal` | Recht/Compliance |
| `system` | System-Screens/Exports |
| `org` | Org/Rollen |
| `kpi` | KPI/Reports |
| `other` | Sonstiges |

**Evidence Relations (aus Evidence Standard v1.0):**

| Relation | Beschreibung |
|----------|-------------|
| `proof` | Harter Nachweis |
| `supports` | Unterstuetzt, aber nicht ausreichend allein |
| `example` | Beispiel/Illustration |
| `supersedes` | Ersetzt aelteres Evidence (neues Item, altes bleibt erhalten) |

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results (Deep Sweep v2)

**Tested:** 2026-02-23
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI) -- Deep Sweep v2
**Build Status:** PASS (Next.js production build, 0 TypeScript errors, all routes compiled)
**Scope:** Full re-audit of PROJ-6 with cross-tenant isolation, locked-run, append-only, upload hardening, and regression

---

### Test Area 1: Cross-Tenant Isolation (RLS)

#### CTA-1: GET /api/tenant/runs/[runId]/evidence
- [x] PASS: Uses `requireTenant()` for auth. RLS on `runs` table ensures tenant can only SELECT own runs (`tenant_id = auth.user_tenant_id()`). Evidence items also scoped via `evidence_items.tenant_id`. A tenant from Tenant-A cannot see evidence from Tenant-B's runs.
- File: `src/app/api/tenant/runs/[runId]/evidence/route.ts` line 288, `sql/rls.sql` lines 128-134, 187-193

#### CTA-2: GET /api/tenant/runs/[runId]/evidence/[evidenceId]/download
- [x] PASS: Verifies run access via RLS, then `.eq("run_id", runId)` on evidence_items. RLS `tenant_select_own_evidence_items` ensures tenant-scoped. Cross-tenant download impossible.
- File: `src/app/api/tenant/runs/[runId]/evidence/[evidenceId]/download/route.ts` lines 17-37

#### CTA-3: POST /api/tenant/runs/[runId]/evidence/[evidenceId]/link
- [x] PASS: Run ownership via RLS, evidence item belongs to run via `.eq("run_id", runId)`. RLS `tenant_insert_evidence_links` checks `evidence_item_id IN (SELECT id FROM evidence_items WHERE tenant_id = auth.user_tenant_id())`.
- File: `src/app/api/tenant/runs/[runId]/evidence/[evidenceId]/link/route.ts` lines 17-41, `sql/rls.sql` lines 231-240

#### CTA-4: GET /api/tenant/runs/[runId] (run detail)
- [x] PASS: RLS `tenant_select_own_runs` ensures tenant sees only own runs. Questions scoped via catalog_snapshot_id from the run (RLS on questions also scoped). Evidence count uses DB-level `.in()` filter.
- File: `src/app/api/tenant/runs/[runId]/route.ts` lines 16-23, `sql/rls.sql` lines 128-134

---

### Test Area 2: Locked-Run Enforcement

#### LRE-1: POST /api/tenant/runs/[runId]/questions/[questionId]/events
- [x] PASS (API): `run.status === "locked"` check returns 403 at line 39-41
- [x] PASS (RLS): `tenant_insert_question_events` policy: `AND run_id IN (SELECT id FROM runs WHERE ... AND status != 'locked')` at `sql/rls.sql` lines 160-171
- Double enforcement confirmed.

#### LRE-2: POST /api/tenant/runs/[runId]/evidence (file upload + note)
- [x] PASS (API): `run.status === "locked"` check returns 403 at line 34-36
- [x] PASS (RLS): `tenant_insert_evidence_items` policy: `AND run_id IN (SELECT id FROM runs WHERE ... AND status != 'locked')` at `sql/rls.sql` lines 195-206
- Double enforcement confirmed.

#### LRE-3: POST /api/tenant/runs/[runId]/evidence/[evidenceId]/link
- [x] PASS (API): `run.status === "locked"` check returns 403 at line 27-29
- [ ] **ISSUE (NEW BUG-20, HIGH, SECURITY):** RLS policy `tenant_insert_evidence_links` at `sql/rls.sql` lines 231-240 does NOT check whether the run is locked. It only checks that `evidence_item_id` belongs to the tenant. If an attacker bypasses the API layer (e.g., direct PostgREST access or crafted Supabase client call with anon key), they could INSERT evidence_links on locked runs. Unlike `question_events` and `evidence_items` which both have `AND status != 'locked'` in their INSERT policies, `evidence_links` is missing this defense-in-depth check.
  - **Mitigation:** The API check catches this for normal usage, and evidence_links is less critical since it does not contain primary data. But it violates the defense-in-depth principle.
  - **Affected file:** `sql/rls.sql` lines 231-240
  - **Fix:** Add `AND evidence_item_id IN (SELECT id FROM evidence_items WHERE tenant_id = auth.user_tenant_id() AND run_id IN (SELECT id FROM runs WHERE status != 'locked'))` or a similar run-status check.

#### LRE-4: POST /api/tenant/runs/[runId]/submit
- [x] PASS: Uses `run_submit()` SECURITY DEFINER function which checks `v_run.status = 'locked'` and raises FORBIDDEN exception. (`sql/functions.sql` lines 123-127)

---

### Test Area 3: Append-Only Enforcement

#### AOE-1: question_events -- No UPDATE/DELETE endpoints
- [x] PASS: Only POST (insert) and GET (list) handlers exist in `src/app/api/tenant/runs/[runId]/questions/[questionId]/events/route.ts`
- [x] PASS: RLS has no UPDATE or DELETE policies for tenant roles (`sql/rls.sql` line 173: "KEIN UPDATE-Policy, KEIN DELETE-Policy")
- [x] PASS: GRANTS only include `SELECT, INSERT` (`sql/rls.sql` line 284)

#### AOE-2: evidence_items -- No UPDATE/DELETE endpoints for tenants
- [x] PASS: No UPDATE or DELETE handler in evidence route.ts for tenant scope
- [x] PASS: RLS has no UPDATE or DELETE policies for tenant roles
- [ ] **ISSUE (BUG-6, MEDIUM):** The `adminClient.from("evidence_items").update({ file_path })` at evidence/route.ts line 227-230 uses service_role to update file_path after upload. This technically violates append-only for `evidence_items`. Tenant cannot trigger this update directly (service_role only), but the principle is breached server-side.

#### AOE-3: evidence_links -- No UPDATE/DELETE endpoints
- [x] PASS: Only POST (create link) handler exists in link/route.ts
- [x] PASS: RLS has no UPDATE or DELETE policies for tenant roles

#### AOE-4: run_submissions -- No direct INSERT by tenant
- [x] PASS: No direct INSERT endpoint -- only via `run_submit()` SECURITY DEFINER
- [x] PASS: RLS has no INSERT policy for tenants (line 263: "KEIN direktes INSERT fuer Tenant")

#### AOE-5: Grep for .update() and .delete() in API routes
- [x] PASS: Only two `update`/`delete` calls found in all API routes:
  1. `evidence/route.ts` line 229: `adminClient.update({ file_path })` -- service_role only (BUG-6)
  2. `catalog/snapshots/route.ts` line 120: `adminClient.delete()` -- admin catalog rollback, acceptable
  No tenant-accessible update or delete operations found on append-only tables.

---

### Test Area 4: Upload Hardening (PROJ-6 Focus)

#### UH-1: MIME whitelist enforcement
- [x] PASS: Server checks `ALLOWED_MIME_TYPES` at evidence/route.ts line 135: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.ms-excel`, `image/png`, `image/jpeg`
- [x] PASS: Client-side `accept=".pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg"` at run-workspace-client.tsx line 613
- [ ] **ISSUE (BUG-8, MEDIUM, SECURITY):** MIME validation relies on `file.type` from the client multipart form data. No server-side magic-bytes validation. An attacker can spoof Content-Type to bypass the check and upload any file type (e.g., executables, HTML with XSS).

#### UH-2: File size limit (200 MB)
- [x] PASS: `MAX_FILE_SIZE = 200 * 1024 * 1024` validated at line 144: `file.size > MAX_FILE_SIZE` returns 400
- [x] PASS: Defined in `src/lib/validations.ts` line 134

#### UH-3: File name sanitization (path traversal)
- [x] PASS (FIXED from previous BUG-7): File name IS now sanitized at evidence/route.ts lines 164-168:
  ```typescript
  const safeName = file.name
    .replace(/[\/\\:*?"<>|]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 255);
  ```
  This strips forward slashes, backslashes, colons, wildcards, quotes, angle brackets, pipes, and collapses double dots. File names are also placed within a UUID subdirectory.
- **Previous BUG-7 status: FIXED**

#### UH-4: SHA256 hash computed server-side
- [x] PASS: `createHash("sha256").update(buffer).digest("hex")` at evidence/route.ts line 172

#### UH-5: Storage path convention
- [x] PASS: Path is `{tenantId}/{runId}/{evidenceId}/{fileName}` at line 197: `const storagePath = \`${profile!.tenant_id}/${runId}/${item.id}/${safeName}\``
- [x] PASS: Full stored path is `evidence/${storagePath}` at line 229

#### UH-6: Duplicate evidence_link bug (previously BUG-1)
- [x] PASS (FIXED): The file upload endpoint now reads `relation` from form data (line 120: `const relation = formData.get("relation") as string | null`) and uses it in the evidence_link INSERT (lines 233-241: `effectiveRelation`). The UI sends the relation via `formData.append("relation", uploadRelation)` at run-workspace-client.tsx line 203. The UI does NOT make a second separate POST to `/evidence/{id}/link` after file upload. Only ONE evidence_link is created per file upload.
- **Previous BUG-1 status: FIXED**

#### UH-7: Note creation evidence_link relation
- [ ] **ISSUE (NEW BUG-21, MEDIUM):** The JSON note creation path (evidence/route.ts lines 84-91) hardcodes `relation: "supports"` when auto-creating the evidence_link. The note form in the UI does NOT have a relation dropdown (unlike the file upload form which has both label and relation dropdowns). This means all notes are always linked with relation "supports", regardless of what the tenant might intend. The spec at AC-8 requires a relation field for all evidence. The note creation form at run-workspace-client.tsx lines 659-687 only has a label Select, no relation Select.
  - **Affected files:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` line 90, `src/app/runs/[id]/run-workspace-client.tsx` lines 659-687
  - **Severity:** MEDIUM
  - **Priority:** Fix before deployment

#### UH-8: evidence_attached event logged
- [x] PASS (file upload): When `questionId && effectiveRelation`, event is logged at lines 244-252
- [x] PASS (note creation): When `question_id` is provided, event is logged at lines 94-102
- [ ] **ISSUE (NEW BUG-22, LOW):** For file uploads, the `evidence_attached` event is only created when BOTH `questionId` AND a valid `effectiveRelation` are present (line 236: `if (questionId && effectiveRelation)`). If a user uploads a file with a question_id but WITHOUT selecting a relation (or with an invalid relation), no evidence_link AND no evidence_attached event is created, even though the file IS uploaded and an evidence_item record IS created. The file exists but is silently unlinked from the question. The note path does not have this problem (it always uses "supports").

---

### Test Area 5: Acceptance Criteria Status (Systematic Re-test)

#### AC-1: Evidence-Bereich in Fragen-Detailansicht
- [x] PASS: Evidence section renders in question detail when `!isAdmin && activeQ` is true (run-workspace-client.tsx line 537)
- [x] PASS: Title "Evidence / Nachweise" displayed (line 540)
- [x] PASS: Hidden for admin via `{!isAdmin && (...)}` guard

#### AC-2: File upload with allowed formats + 200 MB limit
- [x] PASS: Server-side MIME whitelist + client-side `accept` attribute + file size check all confirmed

#### AC-3: Upload form has required Label dropdown (10 labels)
- [x] PASS: All 10 labels in EVIDENCE_LABELS constant (run-workspace-client.tsx lines 29-40)
- [x] PASS: Server-side Zod: `z.enum(EVIDENCE_LABELS)` (validations.ts line 142)
- [x] PASS: Button disabled when no label: `!uploadLabel` (line 649)

#### AC-4: Storage path convention
- [x] PASS: `evidence/{tenantId}/{runId}/{evidenceId}/{safeName}` confirmed

#### AC-5: evidence_items INSERT with metadata + SHA256
- [x] PASS: All fields present in INSERT (lines 177-186)

#### AC-6: evidence_attached event in question_events
- [x] PASS (with caveat from BUG-22 for edge case)

#### AC-7: evidence_links INSERT with link_type, link_id, relation
- [x] PASS: File upload now correctly uses `effectiveRelation` from form data (BUG-1 FIXED)
- [ ] ISSUE: Note creation hardcodes "supports" (BUG-21)

#### AC-8: Relation dropdown with proof, supports, example, supersedes
- [x] PASS (file upload): All 4 relations rendered in Select (lines 42-47)
- [ ] FAIL (note creation): No relation dropdown for notes (BUG-21)

#### AC-9: Supersedes UI asks which previous evidence to replace
- [ ] **FAIL (BUG-2, HIGH):** Still not implemented. When user selects "supersedes", no dropdown to select the replaced item appears. The `evidence_links` table has `link_id` which could reference the superseded evidence_item_id via `link_type='question'`, but there is no mechanism to link to a previous evidence_item. This is an unimplemented acceptance criterion.

#### AC-10: Text notes via "Textnotiz hinzufuegen" with label
- [x] PASS: Text note form with textarea and label Select dropdown present

#### AC-11: Evidence list shows file/note details
- [x] PASS: Label badge, relation badge, file name, size, date, note preview all displayed

#### AC-12: Click on file evidence opens download (signed URL, 15 min)
- [x] PASS: Download button, signed URL with 900s expiry, window.open to new tab

#### AC-13: Upload/note forms disabled when run is locked
- [x] PASS (UI): `{!isLocked && (<>...</>)}` hides forms (line 601)
- [x] PASS (API): `run.status === "locked"` returns 403 (evidence/route.ts line 34-36, link/route.ts line 27-29)

#### AC-14: Rejected file types error message
- [x] PASS: "Nur PDF, DOCX, Excel und Bilddateien werden akzeptiert." (line 138)

#### AC-15: Files >200 MB error message
- [x] PASS: Error message returned at line 147 (uses umlaut character in actual response)

#### AC-16: Run-Level Evidence in separate area
- [ ] **FAIL (BUG-3, MEDIUM):** No UI for run-level evidence. API supports it but UI only shows evidence per question.

---

### Test Area 6: Edge Cases Status

#### EC-1: Upload fails (network interruption)
- [x] Partially handled: API returns error when storage upload fails
- [ ] ISSUE (BUG-4, MEDIUM): Orphaned evidence_item with file_path=NULL remains after storage failure

#### EC-2: Duplicate filename for same question
- [x] PASS: Unique evidence_item_id subdirectory prevents conflicts

#### EC-3: Signed download URL expired
- [x] PASS: Fresh signed URL generated on each download click

#### EC-4: Evidence on run-level (no question_id)
- [x] PASS (API): Supported for both notes and files
- [ ] FAIL (UI): No run-level evidence UI (BUG-3 dup)

#### EC-5: Empty text note
- [x] PASS: Client disabled when empty, server Zod enforces min(1)

#### EC-6: Storage bucket not available
- [ ] FAIL (BUG-5, LOW): Returns 500 with raw error instead of 503 with user-friendly message

#### EC-7: Tenant selects supersedes
- [ ] FAIL (BUG-2 dup): No UI for selecting replaced evidence

---

### Test Area 7: Security Audit Results (Red Team)

#### SEC-1: Authentication enforcement
- [x] PASS: All 4 evidence endpoints use `requireTenant()` -> `getAuthUserWithProfile()` -> `supabase.auth.getUser()`
- [x] PASS: 401 for unauthenticated, 403 for wrong role

#### SEC-2: Cross-tenant isolation (defense in depth)
- [x] PASS: API-level run ownership checks + RLS tenant_id matching on all tables
- [x] PASS: Evidence item verified to belong to run via `.eq("run_id", runId)` in download and link endpoints
- [x] PASS: `sql/rls.sql` anon role has ALL privileges REVOKED (line 301)

#### SEC-3: Append-only enforcement
- [x] PASS: No UPDATE or DELETE RLS policies for tenants on any append-only table
- [x] PASS: GRANTS only include SELECT, INSERT for `authenticated` role (line 284)
- [ ] ISSUE (BUG-6, MEDIUM): Service_role UPDATE on evidence_items file_path field -- technically violates principle

#### SEC-4: Input validation / Injection
- [x] PASS: All inputs Zod-validated server-side
- [x] PASS: Supabase parameterized queries prevent SQL injection
- [x] PASS (FIXED): File names now sanitized (BUG-7 resolved)

#### SEC-5: MIME type validation
- [ ] ISSUE (BUG-8, MEDIUM, SECURITY): No magic-bytes validation; MIME spoofable

#### SEC-6: File size validation
- [x] PASS: Server-side `file.size > MAX_FILE_SIZE` check

#### SEC-7: Storage access control
- [x] PASS: Private bucket, server-side signed URLs, 15-min expiry

#### SEC-8: Rate limiting
- [ ] ISSUE (BUG-9, MEDIUM): No rate limiting on upload endpoint

#### SEC-9: Security headers
- [x] PASS: All 5 required headers present in next.config.ts

#### SEC-10: Secrets in response
- [ ] ISSUE (BUG-10, LOW): Internal storage path exposed in upload response

#### SEC-11: RLS defense-in-depth for evidence_links
- [ ] ISSUE (BUG-20, HIGH, SECURITY): evidence_links INSERT RLS policy missing locked-run check (see Test Area 2, LRE-3)

---

### Test Area 8: Regression Check (PROJ-1 through PROJ-7)

#### REG-PROJ1: Auth invite-only flow
- [x] PASS: `requireAdmin()` and `requireTenant()` function correctly with role checks
- [x] PASS: Middleware redirects unauthenticated users to /login (src/middleware.ts lines 40-44)
- [x] PASS: No self-signup route exists; public paths limited to `/login`, `/auth/callback`, `/auth/set-password`
- [x] PASS: `handle_new_user()` trigger validates tenant_id and role (sql/functions.sql lines 11-63)
- [x] PASS: Tenant-owner uniqueness enforced in trigger (line 48-55)

#### REG-PROJ2: Admin run & catalog management
- [x] PASS: Catalog import with SHA256 hash, Zod validation of all 73 question fields
- [x] PASS: Run creation with tenant_id, catalog_snapshot_id, title, Zod-validated
- [x] PASS: Admin run list and detail endpoints functional with `.in()` filter for evidence counting

#### REG-PROJ3: Tenant login & dashboard
- [x] PASS: Dashboard page exists at /dashboard (dynamic route)
- [x] PASS: Middleware redirects logged-in users from /login to /dashboard
- [x] PASS: Both admin and tenant dashboard views use role-based endpoint selection

#### REG-PROJ4: Tenant run workspace
- [x] PASS: Questions grouped by block (A-I) in Tabs component (run-workspace-client.tsx lines 438-490)
- [x] PASS: Progress bar shows answered/total (lines 413-421)
- [x] PASS: Question selection loads answer text and evidence list

#### REG-PROJ5: Tenant question event logging
- [x] PASS: `answer_submitted` event creation with idempotency check (events/route.ts lines 56-66)
- [x] PASS: Unique constraint `(run_id, client_event_id)` handles retries with 200 response (lines 63-65, 84-95)
- [x] PASS: Locked run check returns 403 (line 39-41)

#### REG-PROJ7: Tenant run submission
- [x] PASS: `run_submit()` SECURITY DEFINER validates ownership, status, events exist
- [x] PASS: Status transitions enforced: collecting -> submitted (idempotent), locked -> raises FORBIDDEN
- [x] PASS: UI button disabled when `answered === 0` (line 404)

#### REG-EVIDENCE-COUNT: Evidence counting
- [x] PASS: Admin run detail loads evidence_items by run_id, uses `.in("evidence_item_id", runEvidenceIds)` for links (admin/runs/[runId]/route.ts lines 64-82)
- [x] PASS: Tenant run detail uses identical pattern (tenant/runs/[runId]/route.ts lines 46-63)
- [x] PASS: Empty evidence arrays guarded with `if (runEvidenceIds.length > 0)` check

---

### Cross-Browser Analysis (Code Review)
- [x] PASS: Standard HTML `<input type="file">` with `accept` -- Chrome, Firefox, Safari compatible
- [x] PASS: `FormData` API for multipart upload -- all modern browsers
- [x] PASS: `crypto.randomUUID()` -- Chrome 92+, Firefox 95+, Safari 15.4+
- [x] PASS: `window.open()` for download -- universal
- [x] PASS: No browser-specific APIs used

### Responsive Analysis (Code Review)
- [x] PASS: `grid-cols-1 lg:grid-cols-3` layout -- single column on mobile, 3 on desktop
- [x] PASS: Upload form `grid-cols-1 sm:grid-cols-2` -- stacks on mobile
- [x] PASS: Evidence items use `min-w-0 flex-1` for text truncation
- [x] PASS: File names use `truncate` class (line 568)
- [ ] ISSUE (BUG-11, LOW): Evidence list outer container has no explicit overflow-hidden; very long unsanitized file names could still overflow at 375px width

---

### Bugs Found (Updated with new findings)

#### BUG-1: Duplicate evidence_link created on file upload
- **Status: FIXED**
- File upload now reads `relation` from form data and creates a single evidence_link with the correct user-selected relation (evidence/route.ts lines 120, 233-241). UI sends relation in FormData (run-workspace-client.tsx line 203) and does NOT make a second link request.

#### BUG-2: Supersedes relation has no UI for selecting replaced evidence
- **Severity:** HIGH
- **Status: OPEN**
- **Steps to Reproduce:**
  1. Select "Ersetzt (supersedes)" from the relation dropdown
  2. Upload a file
  3. Expected: A dropdown appears to select which previous evidence item is being replaced
  4. Actual: No dropdown appears. The link is created with relation "supersedes" but points to the question, not the replaced evidence item.
- **Root Cause:** UI does not implement the supersedes selection flow. The evidence_links table uses link_type/link_id to point to a question, not to a previous evidence item.
- **Affected files:** `src/app/runs/[id]/run-workspace-client.tsx` (missing UI), `src/app/api/tenant/runs/[runId]/evidence/route.ts` (no mechanism to specify superseded item)
- **Priority:** Fix before deployment

#### BUG-3: No UI for run-level evidence
- **Severity:** MEDIUM
- **Status: OPEN**
- **Steps to Reproduce:**
  1. Navigate to the run workspace
  2. Look for a "Run-Evidence" area for evidence not linked to specific questions
  3. Expected: A separate section for run-level evidence
  4. Actual: No such section exists
- **Root Cause:** `RunWorkspaceClient` only shows evidence when a question is selected
- **Affected file:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Priority:** Fix before deployment

#### BUG-4: Orphaned evidence_item on storage upload failure
- **Severity:** MEDIUM
- **Status: OPEN**
- **Steps to Reproduce:**
  1. File upload where Supabase Storage fails (e.g., storage service down)
  2. Expected: No orphaned evidence_item
  3. Actual: evidence_item with file_path=NULL remains in database
- **Root Cause:** INSERT happens before storage upload; no cleanup on failure
- **Affected file:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` lines 175-222
- **Priority:** Fix in next sprint

#### BUG-5: Storage unavailable error does not match spec
- **Severity:** LOW
- **Status: OPEN**
- **Steps to Reproduce:**
  1. Storage service offline, attempt upload
  2. Expected: 503 "Datei-Upload voruebergehend nicht verfuegbar."
  3. Actual: 500 "Datei-Upload fehlgeschlagen: [raw supabase error]"
- **Affected file:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` lines 215-222
- **Priority:** Fix in next sprint

#### BUG-6: UPDATE on append-only evidence_items table
- **Severity:** MEDIUM
- **Status: OPEN**
- **Steps to Reproduce:**
  1. Upload a file
  2. Observe adminClient.update({ file_path }) on evidence_items (line 227-230)
- **Root Cause:** file_path requires evidence_item_id which is only available after INSERT
- **Affected file:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` lines 227-230
- **Priority:** Fix in next sprint (generate UUID client-side before INSERT)

#### BUG-7: File names not sanitized
- **Status: FIXED**
- File name sanitization now implemented at evidence/route.ts lines 164-168. Strips path traversal chars, collapses double dots, limits to 255 chars.

#### BUG-8: MIME type validation is client-trust only
- **Severity:** MEDIUM
- **Status: OPEN**
- **Security concern:** YES -- attacker can upload executables/HTML with spoofed MIME type
- **Affected file:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` line 135
- **Priority:** Fix before deployment

#### BUG-9: No rate limiting on upload endpoint
- **Severity:** MEDIUM
- **Status: OPEN**
- **Security concern:** YES -- resource exhaustion vector
- **Affected file:** `src/app/api/tenant/runs/[runId]/evidence/route.ts`
- **Priority:** Fix in next sprint

#### BUG-10: Internal storage path exposed in API response
- **Severity:** LOW
- **Status: OPEN**
- **Affected file:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` line 259
- **Priority:** Nice to have

#### BUG-11: Evidence list potential horizontal overflow on mobile
- **Severity:** LOW
- **Status: OPEN**
- **Affected file:** `src/app/runs/[id]/run-workspace-client.tsx` line 554
- **Priority:** Nice to have

#### BUG-20 (NEW): evidence_links RLS INSERT policy missing locked-run check
- **Severity:** HIGH
- **Security concern:** YES -- bypasses defense-in-depth for locked runs
- **Status: OPEN**
- **Steps to Reproduce:**
  1. Using direct PostgREST or crafted Supabase client, INSERT into evidence_links for an evidence_item belonging to a locked run
  2. Expected: INSERT rejected by RLS
  3. Actual: INSERT succeeds because the RLS policy only checks tenant ownership, not run status
- **Root Cause:** `tenant_insert_evidence_links` policy at sql/rls.sql lines 231-240 lacks `AND run_id IN (SELECT id FROM runs WHERE status != 'locked')` subquery (unlike evidence_items and question_events policies)
- **Affected file:** `sql/rls.sql` lines 231-240
- **Priority:** Fix before deployment

#### BUG-21 (NEW): Note creation hardcodes relation "supports" with no UI control
- **Severity:** MEDIUM
- **Status: OPEN**
- **Steps to Reproduce:**
  1. Add a text note for a question
  2. Expected: User can choose a relation (proof, supports, example, supersedes)
  3. Actual: Evidence_link is always created with relation "supports" (hardcoded at line 90)
  4. The note form only has a label dropdown, not a relation dropdown
- **Root Cause:** Note creation path hardcodes `relation: "supports"` and the UI form is missing a relation Select
- **Affected files:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` line 90, `src/app/runs/[id]/run-workspace-client.tsx` lines 659-687
- **Priority:** Fix before deployment

#### BUG-22 (NEW): File upload silently unlinked when no relation selected
- **Severity:** LOW
- **Status: OPEN**
- **Steps to Reproduce:**
  1. Upload a file with a question_id but clear/deselect the relation dropdown (or submit with invalid relation)
  2. Expected: Default relation applied, or error returned
  3. Actual: evidence_item is created and stored, but NO evidence_link is created and NO evidence_attached event is logged (because `effectiveRelation` is null and the `if (questionId && effectiveRelation)` guard at line 236 fails)
- **Root Cause:** When `relation` from form data is null or invalid, `effectiveRelation` is null, so the linking and event logging are skipped entirely
- **Affected file:** `src/app/api/tenant/runs/[runId]/evidence/route.ts` lines 233-253
- **Note:** In practice the UI always sends `uploadRelation` (default "supports"), so this is primarily a defense concern for API-level access
- **Priority:** Nice to have (UI always sends a default)

---

### Summary Table

| Test Area | Result | Issues |
|-----------|--------|--------|
| Cross-Tenant Isolation (RLS) | PASS | 0 issues |
| Locked-Run Enforcement | FAIL | 1 issue (BUG-20: evidence_links RLS gap) |
| Append-Only Enforcement | PASS (with note) | 1 issue (BUG-6: service_role UPDATE) |
| Upload Hardening | MOSTLY PASS | 2 fixed (BUG-1, BUG-7), 2 open (BUG-8, BUG-21) |
| Acceptance Criteria | 13/16 PASS | 3 failed (AC-9, AC-16, and partial AC-7/AC-8 for notes) |
| Edge Cases | 4/7 PASS | 3 open (EC-1, EC-6, EC-7) |
| Security Audit | 7/11 PASS | 4 open (BUG-8, BUG-9, BUG-10, BUG-20) |
| Regression PROJ-1-7 | ALL PASS | 0 regressions found |
| Cross-Browser | ALL PASS | 0 issues |
| Responsive | MOSTLY PASS | 1 minor (BUG-11) |

### Overall Status
- **Acceptance Criteria:** 13/16 passed (3 failed: AC-9 supersedes UI, AC-16 run-level evidence, partial AC-7/AC-8 for notes)
- **Bugs Total:** 14 tracked (2 FIXED, 12 OPEN)
- **Breakdown:** 0 critical, 2 high (BUG-2, BUG-20), 5 medium (BUG-3, BUG-4, BUG-6, BUG-8, BUG-21), 5 low (BUG-5, BUG-9, BUG-10, BUG-11, BUG-22)
- **Security Issues:** 4 (BUG-8 MIME spoofing, BUG-9 no rate limit, BUG-10 path leak, BUG-20 RLS gap)
- **Production Ready:** NO
- **Blockers for deployment:** BUG-2 (supersedes UI), BUG-20 (evidence_links RLS), BUG-8 (MIME spoofing), BUG-21 (note relation)
- **Recommended priority:** BUG-20 (security) > BUG-2 (feature gap) > BUG-8 (security) > BUG-21 (feature gap) > BUG-3 (feature gap) > rest

## Deployment
_To be added by /deploy_
