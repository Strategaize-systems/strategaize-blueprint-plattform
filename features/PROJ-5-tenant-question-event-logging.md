# PROJ-5: Tenant — Fragen beantworten (Event-Logging)

## Status: Planned
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

## Dependencies
- Requires: PROJ-4 (Tenant Run Workspace) — Tenant muss im Run Workspace sein
- Requires: PROJ-2 (Admin Run & Fragenkatalog) — Fragen muessen existieren

## User Stories
- Als Tenant-User moechte ich eine Antwort auf eine Frage aus dem Exit Ready Blueprint eingeben und speichern, damit meine Antwort im System erfasst wird.
- Als Tenant-User moechte ich eine neue Antwort auf eine bereits beantwortete Frage abgeben, damit meine Korrektur oder Ergaenzung als neues Event im Log festgehalten wird — ohne dass meine vorherige Antwort geloescht oder ueberschrieben wird.
- Als Tenant-User moechte ich eine Freitext-Notiz zu einer Frage hinzufuegen (getrennt von der Hauptantwort), damit ich zusaetzlichen Kontext liefern kann.
- Als Tenant-User moechte ich wissen, dass keine meiner bisherigen Antworten jemals geloescht oder ueberschrieben wird, damit ich dem System als lueckenlosem Audit-Trail vertrauen kann.
- Als Tenant-User moechte ich die Event-Historie einer Frage sehen, damit ich nachvollziehen kann, wie sich meine Antworten entwickelt haben.

## Source of Truth

**`question_events` ist die einzige Quelle der Wahrheit (Single Source of Truth).**

- Jede Tenant-Aktion (Antwort, Notiz) erzeugt einen neuen Event-Eintrag per `INSERT`. Es gibt kein `UPDATE` und kein `DELETE` auf dieser Tabelle — niemals.
- Es gibt kein "Antwort aktualisieren". Wenn ein Tenant eine bereits beantwortete Frage erneut beantwortet, entsteht ein **neues** `answer_submitted` Event. Das vorherige Event bleibt unveraendert bestehen.
- Die **"Aktuelle Antwort"** einer Frage ist kein gespeicherter Wert, sondern wird **serverseitig abgeleitet**: sie entspricht dem `payload.text` des juengsten `answer_submitted` Events fuer diese `question_id` (sortiert nach `created_at DESC`, `LIMIT 1`).
- Der Tenant ueberschreibt nichts. Es gibt kein Upsert. Kein "letzte gewinnt"-Mechanismus, der alte Daten ersetzt. Stattdessen: das juengste Event wird zur Ableitung der aktuellen Antwort herangezogen. Alle aelteren Events bleiben vollstaendig erhalten.

## Acceptance Criteria
- [ ] Fragen-Detailansicht zeigt: `frage_id`, Block, Ebene-Badge, Unterbereich, vollstaendigen Fragetext
- [ ] Textfeld fuer die Antwort ist vorhanden
- [ ] "Antwort speichern" ruft `POST /api/tenant/runs/{runId}/questions/{qId}/events` mit `event_type: 'answer_submitted'` auf
- [ ] Der API-Endpoint fuehrt ausschliesslich ein `INSERT` in `question_events` durch — niemals ein `UPDATE` oder `DELETE`
- [ ] Nach dem Speichern zeigt die UI die aktuelle Antwort (= abgeleitet aus dem juengsten `answer_submitted` Event) und aktualisiert den Fragen-Status auf "Beantwortet"
- [ ] "Antwort speichern" ist deaktiviert wenn das Textfeld leer ist
- [ ] Erneutes Speichern erstellt ein **neues** `answer_submitted` Event (append-only); das vorherige Event wird weder geloescht noch veraendert
- [ ] "Notiz hinzufuegen" erstellt ein `note_added` Event ueber separates Formular (ebenfalls INSERT-only)
- [ ] Event-Historie zeigt alle Events chronologisch mit Zeitstempel und Typ
- [ ] "Antwort speichern" und "Notiz hinzufuegen" sind deaktiviert wenn der Run `locked` ist
- [ ] Kein Auto-Save in MVP-1 — nur explizites Speichern
- [ ] Erfolgs-Toast nach jedem Speichern

