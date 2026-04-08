# SLC-054 — Free-Form API-Routen

## Slice Info
- Feature: FEAT-035
- Status: planned
- Priority: High
- Dependencies: SLC-053

## Goal

Die 3 API-Routen für den Free-Form Chat implementieren: Chat-Route (Gespräch führen), Mapping-Route (Zuordnung + Neutralisierung), Accept-Route (Drafts übernehmen). Alle nutzen die in SLC-053 erstellten Prompts, Utility-Funktionen und Validierungen.

## Scope

- `POST /api/tenant/runs/[runId]/freeform/chat/route.ts`
- `POST /api/tenant/runs/[runId]/freeform/map/route.ts`
- `POST /api/tenant/runs/[runId]/freeform/accept/route.ts`

## Out of Scope

- Frontend (SLC-055, SLC-056, SLC-057)
- LLM-Prompts (bereits in SLC-053)

### Micro-Tasks

#### MT-1: Chat-Route
- Goal: Free-Form Chat Nachricht senden und LLM-Antwort erhalten
- Files: `src/app/api/tenant/runs/[runId]/freeform/chat/route.ts`
- Expected behavior: requireTenant() Auth. Run laden + Status-Check (nicht locked). Body validieren (freeformChatSchema). Conversation laden oder erstellen (via freeform.ts). Fragen laden mit Block-Filter (loadQuestionsForUser). Profil-Kontext laden (Mirror oder Owner). Memory laden. System-Prompt bauen: FREIFORM_PROMPTS[locale] + profileContext + memoryContext + buildCompactCatalog(questions, locale). Soft-Limit Injection wenn messageCount >= 28. chatWithLLM(messages, {temperature: 0.7, maxTokens: 512}). Conversation updaten (appendMessages). Memory async updaten (updateRunMemory). Response: { response, conversationId, messageCount, softLimitReached }.
- Verification: Route existiert. TypeScript kompiliert. `npm run build` erfolgreich. Manual-Test via curl/Postman möglich (nach DB-Migration auf Hetzner).
- Dependencies: none (innerhalb dieses Slice)

#### MT-2: Mapping-Route
- Goal: Gesamtes Gespräch auf Fragen mappen und neutralisierte Drafts generieren
- Files: `src/app/api/tenant/runs/[runId]/freeform/map/route.ts`
- Expected behavior: requireTenant() Auth. Body validieren (mappingSchema). Conversation laden, Status prüfen (active oder mapping_pending). Status → mapping_pending. Fragen laden mit Block-Filter. Bestehende Antworten laden (v_current_answers). System-Prompt: MAPPING_PROMPTS[locale] + buildFullCatalog(questions, locale) + bestehende Antworten als Info. chatWithLLM(messages, {temperature: 0.3, maxTokens: 4096}). Output parsen (parseMappingResult). mapping_result in Conversation speichern. Status → mapped. Response: { mappings: [{questionId, questionText, block, draftText, confidence, hasExistingAnswer}], unmappedQuestions: [{questionId, questionText, block}] }.
- Verification: Route existiert. TypeScript kompiliert. `npm run build` erfolgreich.
- Dependencies: MT-1

#### MT-3: Accept-Route
- Goal: Ausgewählte Draft-Antworten als answer_submitted Events speichern
- Files: `src/app/api/tenant/runs/[runId]/freeform/accept/route.ts`
- Expected behavior: requireTenant() Auth. Body validieren (acceptDraftsSchema). Conversation laden, Status muss mapped sein. Für jeden Draft: question_id validieren, question_events INSERT mit event_type='answer_submitted', payload={text, source: "freeform", conversation_id}. client_event_id generiert serverseitig (gen_random_uuid). Conversation Status → closed. Response: { acceptedCount, conversationStatus: "closed" }.
- Verification: Route existiert. TypeScript kompiliert. `npm run build` erfolgreich.
- Dependencies: MT-2
