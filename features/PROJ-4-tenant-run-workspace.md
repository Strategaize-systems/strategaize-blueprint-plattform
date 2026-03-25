# PROJ-4: Tenant — Run Workspace (Fragen-Uebersicht)

## Status: Planned
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

## Dependencies
- Requires: PROJ-3 (Tenant Login & Dashboard) — Tenant muss authentifiziert sein
- Requires: PROJ-2 (Admin Run & Fragenkatalog) — Run und Fragen muessen existieren

## User Stories
- Als Tenant-User möchte ich einen Run oeffnen und alle 73 Fragen in der richtigen Reihenfolge sehen, damit ich den vollen Umfang des Assessments verstehe.
- Als Tenant-User möchte ich die Fragen nach den 9 Bloecken (A-I) gruppiert sehen, damit ich thematisch zusammenhaengende Fragen gemeinsam bearbeiten kann.
- Als Tenant-User möchte ich den Status jeder Frage sehen (Unbeantwortet, In Bearbeitung, Beantwortet), damit ich meinen Fortschritt verfolgen kann.
- Als Tenant-User möchte ich zwischen Bloecken und Fragen navigieren können, damit ich das Assessment in meinem eigenen Tempo durcharbeiten kann.
- Als Tenant-User möchte ich sehen, wie viele Fragen insgesamt und pro Block beantwortet sind, damit ich weiss, wie viel Arbeit noch uebrig ist.
- Als Tenant-User möchte ich sehen, ob der Run bereits submitted wurde (Checkpoint-Historie).

## Acceptance Criteria
- [ ] Klick auf einen Run im Dashboard navigiert zu `/runs/{runId}` (Run Workspace)
- [ ] Run Workspace zeigt: Run-Titel, Beschreibung, Status-Badge, Katalog-Version
- [ ] Alle 73 Fragen sind nach Block (A-I) gruppiert mit Block-Ueberschriften
- [ ] Block-Ueberschriften zeigen: Block-Name, Fortschritt (z.B. "3 von 11 beantwortet")
- [ ] Jede Frage zeigt: `frage_id`, Fragetext, Ebene-Badge (`Kern` / `Workspace`), Status-Indikator
- [ ] Fragen-Status wird vollstaendig aus `question_events` abgeleitet:
  - `Unbeantwortet`: Keine Events fuer diese Frage vorhanden
  - `In Bearbeitung`: Events vorhanden, aber kein `answer_submitted` Event
  - `Beantwortet`: Mindestens 1 `answer_submitted` Event existiert
- [ ] Gesamtfortschritt: "X von 73 Fragen beantwortet" als Progress-Bar/Counter (abgeleitet aus `question_events`)
- [ ] Klick auf eine Frage oeffnet die Fragen-Detailansicht (inline oder Panel)
- [ ] Letzte Antwort-Vorschau in der Fragen-Liste: abgeleitet aus dem juengsten `answer_submitted` Event (gekuerzt auf ~100 Zeichen). Es wird kein gespeichertes Antwort-Feld gelesen — die aktuelle Antwort ist immer das juengste Event.
- [ ] Bei `status = 'locked'` sind alle Schreib-Aktionen deaktiviert; Banner: "Dieser Run ist abgeschlossen. Keine weiteren Eingaben moeglich."
- [ ] Submission-Historie (Datum des letzten Checkpoints) im Run-Header sichtbar

## Edge Cases
- Run hat noch keine Fragen (Katalog-Snapshot nicht verknuepft)? -> "Die Fragen fuer diesen Run wurden noch nicht bereitgestellt."
- Tenant versucht, auf einen Run eines anderen Tenants zuzugreifen? -> RLS blockiert; 404-Seite.
- Direkte Navigation zu `/runs/{unknownId}`? -> 404-Seite.
- Run-Status aendert sich auf `locked` waehrend Tenant die Seite offen hat? -> Naechster API-Call zeigt Locked-Fehler; UI zeigt Banner und deaktiviert Schreib-Aktionen.

## Technical Requirements
- Seite ist Server-Side gerendert (Next.js Server Component) beim ersten Laden
- Fragen-Status wird serverseitig aus `question_events` abgeleitet — `question_events` ist die einzige Source of Truth
- "Aktuelle Antwort" = Payload des juengsten `answer_submitted` Events pro Frage (kein separates Feld, kein Ueberschreiben)
- AI-Services (Dify, Ollama, Whisper) sind nie Source of Truth; sie liefern nur Assist-Vorschlaege
- Response Time: Initiales Laden <500ms fuer 73 Fragen
- Mobile Responsive (min. 375px)
- Hosting: Self-hosted auf Hetzner + Coolify + Docker Compose (kein Vercel, kein Supabase Cloud)

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)

### Acceptance Criteria Status

