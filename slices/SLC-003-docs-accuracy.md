# SLC-003 — Documentation Accuracy (High)

## Feature
Keine spezifische Feature — Querschnitt-Dokumentation

## Priority
High — Irreführende Dokumentation, falsche Architektur-Angaben

## Issues addressed
- ISSUE-005: ARCHITECTURE.md funktional leer und widersprüchlich
- ISSUE-006: Production-Docs beschreiben nicht-implementierte Maßnahmen
- ISSUE-012: RELEASES.md leer trotz Live-Deployment
- ISSUE-013: MIGRATIONS.md leer trotz vollem Schema

## Scope
Bestehende Docs auf den tatsächlichen Stand bringen. Kein neuer Code.

## Out of scope
- Vollständige /architecture Skill-Ausführung (zu umfangreich für Fix-Slice)
- Neue Features oder Implementierungen

## Micro-Tasks

### MT-1: ARCHITECTURE.md — Minimalversion mit korrekten Fakten
- **Datei:** `/docs/ARCHITECTURE.md`
- "Vercel" durch tatsächliche Architektur ersetzen:
  - 10-Service Docker Compose Stack
  - Hetzner Self-Hosted via Coolify
  - Kong Gateway → PostgREST / GoTrue / Storage
  - Next.js App als eigener Container
  - Supabase Self-Hosted Stack (DB, Auth, REST, Storage, Realtime, Meta, Studio)
- Keine vollständige Architektur-Doku, nur korrekte Fakten statt falsche
- **Verifikation:** Keine Erwähnung von "Vercel" mehr, Hetzner/Docker/Kong beschrieben

### MT-2: Production-Docs als "Planned" markieren
- **Dateien:**
  - `/docs/production/database-optimization.md` — Header: "Status: Planned — NOT YET IMPLEMENTED"
  - `/docs/production/error-tracking.md` — Header: "Status: Planned — NOT YET IMPLEMENTED"
  - `/docs/production/performance.md` — Header: "Status: Planned — NOT YET IMPLEMENTED"
  - `/docs/production/rate-limiting.md` — Header: "Status: Planned — NOT YET IMPLEMENTED"
  - `/docs/production/security-headers.md` — Header: "Status: IMPLEMENTED in next.config.ts"
- **Verifikation:** Jede Datei hat expliziten Status-Header

### MT-3: RELEASES.md — MVP-1 Release eintragen
- **Datei:** `/docs/RELEASES.md`
- Cockpit-kompatibles Format:
  ```
  ### REL-001 — MVP-1 Initial Deployment
  - Date: 2026-03-25
  - Scope: Auth, Admin-Dashboard, Tenant-Workspace, Event-Sourcing, Evidence-Upload, Submission, ZIP-Export
  - Summary: Erstes Deployment auf Hetzner via Coolify. Auth-Fix (Server Actions + interne Docker-URL) am selben Tag. Admin-Seiten blockiert durch fehlende DB-Migrationen (ISSUE-001).
  - Risks: SQL-Migrationen nicht vollständig auf Production-DB angewendet
  - Rollback Notes: Coolify Rollback auf vorherigen Container-Stand
  ```
- **Verifikation:** Cockpit zeigt Release-Eintrag

### MT-4: MIGRATIONS.md — Baseline-Schema dokumentieren
- **Datei:** `/docs/MIGRATIONS.md`
- Cockpit-kompatibles Format:
  ```
  ### MIG-001 — Initial Schema Baseline (MVP-1)
  - Date: 2026-02-23
  - Scope: 10 Tabellen, 1 View, 4 Functions, RLS-Policies, Grants
  - Affected Areas: Gesamte Datenbankschicht
  - Reason: MVP-1 Erstinstallation
  - Rollback Notes: DROP aller public-Schema Objekte
  ```
- **Verifikation:** Cockpit zeigt Migration-Eintrag

## Acceptance Criteria
- ARCHITECTURE.md beschreibt tatsächliche Architektur (nicht "Vercel")
- Production-Docs haben expliziten Implementation-Status
- RELEASES.md hat MVP-1 Release-Record im Cockpit-Format
- MIGRATIONS.md hat Baseline-Schema im Cockpit-Format
- Cockpit zeigt alle neuen Einträge korrekt an

## Estimated Complexity
Klein — Nur Dokumentation, kein Code
