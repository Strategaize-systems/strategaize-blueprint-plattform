# FEAT-003: LLM-gestützte Rückfragen

## Status
planned

## Version
V1

## Description
Nach jeder Antwort prüft ein LLM (Ollama/Qwen 2.5 via Dify) die Antwortqualität und stellt bei unzureichender Tiefe gezielte Rückfragen.

## In Scope
- Antwortqualitätsprüfung nach jeder Eingabe
- Gezielte Rückfragen bei fehlendem Kontext
- Orchestrierung über Dify.ai
- LLM-Backend: Ollama + Qwen 2.5 (lokal auf Hetzner)
- Konfigurierbare Regeln und Prompts in Dify
- Kontext aus bereits gegebenen Antworten
- Kontext aus hochgeladenen Dokumenten (FEAT-004)

## Out of Scope
- Spracheingabe für Rückfragen (V2)
- Automatische Antwortgenerierung
- LLM-basierte Scoring-Bewertung

## Acceptance Criteria
- LLM erkennt oberflächliche oder unvollständige Antworten
- Rückfragen sind kontextbezogen und hilfreich
- Rückfragen berücksichtigen bisherige Antworten
- Rückfragen berücksichtigen hochgeladene Dokumente
- Keine externe API-Kosten (alles lokal)
- Antwortzeit < 10 Sekunden für Rückfrage

## Dependencies
- FEAT-002 (Fragebogen-Engine)
- FEAT-004 (Datei-Upload für Dokumentenkontext)
- Dify.ai (Self-Hosted auf Hetzner)
- Ollama + Qwen 2.5 (lokal auf Hetzner)
