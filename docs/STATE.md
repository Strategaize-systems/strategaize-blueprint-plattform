# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: qa
- Current Focus: V2.1 Gesamt-QA bestanden. Learning Center deployed und live verifiziert auf blueprint.strategaizetransition.com. Nächster Schritt: /final-check.
- Current Phase: V2.1 QA (bestanden)

## Immediate Next Steps
1. /final-check für V2.1
2. V2.1 als released markieren
3. BL-045 (DSGVO Compliance) separat bearbeiten

## Active Scope
V2.1 — Onboarding & Hilfe. In-App Learning Center mit Hilfe-Button, Video-Tutorials (4 Lektionen mit Dummy-Content), Bedienungsanleitung (Markdown-basiert, durchsuchbar, mit TOC). Alles dreisprachig DE/EN/NL. 3 Features (FEAT-023/024/025) done, 3 Slices (SLC-032/033/034) done, 3 Backlog-Items (BL-042/043/044) done. Deployed und live verifiziert.

## Blockers
- aktuell keine

## Last Stable Version
- V2.1 — 2026-04-01 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (30GB nutzbar, 16 vCPUs). V2.1 Learning Center ist reines Frontend-Feature (kein zusätzlicher RAM-Bedarf). Neue Dependencies: react-markdown + remark-gfm. BL-035 (Lektorat) offen, niedrige Priorität. BL-045 (DSGVO Compliance) offen, läuft separat. Echter Content (Videos + Anleitung) kommt später via /user-guide Skill. V3 (FEAT-020 Dedizierte Server) geplant, kein Zeitdruck.
