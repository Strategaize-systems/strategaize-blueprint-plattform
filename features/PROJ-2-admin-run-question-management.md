# PROJ-2: Admin — Run & Fragenkatalog-Management

## Status: Planned
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

## Dependencies
- Requires: PROJ-1 (Auth & Tenant-Verwaltung) — ein Tenant muss existieren bevor ein Run zugewiesen werden kann

## User Stories
- Als StrategAIze-Admin möchte ich einen Katalog-Snapshot aus dem Exit Ready Blueprint Master importieren, damit die 73 Fragen mit allen Metadaten (Block, Ebene, Flags, Gewichte) im System verfügbar sind.
- Als StrategAIze-Admin möchte ich einen Assessment-Run für einen Tenant erstellen und einen Katalog-Snapshot zuweisen, damit der Tenant die vordefinierten Fragen beantworten kann.
- Als StrategAIze-Admin möchte ich alle Runs über alle Tenants sehen und nach Tenant oder Status filtern, damit ich den Fortschritt auf einen Blick verfolgen kann.
- Als StrategAIze-Admin möchte ich den aktuellen Stand eines Runs sehen (Antworten pro Block, Evidence-Anzahl, Events), damit ich weiss, wie weit der Tenant ist.
- Als StrategAIze-Admin möchte ich einen Run manuell sperren ("locked"), damit nach Abschluss keine weiteren Events mehr hinzugefuegt werden können.
- Als StrategAIze-Admin möchte ich die Fragen eines Runs nach Block und Ebene filtern können, damit ich schnell bestimmte Bereiche pruefen kann.

## Acceptance Criteria
- [ ] Admin kann einen Katalog-Snapshot importieren (Excel-Upload oder JSON) via `POST /api/admin/catalog/snapshots`
- [ ] Importierte Fragen enthalten: `frage_id`, `block`, `ebene`, `unterbereich`, `fragetext`, `owner_dependency`, `deal_blocker`, `sop_trigger`, `ko_hart`, `ko_soft`, `block_weight`, `position`
- [ ] Katalog-Snapshot erhaelt einen SHA256-Hash zur Versionierung
- [ ] Admin kann einen Run erstellen via `POST /api/admin/runs` mit `tenant_id`, `catalog_snapshot_id`, `title`, `description`
- [ ] Neu erstellte Runs haben `status = 'collecting'` und `contract_version = 'v1.0'`
- [ ] Admin kann alle Katalog-Snapshots und deren Versionen einsehen
- [ ] Admin kann Run-Detailseite sehen mit allen 73 Fragen, gruppiert nach Block (A-I), mit letzter Antwort (abgeleitet aus juengstem `answer_submitted` Event in `question_events`) und Evidence-Count pro Frage
- [ ] KO-Fragen (ko_hart/ko_soft) sind visuell hervorgehoben
- [ ] Admin kann einen Run auf `status = 'locked'` setzen; danach keine neuen Events oder Evidence durch den Tenant moeglich
- [ ] Run-Status-Flow: `collecting` -> `submitted` (automatisch bei erstem Checkpoint) -> `locked` (nur durch Admin)
- [ ] Admin kann alle Runs mit Filtern fuer `tenant_id` und `status` auflisten

## Edge Cases
- Admin versucht, Fragen zu einem locked Run hinzuzufuegen? -> Nicht moeglich; Fragen kommen aus dem Katalog-Snapshot, nicht manuell.
- Katalog-Import hat fehlerhafte Daten (fehlende Pflichtfelder)? -> API gibt 400 mit Details zu fehlenden Feldern zurueck.
- Ein Run hat noch keinen Checkpoint und wird locked? -> Erlaubt; Admin kann Runs jederzeit sperren.
- Zwei Imports des gleichen Blueprint-Masters? -> SHA256-Hash erkennt identischen Inhalt; neuer Snapshot wird trotzdem erstellt (fuer Audit-Trail), aber Admin wird informiert.
- Tenant versucht, auf einen Run eines anderen Tenants zuzugreifen? -> RLS blockiert den Query; App zeigt 404.

