# FEAT-006: Antwort-Review & Wiedergabe

## Status
planned

## Version
V1

## Description
Kunden können alle bisherigen Antworten durchgehen, den chronologischen Verlauf pro Frage einsehen und den Gesamtstatus aller Blöcke überblicken.

## In Scope
- Übersichtsseite: alle Blöcke mit Status
- Pro Frage: chronologischer Antwortverlauf
- Fragen-Status: offen, beantwortet, Rückfrage ausstehend, abgeschlossen
- Block-Fortschritt: Anzahl beantworteter vs. offener Fragen
- Textbasierte Wiedergabe

## Out of Scope
- Audio-Wiedergabe (V2)
- PDF-Export der Antworten (ggf. V1.1)
- Kommentarfunktion auf Antworten

## Acceptance Criteria
- Übersichtsseite zeigt alle 9 Blöcke mit Fortschritt
- Pro Frage ist der Antwortverlauf einsehbar
- Fragen-Status wird korrekt angezeigt
- Navigation zwischen Blöcken und Fragen ist intuitiv

## Dependencies
- FEAT-002 (Fragebogen-Engine)
- FEAT-005 (Versionierung für Verlauf)
