# Product Requirements Document

## Purpose

Die Strategaize Blueprint Plattform ist eine nach außen gerichtete Webanwendung, über die Kunden einen strukturierten Fragebogen zur Exit-Readiness ihres Unternehmens bearbeiten. Ein integriertes LLM stellt kontextbezogene Rückfragen, damit jede Antwort ausreichend Tiefe und Substanz erreicht. Die gesammelten Antworten dienen als Rohmaterial für die Weiterverarbeitung in der Strategaize Operating System Plattform.

## Vision

Unternehmer, die ihr Unternehmen in den nächsten 3–5 Jahren verkaufen wollen, sollen den Exit Ready Blueprint bequem online ausfüllen können — unterstützt durch KI, die bei unklaren oder oberflächlichen Antworten gezielt nachhakt. Das Ergebnis ist ein vollständig beantworteter, versionierter Fragebogen, der die Basis für die strategische Exit-Beratung durch Strategaize bildet.

## Target Users

### Primär: Unternehmensinhaber / Geschäftsführer (KMU)

- Planen den Verkauf ihres Unternehmens in 3–5 Jahren
- Haben wenig Zeit, brauchen einen bequemen, geführten Prozess
- Sind nicht technisch versiert — die Plattform muss einfach und klar sein
- Wollen ihren Fortschritt sehen und frühere Antworten nachvollziehen können
- Können weitere Personen aus ihrer Organisation einladen (z.B. CFO, COO)

### Sekundär: Organisationsmitglieder

- Werden vom Hauptkunden eingeladen
- Beantworten spezifische Fragen aus ihrem Verantwortungsbereich
- Haben eingeschränkte Rechte je nach Rolle

### Tertiär: Strategaize-Berater (intern)

- Nutzen die gesammelten Antworten als Rohmaterial
- Arbeiten in der Strategaize Operating System Plattform weiter
- Brauchen vollständige, versionierte, kontextreiche Antworten

## Problem Statement

Der Exit Ready Blueprint umfasst 74 strukturierte Fragen in 9 thematischen Blöcken. Bisher werden diese Fragen manuell bearbeitet — per Gespräch, Excel oder Dokument. Das ist:

- zeitaufwändig für Kunden und Berater
- fehleranfällig (unvollständige Antworten, fehlender Kontext)
- nicht nachvollziehbar (keine Versionierung, kein Audit-Trail)
- nicht skalierbar (jeder Kunde braucht individuelle Betreuung)

Die Blueprint-Plattform löst dieses Problem, indem sie:
- den Fragebogen online zugänglich macht
- ein LLM einsetzt, das bei oberflächlichen Antworten nachhakt
- Dokumente analysiert, die als Antwortgrundlage dienen
- jede Antwort versioniert und nachvollziehbar speichert

## Fragebogen-Struktur (Referenz)

Der Fragebogen ist definiert in `Exit Ready Blueprint Master_V1.0.xlsx` und umfasst:

### 9 Blöcke

| Block | Thema | Gewicht | Fragen |
|-------|-------|---------|--------|
| A | Geschäftsmodell & Markt | 1.2 | 10 |
| B | Führung & Organisation | 1.5 | 10 |
| C | Prozesse & Abläufe | 1.5 | 10 |
| D | Zahlen & Steuerung | 1.3 | 8 |
| E | IT & Systeme | 1.0 | 7 |
| F | Wissen & Kompetenz | 1.2 | 5 |
| G | Kommunikation & Information | 1.1 | 5 |
| H | Personal & Skalierbarkeit | 1.0 | 6 |
| I | Recht & Struktur | 1.4 | 6 |

**Gesamt: 67 Fragen** (74 in der Excel, einige IDs übersprungen)

### Fragen-Attribute

- **Ebene:** Kern (Pflicht-Tiefe) oder Workspace (erweitert)
- **Owner-Dependency (OD):** Ja/Nein — Antwort hängt vom Inhaber ab
- **Deal-Blocker (DB):** Ja/Nein — fehlende Antwort kann Deal gefährden
- **SOP-Trigger (SOP):** Ja/Nein — Antwort löst SOP-Erstellung aus
- **KO-Kriterien:** Hart-KO / Soft-KO pro Frage

