# SLC-014 — Admin Pages Premium (Style Guide v2.1 Alignment)

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
Medium — Admin sieht Projektbesitzer, weniger Kunden-kritisch als SLC-013

## Scope
Admin-Seiten (Tenants, Runs, Run-Detail, Katalog) auf das gleiche Premium-Niveau
wie den Workspace bringen. Visuelle Familienaehnlichkeit herstellen.

## Out of scope
- Workspace/Kundenseite (SLC-013)
- Neue Admin-Features

## Micro-Tasks

### MT-1: Admin Run-Detail — Premium Fragenliste + KPI
- Goal: Run-Detail-Seite mit Premium-KPI-Cards und verbesserter Fragenliste
- Files: `src/app/admin/runs/[id]/run-detail-client.tsx`
- Expected behavior:
  - KPI Cards: rounded-2xl, border-2, shadow-lg (wie Workspace-Panels)
  - Fragenliste: Kategorien gruppiert, Status-Dots, kompakter
  - Export-Button: Premium-Style
- Verification: Build + visuell auf /admin/runs/[id]
- Dependencies: SLC-013

### MT-2: Admin Runs + Tenants — Konsistente Cards
- Goal: Run-Cards und Tenant-Cards auf rounded-2xl, border-2, shadow-lg upgraden
- Files: `src/app/admin/runs/runs-client.tsx`, `src/app/admin/tenants/tenants-client.tsx`
- Expected behavior: Konsistent mit Workspace-Panels, gleiche Shadows und Radii
- Verification: Build + visuell
- Dependencies: none

### MT-3: Admin Sidebar — Logo + Familienaehnlichkeit
- Goal: Admin-Sidebar visuell naeher an Workspace-Sidebar bringen
- Files: `src/components/admin-sidebar.tsx`
- Expected behavior:
  - Echtes Logo (wenn Asset verfuegbar)
  - "Blueprint Assessment" Untertitel konsistent
  - Gleiche Gradient-Qualitaet wie Workspace-Sidebar
- Verification: Build + visuell
- Dependencies: none

## Acceptance Criteria
- Admin-Seiten fuehlen sich visuell verwandt mit Kundenseite an
- Gleiche Card-Styles (rounded-2xl, border-2, shadow-lg)
- Admin-Sidebar passt zum Workspace-Sidebar-Stil
