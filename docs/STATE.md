# STATE

## Project
- Name: Strategaize Blueprint Plattform
- Repository: strategaize-blueprint-plattform
- Delivery Mode: SaaS

## Purpose
Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe erreicht. Die Antworten dienen als Rohmaterial für die Strategaize Operating System Plattform.

## Current State
- High-Level State: implementing
- Current Focus: SLC-035 + SLC-036 done. DB-Schema + Owner-Profil implementiert. Nächster Schritt: /qa für SLC-036, dann SLC-037 (LLM Profil-Injection).
- Current Phase: V2.2 Implementation

## Immediate Next Steps
1. /qa für SLC-036
2. /backend für SLC-037 (LLM Profil-Injection)
3. /backend für SLC-038 (Run Memory Backend)
4. /frontend für SLC-039 (Memory Frontend)

## Active Scope
V2.2 — Personalized LLM. Owner-Profil als Pflicht-Formular auf Tenant-Ebene (persönliche Infos, Anrede, Führungsstil, DISC, freie Vorstellung). LLM Run Memory (kuratierte Zusammenfassung pro Run, LLM-geschrieben, max 800 Tokens). Beides wird in alle LLM-Prompts injiziert. 2 Features (FEAT-026/027), 4 Backlog-Items (BL-046 bis BL-049).

## Blockers
- aktuell keine

## Last Stable Version
- V2.1 — 2026-04-01 — deployed auf https://blueprint.strategaizetransition.com

## Notes
Server: Hetzner CPX62 (30GB nutzbar, 16 vCPUs). V2.1 stabil. V2.2 ist Backend+Frontend Feature (DB-Schema, LLM-Prompt-Änderungen, neues Formular). Token-Budget-Management für Qwen 2.5 14B (32K Context) muss in Architecture berücksichtigt werden. BL-035 (Lektorat) und BL-045 (DSGVO Compliance) bleiben offen.
