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

## DEC-005 — Dify aus Tech-Stack entfernt
- Status: accepted
- Reason: Dify war ursprünglich für LLM-Orchestrierung geplant. Durch den integrierten Chat-Bereich im Workspace (SLC-016) ist die Workflow-Orchestrierung direkt im Backend implementiert. Dify wäre Overkill für drei Prompt-Varianten (Rückfragen, Zusammenfassung, Bewertung). Weniger Infrastruktur = weniger Wartung.
- Consequence: Kein Dify-Container im Stack. LLM wird direkt über Ollama REST API angesprochen. Prompts werden im Code verwaltet.

## DEC-006 — Lokales LLM statt Cloud-API (DSGVO)
- Status: accepted
- Reason: Blueprint-Kunden geben sensible Unternehmensdaten ein (KPIs, Finanzberichte, Verträge, Org-Strukturen). Externe API-Calls (Claude, OpenAI) senden diese Daten an US-Server. Für B2B Exit-Readiness-Beratung ist DSGVO-Konformität geschäftskritisch. Lokales LLM auf Hetzner (EU, DE) hält alle Daten innerhalb der EU.
- Consequence: Ollama + Qwen 2.5 14B auf Hetzner. Kein externer API-Aufruf für Kundendaten. Upgrade-Pfad: 14B → 70B mit GPU-Server wenn Qualität oder Kapazität nicht reicht.

## DEC-007 — Block-basierte Checkpoints statt Run-basiert
- Status: accepted
- Reason: Der Beratungs-Workflow erfordert Block-für-Block Review. Kunden sollen einzelne Themenblöcke (A-I) einreichen können, damit Berater bereits mit Teilbereichen arbeiten können während der Kunde an anderen Blöcken weiterarbeitet.
- Consequence: run_submissions hat block-Column. Checkpoints sind pro Block versioniert (v1, v2...). Frontend zeigt Block-spezifische Checkpoints. Run-Status bleibt unverändert.

## DEC-008 — Mehrfach-Antworten pro Frage (Append-Only)
- Status: accepted
- Reason: Kunden haben oft mehrere Aspekte pro Frage (z.B. 6 Produkte = 6 Antworten). Editieren/Löschen ist nicht erwünscht — jeder Kontext ist wertvoll für die spätere KI-Analyse. Nummerierte Antworten (#1, #2...) ermöglichen Referenzierung ("bei Antwort #6 fehlt noch...").
- Consequence: Antworten sind append-only mit Nummerierung im Verlauf. Kein Edit/Delete. Zusammenfassung via LLM konsolidiert alle Antworten zu einer strukturierten Gesamtantwort.
