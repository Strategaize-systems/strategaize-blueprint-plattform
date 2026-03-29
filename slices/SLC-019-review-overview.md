# SLC-019 — Antwort-Review Uebersichtsseite

## Feature
BL-015 (Antwort-Review Uebersicht mit Block-Fortschritt)

## Priority
Medium

## Scope
Neue Admin-Seite: Review-Uebersicht fuer einen Run. Zeigt Block-fuer-Block den
Fortschritt, Antwort-Qualitaet und offene Punkte. Der Admin/Berater sieht auf
einen Blick welche Bloecke fertig sind und wo noch Arbeit noetig ist.

## Micro-Tasks

### MT-1: API — Review-Daten aggregieren
- Goal: Neuer Admin-Endpoint der Block-Fortschritt + Antwort-Stats liefert
- Files: src/app/api/admin/runs/[runId]/review/route.ts
- Expected behavior:
  - Pro Block: Anzahl Fragen, beantwortet, Evidence-Count, Checkpoint-Status
  - Gesamt-Fortschritt: answered/total, submitted blocks
  - Letzte Aktivitaet pro Block
- Verification: Build + API-Call testen
- Dependencies: none

### MT-2: Frontend — Review-Uebersicht Seite
- Goal: Neue Admin-Seite /admin/runs/[id]/review mit Block-Fortschritts-Grid
- Files: src/app/admin/runs/[id]/review/page.tsx, review-client.tsx
- Expected behavior:
  - Header: Run-Titel, Gesamt-Fortschritt (Dual Progress wie Workspace)
  - Block-Grid: 9 Cards (A-I), jeweils mit:
    - Block-Name + Beschreibung
    - Progress Bar (answered/total)
    - Checkpoint-Status (eingereicht/offen)
    - Evidence-Count
    - Letzte Aktivitaet
  - Klick auf Block → Run-Detail mit dem Block vorgefiltert
- Verification: Build + visuell auf /admin/runs/[id]/review
- Dependencies: MT-1

### MT-3: Navigation — Link zur Review-Uebersicht
- Goal: Button/Link von Run-Detail und Runs-Liste zur Review-Seite
- Files: run-detail-client.tsx, runs-client.tsx, admin-sidebar.tsx
- Expected behavior:
  - Run-Detail Header: "Review" Button neben Export/Sperren
  - Runs-Liste: "Review" Link pro Run-Card
- Verification: Build + visuell
- Dependencies: MT-2

## Acceptance Criteria
- Admin sieht Block-fuer-Block Fortschritt auf einen Blick
- Eingereichte Checkpoints sind pro Block sichtbar
- Offene Bloecke sind klar erkennbar
- Navigation von und zur Review-Seite funktioniert
