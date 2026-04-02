# SLC-035 — DB-Schema: owner_profiles + run_memory

## Metadaten

- **ID:** SLC-035
- **Feature:** FEAT-026, FEAT-027
- **Backlog:** BL-046, BL-048
- **Version:** V2.2
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-02
- **Dependencies:** keine (Grundlage für alle V2.2 Slices)

## Ziel

Beide neuen Tabellen (owner_profiles, run_memory) in der Datenbank anlegen, mit RLS-Policies und GRANTs. Nach diesem Slice existiert das DB-Schema für V2.2 — alle weiteren Slices können darauf aufbauen.

## Scope

- SQL-Migration für owner_profiles (MIG-012)
- SQL-Migration für run_memory (MIG-013)
- RLS-Policies für Tenant-Isolation
- GRANTs für service_role
- Migration auf Hetzner-Server ausführen

## Micro-Tasks

#### MT-1: owner_profiles Migration schreiben
- Goal: SQL-Datei für owner_profiles Tabelle mit allen Spalten, UNIQUE(tenant_id), RLS, GRANTs
- Files: `sql/migrations/012_owner_profiles.sql`
- Expected behavior: Tabelle kann angelegt werden ohne Fehler, RLS ist aktiv
- Verification: SQL manuell auf Hetzner ausführen, Tabelle prüfen
- Dependencies: none

#### MT-2: run_memory Migration schreiben
- Goal: SQL-Datei für run_memory Tabelle mit run_id (UNIQUE), memory_text, version, RLS, GRANTs
- Files: `sql/migrations/013_run_memory.sql`
- Expected behavior: Tabelle kann angelegt werden ohne Fehler, RLS ist aktiv
- Verification: SQL manuell auf Hetzner ausführen, Tabelle prüfen
- Dependencies: none

#### MT-3: Migrationen auf Hetzner ausführen
- Goal: Beide Migrationen auf dem Live-Server anwenden
- Files: keine Code-Dateien (DB-Operation)
- Expected behavior: Beide Tabellen existieren, RLS aktiv, service_role hat Zugriff
- Verification: SELECT aus beiden Tabellen via Supabase Studio
- Dependencies: MT-1, MT-2

## Akzeptanzkriterien

1. owner_profiles Tabelle existiert mit allen Spalten laut ARCHITECTURE.md
2. run_memory Tabelle existiert mit run_id, memory_text, version
3. RLS ist aktiv auf beiden Tabellen
4. Tenant-Isolation funktioniert (User sieht nur eigene Daten)
5. service_role kann in beide Tabellen schreiben (GRANTs)
6. UNIQUE Constraints sind gesetzt (tenant_id bzw. run_id)
