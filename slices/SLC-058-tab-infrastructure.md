# SLC-058 — Tab-Infrastruktur + Cleanup

## Feature
FEAT-037 Unified Tabbed Workspace

## Goal
Die Tab-Leiste einbauen, `workspaceMode` durch `activeTab` ersetzen, Mode-Selector und QuestionOverview entfernen, und das CSS-Hidden-Pattern für Tab-Inhalte implementieren.

## Scope
- Neues Component: `src/components/workspace/workspace-tabs.tsx`
- `run-workspace-client.tsx`: `workspaceMode` State entfernen, `activeTab` State einführen
- Conditional-Return-Screens entfernen (Mode Selector, QuestionOverview, Freeform Chatting Fullscreen)
- Tab-Container mit CSS hidden/block Rendering einbauen
- ModeSelector und QuestionOverview Components entfernen
- i18n Keys für Tab-Labels hinzufügen

## Out of Scope
- Chat-Einbettung (SLC-059)
- Global Collapse (SLC-060)
- Feedback-Tab Inhalt (SLC-060)
- Mapping-Overlay (SLC-061)

## Micro-Tasks

### MT-1: WorkspaceTabs Component erstellen
- Goal: Tab-Leiste als eigene Component
- Files: `src/components/workspace/workspace-tabs.tsx`
- Expected behavior: Drei Tabs (Offen, Frage für Frage, Feedback) mit activeTab-Prop und onChange-Callback. Feedback-Tab visuell disabled. Style Guide v2 konform.
- Verification: Build erfolgreich, Component importierbar
- Dependencies: none

### MT-2: activeTab State + Tab-Container in run-workspace-client.tsx
- Goal: workspaceMode durch activeTab ersetzen, CSS-Hidden-Container für Tab-Inhalte
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: `activeTab` State ("offen" | "questionnaire" | "feedback"), default "offen". Drei `<div>` Container mit `className={activeTab === "x" ? "block" : "hidden"}`. Conditional returns für Mode-Selector, QuestionOverview, Freeform Chatting entfernen.
- Verification: Build erfolgreich, kein React Hooks Violation
- Dependencies: MT-1

### MT-3: i18n Keys für Tabs
- Goal: Tab-Labels dreisprachig
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: `workspace.tabs.offen`, `workspace.tabs.questionnaire`, `workspace.tabs.feedback`, `workspace.tabs.feedbackLocked` Keys in allen drei Sprachen
- Verification: Build erfolgreich
- Dependencies: none

### MT-4: ModeSelector + QuestionOverview entfernen
- Goal: Nicht mehr benötigte Components löschen
- Files: `src/components/freeform/mode-selector.tsx` (DELETE), `src/components/freeform/question-overview.tsx` (DELETE)
- Expected behavior: Dateien gelöscht, keine Imports mehr referenzieren diese Components
- Verification: Build erfolgreich, keine unused-import Warnings
- Dependencies: MT-2

## Acceptance Criteria
- Drei Tabs sichtbar im Workspace
- Tab-Wechsel funktioniert
- Kein Mode-Selector Screen mehr
- Kein QuestionOverview Screen mehr
- Build erfolgreich
- Keine React Hooks Violations
