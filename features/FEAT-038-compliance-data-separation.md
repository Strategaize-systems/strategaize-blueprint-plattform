# FEAT-038 — Compliance-Datentrennung (GF vs. Mirror Datenweitergabe)

## Purpose

Sicherstellen, dass Free-Form-Rohdaten (die persoenliche Formulierungen, Namen und emotionale Aussagen enthalten koennen) nicht unkontrolliert exportiert oder an unbefugte Rollen weitergegeben werden. Die Datenweitergabe wird rollenbasiert abgesichert: GF/Owner behaelt Zugang zu Rohdaten, Mirror-Daten werden nur strukturiert und neutralisiert exportiert.

## User Story

Als Strategaize-Berater moechte ich sicher sein, dass Mirror-Rohdaten nie im Export enthalten sind und dass Free-Form-Gespraeche nur im Management-Export verfuegbar sind, damit die Vertraulichkeit gegenueber Mirror-Teilnehmern gewahrt bleibt.

## Scope

### In Scope

- **Export-Haertung Mirror:** freeform_conversations explizit aus Mirror-Export (survey_type=mirror) ausschliessen
- **Export-Erweiterung Management:** freeform_conversations optional als `freeform/` Ordner im Management-Export einschliessen
- **RLS-Audit:** Verifizieren, dass kein API-Endpunkt freeform-Daten ohne Autorisierungspruefung ausgibt
- **Compliance-Dokumentation:** `/docs/COMPLIANCE.md` mit Datenflussbeschreibung
- **API-Absicherung:** Freeform-API-Routen pruefen, dass mirror_respondent keinen Zugriff auf Management-Freeform hat

### Out of Scope

- TTL / automatische Loeschung von Mirror-Rohdaten (V3.5)
- Compliance-Demo-Seite fuer Kunden
- DSGVO-Verarbeitungsverzeichnis (wird separat in /compliance Skill erstellt)
- Audit-Log fuer Datenzugriffe
- Separate Admin-UI fuer Compliance-Verwaltung

## Acceptance Criteria

1. Mirror-Export (survey_type=mirror) enthaelt KEINE freeform_conversations Daten
2. Management-Export (survey_type=management) enthaelt optional `freeform/` Ordner mit Gespraechsdaten
3. Freeform-API-Routen sind nicht von mirror_respondent aufrufbar (RLS + API-Check)
4. Kein API-Endpunkt gibt freeform-Daten ohne Rollencheck zurueck
5. `/docs/COMPLIANCE.md` dokumentiert den Datenfluss fuer Management und Mirror
6. Export-Manifest enthaelt Flag `includes_freeform: true/false`

## Current State Analysis

### Was bereits existiert:

| Bereich | Status | Details |
|---------|--------|---------|
| survey_type RLS auf runs | Vorhanden | Migration 016 — Management/Mirror getrennt |
| survey_type RLS auf question_events | Vorhanden | Migration 016 — Mirror sieht nur mirror events |
| freeform_conversations RLS | Vorhanden | Migration 019 — created_by = auth.uid() |
| Export isMirror-Logik | Vorhanden | route.ts prueft run.survey_type |
| freeform im Export | Nicht vorhanden | Wird aktuell nicht exportiert |
| Compliance-Doku | Nicht vorhanden | Muss erstellt werden |

### Was fehlt:

1. **Expliziter Ausschluss** von freeform aus Mirror-Export (heute nur implizit weil nicht exportiert)
2. **Einschluss** von freeform in Management-Export (Feature-Erweiterung)
3. **RLS-Audit-Dokumentation** — formale Pruefung aller Endpunkte
4. **Compliance-Dokument** — Datenflussbeschreibung

## Datenfluss-Modell

```
GF/Owner fuellt Fragebogen aus
  |
  +---> question_events (survey_type=management)
  |       Export: JA (Management v1.0)
  |
  +---> freeform_conversations (via run_id → management run)
  |       Export: JA (nur Management, als freeform/)
  |       Mirror-Export: NEIN (explizit ausgeschlossen)
  |
  +---> run_feedback (FEAT-036)
          Export: JA (depersonalisiert, als feedback.json)

Mirror-Teilnehmer fuellt Fragebogen aus
  |
  +---> question_events (survey_type=mirror)
  |       Export: JA (Mirror v2.0, entpersonalisiert)
  |
  +---> freeform_conversations (via run_id → mirror run)
          Export: NEIN
          Zugriff: Nur eigener User (created_by RLS)
          Spaeter: TTL/Loeschung (V3.5)
```

## Export-Erweiterung

### Management-Export (survey_type=management)

Neuer optionaler Ordner `freeform/` im ZIP:

```
export.zip
  manifest.json          (includes_freeform: true)
  run.json
  questions_meta.json
  answers.json
  answer_revisions.json
  evidence/
  evidence_links.json
  submissions.json
  feedback.json           (FEAT-036)
  freeform/
    conversation_1.json
    conversation_2.json
```

Jede `conversation_N.json`:
```json
{
  "conversation_id": "uuid",
  "conversation_number": 1,
  "status": "mapped",
  "message_count": 12,
  "messages": [
    {
      "role": "user",
      "content": "...",
      "timestamp": "2026-04-10T14:30:00Z"
    },
    {
      "role": "assistant",
      "content": "...",
      "timestamp": "2026-04-10T14:30:05Z"
    }
  ],
  "mapping_result": { ... }
}
```

**Keine User-Identifikation in den Nachrichten** — Messages enthalten role (user/assistant), keinen Usernamen.

### Mirror-Export (survey_type=mirror)

Unveraendert (v2.0 Contract). Kein `freeform/` Ordner. `includes_freeform: false` im Manifest.

## RLS-Audit Scope

Folgende Endpunkte muessen geprueft werden:

| Endpunkt | Erwartung |
|----------|-----------|
| POST /api/tenant/runs/[runId]/freeform/chat | Nur wenn Run survey_type=management UND User ist Owner |
| POST /api/tenant/runs/[runId]/freeform/map | Nur wenn Run survey_type=management UND User ist Owner |
| POST /api/tenant/runs/[runId]/freeform/accept | Nur wenn Run survey_type=management UND User ist Owner |
| GET /api/admin/runs/[runId]/export | freeform nur bei survey_type=management |

## Compliance-Dokument

`/docs/COMPLIANCE.md` soll enthalten:

1. Datenkategorien (Management vs. Mirror)
2. Zugriffsmatrix (Wer darf was sehen)
3. Export-Regeln (Was wird exportiert, was nicht)
4. Datenhaltung (Wo liegen Daten, wie lange)
5. Vertraulichkeitsgarantie fuer Mirror-Teilnehmer
6. Offene Punkte (TTL noch nicht implementiert)

## Dependencies

- survey_type RLS (Migration 016) — vorhanden
- freeform_conversations RLS (Migration 019) — vorhanden
- Export-Route — vorhanden, muss erweitert werden
- FEAT-036 (Feedback) — unabhaengig, aber Export wird gleichzeitig erweitert

## Priority

High — Compliance ist geschaeftskritisch fuer die Vertraulichkeitsgarantie gegenueber Mirror-Teilnehmern.

## Version

V3.4
