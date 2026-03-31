# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: released
- Current Focus: V2 released und deployed. Post-Launch Monitoring.
- Current Phase: Stable (V2)

## Immediate Next Steps
1. /post-launch für V2
2. Whisper-Qualität mit echten Kunden validieren
3. BL-035: Manuelles Lektorat UI-Texte (DE/EN/NL)

## Active Scope
V2 — Voice Input via Whisper. Released am 2026-03-31. FEAT-019 done, 4 Slices done (SLC-028 bis SLC-031), alle QAs bestanden, Final-Check conditionally ready → Go-Live GO.

Abgeschlossen: MVP-1 + V1.1 + V2.

## Blockers
- aktuell keine

## Last Stable Version
- V2 — 2026-03-31 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (30GB nutzbar, 16 vCPUs). Whisper Small deployed, RAM 25GB frei. Feature-Flag NEXT_PUBLIC_WHISPER_ENABLED=true. Rollback: Flag auf false oder Coolify Container-Rollback. 19 Features (18 done + FEAT-019), 28 Slices done, 41 Backlog-Items. V3 geplant: FEAT-020 (Dedizierte Server).
