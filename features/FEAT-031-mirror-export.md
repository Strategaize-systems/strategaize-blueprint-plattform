# FEAT-031 — Getrennte Exportströme (Management + Mirror)

## Metadaten

- **ID:** FEAT-031
- **Version:** V3 (Phase 1)
- **Priorität:** P1
- **Status:** planned
- **Erstellt:** 2026-04-03

## Zusammenfassung

Separate Export-ZIPs für Management View und Mirror, mit survey_type-Metadaten. Mirror-Export ist entpersonalisiert (nur respondent_layer, keine Namen).

## Lösung

### Export-Logik

- Admin-Export-UI: Auswahl Management-ZIP / Mirror-ZIP / Beides
- Management-Export: bestehende Data Contract v1.0 (abwärtskompatibel)
- Mirror-Export: neue Data Contract v2.0 mit zusätzlichen Metadaten
- Mirror-Export enthält: Antworten pro Block, respondent_layer, survey_type
- Mirror-Export enthält NICHT: Namen, E-Mail-Adressen, User-IDs

### Mirror Data Contract v2.0

```json
{
  "contract_version": "v2.0",
  "survey_type": "mirror",
  "exported_at": "...",
  "tenant_id": "...",
  "run_id": "...",
  "respondent_count": 5,
  "blocks": {
    "A": {
      "respondent_layers": ["leadership_1", "key_staff"],
      "answers": [...]
    }
  }
}
```

### Zugriffskontrolle

- Nur StrategAIze-Admin kann Mirror-Export erstellen
- Tenant-Owner kann nur Management-Export erstellen (wie bisher)

## Akzeptanzkriterien

1. Management-Export funktioniert wie bisher
2. Mirror-Export enthält Antworten nach Block mit respondent_layer
3. Mirror-Export enthält keine personenbezogenen Daten
4. Export-Manifest hat survey_type Feld
5. Nur StrategAIze-Admin kann Mirror-Export erstellen

## Abhängigkeiten

- FEAT-028 (survey_type)
- FEAT-029 (respondent_layer)
