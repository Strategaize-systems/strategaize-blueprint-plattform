# SLC-020 — Dokument-Analyse: LLM liest Evidence und gibt Feedback

## Feature
BL-027

## Priority
High — macht Evidence-Upload wertvoll statt nur Dateiablage

## Scope
Nach Upload analysiert LLM das Dokument gegen Frage-Kontext und gibt Feedback.

## Micro-Tasks

### MT-1: Neuer Prompt-Typ "Dokument-Analyse"
- Goal: System-Prompt der ein Dokument gegen eine Blueprint-Frage analysiert
- Files: src/lib/llm.ts
- Expected behavior:
  - Neuer Prompt dokumentAnalyse in SYSTEM_PROMPTS
  - Input: Dokument-Text + aktuelle Frage + Block-Kontext
  - Output: Relevante Punkte, offene Luecken, Bewertung
- Verification: Build
- Dependencies: none

### MT-2: Backend — Auto-Analyse nach Upload
- Goal: Nach Evidence-Upload automatisch LLM-Analyse triggern
- Files: src/app/api/tenant/runs/[runId]/evidence/route.ts
- Expected behavior:
  - Nach erfolgreichem Upload + Text-Extraktion: LLM-Call mit Dokument-Text
  - Ergebnis als question_event (event_type: "document_analysis") speichern
  - Async, non-blocking (Response geht sofort zurueck)
- Verification: Upload PDF → Event in DB pruefen
- Dependencies: MT-1

### MT-3: Frontend — Analyse-Feedback im Chat anzeigen
- Goal: document_analysis Events im Chat-Bereich als spezielle Nachricht anzeigen
- Files: run-workspace-client.tsx, event-history.tsx
- Expected behavior:
  - Nach Upload erscheint LLM-Analyse als Chat-Nachricht (spezielles Styling)
  - Icon: Dokument-Symbol, gruener Rahmen
  - Text: "Ich habe [Dateiname] analysiert: ..."
- Verification: Upload → Feedback sichtbar im Chat
- Dependencies: MT-2

### MT-4: Cross-Frage-Erkennung (Phase 2)
- Goal: LLM erkennt ob Dokument auch andere Fragen im Block beantwortet
- Files: src/lib/llm.ts, evidence/route.ts
- Expected behavior:
  - LLM bekommt alle Fragen des Blocks als Kontext
  - Antwortet mit: "Dieses Dokument ist auch relevant fuer F-BP-005, F-BP-008"
  - Ergebnis wird als Metadata gespeichert
- Verification: Upload → Cross-References in Response
- Dependencies: MT-1, MT-2, MT-3

## Acceptance Criteria
- Upload eines PDF/TXT gibt sofort LLM-Feedback
- Feedback erscheint im Chat-Bereich
- User versteht was das LLM aus dem Dokument gelesen hat
- Phase 2: Cross-Frage-Hinweise
