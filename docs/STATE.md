# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: architecture
- Current Focus: V2 Architecture abgeschlossen (Whisper ASR Integration). Nächster Schritt: Slice-Planning, dann BL-041 Bug-Fix (Block-Zugriffskontrolle), dann Implementation.
- Current Phase: V2 Architecture

## Immediate Next Steps
1. /slice-planning für V2 — Voice Input in Implementierungs-Slices aufteilen
2. BL-041 fixen — Block-Zugriffskontrolle (ISSUE-029) vor V2-Implementation
3. /frontend + /backend pro Slice

## Active Scope
V2 — Voice Input via Whisper. Spracheingabe im Chat-Bereich, serverseitig transkribiert durch selbst-gehosteten Whisper ASR Service (Docker, internes Netzwerk). Whisper Small zuerst, Upgrade auf Medium wenn Kunden da sind.

Abgeschlossen: MVP-1 + V1.1 (24 Slices, 18 Features, deployed auf https://blueprint.strategaizetransition.com).

## Blockers
- ISSUE-029 / BL-041: Block-Zugriffskontrolle funktioniert nicht korrekt. Muss vor V2-Implementation gefixt werden.

## Last Stable Version
- V1.1 — 2026-03-31 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (32GB RAM, 16 vCPUs). V2 Architektur: Whisper ASR Webservice als Docker-Container (Port 9000 intern), neue API Route /transcribe, Mikrofon-Button im Chat-UI, Feature-Flag NEXT_PUBLIC_WHISPER_ENABLED. RAM-Bewertung: ~20-27GB mit Whisper Small, 32GB sollte reichen. DEC-013 bis DEC-015 dokumentiert.
