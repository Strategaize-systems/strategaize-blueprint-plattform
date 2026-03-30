# Migrations

### MIG-001 — Initial Schema Baseline (MVP-1)
- Date: 2026-02-23
- Scope: 10 Tabellen (tenants, profiles, question_catalog_snapshots, questions, runs, question_events, evidence_items, evidence_links, run_submissions, admin_events), 1 View (v_current_answers), 4 Functions (handle_new_user, run_submit, run_lock, log_admin_event), RLS-Policies (22), Grants (authenticated + service_role)
- Affected Areas: Gesamte Datenbankschicht
- Reason: MVP-1 Erstinstallation. Schema definiert in sql/schema.sql, Policies in sql/rls.sql, Functions in sql/functions.sql
- Rollback Notes: DROP aller public-Schema Objekte (nur bei kompletter Neuinstallation sinnvoll)

### MIG-002 — service_role Table-Level GRANTs
- Date: 2026-03-26
- Scope: GRANT ALL ON ALL TABLES/SEQUENCES/ROUTINES IN SCHEMA public TO service_role
- Affected Areas: Alle Tabellen — service_role (adminClient) hat jetzt explizite Permissions
- Reason: BYPASSRLS umgeht nur RLS-Policies, nicht Table-Level Permissions. Ohne GRANTs bekam service_role "permission denied" (ISSUE-001)
- Rollback Notes: REVOKE ALL ON ALL TABLES IN SCHEMA public FROM service_role

### MIG-003 — evidence_links Policy + handle_new_user Fix
- Date: 2026-03-26
- Scope: RLS Policy tenant_insert_evidence_links erweitert (link_id Ownership-Check), handle_new_user() RAISE statt silent default
- Affected Areas: evidence_links (Cross-Tenant-Schutz), profiles (Role-Validation bei Invite)
- Reason: ISSUE-007 (Cross-Tenant evidence linking) und ISSUE-009 (silent role default)
- Rollback Notes: DROP POLICY tenant_insert_evidence_links + CREATE alte Version ohne link_id Check. handle_new_user: IF-Block zurück auf v_role := 'tenant_owner'

### MIG-004 — DB Integrity Hardening (Append-only Trigger, tenant_id, FK RESTRICT)
- Date: 2026-03-26
- Scope: prevent_modify() Trigger auf 5 append-only Tabellen, evidence_links.tenant_id Spalte (NOT NULL, FK RESTRICT), questions FK CASCADE → RESTRICT, evidence_links RLS-Policies vereinfacht
- Affected Areas: question_events, evidence_items, evidence_links, run_submissions, admin_events (Trigger), evidence_links (Schema + RLS), questions (FK), API-Route evidence/link (tenant_id INSERT)
- Reason: ISSUE-010 (append-only nur RLS), ISSUE-014 (evidence_links ohne tenant_id), ISSUE-018 (CASCADE statt RESTRICT)
- Risk: evidence_links.tenant_id ist NOT NULL — bestehende Rows ohne tenant_id müssen backfilled werden. Trigger verhindert UPDATE auf append-only Tabellen — auch für service_role.
- Rollback Notes: DROP TRIGGER enforce_append_only auf allen 5 Tabellen. ALTER TABLE evidence_links DROP COLUMN tenant_id. ALTER TABLE questions FK zurück auf CASCADE.

### MIG-005 — Block-basierte Checkpoints + Rollen-System
- Date: 2026-03-28
- Scope: run_submit() Funktions-Signatur-Update (3 Parameter statt 2), tenant_owner → tenant_admin Rollen-Umbenennung in 7 RLS-Policies, block_access Spalte in profiles
- Affected Areas: runs, profiles, question_events, evidence_items, evidence_links (RLS), run_submissions
- Reason: Block-basierte Checkpoints benötigen block_id Parameter in run_submit(). Rollen-Umbenennung für Konsistenz (ISSUE-023).
- Rollback Notes: DROP FUNCTION run_submit(uuid, text, text); CREATE alte 2-Parameter-Version. Policies zurück auf tenant_owner.

### MIG-006 — Storage Role Membership Grant
- Date: 2026-03-29
- Scope: GRANT service_role TO supabase_storage_admin
- Affected Areas: Storage Service — Supabase Storage kann jetzt Dateien hochladen und Buckets erstellen
- Reason: ISSUE-026 — Storage Service nutzt supabase_storage_admin Rolle, die keine Membership in service_role hatte. Dadurch scheiterten alle Storage-Operationen an RLS.
- Risk: Minimal — erweitert nur die Rechte des Storage-Service auf das nötige Niveau
- Rollback Notes: REVOKE service_role FROM supabase_storage_admin
