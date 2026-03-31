# SLC-030 — Transcription API Route

## Meta
- Feature: FEAT-019 (Voice Input)
- Backlog: BL-037
- Priority: High
- Status: done

## Goal

Server-seitige API Route die Audio empfängt, an Whisper sendet und transkribierten Text zurückgibt. Authentifiziert und Tenant-isoliert.

## Scope

- Neue API Route: `/api/tenant/runs/[runId]/questions/[questionId]/transcribe`
- Auth via requireTenant() (identisch zum Chat-Endpunkt)
- FormData-Parsing (Audio-Blob)
- Validierung: Dateigröße (max 25MB), MIME-Type
- Whisper-Aufruf via whisper.ts Utility
- Tenant-Locale als Language-Hint
- Fehlerbehandlung (503/413/400/500)

## Out of Scope

- Frontend UI (SLC-031)
- Audio-Speicherung (DEC-017: keine Speicherung)

### Micro-Tasks

#### MT-1: API Route Grundgerüst + Auth
- Goal: Route-Datei erstellen mit Auth-Check und FormData-Parsing
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/transcribe/route.ts`
- Expected behavior: POST-Request mit Auth-Check. Ohne gültige Session → 401. Ohne Audio-Datei → 400.
- Verification: Build kompiliert. Curl ohne Auth → 401.
- Dependencies: none

#### MT-2: Audio-Validierung + Whisper-Aufruf
- Goal: Audio validieren und an Whisper senden, Transkription zurückgeben
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/transcribe/route.ts`
- Expected behavior: Audio > 25MB → 413. Gültiges Audio → Whisper-Call → `{ transcript: "...", language: "de" }`. Whisper nicht erreichbar → 503.
- Verification: Curl mit WAV-Datei → transkribierter Text zurück. Curl mit zu großer Datei → 413.
- Dependencies: MT-1, SLC-029 (Whisper-Service muss laufen)

#### MT-3: Language-Hint aus Tenant-Locale
- Goal: Tenant-Sprache als Whisper Language-Hint mitgeben
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/transcribe/route.ts`
- Expected behavior: Tenant mit language=nl → Whisper bekommt `language: "nl"`. Verbessert Erkennung bei kurzen Aufnahmen.
- Verification: Request von NL-Tenant → Whisper-Log zeigt "nl" als language parameter
- Dependencies: MT-2
