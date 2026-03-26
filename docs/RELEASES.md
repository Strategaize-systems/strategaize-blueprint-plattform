# Releases

### REL-001 — MVP-1 Initial Deployment
- Date: 2026-03-25
- Scope: Auth (Invite-only, Server Actions), Admin-Dashboard (Tenants, Runs, Catalog), Tenant-Workspace (Block-Navigation, Event-Sourcing, Evidence-Upload), Submission-Checkpoints, ZIP-Export (Data Contract v1.0)
- Summary: Erstes Deployment auf Hetzner via Coolify. Auth-Fix (Server Actions + interne Docker-URL) am selben Tag angewendet. Admin-Seiten initial blockiert durch fehlende service_role GRANTs (ISSUE-001, behoben am 2026-03-26). Security Hardening (SLC-002) am 2026-03-26 nachgezogen.
- Risks: SQL-Änderungen (SLC-002) müssen nach jedem Re-Deployment manuell auf die DB angewendet werden bis sie im Init-Script integriert sind
- Rollback Notes: Coolify Rollback auf vorherigen Container-Stand. DB-Rollback: manuelle Reversion der RLS Policy + Function.
