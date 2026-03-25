# PROJ-7: Tenant — Run Submission Checkpoint

## Status: Planned
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

## Dependencies
- Requires: PROJ-5 (Fragen beantworten) — mindestens ein Event muss existieren
- Requires: PROJ-6 (Evidence Upload) — Evidence-Upload ist ein Pre-Submission-Schritt (optional)
- Requires: PROJ-4 (Tenant Run Workspace) — Submit-Aktion lebt im Run Workspace

## User Stories
- Als Tenant-User moechte ich einen Checkpoint absenden, damit StrategAIze einen Snapshot meines aktuellen Fortschritts zur Pruefung erhaelt.
- Als Tenant-User moechte ich nach dem Absenden weiter Antworten und Evidence hinzufuegen koennen, damit ich meine Einreichung verbessern kann.
- Als Tenant-User moechte ich sehen, wann der letzte Checkpoint gesendet wurde, damit ich einen Ueberblick ueber meine Submission-Historie habe.
- Als Tenant-User moechte ich beim Absenden eine optionale Notiz hinzufuegen, damit ich dem StrategAIze-Team Kontext mitgeben kann.
- Als StrategAIze-Admin moechte ich sehen, wann ein Tenant seinen Checkpoint gesendet hat, damit ich weiss, dass Antworten zur Pruefung bereitliegen.

## Run Status Flow

```
collecting -> submitted -> locked
```

- **`collecting`**: Run ist offen, Tenant kann Events erstellen (Antworten, Evidence, Notizen).
- **`submitted`**: Tenant hat mindestens einen Checkpoint abgesendet. Run bleibt offen fuer weitere Events (append-only weiterhin moeglich).
- **`locked`**: Admin hat den Run gesperrt. Keine weiteren Events moeglich.

## Source of Truth

**`run_submissions` ist die einzige Quelle der Wahrheit fuer die Submission-Historie.**

- Jeder Checkpoint erzeugt einen neuen Eintrag in `run_submissions` per `INSERT`. Es gibt kein `UPDATE` und kein `DELETE` auf dieser Tabelle.
- Die Tabelle ist append-only und bildet die vollstaendige Submission-Historie ab.

## Acceptance Criteria
- [ ] Run Workspace zeigt einen "Checkpoint absenden" Button im Header/Footer
- [ ] Klick auf "Checkpoint absenden" oeffnet einen Bestaetigungsdialog mit: Run-Titel, Fragen-Fortschritt (z.B. "45 von 73 beantwortet"), optionales Notiz-Feld
- [ ] Bei Bestaetigung: `POST /api/tenant/runs/{runId}/submit` erstellt einen `run_submissions`-Eintrag per `INSERT`
- [ ] `runs.status` wechselt zu `'submitted'` beim ersten Checkpoint (bleibt bei weiteren Checkpoints auf `'submitted'`)
- [ ] Run bleibt nach Submission offen fuer weitere Events (Append-only weiterhin moeglich)
- [ ] Erfolgsbanner: "Checkpoint erfolgreich gesendet. Sie koennen weiterhin Informationen hinzufuegen."
- [ ] Submission-Historie im Run Workspace zeigt alle Checkpoints mit Datum, Uhrzeit und Snapshot-Version
- [ ] "Checkpoint absenden" ist deaktiviert wenn Run `locked` ist
- [ ] "Checkpoint absenden" ist deaktiviert wenn der Run null Events hat (leerer Run kann nicht submitted werden)

## Edge Cases
- Doppelklick auf "Absenden"? -> Client-seitiger Debounce (5s); wenn zwei Requests den Server erreichen, wird der zweite verarbeitet und erstellt einen neuen Submission-Eintrag (append-only).
- Submission schlaegt fehl (Netzwerkfehler)? -> Fehler-Toast: "Absenden fehlgeschlagen. Bitte erneut versuchen."
- Run wird zwischen Dialog-Oeffnung und Bestaetigung locked? -> API gibt 403; Dialog schliesst sich, Locked-Banner erscheint.
- Submission mit keinen beantworteten Fragen (nur Notizen oder Evidence)? -> Erlaubt, solange mindestens ein `question_event` existiert.
- Optionale Notiz >2.000 Zeichen? -> Validierung: Inline-Fehler.

