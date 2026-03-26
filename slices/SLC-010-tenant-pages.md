# SLC-010 — Tenant Pages: Dashboard + Workspace

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
High — Das sieht der Kunde

## Scope
Tenant-Dashboard und Run-Workspace auf Style Guide Design umstellen.

## Out of scope
- Admin-Seiten (SLC-009)
- Auth-Seiten (SLC-011)

## Micro-Tasks

### MT-1: Tenant Dashboard — Premium Run-Cards
- Goal: Dashboard mit Premium Run-Cards, Progress-Bar mit Green Gradient, KPI-Zahlen
- Files: `src/app/dashboard/dashboard-client.tsx`
- Expected behavior: Run Cards mit Gradient Top-Border, Progress als Green-Gradient-Bar, Evidence Count Badge
- Verification: Build + visuell als Tenant-User auf /dashboard
- Dependencies: SLC-007

### MT-2: Tenant Header — Branding + Navigation
- Goal: Tenant-Header mit StrategAIze Logo/Branding, cleanes Layout
- Files: `src/app/dashboard/dashboard-client.tsx` (Header-Bereich)
- Expected behavior: Professioneller Header mit Brand-Farben, User-Info rechts
- Verification: Build + visuell
- Dependencies: SLC-007

### MT-3: Run Workspace — Block Navigation Premium
- Goal: Block-Tabs mit Brand-Styling, aktiver Tab mit Gradient-Underline
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Block A-I Tabs mit Active-Gradient, Frage-Liste mit Status-Dots, Selected-Question mit Brand-Border
- Verification: Build + visuell als Tenant-User auf /runs/[id]
- Dependencies: SLC-007

### MT-4: Run Workspace — Question Detail + Evidence
- Goal: Frage-Detail-Panel mit Premium Styling, Answer-Textarea, Evidence-Upload-Area
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Answer-Area mit Focus-Glow, Evidence-Section mit Card-Style, Upload-Button mit Brand-Gradient
- Verification: Build + visuell
- Dependencies: MT-3

## Acceptance Criteria
- Tenant-Dashboard mit Premium Run-Cards und Green Progress
- Run-Workspace mit Brand-gestylten Block-Tabs
- Question-Detail mit Focus-States und Premium Forms
- Evidence-Upload mit konsistentem Design
- Gesamteindruck: professionell, vertrauenswürdig
