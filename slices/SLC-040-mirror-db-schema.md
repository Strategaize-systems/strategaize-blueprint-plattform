# SLC-040 — Mirror DB-Schema

## Metadaten

- **ID:** SLC-040
- **Feature:** FEAT-028
- **Backlog:** BL-050
- **Version:** V3
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-03
- **Dependencies:** keine (Grundlage für alle V3 Slices)

## Ziel

Alle DB-Schema-Änderungen für Mirror-Infrastruktur: survey_type auf runs + snapshots, mirror_respondent Rolle, respondent_layer, mirror_policy_confirmations Tabelle, GRANTs. Danach kann RLS (SLC-041) aufsetzen.

## Scope

- runs.survey_type Spalte + CHECK + Index
- question_catalog_snapshots.survey_type + UNIQUE Constraint ändern
- profiles.role CHECK erweitern um mirror_respondent
- profiles.respondent_layer Spalte
- member_block_access.survey_type Spalte + UNIQUE Constraint ändern
- mirror_policy_confirmations Tabelle (NEU)
- GRANTs für authenticated + service_role

## Micro-Tasks

#### MT-1: Migration SQL schreiben (MIG-015)
- Goal: SQL-Datei mit allen Schema-Änderungen
- Files: `sql/migrations/015_mirror_infrastructure.sql`
- Expected behavior: Alle ALTER TABLE + CREATE TABLE + CHECK + UNIQUE + INDEX Statements
- Verification: SQL syntaktisch korrekt, Build erfolgreich
- Dependencies: none

#### MT-2: Migration auf Hetzner ausführen
- Goal: SQL auf Live-DB anwenden
- Files: keine (DB-Operation, User führt aus)
- Expected behavior: Alle Spalten/Tabellen existieren, Constraints aktiv
- Verification: \d runs, \d profiles, \d mirror_policy_confirmations in psql
- Dependencies: MT-1

## Akzeptanzkriterien

1. runs.survey_type existiert mit default 'management'
2. question_catalog_snapshots.survey_type existiert
3. profiles kann mirror_respondent als Rolle haben
4. profiles.respondent_layer existiert
5. member_block_access.survey_type existiert
6. mirror_policy_confirmations Tabelle existiert
7. Bestehende Daten unverändert (alle defaults management)
