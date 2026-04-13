# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: qa
- Current Focus: V3.4 Gesamt-QA PASS (RPT-068). Alle 3 Slices (SLC-062, SLC-063, SLC-064) verifiziert. Naechster Schritt: Redeploy + Browser-Test, dann Migration 020 auf Hetzner, dann /final-check.
- Current Phase: V3.4 Pre-Deploy

## Immediate Next Steps
1. Redeploy auf Hetzner (Coolify UI) + Browser-Test der V3.4 Features
2. Migration 020 auf Hetzner ausfuehren (run_feedback Tabelle)
3. /final-check
4. /go-live + /deploy

## Active Scope
V3.4 — Feedback + Compliance. FEAT-036: Feedback-Tab im Workspace aktivieren, 4 feste Fragen, run_feedback Tabelle, depersonalisierter Export. FEAT-038: Export-Haertung (freeform aus Mirror ausschliessen), freeform in Management-Export, RLS-Audit, Compliance-Doku.

## Blockers
- aktuell keine

## Last Stable Version
- V3.3 — 2026-04-09 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. LLM auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1). Whisper auf large-v3. Ollama entfernt. V3.2 deployed: Free-Form Chat (FEAT-035) implementiert + Bug-Fix (React Hooks Violation). V3.3: Unified Tabbed Workspace (FEAT-037). FEAT-036 (Feedback) als Platzhalter in V3.3, Inhalt in V3.4. FEAT-020 (Dedizierte Server) auf V4. BL-035 (Lektorat), BL-045 (DSGVO), BL-059 (Policy-Text Recht) offen.
