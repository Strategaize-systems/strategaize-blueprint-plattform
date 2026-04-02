# SLC-038 — Run Memory Backend

## Metadaten

- **ID:** SLC-038
- **Feature:** FEAT-027
- **Backlog:** BL-048
- **Version:** V2.2
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-02
- **Dependencies:** SLC-035 (DB), SLC-037 (Profil-Injection — gleiche Prompt-Erweiterungslogik)

## Ziel

LLM Run Memory implementieren: Memory-Update nach jeder Chat-Interaktion (async), Memory-Read bei Chat/Generate, neuer Memory-Update-Prompt. Nach diesem Slice hat das LLM Session-Kontinuität.

## Scope

- Memory-Update-Prompt (5. Prompt-Typ) in llm.ts
- buildMemoryContext() Funktion in llm.ts
- updateRunMemory() Funktion in llm.ts (async LLM-Call + DB-Write)
- Memory laden und injizieren in Chat-Route
- Memory laden und injizieren in Generate-Route
- Async Memory-Update nach Chat-Response
- Memory GET API-Route (für Frontend-Anzeige)

## Micro-Tasks

#### MT-1: Memory-Update-Prompt + Helper-Funktionen in llm.ts
- Goal: 5. Prompt-Typ "Memory Update" (DE/EN/NL) + buildMemoryContext() + updateRunMemory()
- Files: `src/lib/llm.ts`
- Expected behavior: updateRunMemory() nimmt run_id, bisheriges Memory, Chat-Zusammenfassung → ruft LLM mit Memory-Update-Prompt auf → speichert neues Memory in DB via adminClient. buildMemoryContext() formatiert Memory für System-Prompt.
- Verification: Build erfolgreich, Funktionen exportiert
- Dependencies: none

#### MT-2: Memory in Chat-Route injizieren + async Update
- Goal: Chat-Route lädt Memory, injiziert es, und triggert nach Response ein async Memory-Update
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/chat/route.ts`
- Expected behavior: Memory wird zwischen Profil und Question-Kontext im System-Prompt eingefügt. Nach dem Response wird updateRunMemory() async aufgerufen (fire-and-forget). Fehler beim Memory-Update blockiert nicht die Response.
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-3: Memory in Generate-Route injizieren
- Goal: Generate-Answer-Route lädt Memory und injiziert es (kein Memory-Update bei Generate)
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/generate-answer/route.ts`
- Expected behavior: Memory als System-Kontext, identisches Pattern wie Chat-Route. Kein async Update (Generate ist kein interaktiver Chat).
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-4: Memory GET API-Route
- Goal: API-Route zum Laden des Run-Memory für die Frontend-Anzeige
- Files: `src/app/api/tenant/runs/[runId]/memory/route.ts`
- Expected behavior: GET liefert {memory_text, version, updated_at} oder leeres Objekt wenn kein Memory existiert. Auth via requireTenant().
- Verification: Build erfolgreich, Route existiert
- Dependencies: none

## Akzeptanzkriterien

1. Memory wird nach jeder Chat-Interaktion automatisch aktualisiert (async)
2. Bei erneutem Chat enthält der System-Prompt das gespeicherte Memory
3. Generate-Route hat ebenfalls Memory-Kontext
4. Memory-Update-Fehler blockiert nicht die Chat-Response
5. Memory bleibt unter 800 Tokens (durch Prompt begrenzt)
6. Memory GET-Route liefert aktuelles Memory
7. Build erfolgreich
