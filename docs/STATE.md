# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: Alle 3 V2.1 Slices (SLC-032/033/034) implementiert. Learning Center komplett mit Help-Button, Video-Tutorials, User Guide + Suche. Nächster Schritt: /qa für SLC-034, dann Gesamt-QA.
- Current Phase: V2.1 Implementation (alle Slices done)

## Immediate Next Steps
1. /qa für SLC-034
2. Gesamt-QA V2.1
3. /final-check
4. Commit + Deploy

## Active Scope
V2.1 — Onboarding & Hilfe. In-App Learning Center mit Hilfe-Button, Video-Tutorials (3-4 Lektionen), Bedienungsanleitung (Markdown-basiert, durchsuchbar). Alles dreisprachig DE/EN/NL. Implementation mit Dummy-Content, echter Content kommt später via /user-guide Skill. BL-045 (DSGVO Compliance) läuft separat.

## Blockers
- aktuell keine

## Last Stable Version
- V2 — 2026-03-31 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (30GB nutzbar, 16 vCPUs). V2 stabil, keine offenen Live-Issues. BL-035 (Lektorat) offen, niedrige Priorität. V2.1 hat 3 Features (FEAT-023/024/025), 3 Backlog-Items (BL-042/043/044). Neue Dependency geplant: react-markdown + remark-gfm für Anleitungs-Rendering. V3 (FEAT-020 Dedizierte Server) geplant, kein Zeitdruck.
