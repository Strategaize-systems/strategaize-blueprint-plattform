# SLC-062 — Feedback Backend (DB + API)

## Slice Info
- Feature: FEAT-036
- Priority: High
- Dependencies: keine

## Goal

DB-Schema fuer run_feedback erstellen (Migration 020), RLS-Policies und GRANTs einrichten, und die API-Endpunkte (GET + POST mit UPSERT) implementieren.

## Micro-Tasks

### MT-1: Migration SQL erstellen
- Goal: run_feedback Tabelle mit allen Spalten, Constraints, RLS und GRANTs definieren
- Files: `sql/migrations/020_v34_feedback.sql`
- Expected behavior: SQL ist ausfuehrbar, erstellt Tabelle, UNIQUE Constraint, RLS-Policies (SELECT/INSERT/UPDATE fuer tenant_admin/tenant_owner), GRANTs fuer authenticated + service_role
- Verification: SQL-Syntax validieren, Constraint-Namen pruefen
- Dependencies: keine

### MT-2: Feedback API Route
- Goal: GET und POST Endpunkt fuer Feedback mit UPSERT-Logik
- Files: `src/app/api/tenant/runs/[runId]/feedback/route.ts`
- Expected behavior: GET liefert alle Feedback-Eintraege fuer Run. POST akzeptiert Array von {question_key, response_text, response_rating}, validiert Keys und Run-Status, fuehrt UPSERT aus. Rollencheck: nur tenant_admin/tenant_owner. Run muss submitted/locked und survey_type=management sein.
- Verification: `npm run build` erfolgreich
- Dependencies: MT-1 (Tabelle muss existieren fuer Typen)

## Acceptance Criteria
1. Migration SQL ist vollstaendig und ausfuehrbar
2. API GET liefert leeres Array wenn kein Feedback existiert
3. API POST validiert question_key gegen erlaubte Werte
4. API POST prueft Run-Status (submitted/locked) und survey_type (management)
5. API POST nutzt UPSERT (ON CONFLICT UPDATE)
6. Rollencheck blockiert mirror_respondent und tenant_member