## Edge Cases
- Leere Antwort absenden? -> Client- und serverseitige Validierung verhindern leere Saves.
- Speichern schlaegt fehl (Netzwerkfehler)? -> Fehler-Toast "Speichern fehlgeschlagen. Bitte erneut versuchen." Antwort bleibt im Textfeld.
- Run wird locked waehrend Tenant bearbeitet? -> Naechster Save-Call gibt 403; UI zeigt "Run abgeschlossen"-Banner.
- Antworttext >10.000 Zeichen? -> Server gibt 400 "Antworttext ueberschreitet maximale Laenge."
- Seite wird waehrend der Bearbeitung neu geladen? -> Ungespeicherte Aenderungen gehen verloren; aktuelle Antwort (abgeleitet aus juengstem Event) wird angezeigt.
- Tenant gibt eine neue Antwort auf eine bereits beantwortete Frage? -> Neues `answer_submitted` Event wird erstellt. Die vorherige Antwort bleibt als Event im Log. Die UI zeigt die neue Antwort als "Aktuelle Antwort" (abgeleitet).

## Technical Requirements
- **Append-only**: Ausschliesslich `INSERT` auf `question_events`. Kein `UPDATE`, kein `DELETE`, kein `UPSERT` — niemals.
- **Source of Truth**: `question_events` Tabelle ist die einzige Wahrheitsquelle fuer alle Antworten.
- **Aktuelle Antwort = abgeleitet**: Serverseitig berechnet als `payload.text` des juengsten `answer_submitted` Events pro `question_id` (`ORDER BY created_at DESC LIMIT 1`).
- Zod-Validation: `payload.text` max 10.000 Zeichen
- Optimistic UI: Fragen-Status aktualisiert sich sofort bei erfolgreichem Save
- Events in Historie: neueste zuerst (sortiert nach `created_at DESC`)
- **Hosting**: Supabase self-hosted auf Hetzner via Coolify + Docker Compose
- **Kein Vercel**: API-Routes laufen im self-hosted Next.js Container

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)

### Acceptance Criteria Status

#### AC-1: Fragen-Detailansicht zeigt frage_id, Block, Ebene-Badge, Unterbereich, Fragetext
- [x] Detail panel in `run-workspace-client.tsx` shows: frage_id (monospace), Block number, Ebene badge, Unterbereich (CardDescription), full fragetext (CardTitle)

#### AC-2: Textfeld fuer die Antwort ist vorhanden
- [x] `Textarea` component with 8 rows, placeholder "Geben Sie Ihre Antwort ein..."
- [x] Disabled when locked or admin

#### AC-3: "Antwort speichern" ruft POST /api/tenant/runs/{runId}/questions/{qId}/events mit event_type: 'answer_submitted'
- [x] `saveAnswer()` function in `run-workspace-client.tsx` calls correct endpoint
- [x] Sends `{ client_event_id: crypto.randomUUID(), event_type: "answer_submitted", payload: { text: answerText } }`
- [x] Uses correct URL pattern with runId and activeQuestion (questionId)

#### AC-4: API-Endpoint fuehrt ausschliesslich INSERT durch -- niemals UPDATE oder DELETE
- [x] `src/app/api/tenant/runs/[runId]/questions/[questionId]/events/route.ts` POST handler uses ONLY `supabase.from("question_events").insert()`
- [x] No `.update()`, `.delete()`, or `.upsert()` calls found anywhere in tenant API routes (verified via Grep)
- [x] RLS has no UPDATE/DELETE policies for tenants on question_events

#### AC-5: Nach Speichern zeigt UI aktuelle Antwort und aktualisiert Status
- [x] On successful save, `loadRun()` is called to refresh data
- [x] Success message "Antwort gespeichert" displayed
- [x] Refreshed data from API includes updated latest_answer from v_current_answers view

#### AC-6: "Antwort speichern" deaktiviert wenn Textfeld leer
- [x] `disabled={saving || !answerText.trim()}` on save button
- [x] `if (!activeQuestion || !answerText.trim() || !run) return;` guard at start of saveAnswer()
- [x] Server-side validation: `text: z.string().min(1)` in answerSubmittedPayload schema

