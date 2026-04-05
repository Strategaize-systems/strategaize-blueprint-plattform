# FEAT-034 — Mirror-Run Deadline

## Metadaten

- **ID:** FEAT-034
- **Version:** V3.1
- **Priorität:** P1
- **Status:** planned
- **Erstellt:** 2026-04-05

## Zusammenfassung

Mirror-Runs (und optional Management-Runs) können ein Fälligkeitsdatum bekommen. Teilnehmer sehen die Deadline im Dashboard. Grundlage für spätere Reminder-E-Mails.

## Problem

Aktuell gibt es keinen Zeitrahmen für Runs. Teilnehmer wissen nicht bis wann sie fertig sein sollen. Ohne Deadline sinkt die Rücklaufquote.

## Lösung

### DB-Erweiterung

- `runs.due_date` DATE nullable — Fälligkeitsdatum
- Wird bei Run-Erstellung optional gesetzt

### Admin-UI

- Run-Erstellung: optionales Datumsfeld "Fällig bis"
- Run-Detail: Deadline anzeigen

### Teilnehmer-Dashboard

- Deadline als Badge oder Text unter dem Run-Titel
- Visueller Hinweis wenn Deadline naht (< 3 Tage) oder überschritten

### Export

- `due_date` im Manifest und run.json

## Akzeptanzkriterien

1. Admin kann bei Run-Erstellung eine Deadline setzen
2. Deadline ist im Dashboard des Teilnehmers sichtbar
3. Visueller Hinweis bei nahender/überschrittener Deadline
4. Deadline im Export enthalten
5. Build erfolgreich

## Out of Scope

- Automatische Reminder-E-Mails (V3.2+)
- Automatische Sperrung nach Deadline
- Deadline-Änderung nach Erstellung (V3.2+)
