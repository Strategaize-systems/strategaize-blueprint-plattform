# SLC-057 — Mapping-Review + Antwort-Übernahme

## Slice Info
- Feature: FEAT-035
- Status: planned
- Priority: High
- Dependencies: SLC-054, SLC-056

## Goal

Die Mapping-Review UI implementieren: Nach dem Gespräch sieht der Teilnehmer welche Fragen erkannt wurden, die neutralisierten Draft-Antworten, und kann einzeln Übernehmen/Bearbeiten/Verwerfen. Übernommene Drafts werden als answer_submitted Events gespeichert. Abschluss des Free-Form Flows.

## Scope

- `src/components/freeform/mapping-review.tsx` — Draft-Review Hauptkomponente
- Integration in `run-workspace-client.tsx` (FreeformPhase "mapping" + "review")
- Mapping-Trigger (API-Call zu /freeform/map)
- Accept-Trigger (API-Call zu /freeform/accept)
- i18n: `freeform.mapping.*`, `freeform.review.*` Keys in DE/EN/NL

## Out of Scope

- Änderungen an bestehendem Fragebogen-Modus
- Evidence-Verknüpfung

### Micro-Tasks

#### MT-1: Mapping-Trigger und Loading-State
- Goal: Mapping-API aufrufen und Loading-Zustand anzeigen
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Wenn freeformPhase === "mapping": automatisch POST /api/.../freeform/map mit conversationId aufrufen. Loading-Spinner mit Text "Ihre Antworten werden ausgewertet...". Bei Erfolg: mappingResult State setzen, freeformPhase → "review". Bei Fehler: Error-Toast, freeformPhase zurück auf "chatting" (Retry möglich).
- Verification: `npm run build` erfolgreich. Phase-Transition mapping → review funktioniert.
- Dependencies: none

#### MT-2: mapping-review.tsx Basis
- Goal: Draft-Antworten anzeigen, gruppiert nach Block
- Files: `src/components/freeform/mapping-review.tsx`
- Expected behavior: Props: mappings Array (questionId, questionText, block, draftText, confidence, hasExistingAnswer), unmappedQuestions Array. Gruppierung nach Block (A-I). Pro Mapping: Frage-Text, Draft-Antwort (in Card), Confidence-Badge (Grün=high, Orange=medium, Grau=low). Hinweis "Ergänzung" bei hasExistingAnswer. Abschnitt "Nicht abgedeckte Fragen" am Ende (collapsed, expandable).
- Verification: `npm run build` erfolgreich. Visuell korrekt mit Testdaten.
- Dependencies: MT-1

#### MT-3: Draft-Aktionen (Übernehmen/Bearbeiten/Verwerfen)
- Goal: Interaktive Aktionen pro Draft-Antwort
- Files: `src/components/freeform/mapping-review.tsx`
- Expected behavior: State pro Draft: selected (boolean), edited (boolean), editedText (string). Checkbox pro Draft: Default checked für high/medium, unchecked für low. "Bearbeiten" Button: Draft-Text wird in Textarea editierbar. "Verwerfen" Button: entfernt Draft aus Selection. "Alle auswählen" / "Keine auswählen" Toggle im Header. Footer: "X von Y Drafts ausgewählt" Counter + "Übernehmen" Button.
- Verification: `npm run build` erfolgreich. Interaktion in Browser testbar.
- Dependencies: MT-2

#### MT-4: Accept-Flow und Abschluss
- Goal: Ausgewählte Drafts an Accept-Route senden und Flow abschließen
- Files: `src/components/freeform/mapping-review.tsx`, `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: "Übernehmen" Button → POST /api/.../freeform/accept mit conversationId + acceptedDrafts (questionId + text, ggf. editiert). Loading-State während API-Call. Bei Erfolg: Success-Toast "X Antworten übernommen". freeformPhase → "overview" (zurück zur Modus-Auswahl). workspaceMode → "questionnaire" (zeigt aktualisierte Antworten). Bei Fehler: Error-Toast, Review bleibt offen (Retry möglich).
- Verification: `npm run build` erfolgreich. Antworten erscheinen im Fragebogen nach Übernahme.
- Dependencies: MT-3

#### MT-5: i18n Keys für Mapping + Review
- Goal: Übersetzungen für Mapping und Review
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: Keys: `freeform.mapping.loading`, `freeform.mapping.error`, `freeform.review.title`, `freeform.review.selectAll`, `freeform.review.selectNone`, `freeform.review.accept`, `freeform.review.acceptCount`, `freeform.review.edit`, `freeform.review.discard`, `freeform.review.supplement`, `freeform.review.unmapped`, `freeform.review.confidence.high`, `freeform.review.confidence.medium`, `freeform.review.confidence.low`, `freeform.review.success`. Alle 3 Sprachen.
- Verification: `npm run build` erfolgreich. Keys korrekt aufgelöst.
- Dependencies: MT-2
