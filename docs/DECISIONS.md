# Decisions

## DEC-001: Wechsel von AI Coding Starter Kit zu Strategaize Dev System

**Datum:** 2026-03-24
**Entscheidung:** Das Projekt wird vom generischen AI Coding Starter Kit Workflow (6-Step) auf den Strategaize Dev System Workflow (10-Step) umgestellt.
**Begründung:** Strukturierte, nachvollziehbare, disziplinierte Projektführung mit vollständigem Skill-Workflow.
**Auswirkung:** Starter-Kit `.claude/rules/`, `.claude/skills/`, `.claude/agents/` wurden entfernt. Strategaize-Dokumentationsstruktur wurde angelegt.

## DEC-002: Code-Merge aus lokaler Entwicklung

**Datum:** 2026-03-24
**Entscheidung:** Der MVP-1 Code aus der lokalen Entwicklungsumgebung (`c:\Users\Admin\strategaize\`) wird in das Git-Repository (`strategaize-blueprint-plattform`) übernommen.
**Begründung:** MVP-1 war lokal vollständig implementiert (8 Features, 86 TypeScript-Dateien, 16 API-Endpunkte, 1.200+ Zeilen SQL), aber nie ins Git-Repository gepusht worden. Das Repository enthielt nur das leere Starter-Kit.
**Auswirkung:** Gesamter src/, sql/, docker-compose.yml und lokale Docs (API.md, BACKEND.md, DATA_MODEL.md, EXPORT.md) wurden übernommen. Strategaize Dev System Records (STATE.md, features/INDEX.md, planning/) wurden beibehalten und mit dem tatsächlichen Stand abgeglichen. Feature-IDs wurden von PROJ-1–8 auf FEAT-001–008 umgemappt.

## DEC-003: Feature-ID-Schema Vereinheitlichung

**Datum:** 2026-03-24
**Entscheidung:** Lokale Feature-IDs (PROJ-1 bis PROJ-8) werden auf Strategaize-IDs (FEAT-001 bis FEAT-008) umgemappt. PROJ-Specs bleiben als Referenz erhalten.
**Begründung:** Konsistenz mit dem Strategaize Dev System ID-Schema.
**Auswirkung:** features/INDEX.md enthält beide ID-Spalten. Neue Features ab FEAT-009 verwenden nur noch das FEAT-Schema.

## DEC-004: V1-Scope Neuordnung

**Datum:** 2026-03-24
**Entscheidung:** MVP-1 (Auth bis Export) ist abgeschlossen. LLM-Rückfragen (Dify/Ollama) werden als V1.1 geplant, nicht als Teil von MVP-1.
**Begründung:** LLM-Integration war im ursprünglichen Projekt bereits für MVP-2 vorgesehen. Die Requirements aus dem /requirements-Skill hatten LLM als V1-Feature eingeplant, aber die tatsächliche Implementation folgt dem ursprünglichen MVP-1/MVP-2 Split.
**Auswirkung:** FEAT-009 (LLM-Rückfragen) und FEAT-010 (Review-Übersicht) sind V1.1. Voice, Scoring, Admin-Editor sind V2.
