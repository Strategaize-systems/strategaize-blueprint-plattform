# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: BL-025 + BL-026 done. Alle Admin-Seiten Premium. Nächster Schritt: BL-017 Sentry Error-Tracking.
- Current Phase: V1.1 Implementation

## Immediate Next Steps
1. BL-017/018: Sentry Error-Tracking + strukturiertes Logging
2. BL-015: Antwort-Review Übersichtsseite
3. BL-016: PDF/TXT-Parsing für LLM-Kontext
4. BL-022: Mehrsprachigkeit (DE/EN/NL)
5. BL-021: Voice Input (Whisper)
6. Erstes echtes Kunden-Onboarding

## Active Scope
MVP-1 — Kernplattform deployed und stabil. 8 Features, Auth, Admin, Tenant-Workspace, Event-Sourcing, Evidence, Checkpoints, ZIP-Export. Premium UI mit Style Guide v2.1.

V1.1 — In Arbeit: LLM-Rückfragen via Ollama/Qwen (lokal auf Hetzner, DSGVO-konform), Chat-basierter Antwort-Workflow, Block-basierte Checkpoints, Premium Workspace-Design, Rollen-System (tenant_admin + Block-Zugriff).

## Blockers
- aktuell keine

## Last Stable Version
- MVP-1 — 2026-03-26 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Tech-Stack: Dify entfernt (DEC-005), Cloud-API ausgeschlossen wegen DSGVO (DEC-006). LLM läuft lokal auf Hetzner via Ollama + Qwen 2.5 14B. Server: Hetzner CPX62 (32GB RAM, 16 vCPUs). Block-basierte Checkpoints (DEC-007), Mehrfach-Antworten pro Frage (DEC-008), Rollen-System mit tenant_admin + Block-Zugriff (SLC-018).
