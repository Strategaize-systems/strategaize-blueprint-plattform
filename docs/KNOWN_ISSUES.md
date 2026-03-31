# Known Issues

> Systematische QA vom 2026-03-25. Findings aus Code-Review aller SQL-Dateien, API-Routes, Pages, Components und Production-Docs.

---

## Blocker

### ISSUE-001 — Permission denied for table tenants
- Status: resolved
- Severity: Blocker
- Area: RLS / Database
- Summary: service_role hatte BYPASSRLS aber keine Table-Level GRANTs. PostgreSQL BYPASSRLS umgeht nur RLS-Policies, nicht GRANT/REVOKE. Fix: GRANT ALL ON ALL TABLES/SEQUENCES/ROUTINES TO service_role. Root Cause in sql/rls.sql gefixt und ins Dev System Playbook aufgenommen (Problem 14).
- Impact: Alle Admin-Seiten (Tenants, Runs, Catalog) waren nicht funktional
- Next Action: Keine — behoben am 2026-03-26

---

## High

### ISSUE-002 — Keine Tests im gesamten Repository
- Status: open
- Severity: High
- Area: Testing
- Summary: 89 TypeScript-Dateien, 16 API-Endpunkte, 10 DB-Tabellen — kein einziger Test. Kein __tests__-Verzeichnis, keine *.test.ts-Dateien, kein Test-Framework konfiguriert.
- Impact: Regressionen bei Fixes nicht erkennbar, kein automatisiertes Sicherheitsnetz
- Next Action: Test-Framework aufsetzen (vitest), kritische API-Routes testen

### ISSUE-003 — Kein Rate-Limiting auf API
- Status: resolved
- Severity: High
- Area: Security
- Summary: In-Memory Rate-Limiting (5 Versuche / 15 Min) für Login und Set-Password Server Actions implementiert. Kein Redis nötig für MVP. Weiterführende Rate-Limits auf API-Endpoints sind V1.1-Scope.
- Impact: Login und Set-Password sind jetzt gegen Brute-Force geschützt
- Next Action: Keine — behoben am 2026-03-26 (SLC-002)

### ISSUE-004 — Kein Error-Tracking in Production
- Status: deferred
- Severity: High
- Area: Monitoring
- Summary: Sentry-Integration auf V1.1 verschoben (BL-017). Erst relevant wenn erste Kunden auf der Plattform sind. Sentry.io Free Tier geplant (5k Errors/Monat, externer Dienst — akzeptabel für Monitoring).
- Impact: Produktionsfehler bleiben vorerst nur in Server-Logs sichtbar
- Next Action: BL-017 in V1.1 implementieren

### ISSUE-005 — ARCHITECTURE.md funktional leer und widersprüchlich
- Status: resolved
- Severity: High
- Area: Documentation
- Summary: ARCHITECTURE.md komplett neu geschrieben mit korrekten Fakten: 10-Service Docker Compose, Hetzner/Coolify, Kong Gateway, Dual-URL-Strategie, Auth-Architektur, Daten-Architektur. Kein "Vercel" mehr.
- Impact: Architektur-Doku ist jetzt akkurat und nutzbar
- Next Action: Keine — behoben am 2026-03-26 (SLC-003)

### ISSUE-006 — Production-Docs beschreiben nicht-implementierte Massnahmen
- Status: resolved
- Severity: High
- Area: Documentation
- Summary: Alle 5 Production-Docs haben jetzt explizite Status-Header (PLANNED/PARTIALLY IMPLEMENTED/IMPLEMENTED). Keine falschen Annahmen mehr möglich.
- Impact: Klare Unterscheidung was implementiert ist und was nicht
- Next Action: Keine — behoben am 2026-03-26 (SLC-003)

### ISSUE-007 — evidence_links INSERT-Policy validiert link_id Ownership nicht
- Status: resolved
- Severity: High
- Area: RLS / Security
- Summary: RLS-Policy tenant_insert_evidence_links erweitert mit link_id Ownership-Check. link_type='run' prüft jetzt ob Run dem eigenen Tenant gehört, link_type='question' prüft ob Question über einen eigenen Run erreichbar ist.
- Impact: Cross-Tenant-Datenverknüpfung nicht mehr möglich
- Next Action: Keine — behoben am 2026-03-26 (SLC-002)

---

## Medium

### ISSUE-008 — STATE.md war veraltet
- Status: resolved
- Severity: Medium
- Area: Documentation
- Summary: STATE.md sagte "QA vor Deployment" aber Projekt war bereits live deployed. Wurde am 2026-03-25 korrigiert auf post-launch.
- Next Action: Keine — behoben