## Technical Requirements
- Security: `role = 'strategaize_admin'` Check in Middleware UND Supabase RLS
- Fragen sind read-only fuer Tenant-User (kein INSERT/UPDATE/DELETE auf Katalog-Tabellen)
- Admin erstellt keine Fragen manuell — immer via Katalog-Snapshot-Import
- Run-Liste mit `.limit(100)` sofern nicht paginiert
- Katalog-Import validiert alle 73 Fragen gegen das Blueprint-Schema
- Aktuelle Antwort pro Frage wird aus `question_events` abgeleitet (juengstes `answer_submitted` Event); es gibt kein separates Antwort-Feld, das ueberschrieben wird
- Hosting: Supabase self-hosted auf Hetzner + Coolify + Docker Compose (kein Supabase Cloud, kein Vercel)

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)

### Acceptance Criteria Status

#### AC-1: Admin kann Katalog-Snapshot importieren via POST /api/admin/catalog/snapshots
- [ ] BUG-P2-1: CRITICAL -- Endpoint does NOT exist. No `src/app/api/admin/catalog/` directory exists. There is no import mechanism for the question catalog. The questions table schema is defined, but there is no API to populate it.

#### AC-2: Importierte Fragen enthalten alle Metadaten
- [x] Schema correctly defines all required fields: frage_id, block, ebene, unterbereich, fragetext, owner_dependency, deal_blocker, sop_trigger, ko_hart, ko_soft, block_weight, position
- [x] CHECK constraints on block (A-I) and ebene (Kern/Workspace)
- [ ] BUG-P2-1 (same): No import endpoint to validate against

#### AC-3: Katalog-Snapshot erhaelt SHA256-Hash
- [x] Schema has `hash` field on `question_catalog_snapshots` table (NOT NULL)
- [ ] BUG-P2-1 (same): No implementation exists to compute hash during import

#### AC-4: Admin kann Run erstellen via POST /api/admin/runs
- [x] Route exists at `src/app/api/admin/runs/route.ts` (POST handler)
- [x] Zod validation via `createRunSchema`: tenant_id (uuid), catalog_snapshot_id (uuid), title (1-200 chars), description (optional, max 2000)
- [x] Validates tenant exists before creating run
- [x] Validates catalog snapshot exists before creating run
- [x] Uses `requireAdmin()` auth guard
- [x] Logs `run_created` admin_event

#### AC-5: Neu erstellte Runs haben status = 'collecting' und contract_version = 'v1.0'
- [x] Hardcoded in INSERT: `status: "collecting"`, `contract_version: "v1.0"`
- [x] Schema default matches: `DEFAULT 'collecting'`, `DEFAULT 'v1.0'`

#### AC-6: Admin kann alle Katalog-Snapshots einsehen
- [ ] BUG-P2-2: No endpoint exists to list catalog snapshots. There is no `GET /api/admin/catalog/snapshots` route.

#### AC-7: Admin kann Run-Detailseite sehen mit Fragen, Antworten, Evidence
- [x] Route exists at `src/app/api/admin/runs/[runId]/route.ts` (GET handler)
- [x] Loads questions from catalog via catalog_snapshot_id
- [x] Derives current answers from `v_current_answers` view (correctly uses event-sourced answers)
- [x] Counts events per question
- [x] Counts evidence per question via evidence_links
- [ ] BUG-P2-3: Questions not grouped by block in API response -- they are returned as a flat array sorted by position. Grouping is client responsibility but spec says "gruppiert nach Block (A-I)".
- [ ] BUG-P2-4: Evidence count query in admin run detail fetches ALL evidence_links with link_type='question' regardless of run, not filtered to this run's evidence. (`src/app/api/admin/runs/[runId]/route.ts` lines 64-72)

#### AC-8: KO-Fragen sind visuell hervorgehoben
- [x] API returns `ko_hart` and `ko_soft` fields per question
- [ ] BUG-P2-5: No admin UI page exists. There is no `src/app/admin/` directory. Admin users see the same dashboard/run workspace as tenants. KO-highlighting is not implemented in any existing UI.

