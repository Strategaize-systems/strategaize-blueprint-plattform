# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: SLC-029 (Whisper Infrastructure) done. SLC-030 (Transcription API) als nächstes.
- Current Phase: V2 Implementation

## Immediate Next Steps
1. /qa für SLC-029
2. SLC-030: Transcription API Route
3. SLC-031: Voice Recording UI + Integration

## Active Scope
V2 — Voice Input via Whisper. SLC-028 (Block Access Fix) und SLC-029 (Whisper Infrastructure) erledigt. Whisper-Container läuft auf Hetzner, RAM ausreichend (25GB frei). 2 Slices verbleiben.

Abgeschlossen: MVP-1 + V1.1 + SLC-028 + SLC-029.

## Blockers
- aktuell keine

## Last Stable Version
- V1.1 — 2026-03-31 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (30GB nutzbar, 16 vCPUs). Whisper Small deployed, RAM-Verbrauch ~5.3GB (ohne Ollama geladen). Whisper-Container antwortet auf Port 9000 intern. NEXT_PUBLIC_WHISPER_ENABLED=true in Coolify gesetzt.