## Technical Requirements
- **Append-only**: `run_submissions` ist ausschliesslich `INSERT`-only. Kein `UPDATE`, kein `DELETE`.
- **Source of Truth**: `run_submissions` Tabelle ist die einzige Wahrheitsquelle fuer alle Submission-Checkpoints.
- `snapshot_version` auto-inkrement: `SELECT MAX(snapshot_version) + 1 FROM run_submissions WHERE run_id = ?`
- **Run Status Flow**: `collecting` -> `submitted` -> `locked`
- Bestaetigungsdialog verhindert versehentliches Absenden (Two-Step UX)
- Admin Run-Detailansicht zeigt letztes Submission-Datum und Submission-Anzahl
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

#### AC-1: "Checkpoint absenden" Button im Run Workspace
- [x] Button rendered in header: `<Button onClick={submitRun} disabled={submitting || answered === 0}>`
- [x] Only shown for non-admin, non-locked runs: `{!isAdmin && !isLocked && (...)}`
- [x] Label: "Checkpoint einreichen"

#### AC-2: Bestaetigungsdialog mit Run-Titel, Fortschritt, Notiz-Feld
- [ ] BUG-P7-1: No confirmation dialog. Spec requires a two-step confirmation dialog showing Run-Titel, Fortschritt ("45 von 73 beantwortet"), and an optional note field. The current implementation submits directly on button click without any dialog, without showing progress summary, and without note input.

#### AC-3: POST /api/tenant/runs/{runId}/submit erstellt run_submissions-Eintrag
- [x] Route exists at `src/app/api/tenant/runs/[runId]/submit/route.ts`
- [x] Uses `requireTenant()` auth guard
- [x] Calls `run_submit()` SECURITY DEFINER function via user session
- [x] `run_submit()` function creates INSERT into run_submissions (append-only)
- [x] Returns 201 with submission data (id, run_id, snapshot_version, submitted_at)

#### AC-4: runs.status wechselt zu 'submitted' beim ersten Checkpoint
- [x] `run_submit()` function: `UPDATE runs SET status = 'submitted' WHERE id = p_run_id AND status = 'collecting'`
- [x] Idempotent: subsequent checkpoints do not change status (already 'submitted')
- [x] Also updates `submitted_at = now()`

#### AC-5: Run bleibt nach Submission offen fuer weitere Events
- [x] `run_submit()` only changes status from 'collecting' to 'submitted'
- [x] RLS INSERT policy on question_events checks `status != 'locked'` (not `status = 'collecting'`)
- [x] Therefore, events can still be inserted when status is 'submitted'

#### AC-6: Erfolgsbanner nach Submission
- [x] `setMessage("Checkpoint erfolgreich eingereicht")` on success
- [ ] BUG-P7-2: The spec says "Sie koennen weiterhin Informationen hinzufuegen" in the success banner. Current message is just "Checkpoint erfolgreich eingereicht" without the continuation note.

#### AC-7: Submission-Historie im Run Workspace
- [ ] BUG-P7-3 (same as BUG-P4-8): No submission history rendered in the run workspace. The API does not return run_submissions data in the run detail response. The spec requires "alle Checkpoints mit Datum, Uhrzeit und Snapshot-Version".

#### AC-8: "Checkpoint absenden" deaktiviert bei locked Run
- [x] Submit button is completely hidden (not just disabled) when `isLocked`
- [x] `run_submit()` function checks for locked status and raises EXCEPTION with P0403

#### AC-9: "Checkpoint absenden" deaktiviert bei null Events
- [x] Button `disabled={submitting || answered === 0}` -- disables when no answered questions
- [ ] BUG-P7-4: The disable condition checks `answered === 0` (questions with latest_answer) but the spec and the `run_submit()` function check for `question_events` existence. A question with only a note_added event (no answer_submitted) would have `answered === 0` in the UI but `EXISTS(question_events)` would be TRUE in the DB. The UI would disable the button while the API would allow submission. This is a mismatch.

