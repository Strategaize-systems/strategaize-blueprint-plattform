# SLC-033 — Video Tutorials

## Metadaten

- **ID:** SLC-033
- **Feature:** FEAT-024
- **Backlog:** BL-043
- **Version:** V2.1
- **Status:** planned
- **Priorität:** High
- **Erstellt:** 2026-04-01
- **Abhängigkeiten:** SLC-032 (Learning Center Shell muss existieren)

## Ziel

Video-Tutorial-Bereich im Learning Center implementieren: Tutorial-Konfiguration, Lektions-Liste als Cards, eingebetteter Video-Player, Platzhalter-Thumbnails, i18n für Tutorial-Texte. Nach diesem Slice zeigt der Videos-Tab 4 Lektions-Cards mit Dummy-Content und einen funktionierenden (leeren) Player.

## Scope

**In Scope:**
- Tutorial-Konfiguration (src/config/tutorials.ts)
- VideoTutorials Komponente (Card-Liste der Lektionen)
- VideoPlayer Komponente (HTML5 video + Fehlerbehandlung)
- i18n-Keys für Tutorial-Titel und -Beschreibungen (DE/EN/NL)
- Platzhalter-Thumbnails (generierte JPG-Dateien oder SVG-Platzhalter)
- Graceful Empty State bei fehlenden Videos
- Integration in LearningCenterPanel (Videos-Tab)

**Out of Scope:**
- Echte Video-Dateien (kommen später via /user-guide)
- Dashboard-Teaser (deferred, optional)
- Video-Streaming oder -Analytics

## Micro-Tasks

### MT-1: Tutorial-Konfiguration

- **Goal:** TypeScript-Konfigurationsdatei mit Tutorial-Metadaten erstellen
- **Files:** `src/config/tutorials.ts`
- **Expected behavior:** Exportiert TUTORIALS Array mit 4 Einträgen. Jeder Eintrag: id, titleKey, descriptionKey, durationSeconds (0 für Dummy), videoPath-Template, thumbnailPath. Interface Tutorial exportiert.
- **Verification:** TypeScript kompiliert fehlerfrei, Import funktioniert
- **Dependencies:** keine

### MT-2: VideoTutorials Komponente (Card-Liste)

- **Goal:** Lektions-Übersicht als Card-Liste im Videos-Tab
- **Files:** `src/components/learning-center/video-tutorials.tsx`
- **Expected behavior:** Rendert TUTORIALS als shadcn/ui Cards. Jede Card: Thumbnail-Bild (oder Platzhalter), Titel (aus i18n), Beschreibung (aus i18n), optionale Dauer-Anzeige. Klick auf Card setzt selectedTutorial State. Wenn ein Tutorial ausgewählt → zeigt VideoPlayer statt Liste. Locale wird via useLocale() gelesen für Video-URL-Zusammenbau.
- **Verification:** 4 Cards rendern mit korrekten Texten, Klick selektiert Tutorial
- **Dependencies:** MT-1

### MT-3: VideoPlayer Komponente

- **Goal:** Eingebetteter HTML5 Video-Player mit Fehlerbehandlung
- **Files:** `src/components/learning-center/video-player.tsx`
- **Expected behavior:** HTML5 `<video controls>` mit poster-Attribut (Thumbnail). Zurück-Button oben ("Zurück zur Übersicht" via i18n). Titel der Lektion als Überschrift. onError Handler: wenn Video-Datei fehlt → zeigt Fallback-UI "Video wird vorbereitet" (via i18n learning.videoNotReady). Responsive: volle Breite im Panel.
- **Verification:** Player rendert, Zurück-Button navigiert zur Liste, Fallback-UI bei fehlendem Video
- **Dependencies:** MT-1

### MT-4: i18n-Keys + Platzhalter-Thumbnails

- **Goal:** Tutorial-Texte in alle 3 Sprachen einfügen, Platzhalter-Thumbnails erstellen
- **Files:** `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`, `public/videos/tutorial-01-thumb.jpg`, `public/videos/tutorial-02-thumb.jpg`, `public/videos/tutorial-03-thumb.jpg`, `public/videos/tutorial-04-thumb.jpg`
- **Expected behavior:** learning.tutorials.t01–t04 mit title und description in allen 3 Sprachen. learning.backToList Key. Thumbnail-Dateien existieren (können einfache generierte Platzhalter-Bilder sein, z.B. farbige Flächen mit Text).
- **Verification:** JSON valide, keine fehlenden Keys zwischen Sprachen, Thumbnails abrufbar
- **Dependencies:** keine

### MT-5: Integration in LearningCenterPanel

- **Goal:** Videos-Tab im Learning Center Panel mit VideoTutorials-Komponente befüllen
- **Files:** `src/components/learning-center/learning-center-panel.tsx`
- **Expected behavior:** Videos-Tab zeigt VideoTutorials statt Platzhalter-Text. Tab-Wechsel funktioniert weiterhin. Anleitung-Tab bleibt bei Platzhalter (wird in SLC-034 befüllt).
- **Verification:** Videos-Tab zeigt 4 Lektions-Cards, Klick öffnet Player, Zurück funktioniert, Tab-Wechsel intakt
- **Dependencies:** MT-2, MT-3, MT-4

## Akzeptanzkriterien

1. Videos-Tab zeigt 4 Lektions-Cards mit Titel, Beschreibung, Thumbnail
2. Cards zeigen korrekte Sprache basierend auf Tenant-Locale
3. Klick auf Card öffnet Player-Bereich
4. Zurück-Button führt zur Lektions-Liste
5. Fehlender Video-Datei → "Video wird vorbereitet" Fallback
6. Platzhalter-Thumbnails sind vorhanden und sichtbar
7. Cards stacken korrekt auf Mobile
8. Build erfolgreich (`npm run build`)
