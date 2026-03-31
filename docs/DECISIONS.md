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

## DEC-009 — next-intl für Internationalisierung
- Status: accepted
- Reason: next-intl ist der De-facto-Standard für Next.js App Router mit nativem Server Components Support. react-i18next braucht Workarounds für RSC. Ein JSON pro Sprache, kein Namespace-System nötig.
- Consequence: next-intl als Dependency. Translation-Dateien in /src/messages/{de,en,nl}.json. Keine URL-Prefixes.

## DEC-010 — Sprache auf Tenant-Ebene (nicht User-Ebene)
- Status: accepted
- Reason: Ein Unternehmen arbeitet in einer Sprache. Weniger Komplexität als User-Level Preference. Erweiterbar auf User-Level in V2 falls nötig.
- Consequence: tenants.language Spalte (de/en/nl, default de). Alle User eines Tenants sehen dieselbe Sprache. Admin-UI bleibt Deutsch.

## DEC-011 — Cookie-basiertes Locale (kein URL-Prefix)
- Status: accepted
- Reason: Sprache kommt vom Tenant, nicht von der URL. URL-Prefixes (/de/, /en/) sind für Content-Sites sinnvoll, nicht für SaaS wo die Sprache serverseitig bestimmt wird. Cookie-basiert ist sauberer und erfordert keine URL-Rewrites.
- Consequence: Middleware setzt Locale-Cookie basierend auf Tenant-Sprache. next-intl liest Locale aus Cookie. Keine URL-Änderung nötig.

## DEC-012 — Katalog-Sprache als Spalte statt separate Tabellen
- Status: accepted
- Reason: question_catalog_snapshots bekommt language-Spalte statt separater Tabellen pro Sprache. Einfacher zu verwalten, ein Import pro Sprache. Fallback auf DE wenn keine Übersetzung existiert.
- Consequence: ALTER TABLE question_catalog_snapshots ADD COLUMN language. Beim Run-Erstellen wird Katalog nach Tenant-Sprache gefiltert.

## DEC-013 — V2 Scope: Nur Voice Input (Whisper)
- Status: accepted
- Reason: Discovery-Ergebnis 31.03.2026. Scoring-Dashboard gehört in die OS-Plattform (Blueprint = Rohdaten + Workflow, OS = Analyse + Auswertung). Fragebogen-Editor nicht nötig (Katalog-Import über Admin-UI reicht). Dedizierte Server sind Infrastruktur, kein Feature-Mehrwert — verschoben auf V3.
- Consequence: V2 enthält ausschließlich FEAT-019 (Voice Input via Whisper). FEAT-020 auf V3 verschoben. FEAT-021 und FEAT-022 gestrichen. Klarer, fokussierter V2-Scope.

## DEC-014 — Whisper statt Browser Speech API
- Status: accepted
- Reason: Browser Speech API ist unzuverlässig über Browser hinweg — nicht kontrollierbar welchen Browser Kunden nutzen. Whisper lokal auf Hetzner garantiert konsistente Qualität und DSGVO-Konformität (Audio-Daten verlassen nie den Server). Server-Upgrade akzeptabel wenn RAM nicht reicht.
- Consequence: Whisper ASR Service als Docker-Container. Keine Browser Speech API, kein Hybrid-Ansatz. Zusätzlicher RAM-Bedarf (2-5GB). Möglicherweise Server-Upgrade von 32GB auf 64GB nötig.

## DEC-015 — Whisper Small zuerst, später upgraden
- Status: accepted
- Reason: Small-Modell (~1GB RAM) reicht zum Testen und Validieren der Integration. Qualität muss erst in der Praxis bewertet werden bevor ein größeres Modell (medium, ~5GB RAM) nötig ist. Upgrade ist trivial (nur Modell-Parameter ändern). Kein Grund, sofort mit dem größten Modell zu starten wenn noch keine echten Kunden da sind.
- Consequence: V2-Implementation startet mit Whisper Small. Upgrade auf Medium/Large wenn echte Kunden die Plattform nutzen und die Transkriptionsqualität nicht ausreicht. RAM-Sizing-Entscheidung wird dadurch entspannt (32GB sollte reichen).

## DEC-016 — Whisper als Docker-Service (onerahmet/openai-whisper-asr-webservice)
- Status: accepted
- Reason: Etabliertes Docker-Image mit REST-API (POST /asr). Gleiche Architektur wie Ollama (interner Docker-Service, kein externer Zugriff). Modellwechsel über Env-Var ASR_MODEL. Alternative wäre Whisper direkt in Python-Prozess zu laufen — aber Docker-Service ist konsistenter mit bestehendem Stack und einfacher zu deployen/upgraden.
- Consequence: Whisper läuft als eigenständiger Docker-Container auf Port 9000 (intern). Kommunikation via http://whisper:9000/asr. Neuer Service in docker-compose.yml. Env-Var WHISPER_URL im App-Container.

## DEC-017 — Audio nicht speichern (DSGVO)
- Status: accepted
- Reason: Audio-Aufnahmen enthalten potenziell sensible Unternehmensdaten (Geschäftsführer spricht über Finanzen, Strategie, Personal). Speicherung würde zusätzliche DSGVO-Anforderungen auslösen (Löschfristen, Auskunftsrecht, Verarbeitungsverzeichnis). Der Zweck ist Transkription, nicht Archivierung.
- Consequence: Audio wird nur als In-Memory-Buffer in der API Route verarbeitet. Kein Disk-Write, kein Storage-Upload, kein DB-Eintrag. Nach Transkription wird der Buffer verworfen. Nur der resultierende Text wird im Chat verwendet.

## DEC-018 — Feature-Flag für Whisper (NEXT_PUBLIC_WHISPER_ENABLED)
- Status: accepted
- Reason: Ermöglicht Deployment ohne Whisper-Container (z.B. bei RAM-Problemen oder für Staging-Umgebung ohne AI-Services). Mikrofon-Button wird nur angezeigt wenn Feature-Flag true ist. Graceful Degradation: Plattform funktioniert komplett ohne Voice Input.
- Consequence: Env-Var NEXT_PUBLIC_WHISPER_ENABLED steuert Sichtbarkeit des Mikrofon-Buttons im Frontend. Backend-Route existiert immer, gibt aber 503 zurück wenn Whisper nicht erreichbar.
