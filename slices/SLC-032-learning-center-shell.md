# SLC-032 — Learning Center Shell + Help Button

## Metadaten

- **ID:** SLC-032
- **Feature:** FEAT-023
- **Backlog:** BL-042
- **Version:** V2.1
- **Status:** planned
- **Priorität:** High
- **Erstellt:** 2026-04-01
- **Abhängigkeiten:** keine (Grundstruktur)

## Ziel

Die Grundstruktur des Learning Centers aufbauen: Dependencies installieren, Help-Button als Floating Element auf allen Tenant-Seiten, Sheet-Panel mit Tab-Navigation (Videos + Anleitung), i18n-Keys für Shell-UI. Nach diesem Slice existiert das leere Learning Center mit funktionierender Öffnen/Schließen-Mechanik und Tab-Wechsel.

## Scope

**In Scope:**
- Dependencies installieren (react-markdown, remark-gfm)
- HelpButton Komponente (floating, unten rechts)
- LearningCenterPanel Komponente (Sheet + Tabs)
- i18n-Keys für Shell (learning.helpButton, learning.tabVideos, learning.tabGuide — DE/EN/NL)
- Integration in Dashboard + Workspace
- .gitignore für Video-Dateien
- Leerer Platzhalter-Content in beiden Tabs

**Out of Scope:**
- Video-Lektionen und Player (SLC-033)
- Markdown-Rendering und Suche (SLC-034)
- Echte Inhalte

## Micro-Tasks

### MT-1: Dependencies installieren + .gitignore

- **Goal:** react-markdown und remark-gfm als Dependencies hinzufügen, .gitignore für Video-Dateien erweitern
- **Files:** `package.json`, `.gitignore`
- **Expected behavior:** `npm install` installiert react-markdown und remark-gfm. .gitignore enthält `/public/videos/*.mp4`
- **Verification:** `npm install` erfolgreich, `npm run build` weiterhin erfolgreich
- **Dependencies:** keine

### MT-2: i18n-Keys für Learning Center Shell

- **Goal:** Neue Translation-Keys für das Learning Center in allen 3 Sprachen anlegen
- **Files:** `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- **Expected behavior:** Neuer `learning`-Namespace mit Keys: helpButton, tabVideos, tabGuide, close, videoNotReady, guideNotReady
- **Verification:** Keine Typfehler, JSON valide, Build erfolgreich
- **Dependencies:** keine

### MT-3: HelpButton Komponente

- **Goal:** Floating Help-Button erstellen, der auf Dashboard und Workspace sichtbar ist
- **Files:** `src/components/help-button.tsx`
- **Expected behavior:** Rendert einen runden Button mit Fragezeichen-Icon (Lucide HelpCircle) in der Position fixed bottom-right. Akzeptiert onClick-Callback. Responsive: etwas kleiner auf Mobile (< 768px). Z-Index unter Modals/Sheets. Verwendet Brand-Farben.
- **Verification:** Komponente rendert ohne Fehler, Button ist sichtbar und klickbar
- **Dependencies:** keine

### MT-4: LearningCenterPanel Komponente

- **Goal:** Sheet-Panel mit Tab-Navigation erstellen (Videos + Anleitung Tabs)
- **Files:** `src/components/learning-center/learning-center-panel.tsx`
- **Expected behavior:** Verwendet shadcn/ui Sheet (side="right"). Hat SheetHeader mit Titel. Tab-Navigation (Videos | Anleitung) als Buttons/Tabs. Aktiver Tab ist visuell markiert. Tab-Content zeigt Platzhalter-Text ("Videos werden hier angezeigt" / "Anleitung wird hier angezeigt"). Scrollbar. Responsive Breite (max-w-lg auf Desktop, full auf Mobile). Alle Texte via useTranslations("learning").
- **Verification:** Komponente öffnet sich als Sheet, Tabs wechseln, Texte in korrekter Sprache, schließbar per X/Escape/Backdrop
- **Dependencies:** MT-2 (i18n-Keys), MT-3 (HelpButton wird hier nicht eingebunden, aber Design-Abstimmung)

### MT-5: Integration in Dashboard + Workspace

- **Goal:** HelpButton und LearningCenterPanel in beide Tenant-Seiten einbinden
- **Files:** `src/app/dashboard/dashboard-client.tsx`, `src/app/runs/[id]/run-workspace-client.tsx`
- **Expected behavior:** HelpButton wird am Ende des JSX gerendert (fixed positioning). Klick auf HelpButton öffnet LearningCenterPanel. State (open/closed) wird lokal im jeweiligen Page-Component verwaltet. Panel zeigt leere Tabs mit Platzhalter.
- **Verification:** Help-Button sichtbar auf Dashboard UND Workspace. Klick öffnet Panel. Panel schließbar. Kein Layout-Shift. Keine Regression in bestehender Funktionalität.
- **Dependencies:** MT-3, MT-4

## Akzeptanzkriterien

1. Help-Button ist auf Dashboard und Workspace sichtbar (floating, unten rechts)
2. Klick öffnet Sheet-Panel von rechts mit Tabs
3. Tab-Wechsel zwischen Videos und Anleitung funktioniert
4. Alle Texte erscheinen in der richtigen Tenant-Sprache (DE/EN/NL)
5. Panel schließbar per X, Escape, Backdrop-Klick
6. Kein Layout-Shift beim Öffnen/Schließen
7. react-markdown und remark-gfm installiert
8. Build erfolgreich (`npm run build`)
