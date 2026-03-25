# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: post-launch
- Current Focus: Systematische QA und Fix-Slices nach erstem Live-Deployment
- Current Phase: Post-Launch Stabilisierung (MVP-1)

## Immediate Next Steps
1. KI-001 fixen: RLS/GRANT Policies auf Produktions-DB anwenden
2. Fix-Slices für High-Priority Issues implementieren (KI-002 bis KI-007)
3. ARCHITECTURE.md mit tatsächlicher Architektur befüllen
4. Medium-Priority Fixes (KI-008 bis KI-014)

## Active Scope
MVP-1 — Kernplattform implementiert und deployed (8 Features, FEAT-001 bis FEAT-008). Auth, Admin-Dashboard, Tenant-Workspace, Event-Sourcing, Evidence-Upload, Submission-Checkpoints, ZIP-Export. Live auf https://blueprint.strategaizetransition.com seit 2026-03-25.

V1.1 — Geplant: LLM-Rückfragen (Dify + Ollama/Qwen), Antwort-Review-Übersicht.

## Blockers
- KI-001: permission denied for table tenants — Admin-Seiten nicht funktional
- SQL-Migrationen möglicherweise nicht vollständig auf Produktions-DB angewendet

## Last Stable Version
- MVP-1 — 2026-03-25 — deployed auf https://blueprint.strategaizetransition.com (Auth funktioniert, Admin-Seiten blockiert durch KI-001)

## Notes
MVP-1 wurde am 2026-03-25 erstmals deployed. Auth-Fix (Server Actions + interne Docker-URL) wurde am selben Tag angewendet. Erste Live-Tests zeigen Blocker KI-001 (permission denied). Systematische QA am 2026-03-25 ergab 18 Known Issues (1 Blocker, 6 High, 7 Medium, 4 Low). Siehe `/docs/KNOWN_ISSUES.md`.