#### AC-9: Admin kann Run auf locked setzen
- [x] Route exists at `src/app/api/admin/runs/[runId]/lock/route.ts` (PATCH handler)
- [x] Uses `requireAdmin()` auth guard
- [x] Calls `run_lock()` SECURITY DEFINER function via user session
- [x] `run_lock()` validates admin role, run existence, not-already-locked
- [x] Logs `run_locked` admin_event in the function
- [x] RLS INSERT policy on question_events checks `status != 'locked'` -- correctly blocks tenant writes after lock

#### AC-10: Run-Status-Flow: collecting -> submitted -> locked
- [x] Schema CHECK constraint: `status IN ('collecting','submitted','locked')`
- [x] `run_submit()` SECURITY DEFINER: updates status from 'collecting' to 'submitted' only (idempotent for already-submitted)
- [x] `run_lock()` SECURITY DEFINER: locks from any non-locked status
- [x] No tenant UPDATE policy on runs -- transitions only via SECURITY DEFINER functions

#### AC-11: Admin kann Runs mit Filtern auflisten
- [x] GET /api/admin/runs supports `tenant_id` and `status` query params
- [x] `.limit(100)` applied as specified
- [x] Enriches with tenant_name, catalog_version, answered_count, evidence_count

### Edge Cases Status

#### EC-1: Fragen zu locked Run hinzufuegen
- [x] Not applicable -- questions come from catalog snapshot, not manual addition

#### EC-2: Katalog-Import mit fehlerhaften Daten
- [ ] BUG-P2-1 (same): Cannot test -- import endpoint does not exist

#### EC-3: Run locked ohne Checkpoint
- [x] `run_lock()` does NOT check for submissions, only for non-locked status. Correct per spec.

#### EC-4: Duplicate Blueprint Master import
- [ ] BUG-P2-1 (same): Cannot test -- import endpoint does not exist

#### EC-5: Tenant accessing other tenant's run
- [x] RLS policy `tenant_select_own_runs` restricts to `tenant_id = auth.user_tenant_id()`

### Security Audit Results

- [x] All admin routes protected by `requireAdmin()`
- [x] runs.status transitions only via SECURITY DEFINER functions (run_submit, run_lock)
- [x] Tenant has no UPDATE/DELETE policies on runs table
- [x] Admin audit events logged for run_created and run_locked
- [x] Questions are read-only for tenants (no INSERT/UPDATE/DELETE policies)
- [ ] BUG-P2-4 (repeated): Evidence count query in admin run detail route leaks cross-run evidence link counts -- uses unfiltered evidence_links query

### Bugs Found

#### BUG-P2-1: Catalog snapshot import endpoint completely missing
- **Severity:** Critical
- **Location:** Expected at `src/app/api/admin/catalog/snapshots/route.ts` -- file does not exist
- **Steps to Reproduce:**
  1. Try to import a catalog snapshot
  2. Expected: POST /api/admin/catalog/snapshots accepts Excel/JSON and creates snapshot + questions
  3. Actual: No such endpoint exists. Questions table cannot be populated via the application.
- **Impact:** Without this endpoint, no runs can be created with valid questions. The entire workflow is blocked.
- **Priority:** Fix before deployment (BLOCKER)

#### BUG-P2-2: No endpoint to list catalog snapshots
- **Severity:** High
- **Location:** Expected at `src/app/api/admin/catalog/snapshots/route.ts` (GET handler)
- **Steps to Reproduce:**
  1. Admin needs to see available catalogs to create a run
  2. Expected: GET /api/admin/catalog/snapshots returns list
  3. Actual: No endpoint exists
- **Priority:** Fix before deployment

#### BUG-P2-3: Questions not grouped by block in API
- **Severity:** Low
- **Location:** `src/app/api/admin/runs/[runId]/route.ts`
- **Steps to Reproduce:**
  1. Call GET /api/admin/runs/{runId}
  2. Expected: Questions grouped by block A-I
  3. Actual: Flat array sorted by position (client can group, but spec says "gruppiert")
- **Priority:** Nice to have (client-side grouping works)

#### BUG-P2-4: Evidence count query leaks cross-run data
- **Severity:** Medium (Data integrity)
- **Location:** `src/app/api/admin/runs/[runId]/route.ts`, lines 64-72
- **Steps to Reproduce:**
  1. Call GET /api/admin/runs/{runId}
  2. Expected: evidence_count per question reflects only this run's evidence
  3. Actual: Query fetches ALL evidence_links with link_type='question' without filtering by run_id. Evidence from other runs may inflate counts.
