# SLC-013 — Workspace Premium (Style Guide v2.1 Assessment Patterns)

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
High — Kundenseite, hier verbringt der Nutzer 90% der Zeit

## Scope
Kompletter Umbau der Workspace-Seite auf die neuen Premium Interview & Assessment Patterns
aus Style Guide v2.1 Section 14. Orientierung an den Figma-Mockups.

## Out of scope
- Admin-Seiten (SLC-014)
- Voice Input / Sprechen-Button (V2)
- Checkpoint-Historie mit Block-Zuordnung (braucht Backend-Erweiterung)
- Logo-Asset-Austausch (separates Thema, Logo-Dateien muessen noch geliefert werden)

## Datengrundlage
Alle benoetigten Daten sind bereits in den API-Responses vorhanden:
- `question.block` — Block-Zuordnung (A-I)
- `question.unterbereich` — Kategorie (z.B. "A1 Grundverstaendnis")
- `question.ebene` — Typ (Kern, Analyse, etc.)
- `question.latest_answer` — fuer Block-Progress-Berechnung
- `question.evidence_count` — Evidence-Zaehler
Kein Backend-Umbau noetig fuer diesen Slice.

## Design-Referenz
Style Guide v2.1 Section 14 (Premium Interview & Assessment Patterns):
- 14.1 Dual Progress Header
- 14.2 Markante Fragekarte
- 14.3 Sticky Work Area Pattern
- 14.4 Answer Editor mit Scrollable Textarea
- 14.5 History Panel mit fester Hoehe
- 14.6 Evidence & Checkpoint Grid (nur Evidence-Teil, Checkpoints = V1.1)
- 14.7 Collapsible/Expandable Content

## Micro-Tasks

### MT-1: Header — Dual Progress + Brand
- Goal: Header mit Run-Titel, Dual-Progress (Gesamt + Block), Status-Badge, Checkpoint-Button
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior:
  - Titel links (h1 text-2xl bold)
  - Breadcrumb: Block-Name + Unterbereich
  - Mitte: Zwei Progress-Bars (Gesamt=gruen, Block=blau) mit Labels + Prozent
  - Rechts: Status-Badge (gradient-warning) + Checkpoint-Button (gradient-success, uppercase)
  - Block-Progress dynamisch berechnet aus questions-Array
- Verification: Build + visuell — Header zeigt zwei Progress-Bars
- Dependencies: none

### MT-2: Sidebar — Dark Theme mit Block-Beschreibungen + Kategorien
- Goal: Sidebar komplett auf Dark-Theme umbauen mit Block-Beschreibungen und Unterkategorien
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior:
  - Dark gradient background (wie Admin-Sidebar)
  - StrategAIze Logo + "Blueprint Assessment" + "Strategische Unternehmensanalyse"
  - Bloecke mit Beschreibungen: "Block A: Geschaeftsmodell & Marktauftritt"
  - Typ-Label (ANALYSE) + Fortschritt (10/13) pro Block
  - Fragen gruppiert nach Unterbereich-Kategorie (C1 KERNABLAEUFE, C2 ABLAUFREALITAET etc.)
  - Kategorie-Labels uppercase, farbig
  - Aktive Frage: hervorgehoben (gradient background)
  - Beantwortet: gruener Dot, Offen: grauer Dot
  - Abmelden-Button unten
- Verification: Build + visuell — Sidebar ist dark mit Kategorien
- Dependencies: MT-1

### MT-3: Fragekarte — Markant + Answer Editor mit Action Bar
- Goal: Frage als dominante Karte (Style Guide 14.2) + Antwort-Editor mit Action Bar (14.4)
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior:
  - Fragekarte: rounded-3xl, border-2, shadow-2xl, p-12, gradient top-accent
  - ID-Badge: Blue gradient (F-BP-033), shadow-xl
  - Kategorie: uppercase tracking-wider
  - Typ-Badge: bg-slate-100, rechtsbuendig
  - Frage-Text: text-2xl font-bold leading-[1.4]
  - Answer Editor: rounded-2xl, border-2, shadow-lg
  - Header: "IHRE ANTWORT" mit Dot-Indikator
  - Textarea: borderless, min-h-[20rem], im scrollbaren Container
  - Action Bar unten: Zeichenzaehler links, Buttons rechts (Sprechen disabled=V2, Evidence, Antwort speichern)
  - Antwort speichern: gradient primary mit Checkmark-Icon
- Verification: Build + visuell — Frage dominiert, Antwort-Editor hochwertig
- Dependencies: MT-1, MT-2

### MT-4: History Panel + Evidence Section
- Goal: Verlauf als festes Panel (14.5) + Evidence als Card mit Upload-Hinweis (14.6 vereinfacht)
- Files: `src/app/runs/[id]/run-workspace-client.tsx`, `src/components/event-history.tsx`
- Expected behavior:
  - History Panel: rounded-2xl, border-2, shadow-lg
  - Header mit Clock-Icon (gradient), "ANTWORT-VERLAUF", Event-Count Badge
  - Feste Hoehe (400px) mit Scrollbar
  - Entries: Timestamp, Author, Version-Badge (v1/v2/v3), "Aktuell"-Badge fuer neueste
  - Truncate bei >120 chars mit "Mehr anzeigen"
  - Evidence Section: Card mit FileText-Icon (gradient), "HOCHGELADENE NACHWEISE", Count Badge
  - Datei-Eintraege mit Typ-Icon (PDF/Excel etc.), Filename, Groesse, Datum
  - Delete-Button nur bei Hover sichtbar
- Verification: Build + visuell — Verlauf hat feste Hoehe, Evidence mit Typ-Icons
- Dependencies: MT-3

### MT-5: Evidence Upload als Modal
- Goal: Evidence-Upload von inline-Form zu Dialog/Modal umbauen
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior:
  - "Evidence" Button in der Answer Action Bar oeffnet Modal
  - Modal: "Evidence hochladen" Titel, Drag&Drop-Area (gestrichelt, Icon)
  - "KATEGORIE WAEHLEN" Dropdown
  - Relation Dropdown
  - Abbrechen + Hochladen Buttons
  - Textnotiz: separater Tab oder Toggle im Modal
  - Nach Upload: Modal schliesst, Evidence-Liste aktualisiert
- Verification: Build + visuell — Upload ist jetzt ein Modal statt inline
- Dependencies: MT-3, MT-4

## Acceptance Criteria
- Header zeigt Dual-Progress (Gesamt gruen + Block blau)
- Sidebar ist dark mit Block-Beschreibungen und Kategorien
- Fragekarte ist dominant (rounded-3xl, shadow-2xl, p-12)
- Answer Editor hat Action Bar mit Zeichenzaehler
- History Panel hat feste Hoehe mit Scrollbar und Versionen
- Evidence zeigt Datei-Typ-Icons
- Evidence Upload ist ein Modal
- Alle bestehende Funktionalitaet bleibt erhalten
- Responsive: Mobile funktioniert weiterhin

## Risiken
- Datei ist bereits 600+ Zeilen — wird durch Premium-Patterns noch groesser
- Responsive-Verhalten muss bei dark Sidebar + neuem Layout getestet werden
- "Sprechen" Button wird als disabled/placeholder eingebaut (V2)
