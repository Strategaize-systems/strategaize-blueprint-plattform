# SLC-037 — LLM Profil-Injection

## Metadaten

- **ID:** SLC-037
- **Feature:** FEAT-026
- **Backlog:** BL-047
- **Version:** V2.2
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-02
- **Dependencies:** SLC-035 (DB), SLC-036 (Profil-API)

## Ziel

Owner-Profil in alle 4 bestehenden LLM-Prompt-Typen injizieren. Das LLM kennt danach den Owner persönlich und verwendet die korrekte Anrede. Nach diesem Slice antwortet das LLM personalisiert.

## Scope

- buildOwnerContext() Funktion in llm.ts
- Profil-Kontext-Block in allen 4 Prompts (Rückfrage, Zusammenfassung, Bewertung, Dokumentanalyse)
- Anrede-Regeln im Prompt
- Profil laden in Chat- und Generate-Route
- Profil laden in Evidence-Upload-Route (Dokumentanalyse)

## Micro-Tasks

#### MT-1: buildOwnerContext() in llm.ts
- Goal: Funktion die ein Owner-Profil-Objekt in einen formatierten Kontext-String umwandelt (~300-500 Tokens)
- Files: `src/lib/llm.ts`
- Expected behavior: Gibt formatierten String zurück mit Name, Anrede, Alter, Führungsstil, DISC, Vorstellung. Handelt fehlende Felder graceful (leere Felder weglassen).
- Verification: Build erfolgreich, Funktion exportiert
- Dependencies: none

#### MT-2: Profil in Chat-Route injizieren
- Goal: Chat-Route lädt Owner-Profil und fügt es als System-Kontext ein
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/chat/route.ts`
- Expected behavior: Profil wird nach dem Persona-Prompt und vor dem Question-Kontext eingefügt. Wenn kein Profil → ohne Profil-Kontext (graceful fallback).
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-3: Profil in Generate-Answer-Route injizieren
- Goal: Generate-Answer-Route lädt Owner-Profil und fügt es als System-Kontext ein
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/generate-answer/route.ts`
- Expected behavior: Identisches Injection-Pattern wie Chat-Route
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-4: Profil in Evidence-Upload-Route injizieren (Dokumentanalyse)
- Goal: Dokumentanalyse-LLM-Call erhält Owner-Profil-Kontext
- Files: `src/app/api/tenant/runs/[runId]/evidence/route.ts`
- Expected behavior: documentAnalyse-Prompt enthält Owner-Profil. Wenn kein Profil → ohne.
- Verification: Build erfolgreich
- Dependencies: MT-1

## Akzeptanzkriterien

1. LLM-Rückfragen verwenden die gewählte Anrede (Du/Sie + Name)
2. LLM zeigt Kontextwissen aus Profil (Führungsstil, Hintergrund fließen ein)
3. Alle 4 Prompt-Typen enthalten Profil-Kontext
4. Fehlndes Profil führt nicht zu Fehler (graceful fallback)
5. Token-Budget: Profil-Kontext bleibt unter 500 Tokens
6. Build erfolgreich
