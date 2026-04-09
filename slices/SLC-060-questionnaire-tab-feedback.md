# SLC-060 — Frage-für-Frage-Tab + Global Collapse + Feedback-Platzhalter

## Feature
FEAT-037 Unified Tabbed Workspace

## Goal
Bestehenden Fragebogen im Tab-Container wrappen, globales Auf-/Zuklappen aller Blöcke hinzufügen, und Feedback-Tab als gesperrten Platzhalter implementieren.

## Scope
- Fragebogen-Bereich im "questionnaire" Tab-Container (CSS hidden)
- Global Collapse/Expand Button in der Sidebar
- Feedback-Tab: gesperrter Platzhalter mit "Kommt bald"-Hinweis
- i18n Keys für Feedback-Platzhalter

## Dependencies
- SLC-058 (Tab-Infrastruktur)

## Micro-Tasks

### MT-1: Fragebogen in Tab wrappen
- Goal: Bestehender Fragebogen-Bereich funktioniert im questionnaire Tab-Container
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Gesamter bestehender Fragebogen (Header, Sidebar mit Fragen, Detail-Bereich) rendert im questionnaire Tab-Container. Verhalten identisch zu bisher — Frage auswählen, beantworten, Evidence hochladen, Block einreichen.
- Verification: Alle bestehenden Fragebogen-Funktionen funktionieren
- Dependencies: none

### MT-2: Global Collapse/Expand
- Goal: Button zum gleichzeitigen Auf-/Zuklappen aller Blöcke
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Button in Sidebar (oberhalb der Blöcke). "Alle öffnen" setzt openBlocks auf Set aller Blöcke. "Alle schließen" setzt openBlocks auf leere Set. Button-Label wechselt je nach Zustand. Einzelnes Auf-/Zuklappen funktioniert weiterhin.
- Verification: Alle Blöcke öffnen/schließen sich gleichzeitig
- Dependencies: none

### MT-3: Feedback-Tab Platzhalter
- Goal: Gesperrter Feedback-Tab mit Hinweis
- Files: `src/app/runs/[id]/run-workspace-client.tsx`, `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: Feedback-Tab-Inhalt zeigt zentrierten Platzhalter: Icon + "Dieser Bereich wird bald freigeschaltet" + kurze Beschreibung. Kein interaktiver Content. Dreisprachig.
- Verification: Feedback-Tab zeigt Platzhalter, Build erfolgreich
- Dependencies: none

## Acceptance Criteria
- Fragebogen funktioniert identisch zu bisher
- Global Collapse/Expand Button funktioniert
- Einzelnes Block-Toggle funktioniert weiterhin
- Feedback-Tab zeigt Platzhalter dreisprachig
- Keine Regressionen im bestehenden Fragebogen
