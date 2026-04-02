# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: architecture
- Current Focus: V2.2 Architecture abgeschlossen — DB-Schema (owner_profiles + run_memory), Token-Budget-Strategie, Prompt-Injection, Memory-Lifecycle, 4 Decisions (DEC-023 bis DEC-026), 2 Migrations (MIG-012/013). Nächster Schritt: Slice-Planning.
- Current Phase: V2.2 Architecture

## Immediate Next Steps
1. /slice-planning für V2.2 Personalized LLM
2. Implementation (FEAT-026 → FEAT-027)
3. /qa nach jedem Slice

## Active Scope
V2.2 — Personalized LLM. Owner-Profil als Pflicht-Formular auf Tenant-Ebene (persönliche Infos, Anrede, Führungsstil, DISC, freie Vorstellung). LLM Run Memory (kuratierte Zusammenfassung pro Run, LLM-geschrieben, max 800 Tokens). Beides wird in alle LLM-Prompts injiziert. 2 Features (FEAT-026/027), 4 Backlog-Items (BL-046 bis BL-049).

## Blockers
- aktuell keine

## Last Stable Version
- V2.1 — 2026-04-01 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (30GB nutzbar, 16 vCPUs). V2.1 stabil. V2.2 ist Backend+Frontend Feature (DB-Schema, LLM-Prompt-Änderungen, neues Formular). Token-Budget-Management für Qwen 2.5 14B (32K Context) muss in Architecture berücksichtigt werden. BL-035 (Lektorat) und BL-045 (DSGVO Compliance) bleiben offen.
