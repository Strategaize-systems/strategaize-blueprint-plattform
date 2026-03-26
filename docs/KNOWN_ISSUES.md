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
- Status: open
- Severity: High
- Area: Documentation
- Summary: docs/ARCHITECTURE.md enthält nur Starter-Kit-Defaults. Sagt "Deployment: Vercel" obwohl Projekt Self-Hosted auf Hetzner ist. Keine Beschreibung der tatsächlichen 10-Service Docker-Compose Architektur.
- Impact: Architektur-Doku irreführend für zukünftige Sessions und Entwickler
- Next Action: /architecture Skill oder manuell tatsächliche Architektur dokumentieren

### ISSUE-006 — Production-Docs beschreiben nicht-implementierte Massnahmen
- Status: open
- Severity: High
- Area: Documentation
- Summary: 5 Dateien in docs/production/ beschreiben Best-Practices die grösstenteils nicht implementiert sind (database-optimization, error-tracking, performance, rate-limiting). Nur security-headers.md ist tatsächlich in next.config.ts implementiert.
- Impact: Falsche Sicherheitsannahmen, jemand liest Docs und glaubt System ist gehärtet
- Next Action: Docs als Planned markieren oder löschen

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
- Status: open
- Severity: Medium
- Area: Database
- Summary: question_events, evidence_items, evidence_links, run_submissions, admin_events sind append-only designt. Enforcement nur über fehlende UPDATE/DELETE RLS-Policies, kein DB-Trigger.
- Impact: Bei RLS-Deaktivierung oder BYPASSRLS-Bug können Events geändert werden
- Next Action: DB-Trigger BEFORE UPDATE OR DELETE auf Event-Tabellen

### ISSUE-011 — N+1 Queries in Admin-List-Endpoints
- Status: open
- Severity: Medium
- Area: Performance
- Summary: /api/admin/runs macht pro Run 2 extra Queries (answered count + evidence count). /api/admin/tenants macht pro Tenant 2 Queries (owner email + run count). Bei 50 Tenants = 100 extra Queries.
- Impact: Performance-Degradation bei wachsender Datenmenge
- Next Action: DB-Views oder Joins statt N+1

### ISSUE-012 — RELEASES.md leer trotz Live-Deployment
- Status: open
- Severity: Medium
- Area: Documentation
- Summary: Projekt ist live deployed aber docs/RELEASES.md enthält nur Platzhalter.
- Next Action: MVP-1 Deployment als ersten Release-Record eintragen

### ISSUE-013 — MIGRATIONS.md leer trotz vollem Schema
- Status: open
- Severity: Medium
- Area: Documentation
- Summary: 10 Tabellen, 1 View, 4 Functions, RLS-Policies — aber docs/MIGRATIONS.md ist leer.
- Next Action: Initiales Schema als Baseline-Migration dokumentieren

### ISSUE-014 — evidence_links hat keine tenant_id-Spalte
- Status: open
- Severity: Medium
- Area: Database / Security
- Summary: evidence_links hat keine eigene tenant_id-Spalte. Tenant-Isolation nur über Subquery auf evidence_items. Fragiles indirektes Isolation-Pattern.
- Impact: Bei Bugs in evidence_items könnte evidence_links Isolation brechen
- Next Action: tenant_id-Spalte zu evidence_links hinzufügen (Breaking Change, nach ISSUE-001 Fix)

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
- Status: open
- Severity: Low
- Area: Database
- Summary: questions zu catalog_snapshots FK nutzt CASCADE. Löschen eines Snapshots kaskadiert auf alle Questions und indirekt referenzierte Events.
- Impact: Widerspricht Immutabilitäts-Prinzip
- Next Action: FK auf RESTRICT ändern
