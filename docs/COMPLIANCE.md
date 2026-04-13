# Compliance — Datentrennung und Zugriffskontrolle

## Zweck

Dieses Dokument beschreibt die Datentrennung zwischen Management-Daten (GF/Owner) und Mirror-Daten (Mitarbeiter) in der Strategaize Blueprint Plattform. Es dient als Referenz fuer die interne Compliance-Pruefung und die Vertraulichkeitsgarantie gegenueber Mirror-Teilnehmern.

Stand: V3.4 (2026-04-13)

## Datenkategorien

### Management-Daten (survey_type = management)

Daten, die vom Geschaeftsfuehrer/Owner erfasst werden:
- Strukturierte Antworten auf Fragebogen-Fragen
- Free-Form Chat-Gespraeche (offene Gespraeche mit LLM)
- Evidence-Dokumente (hochgeladene Dateien + Notizen)
- Feedback zum Fragebogen (V3.4)
- Owner-Profil (Unternehmensdaten, Fuehrungsstil)

**Datenweitergabe:** Alle Management-Daten werden vollstaendig ans OS exportiert. Free-Form-Gespraeche und Feedback werden im Export-ZIP mitgeliefert.

### Mirror-Daten (survey_type = mirror)

Daten, die von Mitarbeitern im Rahmen des Operational Reality Mirror erfasst werden:
- Strukturierte Antworten auf Fragebogen-Fragen (depersonalisiert: respondent_layer statt User-ID)
- Free-Form Chat-Gespraeche (nur zur Eingabe, NICHT exportiert)
- Evidence-Dokumente (depersonalisiert)

**Datenweitergabe:** Nur strukturierte, neutralisierte Antworten werden exportiert. Rohe Gespraechsdaten (freeform_conversations) werden NICHT exportiert (DEC-044).

## Zugriffsmatrix

### API-Endpunkte

| Endpunkt | Rolle | survey_type | Zugriff | Absicherung |
|----------|-------|-------------|---------|-------------|
| POST freeform/chat | tenant_admin | management | Erlaubt | requireTenant() + RLS auf runs |
| POST freeform/chat | mirror_respondent | mirror | Erlaubt (eigene) | requireTenant() + RLS auf freeform_conversations (created_by) |
| POST freeform/chat | mirror_respondent | management | Nicht vorgesehen | RLS auf runs (Tenant-Isolation), UI-Trennung |
| POST freeform/map | tenant_admin | management | Erlaubt | requireTenant() + Conversation-Ownership |
| POST freeform/map | mirror_respondent | * | Nicht vorgesehen | Conversation-Ownership (nur eigene) |
| POST freeform/accept | tenant_admin | management | Erlaubt | requireTenant() + Conversation-Ownership + Run-Status-Check |
| POST freeform/accept | mirror_respondent | * | Nicht vorgesehen | Conversation-Ownership (nur eigene) |
| GET/POST feedback | tenant_admin | management | Erlaubt | requireTenant() + expliziter Rollencheck + survey_type-Check |
| GET/POST feedback | mirror_respondent | * | Blockiert | API: profile.role !== "tenant_admin" |
| GET/POST feedback | tenant_member | * | Blockiert | API: profile.role !== "tenant_admin" |
| GET export | strategaize_admin | management | Mit freeform + feedback | requireAdmin() + explizite survey_type-Logik |
| GET export | strategaize_admin | mirror | Ohne freeform | requireAdmin() + COMPLIANCE DEC-044 |

### Absicherungs-Stufen

| Stufe | Beschreibung | Verwendet in |
|-------|-------------|-------------|
| **Explizit** | API-Route prueft Rolle + survey_type im Code | feedback/route.ts, export/route.ts |
| **RLS + Ownership** | PostgreSQL RLS + Conversation-Ownership (created_by = auth.uid()) | freeform/chat, freeform/map, freeform/accept |
| **UI-Trennung** | Unterschiedliche Dashboards/Workflows fuer Management vs. Mirror | Run-Workspace, Dashboard |

## Export-Regeln

### Management-Export (survey_type = management)

```
ZIP
  +--- manifest.json         (has_feedback, includes_freeform Flags)
  +--- run.json
  +--- question_catalog_snapshot.json
  +--- questions_meta.json
  +--- answer_revisions.json  (created_by als User-ID)
  +--- answers.json           (created_by als User-ID)
  +--- evidence/index.json    (created_by als User-ID)
  +--- evidence_links.json
  +--- submissions.json       (submitted_by als User-ID)
  +--- feedback.json          (KEIN created_by — DEC-043)
  +--- freeform/
         +--- conversation_1.json  (messages + mapping_result, KEIN Username)
         +--- conversation_N.json
```

### Mirror-Export (survey_type = mirror)

```
ZIP
  +--- manifest.json         (has_feedback: false, includes_freeform: false)
  +--- run.json
  +--- question_catalog_snapshot.json
  +--- questions_meta.json
  +--- answer_revisions.json  (respondent_layer statt created_by)
  +--- answers.json           (respondent_layer statt created_by)
  +--- evidence/index.json    (respondent_layer statt created_by)
  +--- evidence_links.json
  +--- submissions.json       (respondent_layer statt submitted_by)
  --- KEIN feedback.json ---
  --- KEIN freeform/ Ordner ---
```

### Depersonalisierung

| Datentyp | Management | Mirror |
|----------|-----------|--------|
| Antworten (created_by) | User-ID | respondent_layer (L1/L2/KS) |
| Evidence (created_by) | User-ID | respondent_layer |
| Submissions (submitted_by) | User-ID | respondent_layer |
| Feedback | Kein created_by (DEC-043) | N/A (kein Feedback) |
| Freeform Conversations | Keine User-IDs in Messages | N/A (nicht exportiert) |

## Vertraulichkeitsgarantie fuer Mirror-Teilnehmer

1. Mirror-Teilnehmer-Antworten werden im Export NICHT mit User-IDs versehen
2. Stattdessen wird nur die Rolle (respondent_layer: L1, L2, KS) exportiert
3. Free-Form Chat-Gespraeche von Mirror-Teilnehmern werden NICHT exportiert (DEC-044)
4. Feedback ist nur fuer Management-Runs verfuegbar (kein Mirror-Feedback in V3.4)
5. Die Vertraulichkeitsvereinbarung (Mirror Policy) wird vor Teilnahme bestaetigt

## Offene Punkte

### Explizite survey_type-Checks in Freeform-Routen

Die Freeform-API-Routen (chat, map, accept) pruefen survey_type nicht explizit im API-Code. Die Absicherung erfolgt ueber:
- RLS-Policies auf Tabellenebene (Tenant-Isolation)
- Conversation-Ownership (created_by = auth.uid())
- UI-Trennung (separate Dashboards fuer Management/Mirror)

Fuer maximale Defense-in-Depth waere ein expliziter survey_type-Check in den Freeform-Routen empfehlenswert. Das ist kein akuter Sicherheits-Blocker (RLS verhindert Cross-Tenant-Zugriff), aber ein Verbesserungspotential fuer zukuenftige Versionen.

### TTL fuer Mirror-Rohdaten

Automatische Loeschung von Mirror-Rohdaten (freeform_conversations) nach definierter Frist. Geplant fuer V3.5.

## Entscheidungen

- DEC-043: Kein created_by in run_feedback (Depersonalisierung by Design)
- DEC-044: Freeform-Export nur Management, nie Mirror
- DEC-045: UPSERT statt INSERT-only fuer Feedback
