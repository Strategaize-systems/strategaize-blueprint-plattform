# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: post-launch
- Current Focus: MVP-1 deployed und funktional. Invite-Link-Bug (ISSUE-019) blockiert Tenant-Onboarding.
- Current Phase: Post-Launch Stabilisierung (MVP-1)

## Immediate Next Steps
1. ISSUE-019 fixen: GoTrue Invite-Link zeigt auf internen Hostname statt externe Domain
2. Tenant-Invite-Flow E2E testen (Invite → Set-Password → Login → Dashboard)
3. UI-Update mit Style Guide
4. V1.1 Planung starten
3. SLC-004: DB Integrity Hardening (Append-only Trigger, tenant_id, FK RESTRICT)
4. SLC-005: Monitoring & Observability (Sentry, N+1 Fix, Logging)

## Active Scope
MVP-1 — Kernplattform implementiert und deployed (8 Features, FEAT-001 bis FEAT-008). Auth, Admin-Dashboard, Tenant-Workspace, Event-Sourcing, Evidence-Upload, Submission-Checkpoints, ZIP-Export. Live auf https://blueprint.strategaizetransition.com seit 2026-03-25.

V1.1 — Geplant: LLM-Rückfragen (Dify + Ollama/Qwen), Antwort-Review-Übersicht.

## Blockers
- aktuell keine

## Last Stable Version
- MVP-1 — 2026-03-26 — deployed auf https://blueprint.strategaizetransition.com (Admin-Seiten funktional nach ISSUE-001 Fix)

## Notes
ISSUE-001 (Blocker: permission denied for table tenants) am 2026-03-26 behoben. Root Cause: service_role hatte BYPASSRLS aber keine Table-Level GRANTs. Fix in sql/rls.sql und auf Production-DB angewendet. 17 offene Issues verbleiben (6 High, 6 Medium, 4 Low, 1 resolved). Siehe `/docs/KNOWN_ISSUES.md` und `/slices/INDEX.md`.
