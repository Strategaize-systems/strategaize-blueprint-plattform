# SLC-046 — V3.1 DB-Schema (MIG-018)

## Metadaten

- **ID:** SLC-046
- **Feature:** FEAT-032, FEAT-033, FEAT-034
- **Backlog:** BL-055, BL-060, BL-058
- **Version:** V3.1
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-07
- **Dependencies:** none

## Ziel

Alle DB-Änderungen für V3.1 in einer Migration: mirror_nominations, mirror_profiles, runs.due_date, RLS-Policies, GRANTs.

## Micro-Tasks

#### MT-1: SQL-Migration erstellen
- Goal: MIG-018 SQL-Datei mit allen Tabellen, Policies, GRANTs
- Files: `sql/migrations/018_v31_mirror_usability.sql`
- Expected behavior: mirror_nominations Tabelle mit RLS (tenant_admin CRUD), mirror_profiles Tabelle mit RLS (mirror_respondent eigene), runs.due_date DATE nullable. GRANTs für authenticated + service_role.
- Verification: SQL-Syntax valide
- Dependencies: none

#### MT-2: Migration auf Hetzner ausführen
- Goal: MIG-018 auf Production-DB anwenden
- Files: keine Code-Dateien
- Expected behavior: Tabellen + Policies + GRANTs existieren in DB
- Verification: `\dt mirror_*` zeigt beide Tabellen
- Dependencies: MT-1

## Akzeptanzkriterien

1. mirror_nominations Tabelle existiert mit korrekten Constraints
2. mirror_profiles Tabelle existiert mit profile_id UNIQUE
3. runs.due_date Spalte existiert
4. RLS-Policies aktiv und korrekt
5. GRANTs für authenticated und service_role gesetzt
