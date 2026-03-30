# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: stable
- Current Focus: V1.1 Kern-Features komplett. PDF/DOCX-Parsing + Dokument-Analyse verifiziert auf Production. Nächstes Feature: Mehrsprachigkeit.
- Current Phase: V1.1 Stabilisierung

## Immediate Next Steps
1. BL-022: Mehrsprachigkeit (DE/EN/NL) — letztes V1.1 Feature
2. Test-Daten aufräumen auf Production
3. V1.1 Release vorbereiten (/final-check → /go-live → /deploy)

## Active Scope
MVP-1 — Kernplattform deployed und stabil. Premium UI v2.1.

V1.1 — Implementiert: LLM-Chat via Ollama/Qwen (lokal, DSGVO), Chat-basierter Antwort-Workflow mit Zusammenfassung, Block-basierte Checkpoints, Rollen-System (tenant_admin + Block-Zugriff), Review-Übersichtsseite, Error-Logging mit E-Mail-Alerts, PDF/DOCX/TXT-Parsing für LLM-Kontext, Dokument-Analyse (LLM liest Evidence und gibt Feedback), Storage Upload gefixt, Analyse-Spinner mit Auto-Polling, Typ-spezifische Evidence-Icons.

## Blockers
- aktuell keine

## Last Stable Version
- MVP-1 — 2026-03-26 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (32GB RAM, 16 vCPUs). Tech-Stack: Next.js 16 + Supabase Self-Hosted + Ollama/Qwen 2.5 14B. Kein Dify, kein Cloud-API (DSGVO). 20 Slices implementiert (SLC-001 bis SLC-020), 3 geplant (SLC-021 bis SLC-023). 28 Backlog-Items, davon 25 done. 26 Known Issues, davon 21 resolved. QA: RPT-013 PASS.