### run_submit() SECURITY DEFINER Deep-Dive

#### Function Security
- [x] `SECURITY DEFINER` -- bypasses RLS for internal operations
- [x] `SET search_path = public` -- prevents search_path manipulation attacks
- [x] Session check: `auth.uid() IS NULL` raises UNAUTHORIZED
- [x] Role check: `auth.user_role() NOT IN ('tenant_owner', 'tenant_member')` raises FORBIDDEN
- [x] Run existence check: `NOT FOUND` raises NOT_FOUND
- [x] Tenant ownership check: `v_run.tenant_id != v_tenant_id` raises FORBIDDEN
- [x] Status check: locked run raises FORBIDDEN
- [x] Business rule: at least one question_event must exist, else raises UNPROCESSABLE

#### Status Transition Safety
- [x] Status only changed from 'collecting' to 'submitted' (WHERE clause: `AND status = 'collecting'`)
- [x] Idempotent for already-submitted runs (UPDATE has no effect, no error raised)
- [x] Cannot submit locked runs (explicit check before any mutation)
- [x] No direct UPDATE policy on runs for tenant roles -- only via this function

#### Snapshot Version Auto-Increment
- [x] `SELECT COALESCE(MAX(snapshot_version), 0) + 1 FROM run_submissions WHERE run_id = p_run_id`
- [x] UNIQUE constraint `(run_id, snapshot_version)` prevents duplicates
- [ ] BUG-P7-5 (Low): Potential race condition on snapshot_version if two concurrent submissions happen for the same run. Both could read the same MAX, attempt INSERT with same version, and one would fail with unique constraint violation. The function does NOT handle this constraint violation with a retry. However, this is extremely unlikely in practice (single tenant user submitting).

### Edge Cases Status

#### EC-1: Doppelklick auf "Absenden"
- [ ] BUG-P7-6: No client-side debounce. Spec requires "Client-seitiger Debounce (5s)". The button is disabled via `submitting` state while the request is in flight, but there is no time-based debounce. A rapid double-click before the first request completes could theoretically trigger two submissions (though state updates typically prevent this in React).
- [x] Server-side: Both would succeed creating two run_submission entries (append-only by design)

#### EC-2: Netzwerkfehler
- [x] Catch block sets error message: "Netzwerkfehler -- bitte erneut versuchen"
- [x] `setSubmitting(false)` in finally block

#### EC-3: Run locked between dialog and confirmation
- [x] `run_submit()` checks locked status and returns FORBIDDEN
- [x] API route maps FORBIDDEN error to 403 response
- [ ] BUG-P7-1 (same): No dialog exists, so this scenario's specific UX (dialog closes, locked banner appears) is not implemented

#### EC-4: Submission with no answered questions (only notes/evidence)
- [x] Server allows if any question_event exists (note_added counts)
- [ ] BUG-P7-4 (same): UI disables based on answered count, not event existence

#### EC-5: Note >2.000 Zeichen
- [x] Zod validation: `z.string().max(2000)` in `runSubmitSchema`
- [ ] BUG-P7-1 (same): No note field in UI (no confirmation dialog)

### Security Audit Results

- [x] runs.status transition ONLY via SECURITY DEFINER function -- tenant cannot bypass
- [x] No direct INSERT policy on run_submissions for tenant -- only via run_submit()
- [x] Tenant ownership verified inside run_submit() function
- [x] All auth checks happen INSIDE the SECURITY DEFINER function (not just in the API route)
- [x] Admin cannot submit via this endpoint (role check restricts to tenant roles)
- [x] Error messages from function mapped to appropriate HTTP status codes (401, 403, 404, 422)
- [x] Note input validated via Zod (max 2000 chars)
- [ ] BUG-P7-7 (Low): The submit endpoint silently accepts and ignores extra fields in the request body beyond `note` (Zod `z.object({})` does not strip extra fields by default but they are not used). Not a security issue per se, but unexpected data is not rejected.

### Bugs Found