#### AC-7: Erneutes Speichern erstellt neues Event (append-only)
- [x] Each save generates a new `crypto.randomUUID()` for client_event_id
- [x] API always does INSERT; no check-and-update logic
- [x] UNIQUE constraint on `(run_id, client_event_id)` prevents only duplicate events, not new answers

#### AC-8: "Notiz hinzufuegen" erstellt note_added Event
- [ ] BUG-P5-1: No "Notiz hinzufuegen" UI element exists. The run workspace only has an answer textarea and save button. There is no separate note form or button. The API supports `note_added` event type (validated in createEventSchema), but the UI never sends it.

#### AC-9: Event-Historie zeigt alle Events chronologisch
- [ ] BUG-P5-2: No event history UI. The API has a GET handler at `/api/tenant/runs/{runId}/questions/{questionId}/events` that returns all events sorted by created_at DESC with limit 200. However, the UI never calls this endpoint and does not render any event history panel.

#### AC-10: "Antwort speichern" und "Notiz hinzufuegen" deaktiviert bei locked Run
- [x] Save button hidden when `isLocked || isAdmin`
- [x] Textarea disabled when `isLocked || isAdmin`
- [x] Server-side: API checks `run.status === "locked"` and returns 403
- [x] RLS INSERT policy checks `status != 'locked'`
- [ ] BUG-P5-1 (same): Note form does not exist

#### AC-11: Kein Auto-Save in MVP-1
- [x] No auto-save logic. Only explicit save via button click.

#### AC-12: Erfolgs-Toast nach jedem Speichern
- [ ] BUG-P5-3: No toast component used. Success/error messages are displayed as inline text via `setMessage()`. Spec says "Erfolgs-Toast" which implies a toast notification component. shadcn/ui toast is available (`src/hooks/use-toast.ts` exists) but not used.

### Idempotency Logic Deep-Dive

#### client_event_id Implementation
- [x] Schema: `client_event_id uuid NOT NULL` with `UNIQUE (run_id, client_event_id)` constraint
- [x] Client generates UUID via `crypto.randomUUID()` (browser-native, cryptographically random)
- [x] API checks for existing event with same run_id + client_event_id before INSERT
- [x] If found, returns existing event with HTTP 200 (idempotent retry)
- [x] Race condition handled: if unique constraint violation (23505) on INSERT, retries SELECT and returns existing

#### Assessment of Idempotency
- [x] The idempotency implementation is CORRECT. The flow is:
  1. SELECT for existing event with client_event_id
  2. If found, return 200 (safe retry)
  3. If not found, INSERT
  4. If INSERT fails with unique violation (race condition), SELECT again and return 200
- [x] No data duplication possible due to UNIQUE constraint
- [x] Safe for network retries (same client_event_id will not create duplicate events)

### Append-Only Constraint Deep-Dive

#### Database Level
- [x] No UPDATE policy on question_events for tenant roles
- [x] No DELETE policy on question_events for tenant roles
- [x] `ON DELETE RESTRICT` on question_events FK references (prevents cascade deletion)
- [x] Admin has full access via `admin_full_question_events` policy -- this is by design for operational needs

#### Application Level
- [x] No `.update()` or `.delete()` calls in tenant API routes
- [x] No `.upsert()` calls anywhere in the codebase for event tables
- [x] Only `.insert()` is used for question_events

#### GRANT Level
- [x] `GRANT SELECT, INSERT ON TABLE question_events TO authenticated` -- no UPDATE or DELETE GRANT
- [ ] BUG-P5-4 (Security): Wait -- the GRANT statement at line 284-296 of rls.sql grants `SELECT, INSERT` on ALL listed tables including `runs`. But runs should NOT have INSERT from authenticated role since run creation is admin-only via service_role. The RLS policies prevent non-admin INSERT, but the GRANT is overly broad. This is defense-in-depth concern only since RLS blocks it.

### Security Audit Results

