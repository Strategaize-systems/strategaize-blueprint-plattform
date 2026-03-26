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
- Status: open
- Severity: High
- Area: Monitoring
- Summary: docs/production/error-tracking.md beschreibt Sentry-Integration — nichts davon existiert. Kein @sentry/nextjs, keine Config, kein DSN.
- Impact: Produktionsfehler bleiben unbemerkt, User-Probleme nicht sichtbar
- Next Action: Sentry oder alternatives Error-Tracking aufsetzen

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
- Status: open
- Severity: Medium
- Area: Performance
- Summary: /api/admin/runs macht pro Run 2 extra Queries (answered count + evidence count). /api/admin/tenants macht pro Tenant 2 Queries (owner email + run count). Bei 50 Tenants = 100 extra Queries.
- Impact: Performance-Degradation bei wachsender Datenmenge
- Next Action: DB-Views oder Joins statt N+1

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
- Status: open
- Severity: Low
- Area: Backend
- Summary: Bei Evidence-File-Upload wird zuerst DB-Record erstellt, dann Storage-Upload. Bei Storage-Fehler bleibt evidence_items-Record ohne file_path.
- Next Action: Cleanup-Logic oder Transaktionshandling ergänzen

### ISSUE-016 — console.error Debug-Leftovers in Server Actions
- Status: open
- Severity: Low
- Area: Code Quality
- Summary: login/actions.ts und auth/set-password/actions.ts enthalten console.error Statements ohne strukturierte Logging-Strategie.
- Next Action: Evaluieren ob console.error für Production akzeptabel

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
