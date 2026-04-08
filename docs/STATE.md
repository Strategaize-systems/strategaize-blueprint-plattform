# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: SLC-056 (Chat UI + Voice + Soft-Limit) done. QA SLC-056 als nächstes, dann SLC-057 (Mapping-Review).
- Current Phase: V3.2 Implementation

## Immediate Next Steps
1. /qa SLC-056
2. /frontend SLC-057 (Mapping-Review + Accept)
3. Gesamt-QA V3.2
4. /final-check V3.2
5. /deploy V3.2

## Active Scope
V3.2 — Mirror Smart Input. Free-Form Chat mit LLM-Mapping auf strukturierte Fragen (FEAT-035). 5 Slices (SLC-053 bis SLC-057), 1 Backlog-Item (BL-063).

## Blockers
- aktuell keine

## Last Stable Version
- V3.1 — 2026-04-07 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. LLM auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1). Whisper auf large-v3. Ollama entfernt. V3 released (REL-006). V3.1 Gesamt-QA PASS: 7 Slices, 6 Bugfixes, Live-Test bestanden. FEAT-020 (Dedizierte Server) auf V4. BL-035 (Lektorat), BL-045 (DSGVO), BL-059 (Policy-Text Recht) offen. V3.2 geplant: Free-Form Chat (FEAT-035) + Feedback-Loop (FEAT-036).