#### BUG-P7-1: No confirmation dialog for checkpoint submission
- **Severity:** High
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`, submitRun() function
- **Steps to Reproduce:**
  1. Click "Checkpoint einreichen"
  2. Expected: Confirmation dialog with run title, progress summary, optional note field
  3. Actual: Submission happens immediately without any confirmation step
- **Impact:** Users can accidentally submit without review. No way to add submission notes.
- **Priority:** Fix before deployment

#### BUG-P7-2: Success message incomplete
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`, line 128
- **Steps to Reproduce:**
  1. Successfully submit a checkpoint
  2. Expected: "Checkpoint erfolgreich gesendet. Sie koennen weiterhin Informationen hinzufuegen."
  3. Actual: "Checkpoint erfolgreich eingereicht"
- **Priority:** Fix in next sprint

#### BUG-P7-3: No submission history in run workspace
- **Severity:** Medium
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx` + API
- **Steps to Reproduce:**
  1. Submit one or more checkpoints
  2. Expected: List of all checkpoints with date, time, snapshot version
  3. Actual: No submission history visible anywhere in the run workspace
- **Note:** Same as BUG-P4-8
- **Priority:** Fix before deployment

#### BUG-P7-4: Submit button disabled condition mismatch with API
- **Severity:** Medium
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`, line 206
- **Steps to Reproduce:**
  1. Add only a note_added event to a question (no answer)
  2. Expected: Submit button enabled (events exist)
  3. Actual: Submit button disabled (answered === 0 check instead of events-exist check)
- **Priority:** Fix before deployment

#### BUG-P7-5: Potential race condition on snapshot_version
- **Severity:** Low
- **Location:** `sql/functions.sql`, run_submit() function, lines 138-141
- **Steps to Reproduce:**
  1. Two concurrent submissions for the same run
  2. Expected: Both succeed with different snapshot_versions
  3. Actual: One may fail with unique constraint violation (no retry logic)
- **Note:** Extremely unlikely in single-tenant-user scenario
- **Priority:** Nice to have

#### BUG-P7-6: No 5-second debounce on submit button
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. Rapidly click "Checkpoint einreichen" twice
  2. Expected: 5-second debounce prevents second click (per spec)
  3. Actual: Button disables via React state during in-flight request, but no time-based debounce
- **Priority:** Fix in next sprint

#### BUG-P7-7: Extra request body fields silently ignored
- **Severity:** Low
- **Location:** `src/app/api/tenant/runs/[runId]/submit/route.ts`
- **Steps to Reproduce:**
  1. Send POST with `{ note: "test", malicious_field: "value" }`
  2. Expected: Extra fields rejected or stripped
  3. Actual: Extra fields silently ignored
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 5/9 passed (AC-2 failed, AC-6 partial, AC-7 failed, AC-9 partial)
- **Bugs Found:** 7 total (0 critical, 1 high, 2 medium, 4 low)
- **Security:** STRONG -- runs.status transitions properly secured via SECURITY DEFINER; all auth checks solid
- **Production Ready:** NO
- **Recommendation:** Fix BUG-P7-1 (confirmation dialog with note field), BUG-P7-3 (submission history), BUG-P7-4 (button disable mismatch) before deployment. The SECURITY DEFINER implementation for run_submit() is well-designed and secure.

---

## Full QA Sweep: Regression Report PROJ-1 through PROJ-7

**Tested:** 2026-02-23
**Method:** Static code analysis of all source files (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds, all 18 routes render correctly)
**Scope:** Full regression across PROJ-1 through PROJ-7 + verification of 4 low-severity fixes

### 4 Low-Severity Fix Verification Summary

| Fix | Description | Status | Location |
|-----|-------------|--------|----------|
| FIX-1 | Catalog import hash includes ALL question fields | VERIFIED | `src/app/api/admin/catalog/snapshots/route.ts` lines 59-76 |
| FIX-2 | profiles.email index with lower() + case-insensitive lookup | VERIFIED | `sql/schema.sql` line 40 + invite route line 38,45 |
| FIX-3 | Evidence links filtered at DB level via .in() (admin route) | VERIFIED | `src/app/api/admin/runs/[runId]/route.ts` line 78 |
| FIX-4 | reinvite_sent vs invite_sent audit distinction | VERIFIED | `src/app/api/admin/tenants/[tenantId]/invite/route.ts` line 93 + schema line 215 |

