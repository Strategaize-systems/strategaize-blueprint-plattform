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