### Scoring-System

- Block-Gewichte (1.0–1.5)
- Status-Skala: 0 (Nicht vorhanden) – 4 (Robust)
- Gewichtete Berechnung: Basis × Block-Gewicht × KO-Faktor
- Gap-Analyse: (4 − Status) / 4
- Priority-Score: Base-Score × Gap × KO-Flag

## Implementation Status

> Stand: 2026-03-31.

| Version | Status | Features |
|---------|--------|----------|
| MVP-1 | **released** | FEAT-001 bis FEAT-008 (Auth, Admin, Tenant, Events, Evidence, Submission, Export) |
| V1.1 | **released** | FEAT-009 bis FEAT-018 (LLM-Chat, Review, Checkpoints, Rollen, Premium UI, Error-Logging, Doc-Parsing, Doc-Analyse, i18n) |
| V2 | **released** | FEAT-019 (Voice Input via Whisper) |
| V2.1 | **released** | FEAT-023 bis FEAT-025 (Learning Center, Video-Tutorials, Bedienungsanleitung) |
| V2.2 | **requirements** | FEAT-026 bis FEAT-027 (Owner-Profil, LLM Run Memory) |
| V3 | planned | FEAT-020 (Dedizierte Server pro Kunde) |

## V1 Scope — Core Features

### FEAT-001: Authentifizierung & Organisationsstruktur

**Priorität:** P0 (MVP) — **Status: DONE**

- Einladung per Link durch Strategaize
- Registrierung mit E-Mail und Passwort
- Organisation als Container: ein Kunde = eine Organisation
- Mehrere Benutzer pro Organisation möglich
- Rollenmodell: Owner, Member, Viewer
- Row Level Security (RLS) auf Organisationsebene
- Session-Management via Supabase Auth

### FEAT-002: Fragebogen-Engine

**Priorität:** P0 (MVP)

- Alle 67 Fragen aus dem Exit Ready Blueprint
- Block-basierte Navigation (9 Blöcke)
- Fortschrittsanzeige pro Block und gesamt
- Kern-Fragen priorisiert, Workspace-Fragen als Erweiterung
- Fragen-Metadaten sichtbar: Owner-Dependency, Deal-Blocker-Flag
- Fragen als Datenstruktur (nicht hardcoded UI), geladen aus Datenbank oder Config
- Speicherung jeder Antwort bei Eingabe (Auto-Save)

### FEAT-003: LLM-gestützte Rückfragen

**Priorität:** P0 (MVP)

- Nach jeder Antwort prüft das LLM die Antwortqualität
- Bei unzureichender Tiefe oder fehlendem Kontext: gezielte Rückfrage
- Orchestrierung über Dify.ai
- LLM-Backend: Ollama mit Qwen 2.5 (lokal auf Hetzner)
- Keine externen API-Kosten
- Regeln und Prompts für Rückfragen konfigurierbar in Dify
- LLM berücksichtigt bereits gegebene Antworten als Kontext
- LLM berücksichtigt hochgeladene Dokumente als Kontext

### FEAT-004: Datei-Upload & Analyse

**Priorität:** P0 (MVP)

- Upload von PDF- und Textdateien pro Frage oder pro Block
- Dateien werden vom LLM analysiert
- LLM prüft anhand der Dokumente, ob Fragen ausreichend beantwortet sind
- Speicherung in Supabase Storage
- Dateien sind der Organisation zugeordnet (RLS)
- Unterstützte Formate: PDF, TXT, DOCX (V1 mindestens PDF + TXT)

### FEAT-005: Antwort-Versionierung

**Priorität:** P0 (MVP)

