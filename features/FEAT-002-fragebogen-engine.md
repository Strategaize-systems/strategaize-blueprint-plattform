# FEAT-002: Fragebogen-Engine

## Status
planned

## Version
V1

## Description
Darstellung und Navigation des Exit Ready Blueprint Fragebogens mit 67 Fragen in 9 Blöcken, Fortschrittsanzeige und Auto-Save.

## In Scope
- Alle 67 Fragen aus dem Exit Ready Blueprint
- Block-basierte Navigation (9 Blöcke A–I)
- Fortschrittsanzeige pro Block und gesamt
- Kern/Workspace-Ebenen-Unterscheidung
- Fragen-Metadaten: Owner-Dependency, Deal-Blocker
- Fragen als Datenstruktur (DB oder Config)
- Auto-Save bei Eingabe

## Out of Scope
- Fragebogen-Editor (V2)
- Mehrere Blueprint-Typen (V2)
- Scoring-Berechnung im Frontend (V2)

## Acceptance Criteria
- Alle 9 Blöcke sind navigierbar
- Fortschritt wird korrekt angezeigt
- Kern-Fragen sind visuell priorisiert
- Antworten werden automatisch gespeichert
- Fragen laden aus strukturierter Datenquelle

## Dependencies
- FEAT-001 (Auth/Organisation für Datenzuordnung)
- Fragebogen-Daten aus Excel-Import
