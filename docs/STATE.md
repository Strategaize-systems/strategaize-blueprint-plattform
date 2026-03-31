# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: released
- Current Focus: V1.1 released und stabil. Post-Launch abgeschlossen. Nächste Schritte: BL-033 (Invite-Status), BL-035 (Lektorat), dann V2-Planung.
- Current Phase: Stable (V1.1)

## Immediate Next Steps
1. BL-033: Invite-Status in Tenant-Verwaltung anzeigen
2. BL-035: Manuelles Lektorat aller UI-Texte (DE/EN/NL)
3. V2-Planung (Voice Input, Scoring, Fragebogen-Editor)

## Active Scope
MVP-1 — Kernplattform deployed und stabil. Premium UI v2.1.

V1.1 — Implementiert: LLM-Chat via Ollama/Qwen (lokal, DSGVO), Chat-basierter Antwort-Workflow mit Zusammenfassung, Block-basierte Checkpoints, Rollen-System (tenant_admin + Block-Zugriff), Review-Übersichtsseite, Error-Logging mit E-Mail-Alerts, PDF/DOCX/TXT-Parsing für LLM-Kontext, Dokument-Analyse (LLM liest Evidence und gibt Feedback), Mehrsprachigkeit DE/EN/NL (UI, LLM-Prompts, E-Mail, Katalog-Sprache), Premium UI v2.1.

## Blockers
- aktuell keine

## Last Stable Version
- V1.1 — 2026-03-31 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (32GB RAM, 16 vCPUs). Tech-Stack: Next.js 16 + Supabase Self-Hosted + Ollama/Qwen 2.5 14B. Kein Dify, kein Cloud-API (DSGVO). 24 Slices implementiert (SLC-001 bis SLC-020, SLC-024 bis SLC-027), 2 geplant (SLC-022, SLC-023). 28 Backlog-Items, davon 25 done. 26 Known Issues, davon 21 resolved. QA: RPT-019 PASS. Post-Launch: 4 Hotfixes, alle Smoke-Tests bestanden, V1.1 stabil.
