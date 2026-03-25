# Slice Index

> Zentrale Übersicht aller Implementation Slices. Wird durch `/slice-planning` befüllt.

## Status Legend
- **planned** — definiert, nicht gestartet
- **in_progress** — aktuell in Arbeit
- **done** — implementiert und QA bestanden
- **blocked** — blockiert durch Abhängigkeit oder Problem

## Post-Launch Fix-Slices (2026-03-25)

Priorisierte Fix-Slices basierend auf systematischer QA. Reihenfolge: Blocker → High → Medium.

| ID | Slice | Issues | Priority | Status | Created |
|----|-------|--------|----------|--------|---------|
| SLC-001 | [RLS & Grants Fix](SLC-001-rls-grants-fix.md) | ISSUE-001 | Blocker | planned | 2026-03-25 |
| SLC-002 | [Security Hardening](SLC-002-security-hardening.md) | ISSUE-003, 007, 009 | High | planned | 2026-03-25 |
| SLC-003 | [Documentation Accuracy](SLC-003-docs-accuracy.md) | ISSUE-005, 006, 012, 013 | High | planned | 2026-03-25 |
| SLC-004 | [DB Integrity Hardening](SLC-004-db-integrity.md) | ISSUE-010, 014, 018 | Medium | planned | 2026-03-25 |
| SLC-005 | [Monitoring & Observability](SLC-005-monitoring-setup.md) | ISSUE-004, 011, 015, 016 | High/Medium | planned | 2026-03-25 |

## Execution Order

```
1. SLC-001 (Blocker)  → MUSS ZUERST — ohne DB-Zugriff geht nichts
2. SLC-003 (Docs)     → Kann parallel zu SLC-001 (kein Code, nur Docs)
3. SLC-002 (Security) → Nach SLC-001 (braucht funktionierende DB)
4. SLC-004 (DB)       → Nach SLC-001 (Schema-Änderungen auf Production)
5. SLC-005 (Monitor)  → Nach SLC-001 (braucht funktionierende Admin-Seiten zum Testen)
```

## Issue Coverage

| Issue | Severity | Covered by Slice | Status |
|-------|----------|-----------------|--------|
| ISSUE-001 | Blocker | SLC-001 | planned |
| ISSUE-002 | High | — (Test-Setup, eigener Future-Slice) | deferred |
| ISSUE-003 | High | SLC-002 | planned |
| ISSUE-004 | High | SLC-005 | planned |
| ISSUE-005 | High | SLC-003 | planned |
| ISSUE-006 | High | SLC-003 | planned |
| ISSUE-007 | High | SLC-002 | planned |
| ISSUE-008 | Medium | — (bereits resolved) | resolved |
| ISSUE-009 | Medium | SLC-002 | planned |
| ISSUE-010 | Medium | SLC-004 | planned |
| ISSUE-011 | Medium | SLC-005 | planned |
| ISSUE-012 | Medium | SLC-003 | planned |
| ISSUE-013 | Medium | SLC-003 | planned |
| ISSUE-014 | Medium | SLC-004 | planned |
| ISSUE-015 | Low | SLC-005 | planned |
| ISSUE-016 | Low | SLC-005 | planned |
| ISSUE-017 | Low | — (akzeptabel für MVP-1) | deferred |
| ISSUE-018 | Low | SLC-004 | planned |

**Deferred Issues:**
- ISSUE-002 (Tests): Eigener Slice nötig, zu groß für Fix-Phase. Wird nach Stabilisierung geplant.
- ISSUE-017 (run_submit Vollständigkeit): Akzeptabel für MVP-1, V1.1-Feature.
