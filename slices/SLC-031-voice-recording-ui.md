# SLC-031 — Voice Recording UI + Integration

## Meta
- Feature: FEAT-019 (Voice Input)
- Backlog: BL-038, BL-039
- Priority: High
- Status: done

## Goal

Mikrofon-Button im Chat-Bereich mit Audio-Aufnahme, Transkription und Chat-Input-Integration. End-to-End Voice Input funktioniert.

## Scope

- Mikrofon-Button zwischen Textarea und Send-Button
- MediaRecorder API für Audio-Aufnahme (WebM/Opus)
- Recording-Indikator (Puls-Animation, Dauer-Timer)
- Transkription via /transcribe API Route
- Transkribierter Text im Chat-Eingabefeld (editierbar)
- Feature-Flag: Button nur sichtbar wenn NEXT_PUBLIC_WHISPER_ENABLED=true
- Mikrofon-Berechtigungs-Handling
- Max. Aufnahmedauer (5 Minuten, auto-stop)
- i18n-Keys für alle neuen UI-Texte (DE/EN/NL)
- Fehlerbehandlung (kein Mikrofon, Transkription fehlgeschlagen)

## Out of Scope

- Audio-Wiedergabe
- Echtzeit-Streaming-Transkription
- Audio-Speicherung

### Micro-Tasks

#### MT-1: Mikrofon-Button + Feature-Flag
- Goal: Mikrofon-Button im Chat-Eingabebereich anzeigen (nur wenn WHISPER_ENABLED)
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Button zwischen Textarea und Send-Button. Gleiche Styling-Klassen wie Send-Button. Nur sichtbar wenn `process.env.NEXT_PUBLIC_WHISPER_ENABLED === "true"`. Ohne Flag → kein Button, keine Funktionsänderung.
- Verification: Build kompiliert. Mit Flag → Button sichtbar. Ohne Flag → kein Button.
- Dependencies: none

#### MT-2: Audio-Aufnahme (MediaRecorder)
- Goal: Klick auf Mic-Button startet Audio-Aufnahme, erneuter Klick stoppt sie
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: getUserMedia → MediaRecorder → Start/Stop. audioChunks werden gesammelt. Button wechselt Zustand (Bereit → Aufnahme → Bereit). Browser fragt nach Mikrofon-Berechtigung beim ersten Klick.
- Verification: Browser zeigt Mikrofon-Berechtigung. Button-State wechselt. Kein Crash bei Berechtigung-Verweigerung.
- Dependencies: MT-1

#### MT-3: Recording-Indikator + Timer
- Goal: Visuelles Feedback während der Aufnahme
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Über dem Eingabefeld: Recording-Bar mit Puls-Animation (roter Punkt) und Dauer-Timer (MM:SS). Verschwindet nach Stop. Auto-Stop bei 5 Minuten mit Hinweis.
- Verification: Aufnahme starten → Timer läuft. 5:00 erreicht → automatischer Stop.
- Dependencies: MT-2

#### MT-4: Transkription + Chat-Input-Integration
- Goal: Nach Stop wird Audio an /transcribe gesendet, Text erscheint im Eingabefeld
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Stop → isTranscribing=true → POST /transcribe mit Audio-Blob → Antwort `{ transcript }` → setChatInput(transcript). User kann Text bearbeiten vor Absenden. Fehler → Toast/Hinweis.
- Verification: Aufnahme stoppen → Ladeindikator → Text erscheint im Eingabefeld → editierbar → Send funktioniert normal.
- Dependencies: MT-2, SLC-030 (API Route)

#### MT-5: i18n-Keys + Fehlerbehandlung
- Goal: Alle neuen UI-Texte in 3 Sprachen, robuste Fehlerbehandlung
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`, `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Neue Keys: recording, transcribing, micPermissionDenied, micNotAvailable, transcriptionFailed, maxRecordingReached. Alle in DE/EN/NL. Fehler-States zeigen lokalisierte Meldungen. Kein Mikrofon → Button disabled mit Tooltip.
- Verification: Sprache wechseln → Texte korrekt. Mikrofon verweigern → Fehlermeldung. Whisper down → Fehlermeldung.
- Dependencies: MT-4

#### MT-6: Deploy + End-to-End Smoke Test
- Goal: Voice Input auf Production deployen und testen
- Files: keine Code-Änderung, Deployment + Env-Var-Konfiguration
- Expected behavior: NEXT_PUBLIC_WHISPER_ENABLED=true in Coolify. Mic-Button sichtbar. Aufnahme → Transkription → Text im Eingabefeld → Chat funktioniert normal.
- Verification: Browser-Test auf https://blueprint.strategaizetransition.com — kompletter Voice-Input-Flow mit DE und EN.
- Dependencies: MT-5, SLC-029/MT-4 (Whisper auf Hetzner), SLC-030 (API Route deployed)
