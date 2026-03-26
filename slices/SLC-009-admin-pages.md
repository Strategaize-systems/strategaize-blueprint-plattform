# SLC-009 — Admin Pages: Premium Cards + Tables

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
High — Sichtbarste Seiten für den Projektbesitzer

## Scope
Admin-Seiten (Tenants, Katalog, Runs, Run-Detail) auf Style Guide Design umstellen.

## Out of scope
- Layout/Navigation (SLC-008)
- Tenant-Seiten (SLC-010)

## Micro-Tasks

### MT-1: Tenants-Seite — Premium Cards + KPI
- Goal: Tenant-Liste als Premium Cards mit Hover-Glow, KPI-Zahlen (Runs, Owner)
- Files: `src/app/admin/tenants/tenants-client.tsx`
- Expected behavior: Cards mit gradient top-border, Hover-Shadow, Brand-Farben für CTAs
- Verification: Build + visuell auf /admin/tenants
- Dependencies: SLC-007, SLC-008

### MT-2: Runs-Seite — Premium Table
- Goal: Run-Liste als Premium Table mit Gradient Top-Border, Hover-Rows, Status-Badges
- Files: `src/app/admin/runs/runs-client.tsx`
- Expected behavior: Table Header uppercase mit Sort-Arrows, Row-Hover mit left-border, Gradient-Badges für Status
- Verification: Build + visuell auf /admin/runs
- Dependencies: SLC-007, SLC-008

### MT-3: Run-Detail-Seite — KPI Cards + Tabs
- Goal: Run-Detail mit farbigen KPI-Cards (Fragen, Beantwortet, Evidence), Premium Tabs
- Files: `src/app/admin/runs/[id]/run-detail-client.tsx`
- Expected behavior: KPI Cards mit Gradient-Values, Progress Bar mit Green Gradient, Action-Buttons mit Brand-Gradient
- Verification: Build + visuell auf /admin/runs/[id]
- Dependencies: SLC-007, SLC-008

### MT-4: Katalog-Seite — Collapsible Premium
- Goal: Katalog-Snapshot-Liste mit Premium Card-Style, Question-Table mit Style Guide
- Files: `src/app/admin/catalog/catalog-client.tsx`
- Expected behavior: Snapshot Cards mit Hash-Badge, expandable Question Table
- Verification: Build + visuell auf /admin/catalog
- Dependencies: SLC-007, SLC-008

## Acceptance Criteria
- Alle 4 Admin-Seiten nutzen Style Guide Design
- KPI Cards mit Gradient-Values
- Tables mit Premium Styling (Gradient border, Hover rows)
- Status-Badges mit Gradient-Varianten
- Consistent Spacing (8px Grid)
