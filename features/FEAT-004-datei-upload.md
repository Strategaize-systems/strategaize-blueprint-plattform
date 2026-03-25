# FEAT-004: Datei-Upload & Analyse

## Status
planned

## Version
V1

## Description
Upload von PDF- und Textdateien pro Frage oder Block. Das LLM analysiert die Dokumente und prüft, ob Fragen dadurch ausreichend beantwortet sind.

## In Scope
- Upload pro Frage oder pro Block
- Unterstützte Formate: PDF, TXT (mindestens)
- LLM analysiert hochgeladene Dokumente
- LLM prüft Antwortabdeckung anhand der Dokumente
- Speicherung in Supabase Storage
- RLS auf Organisationsebene
- Datei-Liste pro Frage/Block einsehbar

## Out of Scope
- DOCX-Support (ggf. V1.1)
- OCR für gescannte PDFs
- Automatische Antwortextraktion aus Dokumenten
- Große Dateimengen (>50 MB pro Datei)

## Acceptance Criteria
- PDF- und TXT-Dateien können hochgeladen werden
- Hochgeladene Dateien sind in der Frage-Ansicht sichtbar
- LLM kann auf Dateiinhalte zugreifen
- Dateien sind durch RLS geschützt
- Upload-Feedback (Erfolg/Fehler) ist klar

## Dependencies
- FEAT-001 (Auth/Organisation für RLS)
- FEAT-003 (LLM-Integration für Analyse)
- Supabase Storage
