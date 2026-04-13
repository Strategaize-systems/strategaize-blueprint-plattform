# Feature Index

> Zentrale Übersicht aller Features. Wird automatisch von Skills aktualisiert.
> Quellen: Exit Ready Blueprint Master v1.0, Evidence Standard v1.0, Export Data Contract v1.0.

## Status Legend
- **planned** — Requirements written, ready for development
- **in_progress** — Currently being built
- **done** — Implemented and QA-passed
- **deployed** — Live in production

## MVP-1 Features (Deployed)

| ID | Feature | Status | Created |
|----|---------|--------|---------|
| FEAT-001 | Auth: Invite-only, Rollen & Tenant-Verwaltung | deployed | 2026-02-23 |
| FEAT-002 | Admin: Run & Fragenkatalog-Management | deployed | 2026-02-23 |
| FEAT-003 | Tenant: Login & Dashboard | deployed | 2026-02-23 |
| FEAT-004 | Tenant: Run Workspace (Fragen-Übersicht) | deployed | 2026-02-23 |
| FEAT-005 | Tenant: Fragen beantworten (Event-Logging) | deployed | 2026-02-23 |
| FEAT-006 | Tenant: Evidence Upload (Datei + Text + Labels) | deployed | 2026-02-23 |
| FEAT-007 | Tenant: Run Submission Checkpoint | deployed | 2026-02-23 |
| FEAT-008 | Admin: Daten-Export (Data Contract v1.0) | deployed | 2026-02-23 |

## V1.1 Features (Implementiert)

| ID | Feature | Status | Created |
|----|---------|--------|---------|
| FEAT-009 | LLM-Chat + Rückfragen (Ollama/Qwen, lokal) | deployed | 2026-03-24 |
| FEAT-010 | Antwort-Review Übersichtsseite | deployed | 2026-03-24 |
| FEAT-011 | Block-basierte Checkpoints | deployed | 2026-03-27 |
| FEAT-012 | Rollen-System (Tenant-Admin + Block-Zugriff) | deployed | 2026-03-28 |
| FEAT-013 | Premium UI (Style Guide v2.1) | deployed | 2026-03-26 |
| FEAT-014 | Error-Logging + E-Mail Alerts | deployed | 2026-03-29 |
| FEAT-015 | PDF/DOCX/TXT-Parsing für LLM-Kontext | deployed | 2026-03-29 |
| FEAT-016 | Chat + Zusammenfassung-Workflow | deployed | 2026-03-27 |
| FEAT-017 | Dokument-Analyse: LLM liest Evidence + Feedback | deployed | 2026-03-29 |

## V1.1 Features (Implementiert — Teil 2)

| ID | Feature | Status | Created |
|----|---------|--------|---------|
| FEAT-018 | Mehrsprachigkeit (DE/EN/NL) | deployed | 2026-03-29 |

## V2 Features (Requirements)

| ID | Feature | Status | Created |
|----|---------|--------|---------|
| FEAT-019 | Voice Input (Whisper) | deployed | 2026-03-31 |

## V3 Features (Operational Reality Mirror — Phase 1)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-028 | Mirror-Infrastruktur (DB-Schema + survey_type) | deployed | [Spec](FEAT-028-mirror-infrastructure.md) | 2026-04-03 |
| FEAT-029 | Mirror-Rollen und Sichtbarkeit | deployed | [Spec](FEAT-029-mirror-roles.md) | 2026-04-03 |
| FEAT-030 | Mirror-Einladung und Onboarding | deployed | [Spec](FEAT-030-mirror-onboarding.md) | 2026-04-03 |
| FEAT-031 | Getrennte Exportströme (Management + Mirror) | deployed | [Spec](FEAT-031-mirror-export.md) | 2026-04-03 |

## V4 Features (Interne Meetings)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-039 | Interne Meetings: Aufzeichnung, Transkription, Fragebogen-Verknüpfung | planned | — | 2026-04-13 |

## Deferred Features

| ID | Feature | Status | Created |
|----|---------|--------|---------|
| FEAT-020 | Dedizierte Server pro Kunde | deferred | 2026-03-29 |

## Removed Features (nicht im Scope)

> Die folgenden Feature-IDs wurden vergeben aber aus dem Scope entfernt. Sie werden nicht implementiert.
> - **FEAT-021** — Scoring-Dashboard & Scorecard → Gehört in OS-Plattform, nicht Blueprint
> - **FEAT-022** — Admin: Fragebogen-Editor → Katalog-Import über Admin-UI reicht

## V2.1 Features (Geplant — Onboarding & Hilfe)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-023 | In-App Learning Center: Hilfe-Button + Navigation (DE/EN/NL) | deployed | [Spec](FEAT-023-learning-center.md) | 2026-04-01 |
| FEAT-024 | Video-Tutorial-Bereich (DE/EN/NL) | deployed | [Spec](FEAT-024-video-tutorials.md) | 2026-04-01 |
| FEAT-025 | Bedienungsanleitung als In-App-Dokumentation (DE/EN/NL) | deployed | [Spec](FEAT-025-bedienungsanleitung.md) | 2026-04-01 |

## V2.2 Features (Geplant — Personalized LLM)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-026 | Owner-Profil ("Frage Null") (DE/EN/NL) | deployed | [Spec](FEAT-026-owner-profil.md) | 2026-04-02 |
| FEAT-027 | LLM Run Memory (DE/EN/NL) | deployed | [Spec](FEAT-027-llm-run-memory.md) | 2026-04-02 |

## V3.1 Features (Mirror Usability)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-032 | GF Mirror-Nominierungsformular | deployed | [Spec](FEAT-032-mirror-nominations.md) | 2026-04-05 |
| FEAT-033 | Verbessertes Mirror-Onboarding (E-Mail + Policy) | deployed | [Spec](FEAT-033-mirror-onboarding-v2.md) | 2026-04-05 |
| FEAT-034 | Mirror-Run Deadline | deployed | [Spec](FEAT-034-mirror-deadline.md) | 2026-04-05 |

## V3.2 Features (Mirror Smart Input)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-035 | Free-Form Chat mit LLM-Mapping auf strukturierte Fragen | deployed | [Spec](FEAT-035-free-form-chat.md) | 2026-04-07 |

## V3.3 Features (Unified Workspace)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-037 | Unified Tabbed Workspace | deployed | [Spec](FEAT-037-unified-tabbed-workspace.md) | 2026-04-09 |

## V3.4 Features (Feedback + Compliance)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-036 | Feedback-Schleife nach Fragebogen-Abschluss | planned | [Spec](FEAT-036-feedback-loop.md) | 2026-04-07 |
| FEAT-038 | Compliance-Datentrennung (GF vs. Mirror Datenweitergabe) | planned | [Spec](FEAT-038-compliance-data-separation.md) | 2026-04-09 |

## Next Available ID: FEAT-040
