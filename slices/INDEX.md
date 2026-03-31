# Slice Index

> Zentrale Übersicht aller Implementation Slices. Wird durch `/slice-planning` befüllt.

## Status Legend
- **planned** — definiert, nicht gestartet
- **in_progress** — aktuell in Arbeit
- **done** — implementiert und QA bestanden
- **blocked** — blockiert durch Abhängigkeit oder Problem

## Post-Launch Fix-Slices (2026-03-25)

Priorisierte Fix-Slices basierend auf systematischer QA. Reihenfolge: Blocker → High → Medium.

| ID | Slice | Feature | Status | Priority | Issues | Created |
|----|-------|---------|--------|----------|--------|---------|
| SLC-001 | [RLS & Grants Fix](SLC-001-rls-grants-fix.md) | FEAT-001 | done | Blocker | ISSUE-001 | 2026-03-25 |
| SLC-002 | [Security Hardening](SLC-002-security-hardening.md) | FEAT-001 | done | High | ISSUE-003, 007, 009 | 2026-03-25 |
| SLC-003 | [Documentation Accuracy](SLC-003-docs-accuracy.md) | — | done | High | ISSUE-005, 006, 012, 013 | 2026-03-25 |
| SLC-004 | [DB Integrity Hardening](SLC-004-db-integrity.md) | FEAT-001, 005, 006 | done | Medium | ISSUE-010, 014, 018 | 2026-03-25 |
| SLC-005 | [Monitoring & Observability](SLC-005-monitoring-setup.md) | — | done | High/Medium | ISSUE-004, 011, 015, 016 | 2026-03-25 |
| SLC-006 | Invite-Flow Fix + SMTP | FEAT-001 | done | Blocker | ISSUE-019 | 2026-03-26 |

## V1.1 UI-Update Slices (BL-020)

Style Guide Implementation — Seite für Seite. Reihenfolge: Foundation → Layout → Pages → Auth.

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-007 | [Design Foundation](SLC-007-design-foundation.md) | BL-020 | done | High | 2026-03-26 |
| SLC-008 | [Admin Layout: Sidebar](SLC-008-admin-layout.md) | BL-020 | done | High | 2026-03-26 |
| SLC-009 | [Admin Pages: Cards + Tables](SLC-009-admin-pages.md) | BL-020 | done | High | 2026-03-26 |
| SLC-010 | [Tenant Pages: Dashboard + Workspace](SLC-010-tenant-pages.md) | BL-020 | done | High | 2026-03-26 |
| SLC-011 | [Auth Pages + Shared Components](SLC-011-auth-shared.md) | BL-020 | done | Medium | 2026-03-26 |
| SLC-012 | [Workspace Redesign](SLC-012-workspace-redesign.md) | BL-020 | done | High | 2026-03-27 |
| SLC-013 | [Workspace Premium](SLC-013-workspace-premium.md) | BL-020 | done | High | 2026-03-27 |
| SLC-014 | [Admin Pages Premium](SLC-014-admin-premium.md) | BL-020 | done | Medium | 2026-03-27 |
| SLC-015 | [Block-basierte Checkpoints](SLC-015-block-checkpoints.md) | — | done | High | 2026-03-27 |
| SLC-016 | [Chat + Antwort generieren](SLC-016-chat-generate-answer.md) | BL-012 | done | High | 2026-03-27 |
| SLC-017 | [Ollama LLM Integration](SLC-017-ollama-llm.md) | BL-012, BL-013 | done | High | 2026-03-28 |
| SLC-018 | [Rollen-System: Tenant-Admin + Block-Zugriff](SLC-018-role-system.md) | BL-023 | done | High | 2026-03-28 |
| SLC-019 | [Antwort-Review Übersichtsseite](SLC-019-review-overview.md) | BL-015 | done | Medium | 2026-03-29 |
| SLC-020 | [Dokument-Analyse: LLM Feedback](SLC-020-document-analysis.md) | BL-027 | done | High | 2026-03-29 |
| SLC-021 | ~~Mehrsprachigkeit DE/EN/NL~~ (ersetzt durch SLC-024–027) | BL-022 | — | — | 2026-03-29 |
| SLC-024 | [i18n Foundation: DB + next-intl](SLC-024-i18n-foundation.md) | BL-022 | done | High | 2026-03-30 |
| SLC-025 | [UI-Texte extrahieren + übersetzen](SLC-025-ui-translations.md) | BL-022 | done | High | 2026-03-30 |
| SLC-026 | [LLM-Prompts + E-Mail Locale](SLC-026-llm-email-locale.md) | BL-022 | done | High | 2026-03-30 |
| SLC-027 | [Katalog-Sprache + Admin](SLC-027-catalog-language.md) | BL-022 | done | Medium | 2026-03-30 |
## Pre-V2 Fix

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-028 | [Block Access Control Fix](SLC-028-block-access-fix.md) | FEAT-012, BL-041 | planned | Blocker | 2026-03-31 |

## V2 Slices — Voice Input

> SLC-022 (alter Platzhalter) ersetzt durch SLC-029–031.

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-029 | [Whisper Infrastructure](SLC-029-whisper-infrastructure.md) | FEAT-019 | planned | High | 2026-03-31 |
| SLC-030 | [Transcription API Route](SLC-030-transcription-api.md) | FEAT-019 | planned | High | 2026-03-31 |
| SLC-031 | [Voice Recording UI + Integration](SLC-031-voice-recording-ui.md) | FEAT-019 | planned | High | 2026-03-31 |

## V2 Execution Order

```
1. SLC-028 (Blocker)     → Block Access Fix — MUSS VOR V2
2. SLC-029 (Infra)       → Whisper Docker + whisper.ts + Deploy
3. SLC-030 (Backend)     → /transcribe API Route
4. SLC-031 (Frontend)    → Mic-Button + Recording + Integration + E2E
```

## V3 Slices (Geplant)

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-023 | Dedizierte Server pro Kunde | FEAT-020 | planned | Medium | 2026-03-29 |
