# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: V3.1 alle 7 Slices done + QA passed. 3 Bugfixes nach Live-Test. Nächster Schritt: Gesamt-QA V3.1, /final-check, Deploy + Release.
- Current Phase: V3.1 QA

## Immediate Next Steps
1. Gesamt-QA V3.1
2. /final-check V3.1
3. Deploy + Release REL-007

## Active Scope
V3.1 — Mirror Usability. GF-Nominierungsformular, Mirror-Profil mit LLM-Personalisierung, verbessertes Onboarding (E-Mail + Policy), Run-Deadline, rollenbasiertes Learning Center. 3 Features (FEAT-032 bis FEAT-034), 8 Backlog-Items (BL-055 bis BL-062).

## Blockers
- aktuell keine

## Last Stable Version
- V3 — 2026-04-05 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. LLM auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1). Whisper auf large-v3. Ollama entfernt. V3 released (REL-006). V3.1: alle 7 Slices implementiert + QA passed, 3 Bugfixes nach Live-Test (i18n Profile, Learning Center Tabs, Deadline-Feld). FEAT-020 (Dedizierte Server) auf V4. BL-035 (Lektorat), BL-045 (DSGVO), BL-059 (Policy-Text Recht) offen.
