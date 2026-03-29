# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: stable
- Current Focus: Alle V1.1 Kern-Features implementiert. Kleine Backlog-Items erledigt. Nächste Phase: Mehrsprachigkeit oder Voice Input.
- Current Phase: V1.1 Stabilisierung

## Immediate Next Steps
1. BL-022: Mehrsprachigkeit (DE/EN/NL) — groß
2. BL-021: Voice Input (Whisper) — mittel-groß
3. BL-024: Dedizierte Server pro Kunde — groß
4. Erstes echtes Kunden-Onboarding

## Active Scope
MVP-1 — Kernplattform deployed und stabil. Premium UI v2.1.

V1.1 — Implementiert: LLM-Chat via Ollama/Qwen (lokal, DSGVO), Chat-basierter Antwort-Workflow mit Zusammenfassung, Block-basierte Checkpoints, Rollen-System (tenant_admin + Block-Zugriff), Review-Übersichtsseite, Error-Logging mit E-Mail-Alerts, PDF/TXT-Parsing für LLM-Kontext.

## Blockers
- aktuell keine

## Last Stable Version
- MVP-1 — 2026-03-26 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (32GB RAM, 16 vCPUs). Tech-Stack: Next.js 16 + Supabase Self-Hosted + Ollama/Qwen 2.5 14B. Kein Dify, kein Cloud-API (DSGVO). 19 Slices implementiert (SLC-001 bis SLC-019). 26 Backlog-Items, davon 20 done. 25 Known Issues, davon 21 resolved.