### ISSUE-009 — handle_new_user defaultet ungültige Rollen stillschweigend
- Status: resolved
- Severity: Medium
- Area: Database / Security
- Summary: handle_new_user() wirft jetzt RAISE EXCEPTION mit ERRCODE P0400 bei ungültigen Rollen statt silent auf tenant_owner zu defaulten.
- Impact: Ungültige Rollen werden sofort abgelehnt
- Next Action: Keine — behoben am 2026-03-26 (SLC-002)

### ISSUE-010 — Append-only Enforcement nur über RLS
- Status: resolved
- Severity: Medium
- Area: Database
- Summary: prevent_modify() Trigger-Function erstellt. BEFORE UPDATE OR DELETE Trigger auf allen 5 append-only Tabellen. DB-Level Enforcement zusätzlich zu RLS.
- Impact: Events können auch bei BYPASSRLS nicht mehr modifiziert werden
- Next Action: Keine — behoben am 2026-03-26 (SLC-004)

### ISSUE-011 — N+1 Queries in Admin-List-Endpoints
- Status: resolved
- Severity: Medium
- Area: Performance
- Summary: Admin-Runs und Admin-Tenants GET-Endpoints auf Batch-Queries umgestellt. Statt 2N+1 Queries jetzt 3 Queries (Basis + answered counts + evidence/run counts). Map-basiertes Enrichment.
- Impact: Konstante Query-Anzahl unabhängig von Datenmenge
- Next Action: Keine — behoben am 2026-03-26 (SLC-005)

### ISSUE-012 — RELEASES.md leer trotz Live-Deployment
- Status: resolved
- Severity: Medium
- Area: Documentation
- Summary: REL-001 (MVP-1 Initial Deployment) im Cockpit-kompatiblen Format eingetragen.
- Next Action: Keine — behoben am 2026-03-26 (SLC-003)

### ISSUE-013 — MIGRATIONS.md leer trotz vollem Schema
- Status: resolved
- Severity: Medium
- Area: Documentation
- Summary: 3 Migrationen dokumentiert: MIG-001 (Baseline Schema), MIG-002 (service_role GRANTs), MIG-003 (evidence_links Policy + handle_new_user Fix). Cockpit-kompatibles Format.
- Next Action: Keine — behoben am 2026-03-26 (SLC-003)

### ISSUE-014 — evidence_links hat keine tenant_id-Spalte
- Status: resolved
- Severity: Medium
- Area: Database / Security
- Summary: tenant_id-Spalte zu evidence_links hinzugefügt (NOT NULL, FK tenants RESTRICT). RLS-Policies vereinfacht auf direkte tenant_id-Prüfung. Alle 3 INSERT-Stellen in API-Routes aktualisiert.
- Impact: Direkte Tenant-Isolation statt fragiler Subquery
- Next Action: Keine — behoben am 2026-03-26 (SLC-004). Backfill auf Production nötig.

---

## Low

### ISSUE-015 — Evidence Upload Partial Failure hinterlässt verwaiste Records
- Status: resolved
- Severity: Low
- Area: Backend
- Summary: Upload-Flow umgebaut auf Upload-First: Storage-Upload passiert VOR dem DB-INSERT. Bei Upload-Fehler wird kein DB-Record erstellt. Bei DB-Insert-Fehler wird die hochgeladene Datei aus Storage gelöscht. Keine verwaisten Records mehr möglich.
- Next Action: Keine — behoben am 2026-03-26 (SLC-005)

### ISSUE-016 — console.error Debug-Leftovers in Server Actions
- Status: deferred
- Severity: Low
- Area: Code Quality
- Summary: console.error bleibt vorerst bestehen. Wird in V1.1 durch Sentry.captureException ersetzt (BL-018, abhängig von BL-017).
- Next Action: BL-018 in V1.1 implementieren

### ISSUE-017 — run_submit validiert Antwort-Vollständigkeit nicht
- Status: open
- Severity: Low
- Area: Business Logic
- Summary: run_submit() prüft nur ob mindestens ein Event existiert, nicht ob alle Pflichtfragen beantwortet sind. Für MVP-1 akzeptabel.
- Next Action: Optional Pflichtfragen-Check ergänzen

### ISSUE-018 — questions FK nutzt CASCADE statt RESTRICT
- Status: resolved
- Severity: Low
- Area: Database
- Summary: FK von questions.catalog_snapshot_id auf ON DELETE RESTRICT geändert. Catalog-Snapshots können nicht mehr versehentlich gelöscht werden.
- Impact: Immutabilitäts-Prinzip durchgesetzt
- Next Action: Keine — behoben am 2026-03-26 (SLC-004). FK-Änderung auf Production nötig.

---

## Final-Check Findings (2026-03-26)

