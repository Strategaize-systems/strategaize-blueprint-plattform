# Releases

### REL-008 — V3.2 Mirror Smart Input (Free-Form Chat)
- Date: 2026-04-09
- Scope: Free-Form Chat als alternativer Eingabekanal (FEAT-035). 5 Slices (SLC-053 bis SLC-057), 1 Backlog-Item (BL-063). Teilnehmer spricht frei über Arbeitsalltag, LLM mappt auf strukturierte Fragen, depersonalisiert, Teilnehmer reviewt und akzeptiert. Mode-Selector UI, Themenübersicht, Chat mit Voice+Soft-Limit, Mapping-Review mit Draft-Editing. 1 DB-Migration (MIG-019: freeform_conversations). Bug-Fix: React Hooks Violation (useEffect nach conditional returns).
- Summary: Zweiter Eingabekanal neben dem strukturierten Fragebogen. Teilnehmer können frei über ihr Unternehmen sprechen, das LLM ordnet die Inhalte automatisch den 73 Fragen zu und generiert neutralisierte Draft-Antworten. Review-UI erlaubt Prüfung, Bearbeitung und selektive Übernahme. Voice-Input via Whisper. Compliance-tauglich durch automatische Depersonalisierung.
- Risks: Keine automatisierten Tests (ISSUE-002). Mode-Selector wird in V3.3 durch Unified Workspace ersetzt.
- Rollback Notes: Coolify Container-Rollback auf V3.1. DB: DROP TABLE freeform_conversations;

### REL-007 — V3.1 Mirror Usability
- Date: 2026-04-07
- Scope: Mirror Usability für Realeinsatz. 3 Features (FEAT-032 bis FEAT-034), 7 Slices (SLC-046 bis SLC-052), 8 Backlog-Items. GF-Nominierungsformular (Teilnehmer in Plattform vorschlagen). Mirror-Profil (Pflicht nach Policy, Layer-abhängige Felder, LLM-Personalisierung via buildMirrorContext). Verbessertes Mirror-Onboarding (eigenes E-Mail-Template mit Kontext + erweiterte Policy-Seite mit Erklärungsblock + Video-Platzhalter). Run-Deadline (DatePicker bei Erstellung, Pill-Badge im Dashboard). Rollenbasiertes Learning Center (Mirror sieht angepasste Hilfe statt Owner-Videos). 1 DB-Migration (MIG-018: mirror_nominations, mirror_profiles, runs.due_date). 6 Bugfixes nach Live-Test.
- Summary: V3.1 macht den Mirror-Flow für den Realeinsatz nutzbar. Der GF schlägt Teilnehmer direkt in der Plattform vor. Mirror-Teilnehmer bekommen ein eigenes Profil das ins LLM fließt. Die Einladungs-E-Mail erklärt Kontext und Vertraulichkeit. Runs haben optionale Deadlines. Das Learning Center zeigt Mirror-spezifische Hilfe. 5 neue Decisions (DEC-031 bis DEC-034), 1 Migration.
- Risks: Keine automatisierten Tests (ISSUE-002). Rate-Limit temporär auf 20 erhöht (für Testing, vor Kundeneinsatz zurücksetzen). Policy-Text rechtliche Überarbeitung offen (BL-059).
- Rollback Notes: Coolify Container-Rollback auf V3. DB: DROP TABLE mirror_nominations; DROP TABLE mirror_profiles; ALTER TABLE runs DROP COLUMN due_date;

### REL-006 — V3 Operational Reality Mirror + LLM-Migration
- Date: 2026-04-05
- Scope: Operational Reality Mirror Phase 1 (Infrastruktur) + LLM-Migration Ollama/Qwen → AWS Bedrock Claude Sonnet 4.6. 4 Features (FEAT-028 bis FEAT-031), 6 Slices (SLC-040 bis SLC-045), BL-054 (Admin Mirror-Tab). Zweite Erhebungsschicht (bottom-up) neben bestehendem Management View (top-down). survey_type auf DB-Ebene, mirror_respondent Rolle mit RLS-Isolation, vertraulicher Einladungsflow mit Policy-Bestätigung, getrennte entpersonalisierte Exportströme (Data Contract v2.0). LLM von Qwen 2.5 14B lokal auf Claude Sonnet 4.6 via AWS Bedrock (eu-central-1 Frankfurt) migriert — 10x schneller, deutlich bessere Antwortqualität. Whisper von small auf large-v3 upgraded. Ollama-Service komplett entfernt (12 → 11 Docker Services, ~12 GB RAM frei).
- Summary: Strukturelle Erweiterung der Plattform um eine vertrauliche Mitarbeiter-Erhebung. Mirror-Teilnehmer (L1/L2/KS) werden vom Admin eingeladen, bestätigen eine Vertraulichkeits-Policy und beantworten ebenenspezifische Fragen. Antworten sind für den Geschäftsführer nicht sichtbar (RLS). Export entpersonalisiert (respondent_layer statt Namen/E-Mails). 3 SQL-Migrationen (MIG-015/016/017), 20 geänderte Source-Dateien, 4 Decisions (DEC-025 bis DEC-028). LLM-Migration bringt sofort spürbare Qualitäts- und Geschwindigkeitsverbesserung für alle Nutzer.
- Risks: Keine automatisierten Tests (ISSUE-002, bekanntes Restrisiko seit MVP-1). Bedrock-Abhängigkeit — kein lokaler LLM-Fallback bei AWS-Ausfall. Policy-Text braucht rechtliche Überarbeitung (BL-059). Mirror-Profil fehlt noch (V3.1).
- Rollback Notes: Stufe 1: Coolify Container-Rollback auf V2.2. Stufe 2: DB-Rollback der Mirror-Tabellen (DROP TABLE mirror_policy_confirmations; ALTER TABLE runs DROP COLUMN survey_type; ALTER TABLE profiles DROP COLUMN respondent_layer; etc.). Stufe 3: LLM_MODEL auf qwen2.5:14b + OLLAMA_URL setzen, Ollama-Service wieder in docker-compose.

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
