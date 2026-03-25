# Feature Index

> Zentrale Übersicht aller Features. Wird automatisch von Skills aktualisiert.
> Quellen: Exit Ready Blueprint Master v1.0, Evidence Standard v1.0, Export Data Contract v1.0.

## Status Legend
- **planned** — Requirements written, ready for development
- **in_progress** — Currently being built
- **done** — Implemented and QA-passed
- **deployed** — Live in production

## MVP-1 Features (Implementiert)

Implementiert in der lokalen Entwicklungsphase (Feb 2026). Legacy-IDs: PROJ-1 bis PROJ-8.

| ID | Legacy | Feature | Status | Spec | Created |
|----|--------|---------|--------|------|---------|
| FEAT-001 | PROJ-1 | Auth: Invite-only, Rollen & Tenant-Verwaltung | done | [PROJ-1](PROJ-1-admin-tenant-invitation.md) | 2026-02-23 |
| FEAT-002 | PROJ-2 | Admin: Run & Fragenkatalog-Management | done | [PROJ-2](PROJ-2-admin-run-question-management.md) | 2026-02-23 |
| FEAT-003 | PROJ-3 | Tenant: Login & Dashboard | done | [PROJ-3](PROJ-3-tenant-login-dashboard.md) | 2026-02-23 |
| FEAT-004 | PROJ-4 | Tenant: Run Workspace (Fragen-Übersicht) | done | [PROJ-4](PROJ-4-tenant-run-workspace.md) | 2026-02-23 |
| FEAT-005 | PROJ-5 | Tenant: Fragen beantworten (Event-Logging) | done | [PROJ-5](PROJ-5-tenant-question-event-logging.md) | 2026-02-23 |
| FEAT-006 | PROJ-6 | Tenant: Evidence Upload (Datei + Text + Labels) | done | [PROJ-6](PROJ-6-tenant-evidence-upload.md) | 2026-02-23 |
| FEAT-007 | PROJ-7 | Tenant: Run Submission Checkpoint | done | [PROJ-7](PROJ-7-tenant-run-submission.md) | 2026-02-23 |
| FEAT-008 | PROJ-8 | Admin: Daten-Export (Data Contract v1.0) | done | [PROJ-8](PROJ-8-admin-data-export.md) | 2026-02-23 |

## V1.1 Features (Geplant — LLM-Integration)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-009 | LLM-gestützte Rückfragen (Dify + Ollama/Qwen) | planned | [FEAT-009](FEAT-003-llm-rueckfragen.md) | 2026-03-24 |
| FEAT-010 | Antwort-Review & Wiedergabe (Übersichtsseite) | planned | [FEAT-010](FEAT-006-antwort-review.md) | 2026-03-24 |

## V2 Features (Geplant)

| ID | Feature | Status | Spec | Created |
|----|---------|--------|------|---------|
| FEAT-011 | Multi-User pro Tenant | planned | — | — |
| FEAT-012 | Spracheingabe via Whisper + Audio-Wiedergabe | planned | — | — |
| FEAT-013 | Admin-Interface: Fragebogen-Editor | planned | — | — |
| FEAT-014 | Scoring-Dashboard & Scorecard | planned | — | — |

## Next Available ID: FEAT-015

## Empfohlene Build-Reihenfolge

```
MVP-1 (DONE):
1. FEAT-001  -> Auth: Invite-only, Rollen & Tenant-Verwaltung
2. FEAT-002  -> Runs & Fragenkatalog-Import (73 Fragen)
3. FEAT-003  -> Tenant Login & Dashboard
4. FEAT-004  -> Run Workspace, Fragen nach Block (A-I)
5. FEAT-005  -> Fragen beantworten (append-only Event-Logging)
6. FEAT-006  -> Evidence Upload (Datei + Text + Labels)
7. FEAT-007  -> Submission Checkpoint
8. FEAT-008  -> Admin Daten-Export (Data Contract v1.0)

V1.1 (NEXT):
9. FEAT-009  -> LLM-Rückfragen (Dify + Ollama)
10. FEAT-010 -> Antwort-Review & Übersichtsseite

V2 (LATER):
11. FEAT-011 -> Multi-User pro Tenant
12. FEAT-012 -> Audio Upload & Whisper
13. FEAT-013 -> Fragebogen-Editor
14. FEAT-014 -> Scoring-Dashboard
```

## Quell-Dokumente

| Dokument | Pfad | Beschreibung |
|----------|------|-------------|
| Exit Ready Blueprint Master v1.0 | `Exit Ready Blueprint Master_V1.0.xlsx` | 73 Fragen, 9 Blöcke, Flags, Scoring |
| Evidence Standard v1.0 | `StrategAIze_Evidence_Standard_v1.0.xlsx` | Labels, Relations, Quality Checks |
| Export Data Contract v1.0 | `StrategAIze_Export_Sync_Data_Contract_v1.0.docx` | Export-Format, IDs, Validierung |