### ISSUE-019 — GoTrue Invite-Link zeigt auf internen Docker-Hostname
- Status: resolved
- Severity: High
- Area: Auth / Deployment
- Summary: GoTrue nutzt den Request Host-Header (nicht API_EXTERNAL_URL) für Invite-Verify-Links. Fix: GoTrue E-Mail-Versand komplett umgangen — generateLink API für Token, nodemailer für eigenen E-Mail-Versand, Next.js Rewrite-Rule für /auth/v1/ → Kong. Ausführliche Dokumentation aller gescheiterten Ansätze im Self-Hosted Playbook (Problem 5).

### ISSUE-020 — Keine automatisierten Tests vorhanden
- Status: open
- Severity: Medium
- Area: Testing
- Summary: Identisch mit ISSUE-002. 89 TS-Dateien, 0 Tests. Final-Check bestätigt: Regressionsrisiko bei zukünftigen Änderungen.
- Impact: Keine automatische Erkennung von Regressionen bei Deployments
- Next Action: Test-Framework (vitest) als eigenen Slice in V1.1 oder V2 planen

### ISSUE-021 — run_submit Funktions-Signatur Konflikt nach Block-Migration
- Status: resolved
- Severity: Blocker
- Area: Database / Migration
- Summary: Nach Migration 003 (Block-Checkpoints) findet PostgREST die Funktion run_submit nicht im Schema-Cache, weil die alte 2-Parameter-Signatur nicht gedroppt wurde. Fix: DROP FUNCTION IF EXISTS run_submit(uuid, text) vor CREATE OR REPLACE.
- Next Action: Migration nochmal auf Hetzner ausfuehren mit DROP FUNCTION zuerst.

### ISSUE-022 — Textarea wird nach Antwort speichern nicht geleert
- Status: resolved
- Severity: Low
- Area: Frontend / UX
- Summary: Nach erfolgreichem Speichern einer Antwort blieb der Text in der Textarea stehen. Fix: setAnswerText("") nach erfolgreichem Save.

### ISSUE-023 — RLS Policies referenzierten tenant_owner nach Migration
- Status: resolved
- Severity: Blocker
- Area: Database / RLS
- Summary: Nach Migration 004 (tenant_owner → tenant_admin) referenzierten 7 RLS-Policies noch tenant_owner. Tenant-User konnten keine Runs sehen. Fix: Alle Policies auf tenant_admin aktualisiert, alte Policies gedroppt.

### ISSUE-024 — Coolify Build OOM bei laufendem Ollama
- Status: resolved
- Severity: High
- Area: Deployment / Infrastructure
- Summary: Next.js Build schlaegt fehl wenn Ollama + Qwen 14B im RAM geladen ist (~12GB). Server hat 32GB aber Build braucht auch viel RAM. Workaround: Ollama vor Build stoppen, nach Build starten. Langfristig: Node.js Memory-Limit im Dockerfile erhoehen.

### ISSUE-026 — Evidence File-Upload RLS-Violation (Storage Service)
- Status: resolved
- Severity: Blocker
- Area: Storage / Supabase Self-Hosted
- Summary: File-Upload fuer Evidence schlug fehl mit "new row violates row-level security policy". Root Cause: Supabase Storage Service nutzt supabase_storage_admin Rolle, die keine Membership in service_role hatte. Fix: GRANT service_role TO supabase_storage_admin auf Production-DB. Behoben am 2026-03-29.

### ISSUE-025 — DOCX-Parsing nicht implementiert
- Status: resolved
- Severity: Low
- Area: Backend / Document Parsing
- Summary: DOCX-Textextraktion mit mammoth Library implementiert. extractText() in document-parser.ts unterstuetzt jetzt PDF, DOCX, TXT und CSV. Behoben am 2026-03-30.

### ISSUE-027 — Set-Password-Seite zeigt immer Deutsch (statt Tenant-Sprache)
- Status: resolved
- Severity: High
- Area: i18n / Auth
- Summary: Set-Password-Seite nach Invite zeigte immer Deutsch. Fix: Invite-Link enthaelt jetzt locale-Parameter, Callback-Route setzt NEXT_LOCALE Cookie vor Redirect zu Set-Password. Behoben am 2026-03-31.

### ISSUE-028 — Invite-Flow: Admin-Session kollidiert mit Set-Password
- Status: resolved
- Severity: Blocker
- Area: Auth / Session
- Summary: Admin-Session im selben Browser kollidierte mit Set-Password-Flow. GoTrue meldete "New password should be different from old password". Fix: Callback-Route ruft jetzt signOut() vor verifyOtp() auf. Supabase-Client schreibt Cookies direkt auf die Redirect-Response statt ueber cookies() API. Behoben am 2026-03-31.