- Jede Antwort wird einzeln versioniert
- Jede zusätzliche Information erzeugt eine neue Version
- Versionshistorie pro Frage einsehbar
- Ältere Versionen sind read-only, aber vollständig zugänglich
- Jede Version enthält: Antworttext, Zeitstempel, Autor, Versionsnummer
- Diff-Ansicht oder chronologische Liste (V1: chronologische Liste)

### FEAT-006: Antwort-Review & Wiedergabe

**Priorität:** P0 (MVP)

- Kunde kann alle bisherigen Antworten durchgehen
- Chronologischer Verlauf pro Frage
- Block-Übersicht: welche Fragen beantwortet, welche offen
- Status pro Frage: offen, beantwortet, LLM-Rückfrage ausstehend, abgeschlossen
- Textbasierte Wiedergabe (V1 — Audio-Wiedergabe kommt in V2)

### FEAT-007: Datenexport für Strategaize OS

**Priorität:** P0 (MVP)

- Strukturierter Export aller Antworten (letzte Version pro Frage)
- Format: JSON oder strukturiertes Markdown
- Enthält: Frage-ID, Block, Fragetext, Antwort, Version, Metadaten
- Export auf Organisationsebene
- Wird als Rohmaterial in die Strategaize Operating System Plattform eingespeist
- API-Endpunkt oder manueller Export (V1: manueller Export reicht)

## V2 Scope — Voice Input

### FEAT-019: Voice Input (Whisper)

**Priorität:** P0 (V2) — Einziges V2-Feature

Kunden können im Chat-Bereich per Mikrofon sprechen. Die Sprache wird serverseitig durch Whisper (selbst-gehostet auf Hetzner) transkribiert und als editierbarer Text im Eingabefeld angezeigt.

- Audio-Aufnahme im Browser via MediaRecorder API
- Whisper ASR Service als Docker-Container im internen Netzwerk
- Server-seitige Transkriptions-API Route
- Transkribierter Text erscheint im Chat-Eingabefeld, editierbar vor Absenden
- Automatische Spracherkennung (DE/EN/NL) durch Whisper
- Visuelles Aufnahme-Feedback (Recording-Indikator)
- DSGVO: Audio wird nur für Transkription verarbeitet, nicht gespeichert
- Server-Upgrade auf höhere RAM-Konfiguration akzeptabel falls nötig

**Nicht in V2:**
- Echtzeit-Streaming-Transkription
- Audio-Wiedergabe gespeicherter Antworten
- Text-to-Speech

## V2.1 Scope — Onboarding & Hilfe (Learning Center)

### Problem

Kunden, die die Blueprint Plattform zum ersten Mal nutzen, haben keine geführte Einführung. Es gibt kein In-App-Hilfesystem, keine Video-Tutorials und keine schriftliche Anleitung. Besonders die KI-gestützten Features (Rückfragen, Zusammenfassung, Dokumentanalyse, Spracheingabe) erfordern Erklärung, damit Kunden sie effektiv nutzen.

### Ziel

Ein In-App Learning Center, das Kunden jederzeit zugänglich ist und ihnen hilft, die Plattform eigenständig zu verstehen und produktiv zu nutzen — ohne Strategaize-Support kontaktieren zu müssen.

### FEAT-023: In-App Learning Center — Hilfe-Button + Navigation (DE/EN/NL)

**Priorität:** P0 (V2.1) — Grundstruktur für alle Hilfe-Inhalte

Ein dauerhaft sichtbarer Hilfe-Button im Tenant-Bereich, der das Learning Center als Seitenpanel (Sheet) öffnet. Das Learning Center ist die Container-Struktur für Video-Tutorials und Bedienungsanleitung.

- Hilfe-Button auf allen Tenant-Seiten sichtbar (Dashboard + Workspace)
- Öffnet Sheet-Panel von rechts (shadcn/ui Sheet-Komponente)
- Leicht schließbar (X-Button, Escape, Klick außerhalb)
- Bleibt innerhalb des eingeloggten Bereichs (kein externer Redirect)
- Tab-Navigation im Panel: Videos | Anleitung
- Responsive: Panel auf Mobile als Full-Screen-Overlay
- Dreisprachig: alle UI-Chrome-Texte über next-intl (DE/EN/NL)
- Nicht störend: überlagert den Workspace, blockiert aber keine Interaktion nach Schließen

