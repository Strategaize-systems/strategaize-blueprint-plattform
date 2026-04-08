# SLC-055 — Modus-Auswahl + Fragen-Übersicht

## Slice Info
- Feature: FEAT-035
- Status: planned
- Priority: High
- Dependencies: SLC-054

## Goal

Den Workspace um den Modus-Switch (Fragebogen vs Free-Form) und die Fragen-Übersicht vor dem Gesprächsstart erweitern. Der Teilnehmer sieht seine zugewiesenen Fragen/Blöcke und kann dann das Free-Form Gespräch starten.

## Scope

- `src/components/freeform/mode-selector.tsx` — Modus-Auswahl Cards
- `src/components/freeform/question-overview.tsx` — Block/Fragen-Übersicht mit Fortschritt
- `src/app/runs/[id]/run-workspace-client.tsx` — WorkspaceMode + FreeformPhase State einbauen
- i18n: `freeform.modeSelector.*`, `freeform.overview.*` Keys in DE/EN/NL

## Out of Scope

- Free-Form Chat Panel (SLC-056)
- Mapping-Review (SLC-057)

### Micro-Tasks

#### MT-1: WorkspaceMode State in run-workspace-client.tsx
- Goal: State-Infrastruktur für Free-Form Modus im Workspace
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Neuer State `workspaceMode: "questionnaire" | "freeform"` (default: "questionnaire"). Neuer State `freeformPhase: "overview" | "chatting" | "mapping" | "review"` (default: "overview"). Neuer State `conversationId: string | null`. Conditional Rendering: wenn freeform → Freeform-Komponenten, wenn questionnaire → bestehende UI unverändert.
- Verification: `npm run build` erfolgreich. Bestehender Fragebogen-Modus funktioniert unverändert (Regression-Check).
- Dependencies: none

#### MT-2: mode-selector.tsx Komponente
- Goal: Zwei-Karten Auswahl für Fragebogen vs Free-Form Modus
- Files: `src/components/freeform/mode-selector.tsx`
- Expected behavior: Zwei nebeneinander liegende Cards mit Icon, Titel, kurzer Beschreibung. Fragebogen-Card: "Frage für Frage" Icon, Beschreibung. Free-Form Card: "Offenes Gespräch" Icon, Beschreibung. onClick setzt workspaceMode. Responsive: nebeneinander auf Desktop, übereinander auf Mobile. Tailwind + shadcn/ui Card Styling konsistent mit bestehendem Design.
- Verification: `npm run build` erfolgreich. Visuelle Prüfung im Browser.
- Dependencies: MT-1

#### MT-3: question-overview.tsx Komponente
- Goal: Block/Fragen-Übersicht vor Gesprächsstart
- Files: `src/components/freeform/question-overview.tsx`
- Expected behavior: Block-Liste (A-I) mit Themen-Titel und Fragenanzahl. Pro Block: Fortschrittsanzeige (X von Y beantwortet). Grüner Dot für beantwortete Fragen, grauer Dot für offene. Gesamtfortschritt oben: "X von Y Fragen beantwortet". CTA Button "Gespräch starten" → setzt freeformPhase auf "chatting". Props: questions Array, currentAnswers Map.
- Verification: `npm run build` erfolgreich. Visuelle Prüfung im Browser.
- Dependencies: MT-1

#### MT-4: i18n Keys
- Goal: Übersetzungen für Modus-Auswahl und Übersicht
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: Neuer Namespace `freeform` mit Keys: `modeSelector.questionnaireTitle`, `modeSelector.questionnaireDescription`, `modeSelector.freeformTitle`, `modeSelector.freeformDescription`, `overview.title`, `overview.progress`, `overview.startChat`, `overview.questionsAnswered`. Alle 3 Sprachen.
- Verification: `npm run build` erfolgreich. Keys werden in Komponenten korrekt aufgelöst.
- Dependencies: MT-2, MT-3
