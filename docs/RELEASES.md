# Releases

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
