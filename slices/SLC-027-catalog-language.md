# SLC-027 — Fragenkatalog-Sprache + Admin-Integration

## Feature
BL-022 — Mehrsprachigkeit (DE/EN/NL)

## Goal
Fragenkatalog-Snapshots nach Sprache filtern. Admin kann Kataloge pro Sprache importieren. Run-Erstellung nutzt Tenant-Sprache für Katalog-Auswahl.

## Scope
- DB: `question_catalog_snapshots.language` Spalte (de/en/nl, default de)
- Admin Katalog-Import: Sprache beim Import wählen
- Run-Erstellung: Katalog nach Tenant-Sprache filtern, Fallback auf DE
- Admin Run-Erstellung: zeigt nur Kataloge in passender Sprache

## Out of Scope
- Tatsächliche EN/NL Fragenkatalog-Dateien (kommen später)
- Automatische Übersetzung der Fragen

## Acceptance
1. `question_catalog_snapshots.language` existiert
2. Admin kann Sprache beim Katalog-Import angeben
3. Run-Erstellung filtert Katalog nach Tenant-Sprache
4. Fallback: wenn kein Katalog in Tenant-Sprache → DE-Katalog verwenden
5. Bestehende Kataloge bekommen language='de'

### Micro-Tasks

#### MT-1: DB-Migration — catalog_snapshots.language
- Goal: Language-Spalte auf question_catalog_snapshots hinzufügen
- Files: `sql/schema.sql`
- Expected behavior: Spalte mit CHECK ('de','en','nl'), DEFAULT 'de'
- Verification: SQL auf Production, bestehende Snapshots bekommen 'de'
- Dependencies: none

#### MT-2: Admin Katalog-Import — Sprach-Selektor
- Goal: Sprach-Dropdown beim Katalog-Import
- Files: `src/app/admin/tenants/tenants-client.tsx` (oder relevanter Import-Dialog), `src/app/api/admin/catalog/route.ts`
- Expected behavior: Admin wählt Sprache beim Import, wird in DB gespeichert
- Verification: Import mit language='en' → DB zeigt language='en'
- Dependencies: MT-1

#### MT-3: Run-Erstellung — Katalog nach Sprache filtern
- Goal: Beim Erstellen eines Runs wird der Katalog in Tenant-Sprache gewählt
- Files: `src/app/api/admin/runs/route.ts`
- Expected behavior: Run bekommt Katalog in Tenant-Sprache, Fallback auf DE
- Verification: Run für EN-Tenant erstellen → Katalog mit language='en' (oder Fallback DE)
- Dependencies: MT-1, MT-2
