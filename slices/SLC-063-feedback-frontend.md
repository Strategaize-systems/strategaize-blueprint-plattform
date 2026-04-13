# SLC-063 — Feedback Frontend (Tab + Panel)

## Slice Info
- Feature: FEAT-036
- Priority: High
- Dependencies: SLC-062 (API muss existieren)

## Goal

Feedback-Tab im Workspace aktivieren (disabled → dynamisch), FeedbackPanel Component erstellen mit 4 Fragen, i18n Keys hinzufuegen.

## Micro-Tasks

### MT-1: i18n Keys hinzufuegen
- Goal: Alle Feedback-Texte in DE/EN/NL definieren
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: Keys unter workspace.feedback.* fuer: Titel, 4 Fragen-Texte, Placeholders, Submit-Button, Erfolgs-Nachricht, Tab-Locked-Text
- Verification: JSON-Syntax valide
- Dependencies: keine

### MT-2: FeedbackPanel Component
- Goal: UI-Component mit 4 Feedback-Karten (3x Textarea + 1x Rating+Textarea), Submit-Button, Erfolgs-Nachricht
- Files: `src/components/workspace/feedback-panel.tsx`
- Expected behavior: Laedt bestehende Daten via GET beim Mount. Zeigt 4 Fragen mit Eingabefeldern. Rating als 1-5 Sterne oder Buttons. Submit speichert via POST. Erfolgs-Nachricht nach Submit. Alle Texte via useTranslations().
- Verification: `npm run build` erfolgreich
- Dependencies: MT-1

### MT-3: Tab-Aktivierung + Integration
- Goal: Feedback-Tab dynamisch aktivieren basierend auf Run-Status, FeedbackPanel im Workspace einbinden
- Files: `src/components/workspace/workspace-tabs.tsx`, `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Tab disabled=false wenn Run status submitted/locked UND survey_type=management UND Rolle tenant_admin/tenant_owner. FeedbackPanel ersetzt den Lock-Platzhalter. CSS hidden Pattern beibehalten (DEC-041).
- Verification: `npm run build` erfolgreich, Browser: Tab wechselt korrekt, Platzhalter verschwindet bei submitted Run
- Dependencies: MT-2

## Acceptance Criteria
1. Feedback-Tab ist disabled bei nicht-submitted Runs
2. Feedback-Tab wird aktiv bei submitted/locked Runs
3. Alle 4 Fragen werden mit korrekten i18n-Texten angezeigt
4. Freitext kann eingegeben und gespeichert werden
5. Rating (1-5) kann ausgewaehlt werden
6. Bereits gespeichertes Feedback wird beim erneuten Oeffnen geladen
7. Erfolgs-Nachricht erscheint nach Submit
8. Mirror-Respondent sieht keinen aktiven Feedback-Tab
