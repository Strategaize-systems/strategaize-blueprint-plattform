# FEAT-036 — Feedback-Schleife nach Fragebogen-Abschluss

## Purpose

Nach Abschluss aller Fragebogen-Bloecke soll der Teilnehmer (GF/Owner) strukturiertes Feedback zum Fragebogen selbst geben koennen. Das Feedback betrifft die Qualitaet des Fragebogens — nicht die inhaltlichen Antworten. Die Daten werden depersonalisiert gespeichert und sind exportierbar fuer die interne Katalog-Verbesserung.

## User Story

Als GF/Owner moechte ich nach Abschluss meines Fragebogens Rueckmeldung zur Qualitaet der Fragen geben koennen, damit Strategaize den Fragenkatalog verbessern kann.

## Scope

### In Scope

- Feedback-Tab im Workspace aktivieren (Platzhalter aus V3.3 nutzen)
- Tab wird erst aktiv, wenn alle Bloecke submitted sind (Run-Status = submitted oder locked)
- 4 feste Feedback-Fragen (hardcoded, nicht konfigurierbar):
  1. **Abdeckung:** "Gab es Themen, die im Fragebogen gefehlt haben?" (Freitext)
  2. **Verstaendlichkeit:** "Gab es Fragen, die schwer verstaendlich waren?" (Freitext)
  3. **Verbesserungen:** "Was wuerden Sie am Prozess verbessern?" (Freitext)
  4. **Gesamteindruck:** "Wie bewerten Sie den Fragebogen insgesamt?" (Rating 1-5 + optionaler Kommentar)
- i18n: DE/EN/NL fuer alle Feedback-Fragen und UI-Elemente
- Neue Tabelle `run_feedback` in Supabase
- RLS: Nur eigener Tenant kann eigenes Feedback lesen/schreiben
- Depersonalisierter Export: `feedback.json` im ZIP (kein created_by, kein User-Name)
- Feedback ist einmalig pro Run (kein Mehrfach-Submit, aber Editieren bis Finalisierung)
- Visuelles Feedback nach Submit (Erfolgs-Nachricht)

### Out of Scope

- Mirror-Teilnehmer Feedback (V3.5)
- Konfigurierbare Feedback-Fragen (Admin-UI)
- Feedback-Aggregation / Dashboards / Trends (gehoert in OS)
- Feedback als Grundlage fuer automatische Katalog-Aenderungen
- Notifications bei neuem Feedback

## Acceptance Criteria

1. Feedback-Tab ist disabled solange nicht alle Bloecke submitted sind
2. Feedback-Tab wird automatisch aktiv nach vollstaendigem Submit
3. Alle 4 Feedback-Fragen werden korrekt angezeigt (DE/EN/NL)
4. Freitext-Antworten koennen gespeichert werden
5. Rating (1-5) kann gespeichert werden
6. Feedback wird in `run_feedback` Tabelle gespeichert
7. Feedback erscheint im Admin-Export als `feedback.json`
8. Export enthaelt KEIN created_by oder User-Informationen
9. RLS verhindert Cross-Tenant-Zugriff auf Feedback
10. Feedback ist nicht fuer mirror_respondent sichtbar oder erstellbar
11. Bereits eingegebenes Feedback wird beim erneuten Oeffnen angezeigt

## Data Model

### Tabelle: `run_feedback`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primaerschluessel |
| run_id | UUID | FK runs(id) ON DELETE CASCADE, NOT NULL | Zugehoeriger Run |
| tenant_id | UUID | FK tenants(id) ON DELETE CASCADE, NOT NULL | Tenant fuer RLS |
| question_key | TEXT | NOT NULL | Feedback-Frage-Identifier (coverage, clarity, improvements, overall) |
| response_text | TEXT | nullable | Freitext-Antwort |
| response_rating | INT | nullable, CHECK 1-5 | Rating (nur fuer overall) |
| created_at | TIMESTAMPTZ | DEFAULT now() | Erstellungszeitpunkt |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Letztes Update |

**Constraints:**
- UNIQUE(run_id, question_key) — ein Feedback pro Frage pro Run
- RLS: tenant_id = auth.user_tenant_id()
- Kein created_by in der Tabelle (Depersonalisierung by design)

## Export Format

Im ZIP unter `feedback.json`:

```json
{
  "run_id": "uuid",
  "feedback": [
    {
      "question_key": "coverage",
      "question_text": "Gab es Themen, die im Fragebogen gefehlt haben?",
      "response_text": "...",
      "response_rating": null
    },
    {
      "question_key": "overall",
      "question_text": "Wie bewerten Sie den Fragebogen insgesamt?",
      "response_text": "Sehr gut strukturiert",
      "response_rating": 4
    }
  ],
  "submitted_at": "2026-04-15T10:30:00Z"
}
```

## UI Behavior

- Tab zeigt Lock-Icon + "Verfuegbar nach Fragebogen-Abschluss" wenn Run nicht submitted
- Nach Submit: Tab wird aktiv, zeigt 4 Feedback-Karten
- Jede Karte hat Frage-Text + Eingabefeld (Textarea oder Rating)
- Submit-Button am Ende speichert alle Antworten
- Erfolgs-Nachricht nach Submit
- Bereits gespeichertes Feedback wird beim Tab-Wechsel beibehalten

## Edge Cases

- Run wird nach Feedback-Eingabe wieder entsperrt (re-opened): Feedback bleibt erhalten, Tab wird wieder disabled
- Admin exportiert Run ohne Feedback: feedback.json ist leer oder nicht vorhanden
- Tenant mit mehreren Usern: Nur tenant_admin/tenant_owner kann Feedback geben (nicht tenant_member)

## Dependencies

- V3.3 Tab-Infrastruktur (workspace-tabs.tsx) — vorhanden
- Run Submission System (run_submissions) — vorhanden
- Export-Route — vorhanden, muss erweitert werden

## Priority

Medium — Keine Blocker fuer andere Features, aber schliesst den Feedback-Loop.

## Version

V3.4