**Akzeptanzkriterien:**
1. Hilfe-Button ist auf Dashboard und Workspace sichtbar
2. Klick öffnet Sheet-Panel mit Tab-Navigation
3. Panel zeigt Inhalte in Tenant-Sprache (DE/EN/NL)
4. Panel ist auf Desktop und Mobile nutzbar
5. Schließen per X, Escape oder Klick außerhalb funktioniert
6. Kein Layout-Shift beim Öffnen/Schließen

### FEAT-024: Video-Tutorial-Bereich (DE/EN/NL)

**Priorität:** P0 (V2.1) — Wichtigste Hilfe-Ressource für Endnutzer

3–4 eingebettete Video-Lektionen innerhalb des Learning Centers, die die Kernfunktionen der Plattform erklären.

- Lektionen:
  1. **Erste Schritte** — Login, Dashboard, Run starten
  2. **Fragebogen bearbeiten** — Fragen beantworten, Blöcke navigieren, Fortschritt sehen
  3. **KI richtig nutzen** — Rückfragen, Zusammenfassung, Spracheingabe
  4. **Dokumente hochladen** — Evidence, Labels, Dokumentanalyse
- Video-Player eingebettet (HTML5 `<video>` oder iframe), kein externer Redirect
- Videos extern produziert (via /user-guide + Narakeet oder manuell), als Dateien eingebunden
- Automatische Sprachauswahl: zeigt Videos der Tenant-Sprache
- Auch als Einstiegshilfe auf dem Dashboard sichtbar (optionaler Teaser-Bereich)
- **Dummy-Content für V2.1-Implementation:** Platzhalter-Thumbnails mit Titel/Beschreibung, Video-URLs noch leer oder mit Platzhalter

**Akzeptanzkriterien:**
1. Videos-Tab im Learning Center zeigt 3–4 Lektionen mit Titel und Beschreibung
2. Klick auf eine Lektion öffnet den eingebetteten Player
3. Sprachauswahl folgt automatisch der Tenant-Sprache
4. Dummy-Content ist vorhanden und sauber strukturiert
5. Videos-Bereich funktioniert auch ohne echte Video-Dateien (graceful empty state)

### FEAT-025: Bedienungsanleitung als In-App-Dokumentation (DE/EN/NL)

**Priorität:** P1 (V2.1) — Ergänzung zu Videos für Detail-Fragen

Die schriftliche Bedienungsanleitung (erzeugt via /user-guide Skill) wird als durchsuchbare In-App-Hilfe im Learning Center angezeigt.

- Markdown-basiert, flow-strukturiert (nicht feature-basiert)
- Gerendert innerhalb des Anleitung-Tabs im Learning Center
- Durchsuchbar: Textsuche über den gesamten Anleitung-Inhalt
- Enthält KI-Leitfaden für Erstnutzer (Tipps zur effektiven KI-Nutzung)
- Inhaltsverzeichnis mit Sprungmarken
- Dreisprachig: USER-GUIDE.md (DE), USER-GUIDE-en.md (EN), USER-GUIDE-nl.md (NL)
- Anzeige folgt Tenant-Sprache automatisch
- **Dummy-Content für V2.1-Implementation:** Platzhalter-Markdown mit Strukturüberschriften und Lorem-Ipsum-ähnlichem Dummy-Text, um Layout und Suche zu testen

**Akzeptanzkriterien:**
1. Anleitung-Tab zeigt gerenderten Markdown-Content
2. Inhaltsverzeichnis mit funktionierenden Sprungmarken
3. Textsuche filtert/highlightet relevante Abschnitte
4. Anzeige folgt Tenant-Sprache (DE/EN/NL)
5. Dummy-Content demonstriert die vollständige Struktur
6. Markdown-Rendering unterstützt Überschriften, Listen, Code-Blöcke, Fettdruck

