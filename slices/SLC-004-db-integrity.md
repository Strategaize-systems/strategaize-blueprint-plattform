# SLC-004 — Database Integrity Hardening (Medium)

## Feature
FEAT-001 (Auth), FEAT-005 (Event-Logging), FEAT-006 (Evidence)

## Priority
Medium — Defensive Absicherung der Datenintegrität

## Issues addressed
- ISSUE-010: Append-only Enforcement nur über RLS
- ISSUE-014: evidence_links hat keine tenant_id-Spalte
- ISSUE-018: questions FK nutzt CASCADE statt RESTRICT

## Scope
DB-Schema-Verbesserungen für defensive Integrität. Minimale, gezielte Änderungen.

## Out of scope
- N+1 Query-Optimierung (ISSUE-011, separater Performance-Slice)
- run_submit Vollständigkeitscheck (ISSUE-017, Low Priority)

## Micro-Tasks

### MT-1: Append-only Trigger für Event-Tabellen
- **Datei:** `/sql/functions.sql` (neue Trigger-Function)
- Trigger `prevent_modify` auf: `question_events`, `evidence_items`, `evidence_links`, `run_submissions`, `admin_events`
- Function:
  ```sql
  CREATE OR REPLACE FUNCTION prevent_modify()
  RETURNS trigger AS $$
  BEGIN
    RAISE EXCEPTION 'append-only table: % does not allow % operations',
      TG_TABLE_NAME, TG_OP
      USING ERRCODE = 'P0403';
  END;
  $$ LANGUAGE plpgsql;
  ```
- Trigger: `BEFORE UPDATE OR DELETE ON {table} FOR EACH ROW EXECUTE FUNCTION prevent_modify();`
- **Verifikation:** `UPDATE question_events SET payload = '{}' WHERE id = '...'` muss fehlschlagen

### MT-2: tenant_id-Spalte zu evidence_links hinzufügen
- **Datei:** `/sql/schema.sql` (Schema-Änderung)
- `ALTER TABLE evidence_links ADD COLUMN tenant_id uuid REFERENCES tenants(id) ON DELETE RESTRICT;`
- Backfill: `UPDATE evidence_links el SET tenant_id = ei.tenant_id FROM evidence_items ei WHERE el.evidence_item_id = ei.id;`
- `ALTER TABLE evidence_links ALTER COLUMN tenant_id SET NOT NULL;`
- RLS-Policy anpassen: direkte tenant_id-Prüfung statt Subquery
- **Datei:** `/sql/rls.sql` — Policies für evidence_links vereinfachen
- **Datei:** `/src/app/api/tenant/runs/[runId]/evidence/[evidenceId]/link/route.ts` — tenant_id beim INSERT mitgeben
- **Verifikation:** evidence_links hat tenant_id, Policies nutzen direkte Spalte

### MT-3: questions FK auf RESTRICT ändern
- **Datei:** `/sql/schema.sql`
- `ALTER TABLE questions DROP CONSTRAINT questions_catalog_snapshot_id_fkey;`
- `ALTER TABLE questions ADD CONSTRAINT questions_catalog_snapshot_id_fkey FOREIGN KEY (catalog_snapshot_id) REFERENCES question_catalog_snapshots(id) ON DELETE RESTRICT;`
- **Verifikation:** `DELETE FROM question_catalog_snapshots WHERE id = '...'` muss fehlschlagen wenn Questions referenziert werden

## Acceptance Criteria
- Event-Tabellen lehnen UPDATE/DELETE auf DB-Ebene ab (nicht nur RLS)
- evidence_links hat eigene tenant_id-Spalte mit direkter Isolation
- Catalog-Snapshot-Löschung wird durch RESTRICT verhindert

## Estimated Complexity
Mittel — Schema-Änderungen mit Backfill, Trigger-Function, RLS-Policy-Updates, 1 API-Route-Anpassung

## Dependencies
- SLC-001 muss zuerst abgeschlossen sein (DB-Zugriff auf Production)
