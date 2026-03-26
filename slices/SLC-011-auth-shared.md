# SLC-011 — Auth Pages + Shared Components

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
Medium — Login ist der erste Eindruck, aber weniger komplex

## Scope
Login, Set-Password und gemeinsam genutzte Components auf Style Guide umstellen.

## Out of scope
- Admin/Tenant-Seiten (SLC-008-010)

## Micro-Tasks

### MT-1: Login Page — Premium Design
- Goal: Login-Seite mit Brand-Gradient-Akzent, Premium Card, Brand-Button
- Files: `src/app/login/login-form.tsx`
- Expected behavior: Zentrierte Card mit subtle Brand-Gradient-Element (z.B. Top-Border oder Side-Accent), Brand-Primary Button, Focus-States auf Inputs
- Verification: Build + visuell auf /login
- Dependencies: SLC-007

### MT-2: Set-Password Page — Matching Design
- Goal: Set-Password-Seite im gleichen Stil wie Login
- Files: `src/app/auth/set-password/set-password-form.tsx`
- Expected behavior: Gleicher Card-Style wie Login, konsistente Inputs und Button
- Verification: Build + visuell auf /auth/set-password
- Dependencies: MT-1

### MT-3: ProgressIndicator + StatusBadge — Style Guide
- Goal: Shared Components auf Style Guide Gradient-Styles umstellen
- Files: `src/components/progress-indicator.tsx`, `src/components/status-badge.tsx`
- Expected behavior: Progress mit Green Gradient Bar, StatusBadge mit Gradient-Varianten (collecting=warning, submitted=primary, locked=neutral)
- Verification: Build + visuell auf allen Seiten die diese Components nutzen
- Dependencies: SLC-007

### MT-4: Empty States + Skeleton Loaders — Konsistenz
- Goal: Empty States und Skeleton Loaders auf Style Guide abstimmen
- Files: Diverse Client-Components (dashboard-client, tenants-client, runs-client, catalog-client)
- Expected behavior: Empty States mit Icon-Circle + Brand-CTA, Skeleton mit konsistenter Animation
- Verification: Build + kurz Netzwerk drosseln um Loading zu sehen
- Dependencies: SLC-007

## Acceptance Criteria
- Login sieht professionell aus mit Brand-Elementen
- Set-Password konsistent mit Login
- Progress Bars nutzen Green Gradient
- Status Badges nutzen Gradient-Varianten
- Empty States haben CTA-Button in Brand-Farbe
