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
| SLC-028 | [Block Access Control Fix](SLC-028-block-access-fix.md) | FEAT-012, BL-041 | done | Blocker | 2026-03-31 |

## V2 Slices — Voice Input

> SLC-022 (alter Platzhalter) ersetzt durch SLC-029–031.

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-029 | [Whisper Infrastructure](SLC-029-whisper-infrastructure.md) | FEAT-019 | done | High | 2026-03-31 |
| SLC-030 | [Transcription API Route](SLC-030-transcription-api.md) | FEAT-019 | done | High | 2026-03-31 |
| SLC-031 | [Voice Recording UI + Integration](SLC-031-voice-recording-ui.md) | FEAT-019 | done | High | 2026-03-31 |

## V2 Execution Order

```
1. SLC-028 (Blocker)     → Block Access Fix — MUSS VOR V2
2. SLC-029 (Infra)       → Whisper Docker + whisper.ts + Deploy
3. SLC-030 (Backend)     → /transcribe API Route
4. SLC-031 (Frontend)    → Mic-Button + Recording + Integration + E2E
```

## V2.1 Slices — Learning Center

> 3 Slices für 3 Features. Lineare Abhängigkeitskette: SLC-032 → SLC-033/034 (parallel möglich).

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-032 | [Learning Center Shell + Help Button](SLC-032-learning-center-shell.md) | FEAT-023 | done | High | 2026-04-01 |
| SLC-033 | [Video Tutorials](SLC-033-video-tutorials.md) | FEAT-024 | done | High | 2026-04-01 |
| SLC-034 | [User Guide + Search](SLC-034-user-guide.md) | FEAT-025 | done | High | 2026-04-01 |

## V2.1 Execution Order

```
1. SLC-032 (Foundation)  → Shell + Help Button + Dependencies + i18n
2. SLC-033 (Content)     → Video Tutorials Tab (hängt von SLC-032 ab)
3. SLC-034 (Content)     → User Guide + Search (hängt von SLC-032 ab)

SLC-033 und SLC-034 können nach SLC-032 parallel implementiert werden,
aber sequentiell ist sauberer für QA nach jedem Slice.
```

## V2.2 Slices — Personalized LLM

> 5 Slices für 2 Features. Abhängigkeitskette: SLC-035 → SLC-036/037/038 → SLC-039.

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-035 | [DB-Schema: owner_profiles + run_memory](SLC-035-db-schema-v22.md) | FEAT-026, FEAT-027 | done | High | 2026-04-02 |
| SLC-036 | [Owner-Profil: Backend + Frontend](SLC-036-owner-profil.md) | FEAT-026 | done | High | 2026-04-02 |
| SLC-037 | [LLM Profil-Injection](SLC-037-llm-profil-injection.md) | FEAT-026 | done | High | 2026-04-02 |
| SLC-038 | [Run Memory Backend](SLC-038-run-memory-backend.md) | FEAT-027 | done | High | 2026-04-02 |
| SLC-039 | [Memory Frontend + Polish](SLC-039-memory-frontend.md) | FEAT-027 | done | Medium | 2026-04-02 |

## V2.2 Execution Order

```
1. SLC-035 (DB)          → Tabellen + RLS + GRANTs
2. SLC-036 (Full-Stack)  → Profil API + Formular + Redirect (hängt von SLC-035 ab)
3. SLC-037 (Backend)     → Profil in LLM-Prompts (hängt von SLC-035/036 ab)
4. SLC-038 (Backend)     → Memory Write + Read + Injection (hängt von SLC-035/037 ab)
5. SLC-039 (Frontend)    → Memory-Anzeige + i18n (hängt von SLC-038 ab)
```

## V3 Slices — Operational Reality Mirror (Phase 1)

> 6 Slices für 4 Features. Abhängigkeitskette: SLC-040 → SLC-041 → SLC-042/043/044/045 (teilweise parallel).

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-040 | [Mirror DB-Schema](SLC-040-mirror-db-schema.md) | FEAT-028 | done | High | 2026-04-03 |
| SLC-041 | [Mirror RLS-Policies](SLC-041-mirror-rls.md) | FEAT-029 | done | High | 2026-04-03 |
| SLC-042 | [Admin: Mirror-Run-Erstellung](SLC-042-admin-mirror-runs.md) | FEAT-028 | done | High | 2026-04-03 |
| SLC-043 | [Mirror Invite + Onboarding](SLC-043-mirror-invite-onboarding.md) | FEAT-030 | done | High | 2026-04-03 |
| SLC-044 | [Mirror Workspace](SLC-044-mirror-workspace.md) | FEAT-029 | done | High | 2026-04-03 |
| SLC-045 | [Mirror Export](SLC-045-mirror-export.md) | FEAT-031 | done | Medium | 2026-04-03 |

## V3 Execution Order

```
1. SLC-040 (DB)          → Schema: survey_type, respondent_layer, mirror_policy_confirmations
2. SLC-041 (DB/RLS)      → Policies survey_type-aware + Validierung (hängt von SLC-040 ab)
3. SLC-042 (Admin)       → Run-Erstellung mit survey_type (hängt von SLC-040/041 ab)
4. SLC-043 (Admin+Auth)  → Mirror-Invite + Policy-Seite (hängt von SLC-040/041 ab)
5. SLC-044 (Frontend)    → Mirror-Workspace + Dashboard (hängt von SLC-040/041/043 ab)
6. SLC-045 (Backend)     → Mirror-Export v2.0 (hängt von SLC-040/041 ab)

SLC-042/043/044/045 können nach SLC-041 teilweise parallel laufen,
aber sequentiell ist sauberer für QA und Kontext-Management.
```

## V3.1 Slices — Mirror Usability

