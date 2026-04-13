# SLC-064 — Compliance Export-Haertung + Freeform-Export

## Slice Info
- Feature: FEAT-038, FEAT-036 (Export-Teil)
- Priority: High
- Dependencies: SLC-062 (run_feedback Tabelle fuer feedback.json Export)

## Goal

Export-Route haerten: freeform_conversations explizit aus Mirror-Export ausschliessen, freeform/ Ordner in Management-Export einschliessen, feedback.json hinzufuegen, Manifest erweitern. RLS-Audit dokumentieren.

## Micro-Tasks

### MT-1: Export-Route erweitern
- Goal: feedback.json + freeform/ in Export-Route einbauen
- Files: `src/app/api/admin/runs/[runId]/export/route.ts`
- Expected behavior:
  - Feedback laden (adminClient, run_feedback fuer runId) → feedback.json generieren (ohne User-Referenz)
  - Wenn survey_type=management: freeform_conversations laden → freeform/conversation_N.json generieren (messages + mapping_result, kein Username)
  - Wenn survey_type=mirror: freeform explizit NICHT laden (mit Code-Kommentar: "COMPLIANCE DEC-044")
  - Manifest erweitern: has_feedback (boolean), includes_freeform (boolean)
- Verification: `npm run build` erfolgreich
- Dependencies: keine (funktioniert auch ohne MT-2, gibt dann leere Daten)

### MT-2: RLS-Audit + Compliance-Dokument
- Goal: Alle Freeform-API-Endpunkte auf korrekte Zugriffskontrollen pruefen, Compliance-Dokument erstellen
- Files: `docs/COMPLIANCE.md`, (Review: `src/app/api/tenant/runs/[runId]/freeform/chat/route.ts`, `map/route.ts`, `accept/route.ts`)
- Expected behavior: Jeder Freeform-Endpunkt wird auf Rollencheck und survey_type-Schutz geprueft. Ergebnis wird in COMPLIANCE.md dokumentiert mit: Datenkategorien, Zugriffsmatrix, Export-Regeln, Vertraulichkeitsgarantie.
- Verification: Dokument ist vollstaendig und konsistent mit tatsaechlichem Code
- Dependencies: MT-1 (Export-Aenderungen muessen dokumentiert werden)

## Acceptance Criteria
1. Mirror-Export enthaelt KEINEN freeform/ Ordner
2. Management-Export enthaelt freeform/ Ordner mit Conversations
3. feedback.json ist im Export enthalten (beide survey_types)
4. Manifest hat has_feedback und includes_freeform Flags
5. Freeform-Conversations im Export enthalten keine User-Identifikation
6. COMPLIANCE.md existiert und dokumentiert den Datenfluss
7. Alle Freeform-API-Routen sind auf korrekte Zugriffskontrolle geprueft
