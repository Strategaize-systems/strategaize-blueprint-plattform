# SLC-022 — Voice Input (Whisper)

## Feature
BL-021

## Priority
Medium — V2 Feature, nice-to-have fuer erste Kunden

## Scope
Spracheingabe im Chat-Bereich via Whisper (lokal auf Hetzner).

## Micro-Tasks

### MT-1: Whisper Container auf Hetzner
- Goal: Whisper als Docker-Service deployen
- Files: docker-compose.yml
- Expected behavior:
  - whisper Container mit small/medium Modell
  - REST API auf Port 9000 (intern)
  - ~2-5GB RAM je nach Modell
- Dependencies: none

### MT-2: Backend — Transcription Endpoint
- Goal: POST /api/tenant/transcribe — nimmt Audio, gibt Text zurueck
- Files: Neuer API-Endpoint
- Expected behavior:
  - Akzeptiert audio/webm oder audio/wav
  - Sendet an Whisper Container
  - Gibt transkribierten Text zurueck
  - Max 5 Minuten Audio
- Dependencies: MT-1

### MT-3: Frontend — Mikrofon-Button + Recording
- Goal: "Sprechen" Button im Chat-Bereich aktiviert Mikrofon
- Files: run-workspace-client.tsx
- Expected behavior:
  - Klick startet MediaRecorder (Browser API)
  - Rotes Puls-Icon waehrend Aufnahme
  - Stop → Audio an Transcription API
  - Transkribierter Text erscheint im Chat-Eingabefeld
  - User kann editieren bevor er sendet
- Dependencies: MT-2

### MT-4: Audio-Qualitaet + Fehlerbehandlung
- Goal: Robuste Audio-Verarbeitung
- Files: Transcription Endpoint, Frontend
- Expected behavior:
  - Browser-Kompatibilitaet (Chrome, Firefox, Safari)
  - Fehlermeldung wenn Mikrofon nicht verfuegbar
  - Timeout bei langen Aufnahmen
  - Loading-Spinner waehrend Transkription
- Dependencies: MT-3

## Estimated Effort
Mittel — 1-2 Tage

## Risiken
- RAM: Whisper + Ollama gleichzeitig = ~17GB minimum
- Browser-Kompatibilitaet MediaRecorder
- Transkriptions-Qualitaet bei Fachsprache/Akzent
- Alternative: Browser Web Speech API (kein Server noetig, weniger genau)
