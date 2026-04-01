# FEAT-024 — Video-Tutorial-Bereich (DE/EN/NL)

## Metadaten

- **ID:** FEAT-024
- **Version:** V2.1
- **Priorität:** P0
- **Status:** planned
- **Backlog:** BL-043
- **Erstellt:** 2026-04-01

## Zusammenfassung

3–4 eingebettete Video-Lektionen innerhalb des Learning Center Panels (FEAT-023), die die Kernfunktionen der Blueprint Plattform erklären. Videos werden extern produziert und als Dateien eingebunden. Automatische Sprachauswahl basierend auf Tenant-Sprache.

## Problem

Kunden müssen die Plattform-Features (KI-Rückfragen, Spracheingabe, Dokumentanalyse) selbst entdecken. Ohne visuelle Erklärung werden fortgeschrittene Features untergenutzt oder falsch verwendet.

## Lösung

### Lektionen

| Nr. | Titel (DE) | Titel (EN) | Titel (NL) | Inhalt |
|-----|-----------|-----------|-----------|--------|
| 1 | Erste Schritte | Getting Started | Aan de slag | Login, Dashboard, Run öffnen, Navigation |
| 2 | Fragebogen bearbeiten | Editing the Questionnaire | Vragenlijst bewerken | Fragen beantworten, Blöcke navigieren, Fortschritt |
| 3 | KI richtig nutzen | Using AI Effectively | AI effectief gebruiken | Rückfragen, Zusammenfassung, Spracheingabe |
| 4 | Dokumente hochladen | Uploading Documents | Documenten uploaden | Evidence, Labels, Dokumentanalyse |

### Video-Anzeige im Learning Center

- Videos-Tab zeigt Liste der Lektionen als Cards
- Jede Card: Thumbnail (Platzhalter-Bild), Titel, Kurzbeschreibung, Dauer
- Klick auf Card öffnet eingebetteten Player innerhalb des Panels
- HTML5 `<video>` Tag mit Controls (Play, Pause, Scrub, Fullscreen)
- Zurück-Button zum Lektions-Überblick

### Video-Dateien

- Statische Dateien unter `/public/videos/` (oder CDN-URL)
- Namenskonvention: `tutorial-{nr}-{locale}.mp4` (z.B. `tutorial-01-de.mp4`)
- Thumbnails: `tutorial-{nr}-thumb.jpg`
- Video-Konfiguration als JSON/TypeScript-Datei mit Metadaten pro Lektion und Sprache

### Sprachsteuerung

- Automatisch: zeigt Videos in Tenant-Sprache
- Fallback: wenn Video für Sprache fehlt → DE-Version anzeigen
- Kein manueller Sprachwechsel im Tutorial-Bereich (folgt Plattform-Sprache)

### Dashboard-Teaser (optional)

- Kleiner Teaser-Bereich auf dem Dashboard unterhalb der Run-Liste
- "Neu hier? Unsere Tutorials helfen beim Einstieg" mit Link zum Learning Center
- Kann per Feature-Flag oder einfacher Logik ausgeblendet werden

### Dummy-Content

Für die V2.1-Implementation:
- Platzhalter-Thumbnails (generisches Bild mit Lektions-Titel)
- Video-URLs noch leer oder mit Platzhalter-Video (kurzes Standbild)
- Alle Texte (Titel, Beschreibung) in allen 3 Sprachen vorhanden
- Graceful Empty State wenn Video-Datei fehlt: "Video wird vorbereitet"

## Akzeptanzkriterien

1. Videos-Tab im Learning Center zeigt 3–4 Lektionen als Cards
2. Jede Card hat Thumbnail, Titel und Beschreibung in der richtigen Sprache
3. Klick auf Card öffnet einen Player-Bereich (auch mit Dummy-Content funktionsfähig)
4. Sprachauswahl folgt automatisch der Tenant-Sprache
5. Graceful Fallback wenn Video-Datei fehlt (Placeholder-Nachricht)
6. Responsiv: Cards stacken auf Mobile
7. Zurück-Navigation vom Player zur Lektions-Liste funktioniert

## Technische Hinweise

- Video-Metadaten als TypeScript-Konfiguration: `/src/config/tutorials.ts`
- Komponente: `/src/components/learning-center/video-tutorials.tsx`
- Player-Komponente: `/src/components/learning-center/video-player.tsx`
- i18n: Lektions-Texte über `learning.tutorials.*` in Message-Dateien
- Keine externe Abhängigkeit (kein YouTube, kein Vimeo)
- Keine Supabase-Storage-Anbindung nötig (statische Dateien)

## Abhängigkeiten

- FEAT-023 (Learning Center Container) muss existieren
- Echte Video-Dateien werden später via /user-guide Skill + externe Produktion geliefert

## Out of Scope

- Video-Streaming (Progressive Download reicht)
- Video-Upload durch Admin
- Fortschrittstracking (welche Videos gesehen)
- Untertitel / Closed Captions
- Video-Produktion (nur technische Einbettung)