### V2.1 — Nicht im Scope

- Keine Echtzeit-Chat-Hilfe oder Bot
- Keine kontextsensitiven Tooltips an einzelnen UI-Elementen
- Kein Admin-Interface zum Bearbeiten von Hilfe-Inhalten
- Keine Fortschrittsverfolgung (welche Tutorials der User gesehen hat)
- Keine Video-Produktion — nur die technische Einbettung (Content kommt via /user-guide)
- Kein FAQ-Bereich (kann in späterer Version ergänzt werden)
- DSGVO-Compliance-Dokument (BL-045) läuft separat, nicht Teil des Learning Centers

### V2.1 — Erfolskriterien

V2.1 ist erfolgreich, wenn:

1. **Zugänglichkeit:** Der Hilfe-Button ist auf allen Tenant-Seiten sichtbar und funktional
2. **Struktur:** Das Learning Center hat eine klare Tab-Navigation (Videos + Anleitung)
3. **Dreisprachigkeit:** Alle Inhalte werden korrekt in der Tenant-Sprache angezeigt
4. **Dummy-Ready:** Die Struktur funktioniert vollständig mit Dummy-Content
5. **Content-Ready:** Echter Content kann ohne Code-Änderungen eingefügt werden (Markdown-Dateien + Video-Dateien austauschen)
6. **Nicht-invasiv:** Das Learning Center stört die Kernfunktionalität nicht

## V2.2 Scope — Personalized LLM (Owner-Profil + Run Memory)

### Problem

Das LLM behandelt jeden Kunden gleich und vergisst zwischen Sessions alles. Bei Frage 1 weiß es nichts über den Menschen, bei der nächsten Anmeldung startet es bei Null. Für Geschäftsführer (50-65, wenig KI-Erfahrung), die 67 Fragen über mehrere Tage beantworten, fühlt sich das unpersönlich und frustrierend an. Die Plattform soll sich anfühlen wie ein kompetenter Berater, der den Kunden kennt — nicht wie ein anonymer Bot.

### Ziel

Das LLM kennt den Owner persönlich (Anrede, Hintergrund, Führungsstil) und kann zwischen Sessions anknüpfen (laufendes Memory pro Run). Das verbessert sowohl die Qualität der Rückfragen als auch das Nutzererlebnis.

### FEAT-026: Owner-Profil ("Frage Null") (DE/EN/NL)

**Priorität:** P0 (V2.2) — Grundlage für Personalisierung

Pflicht-Formular auf Tenant-Ebene, das der Owner vor dem ersten Run ausfüllt. Funktioniert wie eine "Vorstellungsrunde auf einem Seminar" — der Owner stellt sich der Plattform vor, damit das LLM ihn ab der ersten Frage persönlich ansprechen und kontextsensitiv nachfragen kann.

**Profil-Bereiche:**

1. **Persönliche Informationen**
   - Name (Vor- und Nachname)
   - Alter / Altersbereich
   - Ausbildungshintergrund (höchster Abschluss, Fachrichtung)
   - Beruflicher Werdegang (Kurzfassung: was vorher gemacht, wie lange Inhaber)

2. **Anrede-Präferenz**
   - Du oder Sie
   - Anrede mit Vorname oder Nachname
   - Wird vom LLM in allen Rückfragen, Zusammenfassungen und Bewertungen verwendet

3. **Führungsstil-Selbsteinordnung**
   - 5 Optionen mit kurzer Beschreibung:
     - **Patriarchisch** — "Ich entscheide, die anderen führen aus"
     - **Kooperativ** — "Ich hole Meinungen ein und entscheide dann"
     - **Delegativ** — "Ich finde gute Leute und lasse sie machen"
     - **Coaching** — "Ich entwickle meine Leute und begleite sie"
     - **Visionär** — "Ich gebe die Richtung vor, das Team findet den Weg"
   - Einfachauswahl, kein Test
   - Impact: LLM passt Fragetiefe an (z.B. Patriarch → direktere Nachfragen zu Delegation)

