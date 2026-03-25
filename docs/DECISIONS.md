# Decisions

## DEC-001 — Wechsel von AI Coding Starter Kit zu Strategaize Dev System
- Status: accepted
- Reason: Strukturierte, nachvollziehbare, disziplinierte Projektführung mit vollständigem Skill-Workflow. Das generische AI Coding Starter Kit (6-Step) reicht nicht aus.
- Consequence: Starter-Kit .claude/rules/, .claude/skills/, .claude/agents/ wurden entfernt. Strategaize-Dokumentationsstruktur wurde angelegt. Projekt folgt jetzt dem 10-Step Workflow.

## DEC-002 — Code-Merge aus lokaler Entwicklung
- Status: accepted
- Reason: MVP-1 war lokal vollständig implementiert (8 Features, 86 TypeScript-Dateien, 16 API-Endpunkte, 1.200+ Zeilen SQL), aber nie ins Git-Repository gepusht worden. Das Repository enthielt nur das leere Starter-Kit.
- Consequence: Gesamter src/, sql/, docker-compose.yml und lokale Docs (API.md, BACKEND.md, DATA_MODEL.md, EXPORT.md) wurden übernommen. Strategaize Dev System Records (STATE.md, features/INDEX.md, planning/) wurden beibehalten und mit dem tatsächlichen Stand abgeglichen. Feature-IDs wurden von PROJ-1–8 auf FEAT-001–008 umgemappt.

## DEC-003 — Feature-ID-Schema Vereinheitlichung
- Status: accepted
- Reason: Konsistenz mit dem Strategaize Dev System ID-Schema. Lokale Feature-IDs (PROJ-1 bis PROJ-8) müssen auf FEAT-001 bis FEAT-008 umgemappt werden.
- Consequence: features/INDEX.md enthält beide ID-Spalten. Neue Features ab FEAT-009 verwenden nur noch das FEAT-Schema. PROJ-Specs bleiben als Referenz erhalten.

## DEC-004 — V1-Scope Neuordnung
- Status: accepted
- Reason: LLM-Integration war im ursprünglichen Projekt bereits für MVP-2 vorgesehen. Die Requirements aus dem /requirements-Skill hatten LLM als V1-Feature eingeplant, aber die tatsächliche Implementation folgt dem urspr-1/MVP-2 Split.
- Consequence: FEAT-009 (LLM-Rückfragen) und FEAT-010 (Review-Übersicht) sind V1.1. Voice, Scoring, Admin-Editor sind V2. MVP-1 (Auth bis Export) ist abgeschlossen.
