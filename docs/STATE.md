# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: LLM live (Ollama + Qwen 2.5 14B). Chat + Zusammenfassung funktional. Nächster Schritt: Prompt-Feintuning + weitere Features.
- Current Phase: V1.1 Implementation

## Immediate Next Steps
1. BL-014: Prompt-Feintuning (Rückfragen-Qualität, Zusammenfassungs-Struktur)
2. BL-023: Rollen-System (Sub-Admin / Tenant-Admin für ersten Kunden)
3. BL-022: Mehrsprachigkeit (DE/EN/NL)
4. BL-017/018: Sentry Error-Tracking
5. BL-021: Voice Input (RAM-Situation prüfen)
6. Erstes echtes Kunden-Onboarding

## Active Scope
MVP-1 — Kernplattform deployed und stabil. 8 Features, Auth, Admin, Tenant-Workspace, Event-Sourcing, Evidence, Checkpoints, ZIP-Export. Premium UI mit Style Guide v2.1.

V1.1 — In Arbeit: LLM-Rückfragen via Ollama/Qwen (lokal auf Hetzner, DSGVO-konform), Chat-basierter Antwort-Workflow, Block-basierte Checkpoints, Premium Workspace-Design.

## Blockers
- aktuell keine

## Last Stable Version
- MVP-1 — 2026-03-26 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Tech-Stack-Änderung am 2026-03-28: Dify entfernt (DEC-005), Cloud-API ausgeschlossen wegen DSGVO (DEC-006). LLM läuft lokal auf Hetzner via Ollama + Qwen 2.5 14B. Block-basierte Checkpoints (DEC-007) und Mehrfach-Antworten pro Frage (DEC-008) implementiert. UI-Update komplett (SLC-007 bis SLC-014). Chat-UI + Generate Answer bereit (SLC-016).