4. **DISC-Kommunikationsstil**
   - 4 Optionen mit Beschreibung und Farbcode:
     - **Dominant (Rot)** — Ergebnisorientiert, direkt, entscheidungsfreudig
     - **Initiativ (Gelb)** — Kommunikativ, optimistisch, begeisterungsfähig
     - **Stetig (Grün)** — Teamorientiert, geduldig, zuverlässig
     - **Gewissenhaft (Blau)** — Analytisch, präzise, qualitätsbewusst
   - Selbsteinordnung, kein vollständiger Test
   - Impact: LLM passt Kommunikationsstil an (z.B. Blau → mehr Zahlen/Fakten, Gelb → mehr Ermutigung)

5. **Freie Vorstellung**
   - Textfeld oder Spracheingabe (Whisper): "Erzählen Sie kurz etwas über sich und Ihr Unternehmen"
   - Leitfragen als Inspiration: Was treibt Sie an? Was ist Ihre größte Stärke? Was wollen Sie mit dem Exit erreichen?
   - Max. 2000 Zeichen / ~3 Minuten Spracheingabe

**Technische Anforderungen:**
- Gespeichert auf Tenant-Ebene (nicht pro Run, nicht pro User)
- Pflicht vor erstem Run-Zugriff (Redirect wenn nicht ausgefüllt)
- Bearbeitbar jederzeit über Profil-Seite
- Profil-Daten werden in alle 4 LLM-Prompt-Typen (Rückfrage, Zusammenfassung, Bewertung, Dokumentanalyse) als System-Kontext injiziert
- Dreisprachig: Formular und Beschreibungstexte in DE/EN/NL

**Akzeptanzkriterien:**
1. Owner wird bei erstem Login zum Profil-Formular geleitet
2. Alle 5 Bereiche sind ausfüllbar (persönlich, Anrede, Führungsstil, DISC, freie Vorstellung)
3. Spracheingabe funktioniert im Freitext-Feld (Whisper-Integration)
4. Profil ist gespeichert und jederzeit bearbeitbar
5. LLM-Rückfragen verwenden die gewählte Anrede (Du/Sie + Name)
6. LLM-Rückfragen zeigen Kontext-Bewusstsein (Profil-Infos fließen sichtbar ein)
7. Formular in DE/EN/NL verfügbar
8. Run-Zugriff ist ohne ausgefülltes Profil nicht möglich

### FEAT-027: LLM Run Memory (DE/EN/NL)

**Priorität:** P0 (V2.2) — Session-Kontinuität

Das LLM schreibt nach jeder Interaktion ein kurzes Memory-Update, das auf dem Server gespeichert wird. Bei der nächsten Session wird das Memory als System-Kontext geladen — das LLM kann anknüpfen, wo der Owner aufgehört hat.

**Memory-Inhalt (LLM-kuratiert, max 500-800 Tokens):**
- Zusammenfassung der bisherigen Themen und Antworten
- Erkannte Muster (z.B. "Owner antwortet sehr detailliert bei Finanzen, oberflächlich bei HR")
- Offene Punkte, die das LLM noch ansprechen wollte
- Beobachtungen zum Antwortstil
- Kontext der letzten Interaktion (was zuletzt besprochen wurde)

**Nicht im Memory:**
- Rohe Antworten (die sind in question_events)
- Vollständige Chat-Histories (zu groß, nicht kurativ)
- Evidence-Inhalte (die sind separat abrufbar)

**Technische Anforderungen:**
- Gespeichert pro Run in der Datenbank (JSON-Blob oder Textfeld)
- Neuer LLM-Prompt-Typ: "Memory Update" — nach jeder Chat-Interaktion
- Memory wird bei jedem Chat- und Generate-Request als Teil des System-Prompts mitgeladen
- Token-Budget: Profil (~300-500 Tokens) + Memory (~500-800 Tokens) + Question + Evidence muss innerhalb von ~8K System-Tokens bleiben, damit für Chat-History und Antwort genug Platz bleibt (Qwen 2.5 14B: 32K Context)
- Owner kann Memory einsehen (Read-Only Anzeige im Workspace)