- **Code:** `await adminClient!.from("evidence_links").select("link_id").eq("link_type", "question")` -- missing `.eq("run_id", runId)` or equivalent join filter
- **Priority:** Fix before deployment

#### BUG-P2-5: No admin UI pages
- **Severity:** High
- **Location:** No `src/app/admin/` directory exists
- **Steps to Reproduce:**
  1. Admin logs in
  2. Expected: Admin-specific pages for tenant management, run management, catalog import
  3. Actual: Admin sees the same dashboard and run workspace as tenants. No admin-specific UI.
- **Note:** Admin functionality works via API routes but there is no dedicated admin UI
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 6/11 passed (AC-1 failed critical, AC-6 failed, AC-7 partial, AC-8 partial)
- **Bugs Found:** 5 total (1 critical, 2 high, 1 medium, 1 low)
- **Security:** 1 medium data-leak issue in evidence count query
- **Production Ready:** NO
- **Recommendation:** BUG-P2-1 (catalog import) is a BLOCKER -- without it, the entire question workflow is non-functional. Fix P2-1, P2-2, P2-4, and P2-5 before deployment.

---

## Phase 1 Bugfix Re-Test Results

**Re-Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds, all new routes appear in build output)

### BUG-P2-1 RETEST: Catalog snapshot import endpoint (CRITICAL)

**Original Bug:** Endpoint `POST /api/admin/catalog/snapshots` did not exist. No import mechanism for the question catalog.

**Fix Status: FIXED**

**Verification Details:**

1. **Route exists:** `src/app/api/admin/catalog/snapshots/route.ts` now provides both GET (list snapshots) and POST (import catalog) handlers. Both appear in `npm run build` output as `f /api/admin/catalog/snapshots`.

2. **GET handler (also fixes BUG-P2-2):**
   - [x] Returns all snapshots from `question_catalog_snapshots` table
   - [x] Selects: id, version, blueprint_version, question_count, hash, created_at
   - [x] Ordered by created_at DESC (newest first)
   - [x] Protected by `requireAdmin()` auth guard

3. **POST handler:**
   - [x] Auth: Protected by `requireAdmin()`
   - [x] JSON body parsing with try/catch (returns 400 on invalid JSON)
   - [x] Zod validation via `importCatalogSchema`:
     - `version`: string, min 1 char
     - `blueprint_version`: string, min 1 char
     - `questions`: array of `questionImportItem`, min 1 item
   - [x] Each `questionImportItem` validates:
     - `frage_id`: string, min 1
     - `block`: enum A-I
     - `ebene`: enum Kern/Workspace
     - `unterbereich`: string, min 1
     - `fragetext`: string, min 1
     - `owner_dependency`, `deal_blocker`, `sop_trigger`, `ko_hart`, `ko_soft`: boolean, default false
     - `block_weight`: number, 0-9.9
     - `position`: integer, min 1

4. **SHA256 Hash:**
   - [x] Computed via Node.js `createHash("sha256")` on JSON-serialized question data
   - [x] Hash includes frage_id, block, ebene, fragetext, position per question
   - [x] Stored in `question_catalog_snapshots.hash` (NOT NULL in schema)

5. **Version Uniqueness:**
   - [x] Application-level check: queries for existing snapshot with same version, returns 409 CONFLICT if found
   - [x] Database-level backup: `question_catalog_snapshots.version` has `UNIQUE` constraint in schema

6. **Rollback on Question Insert Failure:**
   - [x] If question INSERT fails, the snapshot is deleted: `adminClient.from("question_catalog_snapshots").delete().eq("id", snapshot.id)`
   - [x] Questions have `ON DELETE CASCADE` from `question_catalog_snapshots`, so any partially inserted questions are also removed
   - [x] Error message includes the original error: `Question insert failed: ${qError.message}`

7. **Audit Logging:**
   - [x] Logs `catalog_imported` event via `log_admin_event` RPC
   - [x] `catalog_imported` is in the CHECK constraint on `admin_events.event_type`
   - [x] Payload includes: version, blueprint_version, question_count, hash

