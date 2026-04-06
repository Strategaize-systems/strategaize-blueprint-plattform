# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: released
- Current Focus: V3 released (REL-006). LLM auf Claude Sonnet 4.6 via Bedrock migriert. Nächster Zyklus: V3.1 Mirror Usability.
- Current Phase: Stable (V3)

## Immediate Next Steps
1. /architecture V3.1 (FEAT-032, 033, 034 + BL-055 bis BL-062)
2. /slice-planning V3.1
3. Implementation V3.1

## Active Scope
V3 — Operational Reality Mirror Phase 1 (Infrastruktur). Zweite Erhebungsschicht (bottom-up) neben bestehendem Management View (top-down). survey_type auf DB-Ebene, mirror_respondent Rolle, vertraulicher Einladungsflow, getrennte Exportströme. Keine konkreten Fragen (Phase 2). 4 Features (FEAT-028 bis FEAT-031), 4 Backlog-Items (BL-050 bis BL-053).

## Blockers
- aktuell keine

## Last Stable Version
- V3 — 2026-04-05 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. V2.2 stabil. V3 ist eine strukturelle Erweiterung (~15 Dateien betroffen: 5 DB-Tabellen, 9 RLS-Policies, 11+ API-Routes). FEAT-020 (Dedizierte Server) auf V4 verschoben. BL-035 (Lektorat) und BL-045 (DSGVO) offen.
