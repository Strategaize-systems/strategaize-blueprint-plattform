# SLC-008 — Admin Layout: Sidebar + Navigation

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
High — Strukturelle Änderung, Basis für Admin-Seiten

## Scope
Admin Top-Navigation durch Dark Gradient Sidebar ersetzen. Admin-Layout komplett umbauen.

## Out of scope
- Einzelne Admin-Seiten-Inhalte (SLC-009)
- Tenant-Seiten (SLC-010)

## Micro-Tasks

### MT-1: Admin Sidebar Component
- Goal: Neue Sidebar-Component mit Dark Gradient Background, Logo, Nav-Items, User-Info
- Files: `src/components/admin-sidebar.tsx`
- Expected behavior: Dark Gradient Sidebar (256px), Active-Item mit Brand-Gradient, Hover-States, Section-Headers uppercase
- Verification: Build + visuell auf /admin/tenants
- Dependencies: SLC-007 (Brand-Farben müssen in Tailwind sein)

### MT-2: Admin Layout Umbau
- Goal: admin/layout.tsx von Top-Nav auf Sidebar-Layout umbauen
- Files: `src/app/admin/layout.tsx`
- Expected behavior: Sidebar links (fixed), Content rechts (scrollbar), responsive Verhalten
- Verification: Alle Admin-Seiten laden korrekt mit neuem Layout
- Dependencies: MT-1

### MT-3: admin-nav.tsx entfernen oder deprecaten
- Goal: Alte Top-Navigation entfernen wenn Sidebar komplett ist
- Files: `src/components/admin-nav.tsx` (löschen oder umbauen)
- Expected behavior: Keine Referenzen mehr auf admin-nav
- Verification: Build + grep für alte Imports
- Dependencies: MT-2

## Acceptance Criteria
- Admin hat Dark Gradient Sidebar statt Top-Nav
- Active Nav-Item mit Brand-Gradient hervorgehoben
- Alle Admin-Seiten laden korrekt im neuen Layout
- Responsive: Sidebar auf Mobile als Overlay/Drawer