All 4 fixes are confirmed as implemented and correct. Detailed verification in PROJ-1 and PROJ-2 feature specs.

### PROJ-1 Regression: Auth, Invite-only, Roles & Tenant Management

| Check | Status | Notes |
|-------|--------|-------|
| POST /api/admin/tenants (create tenant) | PASS | Zod validation, requireAdmin(), audit log |
| POST /api/admin/tenants/{id}/invite | PASS | Re-invite works, case-insensitive lookup, reinvite_sent audit |
| GET /api/admin/tenants (list tenants) | PASS (partial) | Still missing tenant status (Active/Pending) and user count (BUG-P1-1, P1-2 still open) |
| Auth callback (/auth/callback) | PASS | Token verification, invite redirect to set-password |
| Set-password page | PASS | Password validation, updateUser, redirect to dashboard |
| No /auth/register page | PASS | Confirmed absent |
| requireAdmin() guard | PASS | 401 for unauthenticated, 403 for non-admin |
| requireTenant() guard | PASS | 401 for unauthenticated, 403 for non-tenant |
| RLS on all tables | PASS | All 10 tables have ENABLE ROW LEVEL SECURITY |
| Security headers | PASS | X-Frame-Options, HSTS, nosniff, Referrer-Policy, Permissions-Policy |
| Middleware auth redirect | PASS | Unauthenticated -> /login, authenticated on /login -> /dashboard |

**Existing open bugs from prior QA rounds (not regressions):**
- BUG-P1-1 (Medium): Tenant list missing Active/Pending status
- BUG-P1-2 (Low): Tenant list missing user count
- BUG-P1-4 (Low): No duplicate tenant name warning
- BUG-P1-5 (Low): No dedicated expired-link error page
- BUG-P1-7 (Medium): No rate limiting on auth/invite endpoints

**New regressions found:** NONE

---

### PROJ-2 Regression: Admin Run & Question Catalog Management

| Check | Status | Notes |
|-------|--------|-------|
| POST /api/admin/catalog/snapshots (import) | PASS | Zod, SHA256 with all fields, version uniqueness, rollback |
| GET /api/admin/catalog/snapshots (list) | PASS | Returns all snapshots ordered by date |
| GET /api/admin/catalog/snapshots/{id}/questions | PASS | Verifies snapshot exists, returns ordered questions |
| POST /api/admin/runs (create run) | PASS | Validates tenant + snapshot exist, hardcoded status=collecting |
| GET /api/admin/runs (list runs) | PASS | Filters for tenant_id and status, limit 100, enriched data |
| GET /api/admin/runs/{id} (run detail) | PASS | Questions, derived answers, evidence counts (DB-filtered) |
| PATCH /api/admin/runs/{id}/lock | PASS | SECURITY DEFINER run_lock(), admin-only, audit event |
| run_submit() function | PASS | Status transitions, tenant ownership, event existence checks |
| run_lock() function | PASS | Admin-only, previous_status in audit payload |
| v_current_answers view | PASS | DISTINCT ON correctly derives latest answer per question |

**Existing open bugs (not regressions):**
- BUG-P2-3 (Low): Questions not grouped by block in API
- BUG-P2-5 (High): No admin UI pages
- NEW-P2-4b (Low): Tenant route still uses JS filtering for evidence links

**New regressions found:** NONE

---

### PROJ-3 Regression: Tenant Login & Dashboard

| Check | Status | Notes |
|-------|--------|-------|
| Login page (/login) | PASS | Email+password, Supabase auth, window.location.href redirect |
| Login session verification | PASS | Checks data.session before redirect |
| Login loading state | PASS | Button disabled, finally block resets |
| Dashboard (/dashboard) | PASS | Server component auth check, passes profile to client |
| Dashboard run cards | PASS | Title, status badge, progress bar, evidence count |
| Dashboard empty state | PASS (partial) | Shows empty message (text differs from spec -- BUG-P3-2 still open) |
| Logout button | PASS | signOut() + window.location.href to /login |
| RLS tenant isolation | PASS | Tenant sees only own runs |

