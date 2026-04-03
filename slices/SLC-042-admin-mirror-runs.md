# SLC-042 — Admin: Mirror-Run-Erstellung

## Metadaten

- **ID:** SLC-042
- **Feature:** FEAT-028
- **Backlog:** BL-050
- **Version:** V3
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-03
- **Dependencies:** SLC-040, SLC-041

## Ziel

Admin kann Runs mit survey_type=mirror erstellen. Katalog-Auswahl gefiltert nach survey_type. Run-Liste zeigt survey_type an.

## Scope

- Admin Run-Erstellung API: survey_type Feld
- Admin Run-Liste API: optional Filter nach survey_type
- Admin Run-UI: survey_type Auswahl (Radio/Dropdown)
- Admin Run-UI: survey_type Badge in Liste
- Block-Access-Kopierung survey_type-aware

## Micro-Tasks

#### MT-1: Run-Erstellung API erweitern
- Goal: POST /api/admin/runs akzeptiert survey_type, validiert gegen Katalog
- Files: `src/app/api/admin/runs/route.ts`, `src/lib/validations.ts`
- Expected behavior: survey_type wird gespeichert. Katalog-survey_type muss matchen. Default: management.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Run-Liste API erweitern
- Goal: GET /api/admin/runs zeigt survey_type an, optional Filter
- Files: `src/app/api/admin/runs/route.ts`
- Expected behavior: Response enthält survey_type pro Run. Optional ?survey_type=mirror Filter.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-3: Admin Run-UI survey_type
- Goal: UI-Erweiterung für survey_type Auswahl bei Run-Erstellung + Badge in Liste
- Files: Admin runs client component (ggf. neue Datei oder bestehend erweitern)
- Expected behavior: Radio-Buttons Management/Mirror bei Erstellung. Badge in Run-Liste.
- Verification: Build erfolgreich
- Dependencies: MT-1, MT-2

#### MT-4: i18n-Keys für Admin Mirror
- Goal: admin.mirror.* Namespace in DE/EN/NL
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: Labels für survey_type, Mirror-Badge, etc.
- Verification: JSON valide, Keys konsistent
- Dependencies: none

## Akzeptanzkriterien

1. Admin kann Runs mit survey_type=mirror erstellen
2. Run-Liste zeigt survey_type als Badge
3. Katalog-Filter nach survey_type funktioniert
4. Bestehende Management-Run-Erstellung unverändert
5. Build erfolgreich