**Akzeptanzkriterien:**
1. Nach einer Chat-Interaktion wird das Memory automatisch aktualisiert
2. Bei erneutem Login/Session-Start enthält der LLM-Kontext das gespeicherte Memory
3. LLM-Rückfragen zeigen Kontinuität (z.B. "Sie haben bei Block A erwähnt, dass... — gilt das auch hier?")
4. Memory-Anzeige ist für Owner sichtbar (einfache Darstellung)
5. Token-Budget wird eingehalten — Antwortqualität sinkt nicht durch zu viel Kontext
6. Memory funktioniert über Tage/Wochen hinweg (nicht nur innerhalb einer Session)
7. Memory ist pro Run isoliert (verschiedene Runs haben eigene Memories)

### V2.2 — Nicht im Scope

- Mitarbeiter-Profile (erst bei echtem Multi-User-Bedarf)
- Vollständiger DISC-Test (40+ Fragen) — Selbsteinordnung reicht
- Cross-Question Consistency Engine (teilweise durch Memory abgedeckt)
- System Learning / Prompt-Feedback-Loop (braucht echte Nutzerdaten)
- Adaptive Fragestrategie basierend auf Führungsstil (Parked Idea)
- Chat-History-Persistierung (Memory ersetzt das effektiver)
- Profil-Import aus externen Systemen

### V2.2 — Erfolgskriterien

V2.2 ist erfolgreich, wenn:

1. **Personalisierung spürbar:** LLM spricht den Owner korrekt an und zeigt Kontextwissen
2. **Kontinuität erlebbar:** Owner merkt bei der zweiten Session, dass das LLM "sich erinnert"
3. **Kein Qualitätsverlust:** Antwortqualität der LLM-Rückfragen bleibt mindestens gleich gut
4. **Natürlicher Einstieg:** Profil-Formular fühlt sich an wie eine Vorstellungsrunde, nicht wie ein Verhör
5. **DSGVO:** Profildaten und Memory bleiben auf dem Server (Hetzner EU), kein externer Dienst

## V3 Scope (Later)

| Feature | Beschreibung |
|---------|-------------|
| Dedizierte Server pro Kunde | Single-Tenant Deployment auf eigenem Hetzner-Server |

## Parked Ideas (kein fester Zeitplan)

| Idee | Begründung |
|------|-----------|
| Scoring-Dashboard & Scorecard | Gehört in die Operating System Plattform, nicht in Blueprint |
| Admin Fragebogen-Editor | Katalog-Import über Admin-UI reicht |
| Berater-Zugang | OS-Plattform übernimmt diese Rolle |
| E-Mail-Benachrichtigungen | Kein identifizierter Kernbedarf |
| Mehrere Blueprint-Typen | Abhängig vom Editor, derzeit kein Bedarf |

## Success Criteria

V1 ist erfolgreich, wenn:

1. **Funktional:** Ein Kunde kann sich registrieren, alle 67 Fragen blockweise beantworten, LLM-Rückfragen erhalten und beantworten, Dateien hochladen, und seinen Antwortverlauf einsehen.
2. **Datenqualität:** Die LLM-Rückfragen führen zu tieferen, kontextreicheren Antworten als manuelle Bearbeitung.
3. **Versionierung:** Jede Antwortänderung ist versioniert und nachvollziehbar.
4. **Export:** Die Antworten können strukturiert exportiert und in der Strategaize OS Plattform weiterverarbeitet werden.
5. **Sicherheit:** Organisationsdaten sind durch RLS isoliert. Kein Kunde sieht Daten anderer Organisationen.

## Constraints

