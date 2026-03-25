# SLC-001 — RLS & Grants Fix (Blocker)

## Feature
FEAT-001 (Auth & Tenant-Verwaltung)

## Priority
Blocker — Admin-Seiten nicht funktional

## Issues addressed
- ISSUE-001: Permission denied for table tenants

## Scope
SQL-Migrationen auf Produktions-DB verifizieren und anwenden. Nur existierende SQL-Dateien ausführen, kein neuer Code.

## Out of scope
- Neue RLS Policies schreiben (das ist SLC-003)
- Code-Änderungen in src/

## Micro-Tasks

### MT-1: Diagnose — Welche SQL-Objekte fehlen auf Production
- SSH auf Hetzner-Server
- In Supabase-DB-Container einloggen: `docker exec -it supabase-db psql -U supabase_admin -d postgres`
- Prüfen: `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
- Prüfen: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
- Prüfen: `SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname IN ('service_role', 'authenticated', 'anon');`
- Prüfen: `SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';`
- **Erwartetes Ergebnis:** Klares Bild welche Tabellen/Policies/Functions/Grants fehlen
- **Verifikation:** Liste der fehlenden Objekte dokumentiert

### MT-2: SQL-Migrationen anwenden
- Basierend auf MT-1 Diagnose: fehlende SQL-Statements ausführen
- Reihenfolge: `schema.sql` → `rls.sql` → `functions.sql` (Abhängigkeiten beachten)
- Bei partieller Existenz: nur fehlende Statements einzeln ausführen
- **Verifikation:** `SELECT * FROM pg_policies WHERE tablename = 'tenants';` zeigt Policies

### MT-3: Smoke-Test Admin-Seiten
- Browser: https://blueprint.strategaizetransition.com/admin/tenants
- Login als Admin-User
- Erwartung: Tenant-Liste wird geladen ohne "permission denied"
- Auch testen: /admin/runs, /admin/catalog
- **Verifikation:** Alle 3 Admin-Seiten laden Daten korrekt

## Acceptance Criteria
- Admin kann /admin/tenants aufrufen und sieht Tenant-Liste (oder leere Liste)
- Admin kann /admin/runs aufrufen
- Admin kann /admin/catalog aufrufen
- Kein "permission denied" Error mehr

## Estimated Complexity
Klein — Ausführen von existierendem SQL, kein neuer Code
