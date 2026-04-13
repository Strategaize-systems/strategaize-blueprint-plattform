# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: V3.4 alle 3 Slices done (SLC-062, SLC-063, SLC-064). Naechster Schritt: /qa SLC-064, dann Gesamt-QA V3.4.
- Current Phase: V3.4 QA

## Immediate Next Steps
1. /qa SLC-064 (Compliance Export)
2. Gesamt-QA V3.4
3. /final-check + /go-live + /deploy

## Active Scope
V3.4 — Feedback + Compliance. FEAT-036: Feedback-Tab im Workspace aktivieren, 4 feste Fragen, run_feedback Tabelle, depersonalisierter Export. FEAT-038: Export-Haertung (freeform aus Mirror ausschliessen), freeform in Management-Export, RLS-Audit, Compliance-Doku.

## Blockers
- aktuell keine

## Last Stable Version
- V3.3 — 2026-04-09 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. LLM auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1). Whisper auf large-v3. Ollama entfernt. V3.2 deployed: Free-Form Chat (FEAT-035) implementiert + Bug-Fix (React Hooks Violation). V3.3: Unified Tabbed Workspace (FEAT-037). FEAT-036 (Feedback) als Platzhalter in V3.3, Inhalt in V3.4. FEAT-020 (Dedizierte Server) auf V4. BL-035 (Lektorat), BL-045 (DSGVO), BL-059 (Policy-Text Recht) offen.