- **Hosting:** Self-hosted auf Hetzner — keine Cloud-Abhängigkeiten für LLM
- **LLM:** Ollama + Qwen 2.5 (lokal) — keine externen API-Kosten
- **Orchestrierung:** Dify.ai für LLM-Workflow-Management
- **Stack:** Next.js 16, Supabase, Tailwind CSS, shadcn/ui (bereits aufgesetzt)
- **Fragebogen:** Fix für V1 — ein Blueprint-Typ (Exit Ready)
- **Team:** Einzelentwickler mit AI-Unterstützung
- **Datensensitivität:** Geschäftskritische Unternehmensdaten — RLS und Zugriffskontrolle sind Pflicht

## Non-Goals

- Kein Scoring-Dashboard oder Scorecard-Berechnung (gehört in OS-Plattform)
- Kein Admin-Interface für Fragebogen-Verwaltung (Katalog-Import reicht)
- Keine mehreren Blueprint-Typen
- Kein Berater-Portal (OS-Plattform)
- Keine E-Mail-Benachrichtigungen
- Keine mobile App — responsive Web reicht
- Keine Echtzeit-Kollaboration zwischen mehreren Nutzern gleichzeitig
- Keine Echtzeit-Streaming-Transkription (V2: Aufnahme → Transkription)
- Keine Browser Speech API (unzuverlässig über Browser hinweg)

## Risks & Assumptions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| RAM reicht nicht für Ollama + Whisper gleichzeitig | Hoch | Server-Upgrade auf 64GB. Oder kleineres Whisper-Modell (small statt medium). |
| Transkriptions-Qualität bei M&A-Fachbegriffen | Mittel | Whisper medium hat gute Deutsch-Performance. Kunde kann Text vor Absenden korrigieren. |
| Mikrofon-Berechtigung wird verweigert | Niedrig | Klare Fehlermeldung, Text-Eingabe bleibt verfügbar. |
| Audio-Qualität variiert (Umgebungsgeräusche) | Mittel | Whisper ist robust. Kunde kann Text korrigieren. |
| Build-OOM mit Ollama + Whisper im RAM | Mittel | Beide Container vor Build stoppen. Workaround bekannt (ISSUE-024). |

### Assumptions

- Hetzner-Server kann auf höhere RAM-Konfiguration upgegradet werden
- Whisper ASR Webservice Docker Image ist stabil und wartbar
- MediaRecorder API funktioniert in allen modernen Browsern
- Typische Aufnahmen sind 30 Sekunden bis 3 Minuten
- 1–2 Kunden gleichzeitig (kein Hochlast-Szenario für Whisper)
- Supabase Self-Hosted auf Hetzner (entschieden, läuft)
- Kein Dify — LLM direkt via Ollama REST API (DEC-005)

## Open Questions

1. **Server-Sizing:** Reicht CPX62 (32GB) für Ollama + Whisper Small, oder ist Upgrade nötig? → Muss in Architektur-Phase durch RAM-Messung entschieden werden. Mit Whisper Small (~1GB) wahrscheinlich kein Upgrade nötig.

## Resolved Questions (V2)

1. **Whisper-Modell:** Entschieden: Whisper Small zuerst (DEC-015). Upgrade auf Medium/Large wenn echte Kunden bessere Qualität brauchen.

## Delivery Mode

**SaaS** — Externe Kundenplattform mit kontrollierten Zugängen, gehostet auf eigener Infrastruktur (Hetzner).

## Technical Context

| Aspekt | Entscheidung |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase Self-Hosted (Auth, DB, Storage, RLS) |
| LLM | Ollama + Qwen 2.5 14B (lokal auf Hetzner) |
| Speech-to-Text | Whisper ASR (lokal auf Hetzner, Docker) |
| i18n | next-intl (DE/EN/NL) |
| Hosting | Hetzner CPX62 (32GB RAM, 16 vCPUs) |
| Deployment | Coolify + Docker Compose |
| API Gateway | Kong (deklarative Config) |

---

Erstellt: 2026-03-24
Aktualisiert: 2026-04-02 (V2.2 Requirements — Personalized LLM)
Skill: `/requirements`
Nächster Schritt: `/architecture`
