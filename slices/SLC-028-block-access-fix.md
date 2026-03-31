# SLC-028 — Block Access Control Fix

## Meta
- Feature: FEAT-012 (Rollen-System)
- Backlog: BL-041
- Issue: ISSUE-029
- Priority: Blocker (Pre-V2)
- Status: planned

## Goal

Block-Zugriffskontrolle funktioniert nicht korrekt. Tenants sehen Blöcke die ihnen nicht zugewiesen sind. NL-Test-Kunde sieht alle Blöcke, EN-Test-Kunde sieht falsche Blöcke.

## Scope

- Diagnose: RLS-Policy vs. Frontend-Filter vs. Profil-Daten
- Fix der Ursache (wahrscheinlich RLS oder Frontend-Query)
- Verifikation mit beiden Test-Tenants (NL + EN)

## Out of Scope

- Neues Feature-Work
- UI-Redesign der Block-Navigation

### Micro-Tasks

#### MT-1: Diagnose Block-Zugriffskontrolle
- Goal: Ursache identifizieren — liegt der Bug in RLS-Policies, Frontend-Filterung oder Profil-Daten (allowed_blocks)?
- Files: `src/app/api/tenant/runs/[runId]/questions/route.ts`, `src/app/runs/[id]/run-workspace-client.tsx`, `sql/rls.sql`
- Expected behavior: Klare Ursache dokumentiert
- Verification: Erklärung warum NL alle Blöcke sieht und EN falsche Blöcke sieht
- Dependencies: none

#### MT-2: Fix implementieren
- Goal: Block-Zugriffskontrolle korrekt umsetzen
- Files: Abhängig von MT-1 Diagnose (RLS-Policy, API-Route oder Frontend)
- Expected behavior: Tenant sieht nur die Blöcke die in seinem Profil als allowed_blocks definiert sind
- Verification: NL-Tenant sieht nur freigegebene Blöcke, EN-Tenant sieht nur freigegebene Blöcke
- Dependencies: MT-1

#### MT-3: Production-Fix anwenden
- Goal: Fix auf Production-DB anwenden falls SQL-Änderung nötig
- Files: `sql/` (Migration), `docs/MIGRATIONS.md`
- Expected behavior: Production-Instanz zeigt korrekte Block-Zugriffskontrolle
- Verification: Browser-Test auf https://blueprint.strategaizetransition.com mit beiden Test-Tenants
- Dependencies: MT-2