8. **Questions endpoint:**
   - [x] `GET /api/admin/catalog/snapshots/[snapshotId]/questions` exists
   - [x] Verifies snapshot exists (returns 404 if not)
   - [x] Returns all questions for the snapshot, ordered by position
   - [x] Protected by `requireAdmin()`

**Remaining Issues Found:**

- [x] **NEW-P2-1a (Low):** The `log_admin_event` RPC call omits `p_tenant_id` and `p_run_id` parameters. These default to NULL in the function signature, so the call succeeds, but the catalog_imported event has no tenant or run context. This is acceptable for catalog-level operations.
- [ ] **NEW-P2-1b (Low/Performance):** No index on `profiles.email` column. The invite route's targeted email lookup (`profiles.eq("email", email)`) will do a sequential scan. Not critical for small user bases but will degrade with scale.
- [ ] **NEW-P2-1c (Low):** Hash computation only includes frage_id, block, ebene, fragetext, position. It excludes flags (ko_hart, ko_soft, deal_blocker, etc.) and block_weight. Two catalogs with identical questions but different flags would produce the same hash. This is a design choice but worth noting.

**Verdict: BUG-P2-1 is FIXED. The catalog snapshot import is fully functional with proper Zod validation, SHA256 hashing, version uniqueness checks, and rollback on failure.**

---

### BUG-P2-4 RETEST: Evidence count leak cross-run data (MEDIUM)

**Original Bug:** Evidence count query in admin run detail fetched ALL evidence_links with link_type='question' regardless of run. Evidence from other runs could inflate counts.

**Fix Status: FIXED**

**Verification Details:**

1. **Old code (from original QA report):**
   ```
   await adminClient.from("evidence_links").select("link_id").eq("link_type", "question")
   ```
   -- No run filtering at all.

2. **New code (`src/app/api/admin/runs/[runId]/route.ts`, lines 63-81):**
   - [x] Step 1: Fetches all `evidence_items` for this specific run: `.from("evidence_items").select("id").eq("run_id", runId)`
   - [x] Step 2: Builds a `Set<string>` of evidence item IDs for this run
   - [x] Step 3: Fetches all evidence_links with `link_type='question'`
   - [x] Step 4: Filters in JS: `.filter((e) => runEvidenceIds.has(e.evidence_item_id))`
   - [x] Only evidence items belonging to this run contribute to the count

3. **Assessment:**
   - [x] The fix correctly scopes evidence counts to the current run
   - [x] The two-step approach (fetch evidence_items by run, then filter links) is correct because `evidence_links` has no direct `run_id` column -- it links through `evidence_item_id`
   - [ ] **NEW-P2-4a (Low/Performance):** The evidence_links query still fetches ALL links of type 'question' across all runs/tenants, then filters in JS. For large datasets, this could be slow. A Supabase JOIN or `in()` filter on `evidence_item_id` would be more efficient. However, this runs on `adminClient` (service_role), not via RLS, so it is functionally correct.

**Verdict: BUG-P2-4 is FIXED. Evidence counts are now correctly scoped to the current run.**

---

## Phase 2 Low-Severity Fix Verification (Full QA Sweep)

**Re-Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)
**Scope:** Verify FIX-1 (catalog import hash includes ALL question fields) and FIX-3 (evidence links filtered at DB level via .in())

### FIX-1 RETEST: Catalog import hash includes ALL question fields

**Original Issue (NEW-P2-1c, Low):** Hash computation only included frage_id, block, ebene, fragetext, position. It excluded flags (ko_hart, ko_soft, deal_blocker, etc.) and block_weight. Two catalogs with identical questions but different flags would produce the same hash.

**Fix Status: FIXED**

**Verification Details (`src/app/api/admin/catalog/snapshots/route.ts`, lines 59-76):**