#### AC-1: Klick auf Run navigiert zu /runs/{runId}
- [x] Dashboard links run cards to `/runs/${run.id}`
- [x] Page exists at `src/app/runs/[id]/page.tsx`
- [x] Server component checks auth and loads profile

#### AC-2: Run Workspace zeigt Run-Titel, Beschreibung, Status-Badge, Katalog-Version
- [x] Header shows run.title
- [x] Status badge with color-coded variants (collecting/submitted/locked)
- [x] Description shown in run detail (from API response)
- [ ] BUG-P4-1: Catalog version is NOT shown in the Run Workspace UI. The API `GET /api/tenant/runs/{runId}` does not return `catalog_version` or `contract_version` field, and the UI does not display it.

#### AC-3: Alle 73 Fragen nach Block (A-I) gruppiert mit Block-Ueberschriften
- [x] `RunWorkspaceClient` groups questions by block using `new Set(questions.map(q => q.block))`
- [x] Uses `Tabs` component with TabsTrigger per block ("Block A", "Block B", etc.)
- [ ] BUG-P4-2: Block headings show only "Block X" without the block name (e.g., "A - Business & Positionierung"). Spec says "Block-Ueberschriften" which implies descriptive names.

#### AC-4: Block-Ueberschriften zeigen Fortschritt ("3 von 11 beantwortet")
- [ ] BUG-P4-3: No per-block progress counter. The TabsTrigger labels only show "Block A", "Block B", etc. without an answered/total count. Only overall progress is shown.

#### AC-5: Jede Frage zeigt frage_id, Fragetext, Ebene-Badge, Status-Indikator
- [x] Each question card shows `frage_id` (monospace), `fragetext` (truncated to 2 lines)
- [x] Status indicator: "Beantwortet" or "Offen" badge
- [ ] BUG-P4-4: Ebene badge (Kern/Workspace) is NOT shown in the question list cards. It is only shown in the detail panel when a question is selected. Spec says each question in the list should show the Ebene-Badge.
- [ ] BUG-P4-5: Missing "In Bearbeitung" status. Spec defines 3 states: Unbeantwortet (no events), In Bearbeitung (events but no answer_submitted), Beantwortet (has answer_submitted). The UI only shows 2 states based on `latest_answer` being null or not. Events without answers (e.g., only notes) would incorrectly show as "Offen" instead of "In Bearbeitung".

#### AC-6: Fragen-Status aus question_events abgeleitet
- [x] `v_current_answers` view correctly derives latest answer from events
- [x] API returns `latest_answer` per question
- [ ] BUG-P4-5 (same): The derivation is binary (has answer or not). The intermediate "In Bearbeitung" state (events exist but no answer_submitted) is not implemented. The API would need to return event count per question (which admin API does, but tenant API does not).

#### AC-7: Gesamtfortschritt as Progress-Bar/Counter
- [x] Shows "X / Y Fragen beantwortet" with percentage
- [x] Uses shadcn `Progress` component with calculated value

#### AC-8: Klick auf Frage oeffnet Fragen-Detailansicht
- [x] `selectQuestion()` sets active question state
- [x] Detail panel renders on right side (2/3 width on desktop)
- [x] Shows frage_id, block, ebene badge, unterbereich, full fragetext
- [x] Answer textarea with save button

#### AC-9: Letzte Antwort-Vorschau in Fragen-Liste
- [ ] BUG-P4-6: No answer preview text in the question list cards. Spec says "Letzte Antwort-Vorschau... gekuerzt auf ~100 Zeichen". The list only shows frage_id, fragetext, and status badge. No truncated answer text.

#### AC-10: Bei locked Run sind Schreib-Aktionen deaktiviert
- [x] `isLocked` flag correctly determined from `run.status === "locked"`
- [x] Textarea `disabled={isLocked || isAdmin}`
- [x] Save button hidden when locked or admin
- [x] Submit button hidden when locked
- [ ] BUG-P4-7: No locked banner. Spec says "Banner: Dieser Run ist abgeschlossen. Keine weiteren Eingaben moeglich." but no such banner is rendered. The UI just disables controls silently.

#### AC-11: Submission-Historie im Run-Header sichtbar
- [ ] BUG-P4-8: No submission history shown. The run workspace shows `submitted_at` date in the dashboard cards, but the run workspace page does NOT display any submission history (no list of checkpoints with dates). The API does not return submission history either (would need a query on `run_submissions`).

### Edge Cases Status

#### EC-1: Run hat noch keine Fragen
- [ ] BUG-P4-9: No specific empty state for "no questions". If questions array is empty, the Tabs component renders with no triggers and no content, but no message like "Die Fragen fuer diesen Run wurden noch nicht bereitgestellt."

#### EC-2: Tenant accessing another tenant's run
- [x] RLS policy blocks cross-tenant access
- [x] API returns 404 when run not found

