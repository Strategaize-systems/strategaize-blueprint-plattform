# FEAT-005: Antwort-Versionierung

## Status
planned

## Version
V1

## Description
Jede Antwort wird einzeln versioniert. Jede Änderung oder Ergänzung erzeugt eine neue Version. Alle Versionen bleiben einsehbar.

## In Scope
- Individuelle Versionierung pro Frage
- Jede Änderung = neue Version
- Versionshistorie pro Frage
- Jede Version enthält: Antworttext, Zeitstempel, Autor, Versionsnummer
- Ältere Versionen sind read-only
- Chronologische Versionsansicht

## Out of Scope
- Diff-Ansicht zwischen Versionen (ggf. V1.1)
- Versionen zusammenführen/mergen
- Audio-Versionen (V2)

## Acceptance Criteria
- Antwortänderung erzeugt neue Version (alte bleibt erhalten)
- Versionshistorie zeigt alle Versionen chronologisch
- Jede Version zeigt Autor und Zeitstempel
- Ältere Versionen sind nicht editierbar

## Dependencies
- FEAT-002 (Fragebogen-Engine)
- FEAT-001 (Auth für Autor-Zuordnung)