1. **Hash now includes ALL question fields:**
   - [x] `frage_id` -- included
   - [x] `block` -- included
   - [x] `ebene` -- included
   - [x] `unterbereich` -- included (was previously MISSING)
   - [x] `fragetext` -- included
   - [x] `owner_dependency` -- included (was previously MISSING)
   - [x] `deal_blocker` -- included (was previously MISSING)
   - [x] `sop_trigger` -- included (was previously MISSING)
   - [x] `ko_hart` -- included (was previously MISSING)
   - [x] `ko_soft` -- included (was previously MISSING)
   - [x] `block_weight` -- included (was previously MISSING)
   - [x] `position` -- included

2. **Hash computation method:**
   - [x] `JSON.stringify()` on array of question objects with all 12 fields
   - [x] `createHash("sha256").update(catalogContent).digest("hex")`
   - [x] Stored in `question_catalog_snapshots.hash` (NOT NULL constraint in schema)

3. **Completeness check:**
   - [x] The hash object now maps 1:1 with the `questionImportItem` Zod schema fields
   - [x] All fields from the Zod schema are included: frage_id, block, ebene, unterbereich, fragetext, owner_dependency, deal_blocker, sop_trigger, ko_hart, ko_soft, block_weight, position
   - [x] Two catalogs that differ ONLY in flags (e.g., ko_hart=true vs ko_hart=false) will now produce different hashes

4. **Code comment confirms intent (line 59):**
   - [x] Comment reads: `// Compute hash of catalog content for integrity (ALL question fields)`

**Verdict: FIX-1 is VERIFIED. The SHA256 hash now covers all 12 question fields, preventing false hash collisions between catalogs that differ only in flags or weights.**

---

### FIX-3 RETEST: Evidence links filtered at DB level via .in() not JS

**Original Issue (NEW-P2-4a, Low/Performance):** The admin run detail route fetched ALL evidence_links with link_type='question' across all runs/tenants, then filtered in JS. For large datasets, this was inefficient.

**Fix Status: FIXED (admin route) / PARTIALLY FIXED (tenant route)**

**Verification Details:**

1. **Admin route (`src/app/api/admin/runs/[runId]/route.ts`, lines 63-83):**
   - [x] Step 1: Fetches evidence_items for this run: `.from("evidence_items").select("id").eq("run_id", runId)` (line 64-67)
   - [x] Step 2: Extracts IDs into array: `runEvidenceIds = (runEvidenceItems ?? []).map((e) => e.id)` (line 69)
   - [x] Step 3: Guard clause for empty array: `if (runEvidenceIds.length > 0)` (line 73) -- prevents `.in()` with empty array (which would error in PostgREST)
   - [x] Step 4: DB-level filter: `.in("evidence_item_id", runEvidenceIds)` (line 78)
   - [x] No JS `.filter()` used -- filtering happens entirely at the database level
   - [x] This is a significant improvement: PostgREST translates `.in()` to a SQL `WHERE evidence_item_id IN (...)` clause

2. **Tenant route (`src/app/api/tenant/runs/[runId]/route.ts`, lines 46-63):**
   - [ ] **OBSERVATION:** The tenant route still uses JS-level filtering:
     - Fetches ALL evidence_links with `link_type='question'` (line 51-54)
     - Filters in JS: `.filter((l) => runEvidenceIds.has(l.evidence_item_id))` (line 60)
   - [x] **Mitigating factor:** The tenant route uses the user session (not adminClient), so RLS restricts evidence_links to the tenant's own items via the `tenant_select_own_evidence_links` policy. This limits the scope of the JS filter to only the tenant's evidence, not all evidence across the platform.
   - [ ] **NEW-P2-4b (Low/Performance):** For consistency and performance, the tenant route should also use `.in()` DB-level filtering, matching the approach used in the admin route. This is not a correctness issue (RLS provides tenant isolation) but is a performance concern for tenants with many runs.

3. **Empty array guard:**
   - [x] Admin route correctly guards against `.in()` with empty array (line 73: `if (runEvidenceIds.length > 0)`)
   - [x] This prevents a PostgREST/Supabase error that would occur with `.in("field", [])`

**Verdict: FIX-3 is VERIFIED for the admin route. The evidence_links query now uses `.in()` at the DB level, eliminating the JS-level filter. The tenant route still uses JS filtering but is mitigated by RLS. A minor consistency improvement for the tenant route is noted as NEW-P2-4b (Low).**

---

## Deployment
_To be added by /deploy_
