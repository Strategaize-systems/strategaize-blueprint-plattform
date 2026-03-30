# SLC-026 — LLM-Prompts + E-Mail-Templates pro Sprache

## Feature
BL-022 — Mehrsprachigkeit (DE/EN/NL)

## Goal
LLM System-Prompts und Invite-E-Mail-Templates in DE/EN/NL bereitstellen. Locale wird aus Tenant-Sprache gelesen.

## Scope
- 4 System-Prompts (rückfrage, zusammenfassung, bewertung, dokumentAnalyse) in 3 Sprachen
- chatWithLLM() bekommt locale-Parameter
- Invite-E-Mail Template in 3 Sprachen
- sendInvite() bekommt locale-Parameter aus Tenant

## Out of Scope
- UI-Texte (SLC-025)
- Katalog-Sprache (SLC-027)

## Acceptance
1. LLM antwortet in Tenant-Sprache (DE/EN/NL)
2. Invite-E-Mail kommt in Tenant-Sprache
3. Fallback auf DE wenn Locale unbekannt

### Micro-Tasks

#### MT-1: LLM System-Prompts lokalisieren
- Goal: SYSTEM_PROMPTS von Object zu locale-basiertem Lookup umbauen
- Files: `src/lib/llm.ts`
- Expected behavior: SYSTEM_PROMPTS.rückfrage wird zu getSystemPrompts(locale).rückfrage
- Verification: chatWithLLM mit locale='en' → englische Antwort
- Dependencies: SLC-024 abgeschlossen

#### MT-2: Evidence-Route + Chat-Route — Locale durchreichen
- Goal: Alle LLM-Aufrufe bekommen Tenant-Locale
- Files: `src/app/api/tenant/runs/[runId]/evidence/route.ts`, `src/app/api/tenant/runs/[runId]/questions/[questionId]/chat/route.ts`, `src/app/api/tenant/runs/[runId]/questions/[questionId]/generate-answer/route.ts`
- Expected behavior: Tenant-Sprache wird aus DB gelesen und an chatWithLLM() übergeben
- Verification: Upload Dokument als EN-Tenant → Analyse auf Englisch
- Dependencies: MT-1

#### MT-3: E-Mail-Templates lokalisieren
- Goal: Invite-E-Mail in 3 Sprachen
- Files: `src/lib/email.ts`
- Expected behavior: sendInvite() nutzt Tenant-Sprache für Betreff + Body
- Verification: Invite für EN-Tenant → englische E-Mail
- Dependencies: SLC-024 abgeschlossen
