# SLC-007 — Design Foundation (Style Guide Basis)

## Feature
BL-020 (UI-Update mit Style Guide)

## Priority
High — Grundlage für alle weiteren UI-Slices

## Scope
Tailwind Config, CSS Variables und Brand-Farben auf Style Guide umstellen. Kein Seiten-Refactoring — nur die Design-Tokens und Basis-Styles.

## Out of scope
- Seiten-spezifische Änderungen (SLC-008 bis SLC-011)
- Sidebar-Navigation (SLC-008)
- Neue Components

## Micro-Tasks

### MT-1: Tailwind Config — Brand-Farben + Spacing
- Goal: Brand-Farben (#120774, #4454b8, #00a84f, #4dcb8b, #f2b705) in Tailwind Config eintragen
- Files: `tailwind.config.ts`
- Expected behavior: `bg-brand-primary`, `bg-brand-success`, `text-brand-primary` etc. verfügbar
- Verification: `npx tsc --noEmit` + Farben in Config sichtbar
- Dependencies: none

### MT-2: CSS Variables — Style Guide Tokens in globals.css
- Goal: CSS Custom Properties für Gradients, Shadows, Radius nach Style Guide
- Files: `src/app/globals.css`
- Expected behavior: `--gradient-primary`, `--gradient-success`, `--shadow-card`, `--shadow-glow-brand` etc. definiert
- Verification: Build erfolgreich, Variables in CSS sichtbar
- Dependencies: MT-1

### MT-3: Button Component — Primary Gradient + Hover
- Goal: shadcn Button Primary-Variant auf Gradient-Style umstellen
- Files: `src/components/ui/button.tsx`
- Expected behavior: Primary Button hat Gradient (#120774 → #4454b8), Hover mit Shadow + translateY(-1px)
- Verification: Build + visuell prüfen auf Login-Seite (einzige sichtbare Seite ohne Login)
- Dependencies: MT-1, MT-2

### MT-4: Badge Component — Gradient Success/Warning
- Goal: shadcn Badge um gradient-success und gradient-warning Varianten erweitern
- Files: `src/components/ui/badge.tsx`
- Expected behavior: `<Badge variant="gradient-success">` zeigt grünen Gradient, `<Badge variant="gradient-warning">` zeigt gelben
- Verification: Build erfolgreich
- Dependencies: MT-2

### MT-5: Card Component — Premium Border + Hover-Glow
- Goal: shadcn Card um premium Hover-Effect erweitern (border-color change + shadow elevation)
- Files: `src/components/ui/card.tsx`
- Expected behavior: Cards haben subtle shadow, hover zeigt elevation + border-color change
- Verification: Build erfolgreich
- Dependencies: MT-2

## Acceptance Criteria
- Brand-Farben in Tailwind Config
- CSS Variables für Gradients/Shadows definiert
- Button Primary = Gradient mit Hover-Glow
- Badge hat gradient-success/warning Varianten
- Card hat Premium Hover-Effect
- Build fehlerfrei
