# SLC-027 — Fragenkatalog-Sprache + Admin-Integration

## Feature
BL-022 — Mehrsprachigkeit (DE/EN/NL)

## Goal
Fragenkatalog-Snapshots nach Sprache filtern. Admin kann Kataloge pro Sprache importieren. Run-Erstellung nutzt Tenant-Sprache für Katalog-Auswahl.

## Scope
- DB: `question_catalog_snapshots.language` Spalte (de/en/nl, default de)
- Unique Constraint: (version, language) statt nur version
- Admin Katalog-Import: Sprache beim Import wählen
- Admin Katalog-Liste: Sprach-Badge pro Snapshot
- Run-Erstellung: Katalog-Dropdown zeigt Sprache, sortiert passend zur Tenant-Sprache
- Tenants-API gibt `language` zurück

## Out of Scope
- Tatsächliche EN/NL Fragenkatalog-Dateien (kommen später)
- Automatische Übersetzung der Fragen
- `ebene`-Feld-Übersetzung (bleibt Kern/Workspace als Identifier)

## Acceptance
1. `question_catalog_snapshots.language` existiert (CHECK de/en/nl, DEFAULT de)
2. Admin kann Sprache beim Katalog-Import angeben
3. Gleiche Version kann in verschiedenen Sprachen existieren
4. Katalog-Liste zeigt Sprach-Badge pro Snapshot
5. Run-Erstellung zeigt Katalogsprache und markiert passende Kataloge
6. Bestehende Kataloge bekommen language='de'
7. TypeScript-Check bestanden
8. Migration SQL bereit für Production

## Status: done
