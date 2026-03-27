# SLC-012 — Workspace Redesign: Layout, Informationsarchitektur, Markenpraesenz

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
High — Kundenseite, hier verbringt der Nutzer 90% der Zeit

## Scope
Grundlegende Neuordnung der Workspace-Seite: Fragennavigation als kompakte Sidebar, Hauptarbeitsbereich deutlich priorisiert, Evidence besser integriert, Verlauf als sekundaeres Panel, Brand-Praesenz erhoehen.

## Out of scope
- Neue Funktionalitaet (kein neuer Code fuer Backend/API)
- Admin-Seiten-Inhalte (nur Admin-Sidebar-Polish)
- Logo-Asset-Erstellung (nutzt vorhandenes Icon oder Platzhalter)

## Design-Prinzipien
- Hauptarbeitsbereich (Frage + Antwort + Evidence) ist PRIMAER
- Fragennavigation ist SEKUNDAER (wichtig, aber nicht dominant)
- Verlauf/Historie ist TERTIAER (zugaenglich, aber nicht stoerend)
- Hochwertig, klar, modern, professionell, markenfaehig
- Nicht verspielt, nicht generisch, nicht reine Formularoptik

## Micro-Tasks

### MT-1: Workspace Layout-Grundgeruest — 3-Spalten zu Sidebar+Main
- Goal: Layout von grid-cols-3 auf echte Sidebar (fixed, schmal) + breiten Hauptbereich umbauen
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior:
  - Linke Sidebar: kompakt (280px), scrollbar, dark-on-light oder subtle background
  - Hauptbereich: flexibel breit, der eigentliche Arbeitsraum
  - Header: StrategAIze-Branding + Run-Titel + Progress + Status
  - Progress-Bar in den Header integrieren statt separater Zeile
- Verification: Build + visuell auf /runs/[id]
- Dependencies: SLC-007 (Brand-Farben)

### MT-2: Fragennavigation als kompakte Sidebar
- Goal: Block-Tabs + Fragenliste als vertikale Sidebar-Navigation neu gestalten
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior:
  - Bloecke als aufklappbare Gruppen (Accordion/Collapsible) statt Tabs
  - Fragen als kompakte Zeilen: Frage-ID + Kurztext + Status-Dot (gruen/gelb/grau)
  - Aktive Frage mit Brand-Highlight (linker Strich oder Background)
  - Weniger visuelle Masse, besser scanbar
  - Kein Card-pro-Frage mehr — eher Listen-Items
- Verification: Build + visuell — Navigation ist schmaler und ruhiger
- Dependencies: MT-1

### MT-3: Hauptarbeitsbereich — Frage + Antwort hochwertig
- Goal: Frage-Anzeige und Antwort-Bereich als klaren, grosszuegigen Arbeitsraum gestalten
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior:
  - Frage deutlich inszeniert (groessere Schrift, Brand-Akzent)
  - Frage-Metadaten (Block, Ebene, Unterbereich) sekundaer/subtle
  - Antwort-Textarea grosszuegiger (mehr Hoehe, besserer Focus-State)
  - Speichern-Button prominent aber nicht aufdringlich
  - Evidence-Sektion direkt unter Antwort, visuell angebunden (nicht als separates Formular-Stueck)
  - Evidence-Upload kompakter (Datei + Notiz in Tabs oder kompakte Sections)
- Verification: Build + visuell — Hauptbereich fuehlt sich wie eigentlicher Arbeitsraum an
- Dependencies: MT-1, MT-2

### MT-4: Verlauf/Historie als Utility-Panel
- Goal: Verlauf nicht mehr gestapelt unter allem, sondern als aufklappbares sekundaeres Panel
- Files: `src/app/runs/[id]/run-workspace-client.tsx`, `src/components/event-history.tsx`
- Expected behavior:
  - Verlauf als Collapsible-Section am unteren Rand des Hauptbereichs ODER als Slide-in Panel
  - Standardmaessig zugeklappt wenn nur wenige Events
  - Event-Count als Badge sichtbar auch im zugeklappten Zustand
  - Beim Arbeiten nicht im Weg, aber schnell erreichbar
- Verification: Build + visuell — Verlauf stoert nicht den Hauptfokus
- Dependencies: MT-3

### MT-5: Brand-Praesenz + Admin-Sidebar Polish
- Goal: StrategAIze-Identitaet auf Kunden- und Admin-Seite staerken
- Files: `src/app/runs/[id]/run-workspace-client.tsx`, `src/app/dashboard/dashboard-client.tsx`, `src/components/admin-sidebar.tsx`
- Expected behavior:
  - Workspace-Header: StrategAIze-Logo-Icon + Run-Titel als klarer Produktrahmen
  - Dashboard-Header: konsistent mit Workspace
  - Admin-Sidebar: Logo-Bereich hochwertiger, klarere visuelle Familienaehnlichkeit
  - Durchgaengiges Produktgefuehl ohne Branding-Ueberladung
- Verification: Build + visuell — alle Seiten fuehlen sich wie ein Produkt an
- Dependencies: MT-1 bis MT-4

## Acceptance Criteria
- Fragennavigation ist kompakt, ruhig, nicht dominant
- Hauptarbeitsbereich fuehlt sich wie priorisierte Arbeitsflaeche an
- Evidence ist Teil des Arbeitsprozesses, kein Anhaengsel
- Verlauf ist zugaenglich aber stoert nicht
- StrategAIze-Identitaet ist auf der Kundenseite praesent
- Admin-Sidebar passt visuell zur Kundenseite
- Keine Funktionalitaet verloren (alle Features funktionieren wie vorher)

## Estimated Complexity
Gross — Haupt-UI-Datei ist 746 Zeilen, Layout-Grundstruktur aendert sich komplett

## Risiken
- Die Workspace-Datei ist eine einzelne grosse Client-Component (746 Zeilen)
- Layout-Umstrukturierung betrifft alle UI-Bereiche gleichzeitig
- Responsive-Verhalten muss weiterhin funktionieren
