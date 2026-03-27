# SLC-016 — Chat-Bereich + Antwort generieren (LLM-Vorbereitung)

## Feature
BL-012 (LLM-Integration Vorbereitung)

## Priority
High — Architektonische Grundlage fuer den LLM-Workflow

## Scope
Chat-Bereich ueber der Antwort-Textarea + "Antwort generieren" Button.
Vorbereitung fuer Dify/LLM-Anbindung. LLM-Call wird als Placeholder implementiert.

## Workflow-Design

```
1. User oeffnet Frage
2. Chat-Bereich zeigt bisherige Konversation (user_chat + llm_response Events)
3. User tippt im Chat-Eingabefeld, LLM antwortet mit Rueckfragen
4. Nach ausreichend Chat: "Antwort generieren" Button
5. LLM fasst gesamten Chat zusammen → Text erscheint in Textarea
6. User prueft, editiert bei Bedarf
7. Falls nicht zufrieden: nochmal "Antwort generieren"
   → LLM bekommt: Original-Chat + vorherige generierte Antwort + User-Edits
8. "Antwort speichern" → nur der finale, freigegebene Text wird gespeichert
```

## Daten-Architektur

Neue Event-Typen in question_events:
- `user_chat` — User-Nachricht im Chat (payload: { text })
- `llm_response` — LLM-Antwort/Rueckfrage (payload: { text })
- `answer_generated` — LLM-generierte Zusammenfassung (payload: { text })

Bestehend (unveraendert):
- `answer_submitted` — finale, vom User freigegebene Antwort

## Micro-Tasks

### MT-1: Frontend — Chat-UI ueber Textarea
- Goal: Chat-Bereich als scrollbares Panel zwischen Fragekarte und Antwort-Editor
- Files: src/app/runs/[id]/run-workspace-client.tsx
- Expected behavior:
  - Chat-Nachrichten: User (rechts, blau) + LLM (links, grau)
  - Chat-Eingabefeld mit Send-Button
  - "Antwort generieren" Button unter dem Chat
  - Chat ist collapsed/minimal wenn keine Chat-Events existieren
- Dependencies: none

### MT-2: Backend — Chat-Event API
- Goal: POST Endpoint fuer user_chat Events + GET fuer Chat-Historie
- Files: Neuer Endpoint oder Erweiterung von question events
- Expected behavior:
  - POST erstellt user_chat Event
  - GET gibt Chat-Events zurueck (user_chat + llm_response)
  - Bestehende answer_submitted Events bleiben unveraendert
- Dependencies: none

### MT-3: Backend — Generate Answer Endpoint (Placeholder)
- Goal: POST /api/tenant/runs/[runId]/questions/[qId]/generate-answer
- Files: Neuer API-Endpoint
- Expected behavior:
  - Nimmt Chat-Historie + aktuelle Textarea als Input
  - Gibt generierten Antwort-Text zurueck (vorerst Placeholder)
  - Erstellt answer_generated Event
  - Spaeter: Dify API-Call fuer echte Zusammenfassung
- Dependencies: MT-2

### MT-4: Frontend — Generate Answer Integration
- Goal: "Antwort generieren" Button ruft Endpoint auf, Text erscheint in Textarea
- Files: src/app/runs/[id]/run-workspace-client.tsx
- Expected behavior:
  - Button-Click → Loading State → API-Call → Text in Textarea
  - Textarea ist editierbar nach Generierung
  - Nochmal "Generieren" schickt editierten Text + Chat mit
  - "Antwort speichern" speichert nur den finalen Text
- Dependencies: MT-3

## Out of scope
- Tatsaechlicher LLM-Call (kommt mit Dify-Anbindung BL-012)
- Voice Input (V2)
- Automatische Rueckfragen (kommt mit Dify)
