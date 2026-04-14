# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: final-check
- Current Focus: V3.4 als letzter Blueprint-Release — Deploy heute. Strategieentscheidung 2026-04-14: Blueprint wird nach V3.4 Deploy eingefroren. Weiterentwicklung erfolgt in neuer Onboarding-Plattform (separates Repo).
- Current Phase: V3.4 Final Deploy / Blueprint Freeze

## Immediate Next Steps
1. /final-check (Code/Docs Audit)
2. Coolify Redeploy + Migration 020 auf Hetzner + Browser-Test
3. /go-live + /deploy
4. Blueprint einfrieren (State: frozen, Container pausieren)
5. Neues Repo: strategaize-onboarding-plattform anlegen
6. /discovery fuer Onboarding-Plattform

## Active Scope
V3.4 — Feedback + Compliance. FEAT-036: Feedback-Tab im Workspace aktivieren, 4 feste Fragen, run_feedback Tabelle, depersonalisierter Export. FEAT-038: Export-Haertung (freeform aus Mirror ausschliessen), freeform in Management-Export, RLS-Audit, Compliance-Doku.

## Blockers
- aktuell keine

## Last Stable Version
- V3.3 — 2026-04-09 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. LLM auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1). Whisper auf large-v3. Ollama entfernt. V3.2 deployed: Free-Form Chat (FEAT-035) implementiert + Bug-Fix (React Hooks Violation). V3.3: Unified Tabbed Workspace (FEAT-037). FEAT-036 (Feedback) als Platzhalter in V3.3, Inhalt in V3.4.

**Strategieentscheidung 2026-04-14 (FREEZE):** Blueprint wird nach V3.4 Deploy als Produkt eingefroren. Kein Blueprint-V4. Weiterentwicklung (Capture-Modi + OS-Verdichtungslayer + Template-System) erfolgt in neuer Onboarding-Plattform (separates Repo strategaize-onboarding-plattform). FEAT-020 (Dedizierte Server), V4 Interne Meetings wandern in Onboarding-Plattform.

**Bewusst offen & akzeptiert beim Einfrieren:**
- BL-035 (Lektorat Fragen): kosmetisch, kein Deploy-Blocker
- BL-045 (DSGVO-Dokument fuer Kundenuebergabe): nicht noetig, Blueprint wird nicht produktiv an Kunden uebergeben
- BL-059 (Policy-Text Recht): nicht noetig, Blueprint wird eingefroren
- FEAT-023/024/025 User-Guide-Ausbau: kosmetisch, kein Deploy-Blocker
