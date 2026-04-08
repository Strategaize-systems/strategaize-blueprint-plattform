# SLC-053 — Free-Form DB-Schema + LLM-Prompts

## Slice Info
- Feature: FEAT-035
- Status: planned
- Priority: High
- Dependencies: none

## Goal

DB-Tabelle `freeform_conversations` anlegen, RLS-Policies + GRANTs einrichten, und die beiden neuen LLM-Prompt-Typen (`freiform` + `mapping`) in `llm.ts` implementieren. Backend-Utility `freeform.ts` für Conversation-Logik und Katalog-Loader erstellen.

Dieser Slice ist die Grundlage für alle folgenden Slices — ohne Tabelle und Prompts kann keine API-Route gebaut werden.

## Scope

- SQL Migration `019_v32_freeform_chat.sql`
- RLS-Policies für freeform_conversations
- GRANTs für authenticated + service_role
- LLM-Prompts: `FREIFORM_PROMPTS` (DE/EN/NL) + `MAPPING_PROMPTS` (DE/EN/NL) in `llm.ts`
- Helper: `buildCompactCatalog()` für Freiform-Prompt (Themen statt Frage-IDs)
- Helper: `buildFullCatalog()` für Mapping-Prompt (mit Frage-IDs)
- Utility: `src/lib/freeform.ts` — Conversation CRUD, Katalog-Loader mit Block-Filter, Mapping-Result-Parser
- Validierung: `freeformChatSchema`, `mappingSchema`, `acceptDraftsSchema` in `validations.ts`

## Out of Scope

- API-Routen (SLC-054)
- Frontend-Komponenten (SLC-055, SLC-056, SLC-057)
- i18n UI-Texte (kommt mit Frontend-Slices)

### Micro-Tasks

#### MT-1: SQL Migration erstellen
- Goal: Tabelle `freeform_conversations` mit RLS und GRANTs anlegen
- Files: `sql/migrations/019_v32_freeform_chat.sql`
- Expected behavior: CREATE TABLE mit allen Spalten (id, run_id, tenant_id, created_by, conversation_number, messages JSONB, status, message_count, mapping_result JSONB, created_at, updated_at). UNIQUE Constraint auf (run_id, created_by, conversation_number). CHECK auf status. RLS-Policies: SELECT eigene, INSERT eigene (wenn Run nicht locked). GRANTs für authenticated + service_role.
- Verification: SQL-Datei ist syntaktisch korrekt (Review). Migration-Nummer 019 passt zur Reihenfolge.
- Dependencies: none

#### MT-2: LLM-Prompts freiform + mapping
- Goal: Zwei neue Prompt-Typen in llm.ts hinzufügen (DE/EN/NL)
- Files: `src/lib/llm.ts`
- Expected behavior: `PROMPTS_BY_LOCALE` wird um `freiform` und `mapping` erweitert. Freiform-Prompt: M&A-Berater Gesprächsführung, offene Fragen, thematische Steuerung, KEIN Mapping. Mapping-Prompt: Analytiker, Frage-IDs Zuordnung, Neutralisierungsregeln (keine Namen, sachlich, Rollen statt Personen), JSON-Output-Format. Beide in DE/EN/NL.
- Verification: TypeScript kompiliert. Prompts sind in allen 3 Sprachen vorhanden. `npm run build` erfolgreich.
- Dependencies: none

#### MT-3: Katalog-Builder Funktionen
- Goal: buildCompactCatalog() und buildFullCatalog() für Prompt-Kontext
- Files: `src/lib/llm.ts`
- Expected behavior: `buildCompactCatalog(questions, locale)` → kompakte Themen-Übersicht (Block + Themen, keine IDs). `buildFullCatalog(questions, locale)` → vollständige Liste mit Frage-IDs für Mapping. Beide akzeptieren gefilterte Fragen-Arrays (für Mirror Block-Filter).
- Verification: TypeScript kompiliert. Funktionen exportiert. `npm run build` erfolgreich.
- Dependencies: MT-2

#### MT-4: freeform.ts Utility
- Goal: Conversation-Logik, Katalog-Loader mit Block-Filter, Mapping-Parser
- Files: `src/lib/freeform.ts`
- Expected behavior: `loadConversation(conversationId, userId)` — lädt Conversation, prüft Ownership. `createConversation(runId, tenantId, userId)` — erstellt neue Conversation mit nächster conversation_number. `appendMessages(conversationId, userMsg, assistantMsg)` — fügt Messages zu JSONB Array hinzu, incrementiert message_count. `loadQuestionsForUser(runId, profile)` — lädt Fragen mit Block-Filter für Mirror. `parseMappingResult(llmOutput)` — parst JSON-Output des Mapping-Prompts. Alle DB-Zugriffe via adminClient.
- Verification: TypeScript kompiliert. Alle Funktionen exportiert. `npm run build` erfolgreich.
- Dependencies: MT-1

#### MT-5: Validierungs-Schemata
- Goal: Zod-Schemata für die 3 API-Routen
- Files: `src/lib/validations.ts`
- Expected behavior: `freeformChatSchema` — { message: string, conversationId?: string }. `mappingSchema` — { conversationId: string }. `acceptDraftsSchema` — { conversationId: string, acceptedDrafts: [{ questionId: string, text: string }] }.
- Verification: TypeScript kompiliert. `npm run build` erfolgreich.
- Dependencies: none
