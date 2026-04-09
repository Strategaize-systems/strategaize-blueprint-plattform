# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: released
- Current Focus: V3.3 released und stabil. Nächstes: V3.4 (Feedback + Compliance).
- Current Phase: V3.3 Released

## Immediate Next Steps
1. Live-Test Free-Form Chat End-to-End (Chat → Mapping → Accept)
2. /discovery V3.4 (FEAT-036 Feedback + FEAT-038 Compliance)
3. Offene Backlog-Items: BL-035 (Lektorat), BL-045 (DSGVO), BL-059 (Policy-Text)

## Active Scope
V3.3 — Unified Workspace. Drei-Tab-Layout (Offen, Frage für Frage, Feedback), direkter Einstieg ohne Mode-Selector, eingebetteter Free-Form Chat, Mapping/Review als Vollbild-Overlay. Reine Frontend-Arbeit, keine API-Änderungen. FEAT-037, BL-065.

## Blockers
- aktuell keine

## Last Stable Version
- V3.3 — 2026-04-09 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. LLM auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1). Whisper auf large-v3. Ollama entfernt. V3.2 deployed: Free-Form Chat (FEAT-035) implementiert + Bug-Fix (React Hooks Violation). V3.3: Unified Tabbed Workspace (FEAT-037). FEAT-036 (Feedback) als Platzhalter in V3.3, Inhalt in V3.4. FEAT-020 (Dedizierte Server) auf V4. BL-035 (Lektorat), BL-045 (DSGVO), BL-059 (Policy-Text Recht) offen.
