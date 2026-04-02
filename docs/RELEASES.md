# Releases

### REL-005 — V2.2 Personalized LLM (Owner-Profil + Run Memory)
- Date: 2026-04-02
- Scope: Owner-Profil als Pflicht-Formular auf Tenant-Ebene (persönliche Infos, Anrede-Präferenz, Führungsstil-Ranking, DISC-Kommunikationsstil, freie Vorstellung mit Whisper). LLM Run Memory für Session-Kontinuität (async update nach Chat, kuratiertes Memory max 800 Tokens). Profil + Memory werden in alle LLM-Prompts injiziert. Memory-Anzeige für Owner im Workspace. 2 neue DB-Tabellen (owner_profiles, run_memory). 5 Slices, 4 Decisions, 3 Migrationen.
- Summary: Das LLM kennt den Owner persönlich (Anrede, Hintergrund, Führungsstil) und kann zwischen Sessions anknüpfen. Zielgruppe: Geschäftsführer 50-65, wenig KI-Erfahrung. Reines Backend+Frontend Feature, kein neuer Docker-Service, kein zusätzlicher RAM-Bedarf. Token-Budget: Profil ~500 + Memory ~800 von 32K Context.
- Risks: Keine automatisierten Tests (ISSUE-002). LLM-Personalisierung + Memory-Kontinuität noch nicht mit echtem Kunden-Chat validiert (Fallback graceful). GRANT-Fix für authenticated Rolle war nötig (MIG-014, identisches Root-Cause wie ISSUE-001).
- Rollback Notes: Coolify Container-Rollback auf V2.1. DB: DROP TABLE owner_profiles CASCADE; DROP TABLE run_memory CASCADE;

### REL-004 — V2.1 In-App Learning Center
- Date: 2026-04-01
- Scope: In-App Learning Center mit Help-Button (floating, alle Tenant-Seiten), Video-Tutorial-Bereich (4 Lektions-Cards mit HTML5-Player, Fallback bei fehlenden Videos), Bedienungsanleitung (Markdown-Rendering via react-markdown, Inhaltsverzeichnis, Textsuche mit Highlighting). Alles dreisprachig DE/EN/NL. Implementation mit Dummy-Content — echter Content wird später via /user-guide Skill eingefügt.
- Summary: Reines Frontend-Feature (keine DB-Änderungen, keine neuen API-Routes, keine neuen Docker-Services). 3 Features (FEAT-023/024/025), 3 Slices (SLC-032/033/034), 4 Decisions (DEC-019 bis DEC-022). Neue Dependencies: react-markdown, remark-gfm. 647 Zeilen neuer Code über 8 Dateien. Kein RAM-Impact auf Server.
- Risks: Keine automatisierten Tests (ISSUE-002, bekanntes Restrisiko). Dummy-Content statt echte Videos/Anleitung (by design).
- Rollback Notes: Coolify Container-Rollback auf V2. Keine DB-Migration, kein Datenverlust.

### REL-003 — V2 Voice Input (Whisper)
- Date: 2026-03-31
- Scope: Spracheingabe im Chat via Whisper ASR (selbst-gehostet auf Hetzner, DSGVO). Mikrofon-Button im Chat-Bereich, Audio-Aufnahme via MediaRecorder, serverseitige Transkription, Mehrsprach-Support (DE/EN/NL). Bug-Fix: Block-Zugriffskontrolle (ISSUE-029).
- Summary: Kunden können Antworten per Sprache eingeben. Audio wird lokal auf dem Server transkribiert (Whisper Small) und als editierbarer Text im Chat-Eingabefeld angezeigt. Feature-Flag NEXT_PUBLIC_WHISPER_ENABLED ermöglicht Deaktivierung ohne Code-Änderung. 4 Slices (SLC-028 bis SLC-031), 6 neue Decisions (DEC-013 bis DEC-018), 5 QA-Reports (RPT-021 bis RPT-025).
- Risks: Keine automatisierten Tests (ISSUE-002). Whisper Small Transkriptionsqualität noch nicht mit echten Kunden validiert.
- Rollback Notes: Stufe 1: NEXT_PUBLIC_WHISPER_ENABLED=false → Redeploy (Mic-Button verschwindet). Stufe 2: docker stop whisper-container. Stufe 3: Coolify Container-Rollback auf V1.1.

### REL-002 — V1.1 LLM + Premium UI + i18n
- Date: 2026-03-31
- Scope: LLM-Chat mit Ollama/Qwen (lokal, DSGVO), Chat-basierter Antwort-Workflow mit Zusammenfassung, Dokument-Analyse (LLM liest Evidence), Block-basierte Checkpoints, Rollen-System (tenant_admin + Block-Zugriff), Review-Übersichtsseite, Premium UI (Style Guide v2.1), Mehrsprachigkeit DE/EN/NL (UI, LLM-Prompts, E-Mail, Katalog), Error-Logging + E-Mail-Alerts, PDF/DOCX/TXT-Parsing, Tenant-CRUD (Bearbeiten/Löschen/User-Management)
- Summary: Größtes Update seit MVP-1. 24 Slices, 35 Backlog-Items. KI-Assistent für strukturierte Antworten, dreisprachige Plattform, komplett überarbeitete UI. Post-Launch: 4 Hotfixes am Release-Tag (Session-Kollision, Locale-Cookie, Tenant-CRUD, Delete-Cascade). Alle Smoke-Tests bestanden.
- Risks: Keine automatisierten Tests (ISSUE-002). UI-Texte Lektorat ausstehend (BL-035).
- Rollback Notes: Coolify Rollback auf vorherigen Container. DB: MIG-007/008/009/010 Rollback-SQL in MIGRATIONS.md dokumentiert.

### REL-001 — MVP-1 Initial Deployment
- Date: 2026-03-25
- Scope: Auth (Invite-only, Server Actions), Admin-Dashboard (Tenants, Runs, Catalog), Tenant-Workspace (Block-Navigation, Event-Sourcing, Evidence-Upload), Submission-Checkpoints, ZIP-Export (Data Contract v1.0)
- Summary: Erstes Deployment auf Hetzner via Coolify. Auth-Fix (Server Actions + interne Docker-URL) am selben Tag angewendet. Admin-Seiten initial blockiert durch fehlende service_role GRANTs (ISSUE-001, behoben am 2026-03-26). Security Hardening (SLC-002) am 2026-03-26 nachgezogen.
- Risks: SQL-Änderungen (SLC-002) müssen nach jedem Re-Deployment manuell auf die DB angewendet werden bis sie im Init-Script integriert sind
- Rollback Notes: Coolify Rollback auf vorherigen Container-Stand. DB-Rollback: manuelle Reversion der RLS Policy + Function.
