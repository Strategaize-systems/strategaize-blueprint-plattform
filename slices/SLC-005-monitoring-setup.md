# SLC-005 — Monitoring & Observability Setup (High/Medium)

## Feature
Querschnitt — Betriebssicherheit

## Priority
High (ISSUE-004) + Medium (ISSUE-011, ISSUE-015, ISSUE-016)

## Issues addressed
- ISSUE-004: Kein Error-Tracking in Production
- ISSUE-011: N+1 Queries in Admin-List-Endpoints
- ISSUE-015: Evidence Upload Partial Failure hinterlässt verwaiste Records
- ISSUE-016: console.error Debug-Leftovers in Server Actions

## Scope
Minimales Error-Tracking aufsetzen, N+1 Queries optimieren, Logging vereinheitlichen.

## Out of scope
- Vollständiges APM/Performance-Monitoring
- Sentry Pro Features
- Dashboard oder Alerting

## Micro-Tasks

### MT-1: Sentry Basis-Setup
- `npm install @sentry/nextjs`
- **Neue Dateien:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- **Datei:** `/next.config.ts` — Sentry Plugin einbinden (withSentryConfig)
- DSN als Environment-Variable: `SENTRY_DSN`
- `.env.deploy.example` aktualisieren
- Source-Maps nur in Production
- **Verifikation:** Absichtlicher Fehler in /api/health werfen, prüfen ob er in Sentry erscheint

### MT-2: console.error durch strukturiertes Logging ersetzen
- **Dateien:** `/src/app/login/actions.ts`, `/src/app/auth/set-password/actions.ts`
- console.error-Statements durch Sentry.captureException() ersetzen
- Fallback: wenn kein Sentry DSN konfiguriert, console.error beibehalten
- **Verifikation:** Login-Fehler erscheint in Sentry statt nur in Server-Log

### MT-3: N+1 Queries in Admin-Runs optimieren
- **Datei:** `/src/app/api/admin/runs/route.ts`
- Statt pro Run 2 Queries: einen JOIN oder Batch-Query für alle Runs gleichzeitig
- Answered-Count: `SELECT run_id, COUNT(*) FROM v_current_answers WHERE run_id IN (...) GROUP BY run_id`
- Evidence-Count: `SELECT run_id, COUNT(*) FROM evidence_items WHERE run_id IN (...) GROUP BY run_id`
- **Verifikation:** Network-Tab: /api/admin/runs Antwortzeit messen (vorher vs nachher)

### MT-4: N+1 Queries in Admin-Tenants optimieren
- **Datei:** `/src/app/api/admin/tenants/route.ts`
- Gleicher Ansatz wie MT-3: Batch-Queries statt pro-Tenant
- **Verifikation:** Analog zu MT-3

### MT-5: Evidence Upload Cleanup bei Storage-Fehler
- **Datei:** `/src/app/api/tenant/runs/[runId]/evidence/route.ts`
- Wenn Storage-Upload fehlschlägt: evidence_items-Record wieder löschen (via adminClient)
- **Verifikation:** Storage-Upload simuliert fehlschlagen → kein verwaister DB-Record

## Acceptance Criteria
- Sentry fängt unbehandelte Fehler in Production
- Login/Set-Password Errors in Sentry sichtbar
- Admin-Runs und Admin-Tenants Listen laden ohne N+1 Pattern
- Evidence-Upload hinterlässt keine verwaisten Records bei Storage-Fehler

## Estimated Complexity
Mittel-Groß — Sentry-Setup, 2 API-Route-Optimierungen, 1 Cleanup-Fix, Logging-Umstellung

## Dependencies
- SLC-001 muss zuerst abgeschlossen sein (Admin-Seiten müssen funktionieren um zu testen)
