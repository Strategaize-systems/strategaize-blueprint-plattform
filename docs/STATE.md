# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: BL-022 Mehrsprachigkeit (DE/EN/NL) — SLC-024 (i18n Foundation) + SLC-025 (UI-Texte) + SLC-026 (LLM/E-Mail Locale) done. SLC-027 (Katalog-Sprache) offen.
- Current Phase: V1.1 Implementation

## Immediate Next Steps
1. SLC-027: Katalog-Sprache + Admin-Integration
2. Gesamt-QA für BL-022 nach Abschluss aller 4 Slices
3. /final-check + /go-live für V1.1

## Active Scope
MVP-1 — Kernplattform deployed und stabil. Premium UI v2.1.

V1.1 — Implementiert: LLM-Chat via Ollama/Qwen (lokal, DSGVO), Chat-basierter Antwort-Workflow mit Zusammenfassung, Block-basierte Checkpoints, Rollen-System (tenant_admin + Block-Zugriff), Review-Übersichtsseite, Error-Logging mit E-Mail-Alerts, PDF/DOCX/TXT-Parsing für LLM-Kontext, Dokument-Analyse (LLM liest Evidence und gibt Feedback), Storage Upload gefixt, Analyse-Spinner mit Auto-Polling, Typ-spezifische Evidence-Icons.

## Blockers
- aktuell keine

## Last Stable Version
- MVP-1 — 2026-03-26 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (32GB RAM, 16 vCPUs). Tech-Stack: Next.js 16 + Supabase Self-Hosted + Ollama/Qwen 2.5 14B. Kein Dify, kein Cloud-API (DSGVO). 23 Slices implementiert (SLC-001 bis SLC-020, SLC-024, SLC-025, SLC-026), 3 geplant (SLC-022, SLC-023, SLC-027). 28 Backlog-Items, davon 25 done. 26 Known Issues, davon 21 resolved. QA: RPT-017 PASS (SLC-025).
