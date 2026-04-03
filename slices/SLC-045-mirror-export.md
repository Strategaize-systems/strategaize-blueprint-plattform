# SLC-045 — Mirror Export

## Metadaten

- **ID:** SLC-045
- **Feature:** FEAT-031
- **Backlog:** BL-053
- **Version:** V3
- **Status:** planned
- **Priority:** Medium
- **Created:** 2026-04-03
- **Dependencies:** SLC-040, SLC-041

## Ziel

Getrennte Exportströme für Management und Mirror. Mirror-Export ist entpersonalisiert (respondent_layer statt User-IDs). Management-Export bleibt abwärtskompatibel.

## Scope

- Export-Route: survey_type in Manifest
- Export-Route: Mirror-Entpersonalisierung (created_by → respondent_layer Mapping)
- Export-Route: Data Contract v2.0 für Mirror
- Admin-UI: Export-Auswahl (Management/Mirror/Beide)
- Zugriffskontrolle: Nur Admin kann Mirror-Export

## Micro-Tasks

#### MT-1: Export-Route erweitern
- Goal: survey_type in Manifest, Mirror-Entpersonalisierung
- Files: `src/app/api/admin/runs/[runId]/export/route.ts`
- Expected behavior: Management-Export → v1.0 (bestehend + survey_type Feld). Mirror-Export → v2.0 (respondent_layer statt created_by, keine Namen/E-Mails).
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Admin-UI Export-Auswahl
- Goal: Export-Button bietet Auswahl zwischen Management/Mirror wenn Tenant beide hat
- Files: Admin runs client component
- Expected behavior: Wenn Run survey_type=mirror → Export-Button erzeugt Mirror-ZIP. survey_type wird angezeigt.
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-3: i18n Export-Keys
- Goal: admin.mirror.export* Keys
- Files: `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: Labels für Export-Auswahl
- Verification: JSON valide
- Dependencies: none

## Akzeptanzkriterien

1. Management-Export funktioniert wie bisher (abwärtskompatibel)
2. Mirror-Export enthält respondent_layer statt created_by
3. Mirror-Export enthält keine Namen/E-Mails
4. Export-Manifest hat survey_type Feld
5. Nur StrategAIze-Admin kann Mirror-Export erstellen
