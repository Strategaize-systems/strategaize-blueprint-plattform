# SLC-018 — Rollen-System: Tenant-Admin + Block-Zugriff

## Feature
BL-023 (Rollen-System)

## Priority
High — Brauchen wir fuer den ersten Kunden

## Scope
Neue Rolle tenant_admin (Geschaeftsfuehrer) + Block-Level Zugriffskontrolle.

## Aktuelle Rollen
- strategaize_admin: Komplettadmin (wir/Berater)
- tenant_owner: Erster User eines Tenants (aktuell: kann alles im Tenant)
- tenant_member: Weitere User eines Tenants (aktuell: kann alles im Tenant)

## Neue Rollen-Hierarchie
- strategaize_admin: Komplettadmin (unveraendert)
- tenant_owner → wird zu tenant_admin: Geschaeftsfuehrer, kann Mitarbeiter einladen + Bloecke zuweisen
- tenant_member: Kann nur zugewiesene Bloecke sehen/bearbeiten

## Datenmodell-Aenderungen
1. profiles: role CHECK erweitern um 'tenant_admin'
2. Neue Tabelle: member_block_access (user_id, block, run_id)
3. handle_new_user() erweitern fuer tenant_admin + allowed_blocks Metadata

## Micro-Tasks

### MT-1: DB Migration — Neue Rolle + Block-Access Tabelle
- Goal: tenant_admin Rolle + member_block_access Tabelle
- Files: sql/migrations/004_role_system.sql
- Expected behavior:
  - ALTER profiles role CHECK: + 'tenant_admin'
  - Existierende tenant_owner → tenant_admin umbenennen
  - CREATE TABLE member_block_access (id, profile_id, run_id, block)
  - RLS auf member_block_access
- Dependencies: none

### MT-2: Backend — Invite-Flow mit Rolle + Bloecken
- Goal: Admin/Tenant-Admin kann beim Einladen Rolle + Bloecke waehlen
- Files: invite route.ts, validations.ts, handle_new_user()
- Expected behavior:
  - Invite akzeptiert: role (tenant_admin oder tenant_member) + allowed_blocks (Array)
  - handle_new_user() erstellt member_block_access Eintraege
  - Tenant-Admin kann andere einladen (neuer API-Endpoint)
- Dependencies: MT-1

### MT-3: Backend — Block-Zugriff in APIs einbauen
- Goal: Tenant-Members sehen nur zugewiesene Bloecke
- Files: tenant runs API, questions API
- Expected behavior:
  - GET /api/tenant/runs/[id] filtert Fragen nach erlaubten Bloecken
  - tenant_admin sieht alles (wie bisher tenant_owner)
  - tenant_member sieht nur zugewiesene Bloecke
- Dependencies: MT-1, MT-2

### MT-4: Frontend — Tenant-Admin Invite-Dialog mit Rollen + Bloecken
- Goal: Tenant-Admin kann im Frontend Mitarbeiter einladen mit Rolle und Block-Auswahl
- Files: Neuer Tenant-Admin Bereich oder Erweiterung Dashboard
- Expected behavior:
  - Tenant-Admin sieht "Team verwalten" im Dashboard
  - Invite-Dialog: E-Mail + Rolle (Admin/Member) + Block-Checkboxen (A-I)
  - Uebersicht der eingeladenen Mitarbeiter mit zugewiesenen Bloecken
- Dependencies: MT-2, MT-3

### MT-5: Frontend — Block-Filter fuer Members
- Goal: Workspace zeigt nur zugewiesene Bloecke in Sidebar
- Files: run-workspace-client.tsx
- Expected behavior:
  - tenant_member sieht nur Bloecke die ihm zugewiesen sind
  - tenant_admin sieht alle Bloecke (unveraendert)
  - Nicht-zugewiesene Bloecke sind ausgeblendet (nicht nur deaktiviert)
- Dependencies: MT-3

## Acceptance Criteria
- tenant_admin kann Mitarbeiter mit Block-Zugriff einladen
- tenant_member sieht nur zugewiesene Bloecke
- strategaize_admin Funktionalitaet unveraendert
- Bestehende tenant_owner werden zu tenant_admin migriert
