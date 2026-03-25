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

> Stand: 2026-03-24. MVP-1 wurde in lokaler Entwicklung (Feb 2026) vollständig implementiert und am 2026-03-24 ins Git-Repository zusammengeführt.

| Version | Status | Features |
|---------|--------|----------|
| MVP-1 | **done** | FEAT-001 bis FEAT-008 (Auth, Admin, Tenant, Events, Evidence, Submission, Export) |
| V1.1 | planned | FEAT-009 (LLM-Rückfragen), FEAT-010 (Review-Übersicht) |
| V2 | planned | FEAT-011–014 (Voice, Multi-User, Scoring, Fragebogen-Editor) |

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

## V2 Scope (Later)

Die folgenden Features sind explizit **nicht Teil von V1**, aber als nächste Ausbaustufe geplant:

| Feature | Beschreibung |
|---------|-------------|
| Spracheingabe | Speech-to-Text via lokales Whisper auf Hetzner |
| Audio-Aufnahme & Wiedergabe | Antworten per Sprache diktieren, Aufnahmen abspielen |
| Admin-Interface | Fragebogen erstellen, bearbeiten, neue Blueprints anlegen |
| Scoring-Dashboard | Live-Scorecard mit Block-Bewertungen und Gap-Analyse |
| Fragebogen-Konfigurierbarkeit | Mehrere Blueprint-Typen, nicht nur Exit Ready |
| Benachrichtigungen | E-Mail-Erinnerungen bei offenen Fragen |
| Berater-Zugang | Strategaize-Berater können Antworten direkt in der Plattform einsehen |

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

## Non-Goals (V1)

- Kein Sprach-/Audio-Interface (V2)
- Kein Admin-Interface für Fragebogen-Verwaltung (V2)
- Kein Scoring-Dashboard oder Scorecard-Berechnung (V2)
- Keine mehreren Blueprint-Typen (V2)
- Kein Berater-Portal (V2)
- Keine E-Mail-Benachrichtigungen (V2)
- Keine mobile App — responsive Web reicht
- Keine Echtzeit-Kollaboration zwischen mehreren Nutzern gleichzeitig

## Risks & Assumptions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Qwen 2.5 Rückfrage-Qualität unzureichend | Hoch | Iterative Prompt-Optimierung in Dify, Fallback auf größeres Modell |
| Dify-Integration Komplexität | Mittel | Prototyp der Dify-Anbindung früh in der Architektur validieren |
| PDF-Parsing-Qualität | Mittel | Unterstützte Formate klar begrenzen, Parsing-Bibliothek evaluieren |
| Hetzner-Performance für LLM | Mittel | Server-Sizing vor Implementierung klären |

### Assumptions

- Hetzner-Server mit ausreichend GPU/RAM für Ollama + Qwen 2.5 ist verfügbar
- Dify.ai kann als Self-Hosted-Instanz auf Hetzner betrieben werden
- Supabase (self-hosted oder Cloud) ist die Backend-Plattform
- Der Fragebogen ändert sich in V1 nicht wesentlich
- 1–2 Kunden gleichzeitig in V1 (kein Hochlast-Szenario)

## Open Questions

1. **Supabase Cloud oder Self-Hosted?** — Supabase auf Hetzner oder Supabase Cloud?
2. **Dify-Deployment:** Läuft Dify als Docker-Container auf demselben Hetzner-Server wie Ollama?
3. **Hetzner-Server-Spec:** Welche GPU/RAM-Konfiguration für Ollama + Qwen 2.5?
4. **Scoring in V1?** — Die Excel enthält ein vollständiges Scoring-System. Soll die Berechnung in V1 im Backend laufen (ohne Dashboard), damit der Export die Scores enthält?
5. **Vorherige Arbeit:** Es gab bereits Frontend- und Backend-Arbeit mit Supabase/RLS. Wo befindet sich dieser Code? Im aktuellen Repository ist er nicht vorhanden.

## Delivery Mode

**SaaS** — Externe Kundenplattform mit kontrollierten Zugängen, gehostet auf eigener Infrastruktur (Hetzner).

## Technical Context

| Aspekt | Entscheidung |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, DB, Storage, RLS) |
| LLM | Ollama + Qwen 2.5 (lokal) |
| LLM-Orchestrierung | Dify.ai |
| Hosting | Hetzner (Self-Hosted) |
| Deployment | Docker (TBD) |

---

Erstellt: 2026-03-24
Skill: `/requirements`
Nächster Schritt: `/architecture`