- [x] Auth guard via `requireTenant()` on all endpoints
- [x] Zod validation on all input (event_type enum, client_event_id uuid, payload structure)
- [x] Payload validation discriminated by event_type (answer_submitted validates text, note_added validates text, etc.)
- [x] Text length capped at 10,000 characters (server-side via Zod)
- [x] RLS double-checks tenant_id on INSERT
- [x] Locked run check both in API code AND RLS policy (defense-in-depth)
- [x] No SQL injection possible (Supabase parameterized queries)
- [ ] BUG-P5-5 (Medium/Security): Question ownership NOT verified against run's catalog. The events route at line 44-48 checks that the question exists (`supabase.from("questions").select("id").eq("id", questionId).single()`) but does NOT verify that the question belongs to the run's catalog_snapshot_id. RLS on questions ensures the tenant can only see questions from their catalog, which provides some protection. BUT if a tenant has multiple runs with different catalogs, they could potentially insert events for questions from a different run's catalog. The question_events table only stores question_id and run_id, so mismatched entries could be created.
- [ ] BUG-P5-6 (Low/Security): No rate limiting on event creation endpoint. A tenant could flood the event log with thousands of events.

### Edge Cases Status

#### EC-1: Leere Antwort absenden
- [x] Client: `!answerText.trim()` guard
- [x] Server: `z.string().min(1)` validation
- [x] Both client and server prevent empty saves

#### EC-2: Netzwerkfehler beim Speichern
- [x] Catch block sets error message "Netzwerkfehler -- bitte erneut versuchen"
- [x] Answer text remains in textarea (state not cleared on error)

#### EC-3: Run locked waehrend Bearbeitung
- [x] Next save returns 403 from API
- [x] Error message displayed via setMessage

#### EC-4: Antworttext >10.000 Zeichen
- [x] Zod validation: `z.string().max(10000)` returns 400
- [ ] BUG-P5-7: No client-side character count or max-length indicator. User could type 10,001 chars, submit, and only see a server error. No visual feedback about the limit.

#### EC-5: Seite neu geladen
- [x] Ungespeicherte Aenderungen lost (no local storage). `loadRun()` re-fetches and `selectQuestion()` fills textarea from latest_answer.

#### EC-6: Neue Antwort auf bereits beantwortete Frage
- [x] New crypto.randomUUID() generated, new INSERT created
- [x] v_current_answers returns the latest event
- [x] Previous events preserved (append-only)

### Bugs Found

#### BUG-P5-1: No "Notiz hinzufuegen" UI
- **Severity:** High
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. Open a question detail view
  2. Expected: Separate "Notiz hinzufuegen" form/button
  3. Actual: Only answer textarea and "Antwort speichern" button exist
- **Note:** Backend supports note_added event type; only UI is missing
- **Priority:** Fix before deployment

#### BUG-P5-2: No event history UI
- **Severity:** High
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. View a question that has been answered multiple times
  2. Expected: Chronological event history with timestamps and types
  3. Actual: No history panel rendered; only latest answer shown in textarea
- **Note:** Backend GET /events endpoint exists and works; only UI is missing
- **Priority:** Fix before deployment

#### BUG-P5-3: No toast notification for save success
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. Save an answer
  2. Expected: Toast notification "Antwort gespeichert"
  3. Actual: Inline text message (not a toast)
- **Priority:** Fix in next sprint

#### BUG-P5-4: Overly broad GRANT on authenticated role
- **Severity:** Low (Security, mitigated by RLS)
- **Location:** `sql/rls.sql`, lines 284-296
- **Steps to Reproduce:**
  1. GRANT SELECT, INSERT applies to runs table for authenticated role
  2. Expected: INSERT only granted where RLS allows it
  3. Actual: GRANT is broad but RLS policies prevent actual unauthorized INSERT -- defense in depth only
- **Priority:** Nice to have

#### BUG-P5-5: Question not verified against run's catalog
- **Severity:** Medium (Security)
- **Location:** `src/app/api/tenant/runs/[runId]/questions/[questionId]/events/route.ts`, lines 44-48
- **Steps to Reproduce:**
  1. Tenant has Run A (catalog X) and Run B (catalog Y)
  2. POST event to Run A with a question_id from catalog Y
  3. Expected: API rejects -- question does not belong to this run's catalog
  4. Actual: API only checks question exists (RLS allows seeing questions from own catalogs), INSERT succeeds with mismatched question_id
