# SLC-056 — Free-Form Chat UI + Soft-Limit

## Slice Info
- Feature: FEAT-035
- Status: planned
- Priority: High
- Dependencies: SLC-054, SLC-055

## Goal

Das Free-Form Chat Panel implementieren — das Herzstück des Features. Der Teilnehmer führt ein offenes Gespräch mit dem LLM, ohne eine spezifische Frage auszuwählen. Voice-Input via Whisper funktioniert. Soft-Limit Banner bei ~30 Nachrichten. "Gespräch beenden" Button triggert das Mapping.

## Scope

- `src/components/freeform/freeform-chat.tsx` — Chat-Panel (Messages, Input, Send, Voice)
- `src/components/freeform/soft-limit-banner.tsx` — Hinweis-Banner bei Soft-Limit
- Integration in `run-workspace-client.tsx` (FreeformPhase "chatting")
- i18n: `freeform.chat.*`, `freeform.softLimit.*` Keys in DE/EN/NL

## Out of Scope

- Mapping und Review (SLC-057)

### Micro-Tasks

#### MT-1: freeform-chat.tsx Basis-Komponente
- Goal: Chat-Panel mit Messages-Anzeige und Text-Input
- Files: `src/components/freeform/freeform-chat.tsx`
- Expected behavior: Messages-Liste (scrollbar): User-Nachrichten rechts (brand-primary), Assistant links (slate-100) — gleiche Styling-Pattern wie bestehender Chat. Text-Input (4-row Textarea) + Send-Button. sendMessage() ruft POST /api/.../freeform/chat mit message + conversationId. Response: assistant-Nachricht wird zur Liste hinzugefügt, conversationId wird gesetzt. Loading-State während LLM antwortet (Spinner). Props: runId, onConversationCreated(id), onEndChat(). State: freeformMessages[], chatInput, chatLoading, conversationId.
- Verification: `npm run build` erfolgreich. Chat-Nachricht senden und Antwort empfangen (nach Deploy + Migration).
- Dependencies: none

#### MT-2: Voice-Integration
- Goal: Whisper-Spracheingabe im Free-Form Chat
- Files: `src/components/freeform/freeform-chat.tsx`
- Expected behavior: Mikrofon-Button zwischen Textarea und Send (gleiche Position wie im bestehenden Chat). Aufnahme → Transkription via bestehende /transcribe Route → Text im Eingabefeld. Gleiche States: isRecording, isTranscribing, recordingDuration. Gleiche Logik wie in run-workspace-client.tsx — kann als Shared-Hook extrahiert oder kopiert werden. Feature-Flag NEXT_PUBLIC_WHISPER_ENABLED respektiert.
- Verification: `npm run build` erfolgreich. Mic-Button sichtbar wenn Whisper enabled.
- Dependencies: MT-1

#### MT-3: soft-limit-banner.tsx
- Goal: Info-Banner das bei Soft-Limit angezeigt wird
- Files: `src/components/freeform/soft-limit-banner.tsx`
- Expected behavior: Gelb/Orange Banner über dem Eingabefeld. Text: "Genug Material gesammelt — Ergebnisse jetzt auswerten". Button "Ergebnisse auswerten" (prominent). Wird sichtbar wenn softLimitReached=true (von API response). Eingabefeld bleibt aktiv (kein hartes Limit).
- Verification: `npm run build` erfolgreich. Visuell korrekt.
- Dependencies: MT-1

#### MT-4: "Gespräch beenden" Button + Phase-Transition
- Goal: Button und Logik zum Beenden des Gesprächs und Starten des Mappings
- Files: `src/components/freeform/freeform-chat.tsx`, `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: "Gespräch beenden" Button sichtbar ab 4+ Nachrichten. Wird prominent nach Soft-Limit (neben Banner). Klick → Confirmation Dialog ("Gespräch beenden und Ergebnisse auswerten?"). Bestätigung → freeformPhase wechselt zu "mapping" → Mapping wird getriggert.
- Verification: `npm run build` erfolgreich. Phase-Transition funktioniert.
- Dependencies: MT-1, MT-3

#### MT-5: i18n Keys für Chat + Soft-Limit
- Goal: Übersetzungen für Chat-UI und Soft-Limit
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: Keys: `freeform.chat.placeholder`, `freeform.chat.send`, `freeform.chat.loading`, `freeform.chat.endChat`, `freeform.chat.endChatConfirm`, `freeform.chat.endChatConfirmText`, `freeform.softLimit.title`, `freeform.softLimit.description`, `freeform.softLimit.evaluateNow`. Alle 3 Sprachen.
- Verification: `npm run build` erfolgreich. Keys in Komponenten korrekt aufgelöst.
- Dependencies: MT-1, MT-3
