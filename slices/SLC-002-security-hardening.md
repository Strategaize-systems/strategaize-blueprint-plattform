# SLC-002 — Security Hardening (High)

## Feature
FEAT-001 (Auth & Tenant-Verwaltung)

## Priority
High — Sicherheitslücken in RLS und fehlende Schutzmaßnahmen

## Issues addressed
- ISSUE-003: Kein Rate-Limiting auf API
- ISSUE-007: evidence_links INSERT-Policy validiert link_id Ownership nicht
- ISSUE-009: handle_new_user defaultet ungültige Rollen stillschweigend

## Scope
Kritische Sicherheitslücken schließen. Minimale Änderungen, kein Refactoring.

## Out of scope
- Sentry/Error-Tracking (separater Slice)
- Append-only DB-Trigger (ISSUE-010, Medium)
- Rate-Limiting auf allen Endpoints (nur Login + Auth-kritische)

## Micro-Tasks

### MT-1: evidence_links RLS Policy fixen
- **Datei:** `/sql/rls.sql`
- Policy `tenant_insert_evidence_links` erweitern
- link_id Ownership-Check hinzufügen: wenn link_type='question', muss link_id zu einer Question gehören die über einen Run des eigenen Tenants erreichbar ist
- SQL:
  ```sql
  AND (
    link_type = 'run' AND link_id IN (
      SELECT id FROM runs WHERE tenant_id = auth.user_tenant_id()
    )
    OR link_type = 'question' AND link_id IN (
      SELECT q.id FROM questions q
      WHERE q.catalog_snapshot_id IN (
        SELECT r.catalog_snapshot_id FROM runs r
        WHERE r.tenant_id = auth.user_tenant_id()
      )
    )
  )
  ```
- **Verifikation:** Policy auf Production anwenden, testen mit Tenant-User ob eigene Links funktionieren

### MT-2: handle_new_user() — ungültige Rollen ablehnen
- **Datei:** `/sql/functions.sql`
- Zeile mit `v_role := 'tenant_owner';` (silent default) ersetzen durch `RAISE EXCEPTION 'invalid role: %', v_role USING ERRCODE = 'P0400';`
- **Verifikation:** Auf Production anwenden, Test: Invite mit ungültiger Rolle muss fehlschlagen

### MT-3: Rate-Limiting für Login-Endpoint
- **Dateien:** `/src/app/login/actions.ts`, `/src/lib/rate-limit.ts` (neu)
- Einfaches In-Memory Rate-Limiting (Map-basiert, kein Redis nötig für MVP)
- Regel: Max 5 Login-Versuche pro IP pro 15 Minuten
- Bei Überschreitung: 429 Too Many Requests
- **Verifikation:** 6x falsches Passwort eingeben → 6. Versuch wird blockiert

### MT-4: Rate-Limiting für Set-Password-Endpoint
- **Datei:** `/src/app/auth/set-password/actions.ts`
- Gleicher Rate-Limiter wie MT-3
- Regel: Max 5 Versuche pro IP pro 15 Minuten
- **Verifikation:** Analog zu MT-3

## Acceptance Criteria
- evidence_links können nur noch auf eigene Questions/Runs verlinken
- Ungültige Rollen bei Invite werden abgelehnt statt silent-defaulted
- Login hat Rate-Limiting (5 Versuche / 15 Min)
- Set-Password hat Rate-Limiting

## Estimated Complexity
Mittel — 1 SQL-Policy-Änderung, 1 Function-Änderung, 1 neue Utility + 2 Integrationen
