# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: released
- Current Focus: V3.1 released (REL-007). Nächster Zyklus: V3.2 (Free-Form Chat + Feedback-Loop).
- Current Phase: Stable (V3.1)

## Immediate Next Steps
1. /discovery V3.2 FEAT-035 (Free-Form Chat mit LLM-Mapping)
2. /requirements V3.2 FEAT-036 (Feedback-Loop)
3. Implementation V3.2

## Active Scope
V3.1 — Mirror Usability. GF-Nominierungsformular, Mirror-Profil mit LLM-Personalisierung, verbessertes Onboarding (E-Mail + Policy), Run-Deadline, rollenbasiertes Learning Center. 3 Features (FEAT-032 bis FEAT-034), 8 Backlog-Items (BL-055 bis BL-062).

## Blockers
- aktuell keine

## Last Stable Version
- V3.1 — 2026-04-07 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62. LLM auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1). Whisper auf large-v3. Ollama entfernt. V3 released (REL-006). V3.1 Gesamt-QA PASS: 7 Slices, 6 Bugfixes, Live-Test bestanden. FEAT-020 (Dedizierte Server) auf V4. BL-035 (Lektorat), BL-045 (DSGVO), BL-059 (Policy-Text Recht) offen. V3.2 geplant: Free-Form Chat (FEAT-035) + Feedback-Loop (FEAT-036).