**Existing open bugs (not regressions):**
- BUG-P3-1 (Low): Locked runs not greyed out
- BUG-P3-2 (Low): Empty state text differs from spec
- BUG-P3-3 (Low): No dedicated expired invite error page
- BUG-P3-4 (Low): Login errors in English, not German
- BUG-P3-5 (Low): No session-expired message
- BUG-P3-6 (Medium): Middleware doesn't enforce role-based route protection
- BUG-P3-7 (Low): Raw Supabase errors exposed

**New regressions found:** NONE

---

### PROJ-4 Regression: Tenant Run Workspace

| Check | Status | Notes |
|-------|--------|-------|
| Run workspace page (/runs/{id}) | PASS | Server component auth, client component loads data |
| Question grouping by block | PASS | Tabs component with TabsTrigger per block |
| Overall progress bar | PASS | X/Y Fragen beantwortet with Progress component |
| Question detail panel | PASS | frage_id, block, ebene badge, unterbereich, fragetext |
| Locked run disables controls | PASS | Textarea + button disabled, submit button hidden |
| Run not found (404) | PASS | Shows "Run nicht gefunden." |
| RLS cross-tenant access blocked | PASS | API returns 404 via RLS |

**Existing open bugs (not regressions):**
- BUG-P4-1 (Low): Catalog version not shown
- BUG-P4-2 (Low): Block names not descriptive
- BUG-P4-3 (Medium): No per-block progress counter
- BUG-P4-4 (Low): Ebene badge missing from question list
- BUG-P4-5 (Medium): Missing "In Bearbeitung" question status
- BUG-P4-6 (Medium): No answer preview in question list
- BUG-P4-7 (Medium): No locked run banner
- BUG-P4-8 (Medium): No submission history
- BUG-P4-9 (Low): No empty state for questions
- BUG-P4-10 (Low): isAdmin flag passed as client prop

**New regressions found:** NONE

---

### PROJ-5 Regression: Question Event Logging

| Check | Status | Notes |
|-------|--------|-------|
| POST events endpoint | PASS | Zod validation, idempotency, append-only INSERT |
| GET events endpoint | PASS | Returns events ordered by created_at DESC, limit 200 |
| Cross-catalog verification | PASS (previously fixed) | question.catalog_snapshot_id === run.catalog_snapshot_id |
| Idempotency via client_event_id | PASS | SELECT-first, INSERT, race-condition retry on 23505 |
| Locked run blocking | PASS | API check + RLS INSERT policy |
| Append-only enforcement | PASS | No .update()/.delete()/.upsert() in tenant routes; no UPDATE/DELETE RLS policies |
| GRANT enforcement | PASS | SELECT, INSERT only for authenticated role |
| Zod discriminated payload validation | PASS | answer_submitted validates text, note_added validates text |

**Existing open bugs (not regressions):**
- BUG-P5-1 (High): No "Notiz hinzufuegen" UI
- BUG-P5-2 (High): No event history UI
- BUG-P5-3 (Low): No toast for save success
- BUG-P5-4 (Low): Overly broad GRANT
- BUG-P5-6 (Low): No rate limiting on event creation
- BUG-P5-7 (Low): No character count indicator

**New regressions found:** NONE

---

### PROJ-6 Regression: Evidence Upload

**Status: NOT IMPLEMENTED (Planned)**

| Check | Status | Notes |
|-------|--------|-------|
| Evidence upload API routes | N/A | No `src/app/api/**/evidence*/` routes exist |
| Evidence UI in run workspace | N/A | No evidence upload form or list in UI |
| Supabase Storage integration | N/A | No storage client code found |

**Assessment:** PROJ-6 remains in "Planned" status. No implementation exists. This is NOT a regression -- it was never built. The database schema (evidence_items, evidence_links tables) and RLS policies are correctly defined, ready for implementation.

---

