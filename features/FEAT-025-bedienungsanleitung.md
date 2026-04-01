# FEAT-025 — Bedienungsanleitung als In-App-Dokumentation (DE/EN/NL)

## Metadaten

- **ID:** FEAT-025
- **Version:** V2.1
- **Priorität:** P1
- **Status:** planned
- **Backlog:** BL-044
- **Erstellt:** 2026-04-01

## Zusammenfassung

Die schriftliche Bedienungsanleitung wird als durchsuchbare In-App-Hilfe im Anleitung-Tab des Learning Centers (FEAT-023) angezeigt. Markdown-basiert, flow-strukturiert, dreisprachig. Enthält KI-Leitfaden für Erstnutzer.

## Problem

Kunden brauchen neben Videos auch eine schriftliche Referenz, die sie durchsuchen können. Besonders für Detail-Fragen ("Wie lade ich ein DOCX hoch?", "Was passiert wenn ich einen Block einreiche?") ist ein durchsuchbarer Text effizienter als Video.

## Lösung

### Markdown-Quelle

- Drei Markdown-Dateien im Repository:
  - `/public/docs/USER-GUIDE.md` (Deutsch)
  - `/public/docs/USER-GUIDE-en.md` (Englisch)
  - `/public/docs/USER-GUIDE-nl.md` (Niederländisch)
- Dateien werden vom /user-guide Skill erzeugt und können manuell nachbearbeitet werden
- Flow-basierte Struktur (nicht feature-basiert):
  1. Willkommen & Überblick
  2. Ersten Run starten
  3. Fragen beantworten
  4. KI-Unterstützung nutzen (Rückfragen, Zusammenfassung, Spracheingabe)
  5. Dokumente hochladen & analysieren
  6. Fortschritt prüfen & Block einreichen
  7. Tipps für bessere Ergebnisse

### Rendering im Learning Center

- Anleitung-Tab rendert die Markdown-Datei der aktuellen Tenant-Sprache
- Markdown → HTML via bestehender Library (react-markdown oder ähnlich)
- Unterstützte Elemente: H1–H4, Paragraphen, Listen, Fettdruck, Code-Blöcke, Bilder
- Inhaltsverzeichnis: automatisch generiert aus H2/H3-Überschriften
- Sprungmarken: Klick auf TOC-Eintrag scrollt zur Überschrift

### Suchfunktion

- Suchfeld oben im Anleitung-Tab
- Client-seitige Textsuche über den gesamten Markdown-Content
- Ergebnis: Abschnitte die den Suchbegriff enthalten werden angezeigt/hervorgehoben
- Leer-Zustand: "Keine Ergebnisse für [Suchbegriff]"

### KI-Leitfaden

- Spezieller Abschnitt in der Anleitung: "KI-Unterstützung effektiv nutzen"
- Erklärt: Rückfragen verstehen, Zusammenfassungen nutzen, Spracheingabe verwenden
- Tipps: "Je detaillierter Ihre Antwort, desto bessere Rückfragen"
- Hinweis auf DSGVO: "Alle Daten bleiben auf unserem europäischen Server"

### Dummy-Content

Für die V2.1-Implementation:
- Vollständige Markdown-Struktur mit allen Überschriften
- Platzhalter-Text pro Abschnitt (beschreibend, nicht Lorem Ipsum)
- Beschreibender Dummy-Text: "Hier wird erklärt, wie Sie [Feature] nutzen"
- Mindestens 7 Abschnitte mit je 2–3 Unterabschnitten
- Ausreichend Text für sinnvollen Such-Test

## Akzeptanzkriterien

1. Anleitung-Tab zeigt gerenderten Markdown-Content
2. Inhaltsverzeichnis mit funktionierenden Sprungmarken (alle H2/H3)
3. Textsuche filtert Abschnitte und hebt Treffer hervor
4. Anzeige folgt Tenant-Sprache (DE/EN/NL) automatisch
5. Dummy-Content zeigt vollständige Struktur mit mindestens 7 Abschnitten
6. Markdown-Rendering: Überschriften, Listen, Fettdruck, Code-Blöcke funktionieren
7. Scrollbar innerhalb des Panels
8. Fallback wenn Markdown-Datei fehlt: "Anleitung wird vorbereitet"

## Technische Hinweise

- Markdown-Rendering: `react-markdown` + `remark-gfm` (neue Dependency)
- Komponente: `/src/components/learning-center/user-guide.tsx`
- TOC-Generierung: Parsing der H2/H3-Headings aus dem Markdown-AST
- Suchlogik: einfache String-Suche über den Raw-Markdown, dann Filterung der Abschnitte
- Markdown-Dateien unter `/public/docs/` (statisch, kein Build nötig für Updates)
- Laden via `fetch('/docs/USER-GUIDE.md')` zur Laufzeit

## Abhängigkeiten

- FEAT-023 (Learning Center Container) muss existieren
- Echte Inhalte werden später via /user-guide Skill erzeugt
- Neue Dependency: `react-markdown` + `remark-gfm`

## Out of Scope

- WYSIWYG-Editor zum Bearbeiten der Anleitung im Browser
- Versionierung der Anleitungs-Inhalte
- Feedback-Funktion ("War dieser Abschnitt hilfreich?")
- PDF-Export der Anleitung
- Automatische Übersetzung (Übersetzung erfolgt manuell oder via /user-guide)