- **Fix:** After loading the run, verify `question.catalog_snapshot_id === run.catalog_snapshot_id`
- **Priority:** Fix before deployment

#### BUG-P5-6: No rate limiting on event creation
- **Severity:** Low (Security)
- **Location:** `src/app/api/tenant/runs/[runId]/questions/[questionId]/events/route.ts`
- **Steps to Reproduce:**
  1. Send 1000 rapid POST requests to create events
  2. Expected: Rate limiting kicks in
  3. Actual: All 1000 events created (each with unique client_event_id)
- **Priority:** Fix in next sprint

#### BUG-P5-7: No character count indicator on answer textarea
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. Start typing a very long answer
  2. Expected: Character count showing X/10000
  3. Actual: No indication of max length; server returns 400 if exceeded
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 8/12 passed (AC-8 missing, AC-9 missing, AC-10 partial, AC-12 failed)
- **Bugs Found:** 7 total (0 critical, 2 high, 1 medium, 4 low)
- **Security:** 1 medium issue (question-catalog mismatch), 2 low issues
- **Production Ready:** NO
- **Recommendation:** Fix BUG-P5-1 (note UI), BUG-P5-2 (event history UI), and BUG-P5-5 (question-catalog verification) before deployment. The append-only and idempotency implementations are SOLID.

---

## Phase 1 Bugfix Re-Test Results

**Re-Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)

### BUG-P5-5 RETEST: Cross-catalog verification missing (MEDIUM/Security)

**Original Bug:** The events route only checked that a question EXISTS (`supabase.from("questions").select("id").eq("id", questionId).single()`) but did NOT verify that the question belongs to the run's catalog_snapshot_id. A tenant with multiple runs using different catalogs could potentially insert events for questions from a different run's catalog.

**Fix Status: FIXED**

**Verification Details (`src/app/api/tenant/runs/[runId]/questions/[questionId]/events/route.ts`):**

1. **Run query now includes catalog_snapshot_id (line 31):**
   - [x] Run SELECT now fetches `catalog_snapshot_id`: `.select("id, status, tenant_id, catalog_snapshot_id")`
   - [x] Previously only fetched `id, status, tenant_id` (missing catalog_snapshot_id)

2. **Question verification now includes catalog check (lines 43-49):**
   - [x] Old code: `.eq("id", questionId).single()` -- only checked question exists
   - [x] New code: `.eq("id", questionId).eq("catalog_snapshot_id", run.catalog_snapshot_id).single()`
   - [x] This ensures the question belongs to the SAME catalog that the run references

3. **Error message updated (line 52):**
   - [x] Returns "Question not found in this run's catalog" (was just "Question not found")
   - [x] This gives a clear indication that the catalog mismatch was the reason

4. **Defense-in-depth analysis:**
   - [x] Layer 1 (Application): API explicitly checks `question.catalog_snapshot_id === run.catalog_snapshot_id`
   - [x] Layer 2 (RLS): `tenant_select_questions_via_runs` policy restricts question visibility to catalogs referenced by the tenant's runs
   - [x] Layer 3 (FK constraint): `question_events.question_id` references `questions(id)` with ON DELETE RESTRICT
   - [x] The attack vector (tenant with two runs, different catalogs) is now blocked at the application layer

5. **Scenario verification:**
   - Tenant has Run A (catalog X) and Run B (catalog Y)
   - POST event to Run A with question_id from catalog Y
   - Run A loaded: `catalog_snapshot_id = X`
   - Question lookup: `.eq("id", qFromCatalogY).eq("catalog_snapshot_id", X)` -> returns NULL -> 404
   - [x] Attack vector is correctly blocked

**Verdict: BUG-P5-5 is FIXED. Questions are now verified against the run's catalog_snapshot_id, preventing cross-catalog event injection.**

---

## Deployment
_To be added by /deploy_
