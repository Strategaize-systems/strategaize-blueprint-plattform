# SLC-034 — User Guide + Search

## Metadaten

- **ID:** SLC-034
- **Feature:** FEAT-025
- **Backlog:** BL-044
- **Version:** V2.1
- **Status:** planned
- **Priorität:** High
- **Erstellt:** 2026-04-01
- **Abhängigkeiten:** SLC-032 (Learning Center Shell muss existieren)

## Ziel

Bedienungsanleitung im Learning Center implementieren: Markdown-Rendering via react-markdown, automatisch generiertes Inhaltsverzeichnis, client-seitige Textsuche, Dummy-Markdown-Dateien in 3 Sprachen. Nach diesem Slice zeigt der Anleitung-Tab eine vollständig gerenderte, durchsuchbare Anleitung mit Dummy-Content.

## Scope

**In Scope:**
- UserGuide Komponente (Markdown laden + rendern)
- UserGuideTOC Komponente (Inhaltsverzeichnis aus Headings)
- UserGuideSearch Komponente (Client-seitige Textsuche)
- Dummy USER-GUIDE.md Dateien (DE/EN/NL) mit realitätsnaher Struktur
- i18n-Keys für Suche und Fallback-UI (DE/EN/NL)
- Integration in LearningCenterPanel (Anleitung-Tab)

**Out of Scope:**
- Echte Anleitungs-Inhalte (kommen via /user-guide Skill)
- PDF-Export
- @tailwindcss/typography (evaluieren, aber nicht zwingend — eigenes Styling reicht)

## Micro-Tasks

### MT-1: Dummy USER-GUIDE Markdown-Dateien

- **Goal:** Strukturierte Platzhalter-Markdown-Dateien in 3 Sprachen erstellen
- **Files:** `public/docs/USER-GUIDE.md`, `public/docs/USER-GUIDE-en.md`, `public/docs/USER-GUIDE-nl.md`
- **Expected behavior:** Jede Datei hat 7 Hauptabschnitte (H2) mit je 2-3 Unterabschnitten (H3). Beschreibender Platzhalter-Text (nicht Lorem Ipsum). Abschnitte:
  1. Willkommen / Welcome / Welkom
  2. Ersten Run starten / Starting Your First Run / Uw eerste Run starten
  3. Fragen beantworten / Answering Questions / Vragen beantwoorden
  4. KI-Unterstützung nutzen / Using AI Support / AI-ondersteuning gebruiken
  5. Dokumente hochladen / Uploading Documents / Documenten uploaden
  6. Fortschritt prüfen / Checking Progress / Voortgang controleren
  7. Tipps für bessere Ergebnisse / Tips for Better Results / Tips voor betere resultaten
  Mindestens 800 Wörter pro Datei für sinnvollen Suchtest.
- **Verification:** Dateien abrufbar via `/docs/USER-GUIDE.md` etc., gültiges Markdown
- **Dependencies:** keine

### MT-2: UserGuide Komponente (Markdown-Rendering)

- **Goal:** Markdown-Datei laden und via react-markdown rendern
- **Files:** `src/components/learning-center/user-guide.tsx`
- **Expected behavior:** Liest Locale via useLocale(). Konstruiert Pfad: `/docs/USER-GUIDE.md` (DE), `/docs/USER-GUIDE-en.md` (EN), `/docs/USER-GUIDE-nl.md` (NL). Lädt Datei via fetch(). Bei Fehler: Fallback auf DE-Version. Bei komplettem Fehler: Fallback-UI "Anleitung wird vorbereitet" (via i18n). Rendert Markdown via ReactMarkdown mit remarkGfm Plugin. Styled Headings, Listen, Paragraphen, Bold mit Tailwind-Klassen (prose-ähnlich, eigene Styles).
- **Verification:** Markdown wird korrekt gerendert, H1–H4, Listen, Fett/Kursiv, Code-Blöcke funktionieren
- **Dependencies:** MT-1 (Dummy-Dateien zum Testen)

### MT-3: UserGuideTOC Komponente (Inhaltsverzeichnis)

- **Goal:** Automatisch generiertes Inhaltsverzeichnis aus Markdown-Headings
- **Files:** `src/components/learning-center/user-guide-toc.tsx`
- **Expected behavior:** Parst Markdown-String nach H2 und H3 Headings (Regex oder String-Parsing). Rendert als klickbare Liste mit Einrückung (H3 eingerückt unter H2). Klick scrollt zum entsprechenden Heading im Content-Bereich (scroll-to-id). TOC wird über dem Content angezeigt (collapsible oder always-visible sidebar-style innerhalb des Panels).
- **Verification:** TOC zeigt alle H2/H3 Headings, Klick scrollt zur richtigen Position
- **Dependencies:** MT-1 (Dummy-Dateien zum Testen)

### MT-4: UserGuideSearch Komponente (Textsuche)

- **Goal:** Client-seitige Textsuche über den Anleitungs-Inhalt
- **Files:** `src/components/learning-center/user-guide-search.tsx`
- **Expected behavior:** Suchfeld mit debounced Input (300ms). Filtert Markdown-Abschnitte (Split bei ## oder ###) nach Suchbegriff (case-insensitive). Zeigt nur Abschnitte die den Begriff enthalten. Hebt Suchbegriff im gerenderten Text hervor (mark-Element oder CSS-Highlight). Leere Suche → alle Abschnitte. Keine Treffer → "Keine Ergebnisse" Hinweis (via i18n). Reset-Button zum Löschen der Suche.
- **Verification:** Suche filtert Abschnitte korrekt, Highlighting funktioniert, Reset setzt zurück
- **Dependencies:** MT-2 (UserGuide-Komponente für Integration)

### MT-5: Integration + i18n

- **Goal:** Anleitung-Tab befüllen, i18n-Keys ergänzen, Gesamtintegration testen
- **Files:** `src/components/learning-center/learning-center-panel.tsx`, `src/components/learning-center/user-guide.tsx` (Zusammenbau), `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- **Expected behavior:** Anleitung-Tab zeigt: Suchfeld oben, TOC darunter (collapsible), Markdown-Content darunter. Tab-Wechsel zu Videos funktioniert weiterhin. i18n-Keys: learning.searchPlaceholder, learning.noResults, learning.guideNotReady in allen 3 Sprachen.
- **Verification:** Anleitung-Tab zeigt vollständiges UI mit Suche + TOC + Content. Sprachwechsel funktioniert. Build erfolgreich (`npm run build`). Beide Tabs funktionieren. Learning Center E2E Flow: Button → Panel → Videos-Tab → Anleitung-Tab → Suche → Schließen.
- **Dependencies:** MT-2, MT-3, MT-4

## Akzeptanzkriterien

1. Anleitung-Tab zeigt gerenderten Markdown-Content
2. Inhaltsverzeichnis mit funktionierenden Sprungmarken (alle H2/H3)
3. Textsuche filtert Abschnitte und hebt Treffer hervor
4. Anzeige folgt Tenant-Sprache (DE/EN/NL) automatisch
5. Dummy-Content zeigt vollständige Struktur mit 7 Abschnitten
6. Markdown-Rendering: Überschriften, Listen, Fettdruck funktionieren
7. Fallback bei fehlender Markdown-Datei ("Anleitung wird vorbereitet")
8. Scrollbar innerhalb des Panels
9. Build erfolgreich (`npm run build`)