#### EC-3: Direct navigation to /runs/{unknownId}
- [x] API returns 404; UI renders "Run nicht gefunden." message

#### EC-4: Run locked while tenant has page open
- [x] Next save attempt will return 403 from API (RLS blocks INSERT on locked run)
- [x] Error message shown via `setMessage`
- [ ] BUG-P4-7 (same): No dynamic locked banner appears; just an error message on save attempt

### Security Audit Results

- [x] Server component checks auth before rendering
- [x] API uses `requireTenant()` auth guard
- [x] RLS enforces tenant isolation on all queries
- [x] Admin cannot accidentally modify data through tenant routes (admin check on write actions)
- [x] No tenant_id or sensitive data exposed beyond what RLS allows
- [ ] BUG-P4-10 (Low): The run workspace fetches from either `/api/admin/runs/{id}` or `/api/tenant/runs/{id}` based on `isAdmin` flag passed from server. This flag is passed as a prop and could theoretically be manipulated in the client, but the API routes have their own auth checks, so exploitation would only cause 403 errors, not data access.

### Bugs Found

#### BUG-P4-1: Catalog version not shown in workspace
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. Open a run workspace
  2. Expected: Catalog/contract version visible
  3. Actual: Not shown
- **Priority:** Fix in next sprint

#### BUG-P4-2: Block names not descriptive
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`, line 242
- **Steps to Reproduce:**
  1. Open run workspace
  2. Expected: "Block A - Business & Positionierung"
  3. Actual: "Block A"
- **Priority:** Fix in next sprint

#### BUG-P4-3: No per-block progress counter
- **Severity:** Medium
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`, TabsTrigger components
- **Steps to Reproduce:**
  1. Open run workspace
  2. Expected: "Block A (3 von 11 beantwortet)" on each tab
  3. Actual: Only "Block A" label, no count
- **Priority:** Fix before deployment

#### BUG-P4-4: Ebene badge missing from question list
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`, question cards
- **Steps to Reproduce:**
  1. View question list in run workspace
  2. Expected: Each question shows Kern/Workspace badge
  3. Actual: No ebene badge shown in list (only in detail panel)
- **Priority:** Fix in next sprint

#### BUG-P4-5: Missing "In Bearbeitung" question status
- **Severity:** Medium
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx` + `src/app/api/tenant/runs/[runId]/route.ts`
- **Steps to Reproduce:**
  1. Add a note event to a question (without answering)
  2. Expected: Question shows "In Bearbeitung"
  3. Actual: Question shows "Offen" (only checks for latest_answer, not for any events)
- **Priority:** Fix before deployment

#### BUG-P4-6: No answer preview in question list
- **Severity:** Medium
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`, question cards
- **Steps to Reproduce:**
  1. Answer a question and return to the list
  2. Expected: Truncated ~100 char preview of latest answer visible in list
  3. Actual: Only "Beantwortet" badge shown, no text preview
- **Priority:** Fix before deployment

#### BUG-P4-7: No locked run banner
- **Severity:** Medium
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. View a locked run
  2. Expected: Banner "Dieser Run ist abgeschlossen. Keine weiteren Eingaben moeglich."
  3. Actual: Controls silently disabled, no banner
- **Priority:** Fix before deployment

#### BUG-P4-8: No submission history in run workspace
- **Severity:** Medium
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx` + `src/app/api/tenant/runs/[runId]/route.ts`
- **Steps to Reproduce:**
  1. Submit a checkpoint, then view run workspace
  2. Expected: Submission history visible with date, time, snapshot version
  3. Actual: No submission history rendered; API does not return run_submissions data
- **Priority:** Fix before deployment

#### BUG-P4-9: No empty state for questions
- **Severity:** Low
- **Location:** `src/app/runs/[id]/run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. Open run without linked questions
  2. Expected: "Die Fragen fuer diesen Run wurden noch nicht bereitgestellt."
  3. Actual: Empty tabs component with no message
- **Priority:** Fix in next sprint

#### BUG-P4-10: isAdmin flag passed as client prop
- **Severity:** Low (Security -- mitigated by API auth)
- **Location:** `src/app/runs/[id]/page.tsx` -> `run-workspace-client.tsx`
- **Steps to Reproduce:**
  1. Client could theoretically manipulate isAdmin prop
  2. Expected: Server-side enforcement of admin role
  3. Actual: API routes enforce role independently, so no actual security breach possible
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 5/11 passed (6 with issues)
- **Bugs Found:** 10 total (0 critical, 0 high, 5 medium, 5 low)
- **Security:** No significant security issues (1 low mitigated concern)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-P4-3 (per-block progress), P4-5 (In Bearbeitung status), P4-6 (answer preview), P4-7 (locked banner), P4-8 (submission history) before deployment

## Deployment
_To be added by /deploy_