> 7 Slices für 3 Features + 5 Backlog-Items. Abhängigkeitskette: SLC-046 → SLC-047/049/050/051 (parallel nach DB) → SLC-048 (nach 047) → SLC-052 (nach 049).

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-046 | [V3.1 DB-Schema](SLC-046-v31-db-schema.md) | FEAT-032, 033, 034 | done | High | 2026-04-07 |
| SLC-047 | [Nominations Backend](SLC-047-nominations-backend.md) | FEAT-032 | done | High | 2026-04-07 |
| SLC-048 | [Nominations Frontend](SLC-048-nominations-frontend.md) | FEAT-032 | done | High | 2026-04-07 |
| SLC-049 | [Mirror-Profil](SLC-049-mirror-profile.md) | FEAT-033 | done | High | 2026-04-07 |
| SLC-050 | [Mirror-Onboarding](SLC-050-mirror-onboarding.md) | FEAT-033 | done | High | 2026-04-07 |
| SLC-051 | [Run-Deadline](SLC-051-run-deadline.md) | FEAT-034 | done | Medium | 2026-04-07 |
| SLC-052 | [Learning Center Mirror](SLC-052-learning-center-mirror.md) | FEAT-033 | done | Medium | 2026-04-07 |

## V3.1 Execution Order

```
1. SLC-046 (DB)          → Schema: mirror_nominations, mirror_profiles, runs.due_date
2. SLC-047 (Backend)     → Nominations API CRUD (hängt von SLC-046 ab)
3. SLC-049 (Full-Stack)  → Mirror-Profil API + Formular + LLM-Kontext (hängt von SLC-046 ab)
4. SLC-050 (Backend+UI)  → Mirror E-Mail + Policy-Erweiterung (hängt von SLC-046 ab)
5. SLC-051 (Full-Stack)  → Run-Deadline Admin + Dashboard (hängt von SLC-046 ab)
6. SLC-048 (Frontend)    → Nominations GF-Seite + Admin-Integration (hängt von SLC-047 ab)
7. SLC-052 (Frontend)    → Learning Center Mirror-Inhalte (hängt von SLC-049 ab)

SLC-047/049/050/051 können nach SLC-046 parallel laufen.
SLC-048 braucht SLC-047. SLC-052 braucht SLC-049.
Sequentiell ist sauberer für QA.
```

## V3.2 Slices — Free-Form Chat

> 5 Slices für 1 Feature (FEAT-035). Abhängigkeitskette: SLC-053 → SLC-054 → SLC-055/056 → SLC-057.

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-053 | [Free-Form DB-Schema + LLM-Prompts](SLC-053-freeform-db-schema.md) | FEAT-035 | done | High | 2026-04-08 |
| SLC-054 | [Free-Form API-Routen](SLC-054-freeform-api-routes.md) | FEAT-035 | done | High | 2026-04-08 |
| SLC-055 | [Modus-Auswahl + Fragen-Übersicht](SLC-055-freeform-mode-overview.md) | FEAT-035 | done | High | 2026-04-08 |
| SLC-056 | [Free-Form Chat UI + Soft-Limit](SLC-056-freeform-chat-ui.md) | FEAT-035 | done | High | 2026-04-08 |
| SLC-057 | [Mapping-Review + Antwort-Übernahme](SLC-057-freeform-mapping-review.md) | FEAT-035 | done | High | 2026-04-08 |

## V3.2 Execution Order

```
1. SLC-053 (DB+Backend)    → Schema + RLS + LLM-Prompts + Utility + Validierung
2. SLC-054 (Backend)       → 3 API-Routen: chat, map, accept (hängt von SLC-053 ab)
3. SLC-055 (Frontend)      → Modus-Switch + Fragen-Übersicht (hängt von SLC-054 ab)
4. SLC-056 (Frontend)      → Chat-Panel + Voice + Soft-Limit (hängt von SLC-054, SLC-055 ab)
5. SLC-057 (Frontend)      → Mapping-Review + Accept-Flow (hängt von SLC-054, SLC-056 ab)

Strikt sequentiell: jeder Slice baut auf dem vorherigen auf.
QA nach jedem Slice.
```

## V3.3 Slices — Unified Tabbed Workspace

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-058 | [Tab-Infrastruktur + Cleanup](SLC-058-tab-infrastructure.md) | FEAT-037 | done | High | 2026-04-09 |
| SLC-059 | [Offen-Tab mit eingebettetem Chat](SLC-059-offen-tab-chat.md) | FEAT-037 | done | High | 2026-04-09 |
| SLC-060 | [Frage-für-Frage-Tab + Global Collapse + Feedback](SLC-060-questionnaire-tab-feedback.md) | FEAT-037 | done | High | 2026-04-09 |
| SLC-061 | [Mapping/Review Overlay](SLC-061-mapping-overlay.md) | FEAT-037 | done | High | 2026-04-09 |

## V3.3 Execution Order

```
1. SLC-058 (Frontend)  → Tab-Leiste, activeTab State, alte Screens entfernen
2. SLC-059 (Frontend)  → Chat in Offen-Tab einbetten, Sidebar-Collapse (hängt von SLC-058 ab)
3. SLC-060 (Frontend)  → Fragebogen in Tab, Global Collapse, Feedback-Platzhalter (hängt von SLC-058 ab)
4. SLC-061 (Frontend)  → Mapping-Overlay, Accept-Flow, Phase-Cleanup (hängt von SLC-058, SLC-059 ab)

SLC-059 und SLC-060 können parallel nach SLC-058 laufen.
QA nach jedem Slice.
```

## V4 Slices (Geplant)

| ID | Slice | Feature | Status | Priority | Created |
|----|-------|---------|--------|----------|---------|
| SLC-023 | Dedizierte Server pro Kunde | FEAT-020 | planned | Medium | 2026-03-29 |