### PROJ-7 Regression: Run Submission Checkpoint

| Check | Status | Notes |
|-------|--------|-------|
| POST /api/tenant/runs/{id}/submit | PASS | requireTenant(), run_submit() SECURITY DEFINER |
| run_submit() SECURITY DEFINER | PASS | All 6 checks (auth, role, existence, ownership, locked, events) |
| Status transition collecting -> submitted | PASS | Idempotent for already-submitted |
| Run remains open after submission | PASS | RLS allows INSERT when status != 'locked' |
| Submit button in workspace | PASS | Hidden when locked/admin, disabled when answered=0 |
| Submission response 201 | PASS | Returns id, run_id, snapshot_version, submitted_at |
| Note validation | PASS | Zod max 2000 chars |

**Existing open bugs (not regressions):**
- BUG-P7-1 (High): No confirmation dialog
- BUG-P7-2 (Low): Success message incomplete
- BUG-P7-3 (Medium): No submission history in workspace
- BUG-P7-4 (Medium): Submit button disable mismatch
- BUG-P7-5 (Low): Snapshot version race condition
- BUG-P7-6 (Low): No 5-second debounce
- BUG-P7-7 (Low): Extra fields silently ignored

**New regressions found:** NONE

---

### Cross-Cutting Concerns (Regression)

| Area | Status | Notes |
|------|--------|-------|
| Build passes | PASS | `npm run build` succeeds with 0 errors, all 18 routes compiled |
| Security headers | PASS | X-Frame-Options DENY, HSTS, nosniff, Referrer-Policy, Permissions-Policy |
| RLS on all tables | PASS | 10 tables + 1 view, all with RLS enabled |
| Append-only tables | PASS | No UPDATE/DELETE policies for tenants on event tables |
| SECURITY DEFINER functions | PASS | run_submit(), run_lock(), handle_new_user(), log_admin_event() all have SET search_path |
| Service role key isolation | PASS | Only in src/lib/supabase/admin.ts, not exposed via NEXT_PUBLIC_ |
| Middleware auth | PASS | Public paths: /login, /auth/callback, /auth/set-password, /api/health |
| Zod validation on all endpoints | PASS | Every POST endpoint validates input via Zod |
| Error response format | PASS | Consistent { error: { code, message, details? } } format |

---

### Overall Sweep Summary

| Feature | Regressions Found | Previously Open Bugs | New Issues |
|---------|-------------------|---------------------|------------|
| PROJ-1 (Auth) | 0 | 5 (0C, 0H, 2M, 3L) | 0 |
| PROJ-2 (Runs/Catalog) | 0 | 3 (0C, 1H, 0M, 2L) | 0 |
| PROJ-3 (Login/Dashboard) | 0 | 7 (0C, 0H, 1M, 6L) | 0 |
| PROJ-4 (Workspace) | 0 | 10 (0C, 0H, 5M, 5L) | 0 |
| PROJ-5 (Events) | 0 | 6 (0C, 2H, 0M, 4L) | 0 |
| PROJ-6 (Evidence) | N/A | N/A (not implemented) | 0 |
| PROJ-7 (Submission) | 0 | 7 (0C, 1H, 2M, 4L) | 0 |
| **TOTAL** | **0** | **38** | **0** |

**4 Low-Severity Fixes: ALL 4 VERIFIED as correctly implemented.**

**0 regressions found across the entire codebase.**

**Production-Readiness Assessment:**
- **API layer:** SOLID -- all routes properly guarded, validated, and tested
- **Database layer:** SOLID -- RLS, append-only, SECURITY DEFINER functions all correct
- **Frontend layer:** FUNCTIONAL but INCOMPLETE -- several UI features missing (note form, event history, confirmation dialog, admin pages)
- **Overall:** NOT READY for production deployment until the 4 High-severity bugs are resolved:
  1. BUG-P2-5: No admin UI pages
  2. BUG-P5-1: No "Notiz hinzufuegen" UI
  3. BUG-P5-2: No event history UI
  4. BUG-P7-1: No confirmation dialog for checkpoint submission

## Deployment
_To be added by /deploy_
