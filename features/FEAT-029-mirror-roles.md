# FEAT-029 — Mirror-Rollen und Sichtbarkeit

## Metadaten

- **ID:** FEAT-029
- **Version:** V3 (Phase 1)
- **Priorität:** P0
- **Status:** planned
- **Erstellt:** 2026-04-03

## Zusammenfassung

Neue Rolle `mirror_respondent` mit eingeschränkter Sichtbarkeit. Mirror-Teilnehmer sehen nur ihre eigenen zugewiesenen Fragen. Inhaber sieht keine Mirror-Rohdaten.

## Lösung

### Neue Rolle

- `mirror_respondent` in profiles.role (neben strategaize_admin, tenant_admin, tenant_member)
- `profiles.respondent_layer` TEXT optional: 'owner', 'leadership_1', 'leadership_2', 'key_staff'

### Sichtbarkeitsmatrix

| Rolle | Management View | Mirror-Rohdaten | Eigene Mirror-Antworten | Aggregierte Synthese |
|-------|----------------|-----------------|------------------------|---------------------|
| Inhaber/tenant_admin | Ja | Nein | — | Ja (später, OS) |
| tenant_member | Zugewiesene Blöcke | Nein | — | Nein |
| mirror_respondent | Nein | Nein | Ja (nur eigene) | Nein |
| strategaize_admin | Ja | Ja | Ja | Ja |

### RLS-Policies

- mirror_respondent sieht nur Runs mit survey_type = 'mirror'
- mirror_respondent sieht nur question_events die er selbst erstellt hat
- Tenant-Owner/Admin RLS wird auf survey_type = 'management' eingeschränkt
- member_block_access wird survey_type-aware

## Akzeptanzkriterien

1. mirror_respondent kann nur zugewiesene Mirror-Fragen beantworten
2. mirror_respondent sieht keine Management-View-Daten
3. mirror_respondent sieht keine anderen Mirror-Antworten
4. Tenant-Owner sieht keine Mirror-Rohdaten
5. StrategAIze-Admin kann alles einsehen
6. Block-Zuweisung pro Mirror-Teilnehmer funktioniert

## Abhängigkeiten

- FEAT-028 (survey_type Infrastruktur)
