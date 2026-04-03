# FEAT-028 — Mirror-Infrastruktur (DB-Schema + survey_type)

## Metadaten

- **ID:** FEAT-028
- **Version:** V3 (Phase 1)
- **Priorität:** P0
- **Status:** planned
- **Erstellt:** 2026-04-03

## Zusammenfassung

Erweiterung des Datenmodells um `survey_type` auf Runs und Fragenkatalogen. Grundlage für die Trennung von Management View und Operational Reality Mirror.

## Lösung

### DB-Änderungen

- `runs.survey_type` TEXT NOT NULL DEFAULT 'management' CHECK ('management', 'mirror')
- `question_catalog_snapshots.survey_type` TEXT NOT NULL DEFAULT 'management' CHECK ('management', 'mirror')
- UNIQUE Constraint auf snapshots: (version, language, survey_type)
- Index auf runs: (tenant_id, survey_type, status)

### RLS-Erweiterung

- Tenant-Owner/Admin: sieht nur Runs mit survey_type = 'management'
- mirror_respondent: sieht nur Runs mit survey_type = 'mirror' UND eigene Block-Zuweisung
- StrategAIze-Admin: sieht alle Runs (BYPASSRLS)

### Admin-UI Erweiterung

- Run-Erstellung: Dropdown/Radio für survey_type (management/mirror)
- Run-Liste: optional Filter nach survey_type
- Katalog-Import: survey_type Zuordnung

## Akzeptanzkriterien

1. Runs können mit survey_type management oder mirror erstellt werden
2. Bestehende Runs funktionieren unverändert (default management)
3. Mirror-Runs für Tenant-Owner nicht sichtbar (RLS)
4. StrategAIze-Admin sieht alle Runs
5. Fragenkataloge nach survey_type getrennt

## Abhängigkeiten

- Keine (Grundlage für FEAT-029/030/031)

## Out of Scope

- Konkrete Mirror-Fragen
- Mirror-LLM-Integration
