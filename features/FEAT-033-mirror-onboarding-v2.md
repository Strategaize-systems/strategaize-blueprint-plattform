# FEAT-033 — Verbessertes Mirror-Onboarding

## Metadaten

- **ID:** FEAT-033
- **Version:** V3.1
- **Priorität:** P0
- **Status:** planned
- **Erstellt:** 2026-04-05

## Zusammenfassung

Einladungs-E-Mail und Policy-Seite werden für den realen Einsatz aufgewertet. Mirror-Teilnehmer (die Strategaize nicht kennen) brauchen mehr Kontext und Orientierung.

## Problem

Die aktuelle Einladungs-E-Mail ist generisch — sie nennt den Firmennamen und enthält den Link, aber erklärt nicht wer Strategaize ist, warum der Teilnehmer angeschrieben wird, was er tun soll, und was mit seinen Antworten passiert. Die Policy-Seite hat die Vertraulichkeits-Punkte, aber keinen Gesamtkontext.

## Lösung

### Verbesserte Einladungs-E-Mail

Die Mirror-Invite-E-Mail bekommt ein eigenes Template (getrennt vom Management-Invite):

**Inhalt:**
1. Wer ist Strategaize (1 Satz)
2. Warum werden Sie kontaktiert ("Ihr Unternehmen führt eine strukturelle Analyse durch")
3. Was wird erwartet ("Sie beantworten ca. X Fragen zu Ihrem Bereich, Zeitaufwand ca. 30-45 Min")
4. Vertraulichkeit (Kurzversion: "Ihre Antworten werden nicht personenbezogen an die Geschäftsführung zurückgegeben")
5. KI-Hinweis ("Ein KI-Assistent steht Ihnen für Rückfragen zur Verfügung")
6. Zeitrahmen (wenn Deadline gesetzt)
7. Link zum Starten

### Erweiterte Policy-Seite

- Bestehende 4 Vertraulichkeits-Punkte bleiben
- Zusätzlich: Erklärungsblock oben ("Was ist die Realitätserhebung?", "Wie funktioniert es?")
- Optional: Eingebettetes Erklärvideo (Platzhalter, Video wird extern produziert)
- Hinweis auf KI-Assistenten im Workspace
- Dreisprachig (DE/EN/NL)

### E-Mail-Template Trennung

- Bestehend: `sendInviteEmail()` für Management-Invites
- Neu: `sendMirrorInviteEmail()` mit Mirror-spezifischem Template
- Automatische Auswahl basierend auf Rolle bei Invite

## Akzeptanzkriterien

1. Mirror-Teilnehmer erhalten eine separate, kontextreiche Einladungs-E-Mail
2. E-Mail erklärt: wer, warum, was, Zeitaufwand, Vertraulichkeit, KI-Hinweis
3. Policy-Seite hat erweiterten Erklärungsblock
4. Policy-Seite hat Video-Platzhalter (ready für externes Video)
5. Dreisprachig (DE/EN/NL)
6. Build erfolgreich

## Out of Scope

- Direktkommunikation Strategaize ↔ Teilnehmer
- In-App Messaging
- Video-Produktion (nur Platzhalter/Embed-Struktur)
