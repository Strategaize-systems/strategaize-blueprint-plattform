# SLC-041 — Mirror RLS-Policies

## Metadaten

- **ID:** SLC-041
- **Feature:** FEAT-029
- **Backlog:** BL-051
- **Version:** V3
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-03
- **Dependencies:** SLC-040 (DB Schema)

## Ziel

Alle RLS-Policies survey_type-aware machen. Tenant-Owner sieht keine Mirror-Daten. Mirror-Respondent sieht nur eigene Mirror-Events. Bestehende Management-Queries funktionieren unverändert.

## Scope

- runs: tenant_select_own_runs → survey_type-aware
- question_events: SELECT + INSERT Policies → survey_type + created_by aware
- questions: tenant_select_questions_via_runs → survey_type-aware
- question_catalog_snapshots: tenant_select_snapshots_via_runs → survey_type-aware
- member_block_access: Policies für mirror_respondent
- mirror_policy_confirmations: RLS Policies
- GRANTs für neue Tabelle

## Micro-Tasks

#### MT-1: Migration SQL schreiben (MIG-016)
- Goal: SQL-Datei die alle bestehenden Policies ändert und neue für mirror_respondent erstellt
- Files: `sql/migrations/016_mirror_rls.sql`
- Expected behavior: DROP + CREATE für geänderte Policies. Neue Policies für mirror_respondent. RLS + GRANTs für mirror_policy_confirmations.
- Verification: SQL syntaktisch korrekt
- Dependencies: none

#### MT-2: Migration auf Hetzner ausführen
- Goal: RLS-Policies auf Live-DB anwenden
- Files: keine (DB-Operation)
- Expected behavior: Bestehende Management-Queries funktionieren unverändert. mirror_respondent hat eingeschränkte Sicht.
- Verification: Test mit bestehenden Accounts, keine Regression
- Dependencies: MT-1

#### MT-3: Validierung aktualisieren
- Goal: createRunSchema + inviteTenantUserSchema um survey_type + respondent_layer erweitern
- Files: `src/lib/validations.ts`
- Expected behavior: survey_type optional (default management), respondent_layer optional, role erweitert um mirror_respondent
- Verification: Build erfolgreich
- Dependencies: none

## Akzeptanzkriterien

1. Bestehende Tenant-Owner sieht nur Management-Runs (Regression-frei)
2. mirror_respondent sieht nur Mirror-Runs
3. mirror_respondent sieht nur eigene question_events
4. StrategAIze-Admin sieht alles (beide Typen)
5. Build erfolgreich
