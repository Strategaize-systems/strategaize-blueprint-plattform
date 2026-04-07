# SLC-051 — Run-Deadline (Backend + Frontend)

## Metadaten

- **ID:** SLC-051
- **Feature:** FEAT-034
- **Backlog:** BL-058
- **Version:** V3.1
- **Status:** planned
- **Priority:** Medium
- **Created:** 2026-04-07
- **Dependencies:** SLC-046

## Ziel

Runs bekommen optionale Deadline. Admin setzt bei Erstellung. Teilnehmer sieht im Dashboard mit visuellem Hinweis. Deadline im Export.

## Micro-Tasks

#### MT-1: Admin Run-Erstellung + Detail: due_date
- Goal: DatePicker bei Erstellung, Deadline-Anzeige im Detail
- Files: `src/app/admin/runs/runs-client.tsx`, `src/app/admin/runs/[id]/run-detail-client.tsx`, `src/app/api/admin/runs/route.ts`, `src/lib/validations.ts`
- Expected behavior: Optionaler DatePicker "Fällig bis" bei Run-Erstellung. due_date im POST-Body. Run-Detail zeigt Deadline. createRunSchema erweitert.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Dashboard Deadline-Badge
- Goal: Teilnehmer sieht Deadline unter Run-Titel
- Files: `src/app/dashboard/dashboard-client.tsx`, `src/app/api/tenant/runs/route.ts`
- Expected behavior: due_date im API-Response. Badge: Grün (>3 Tage), Orange (≤3 Tage), Rot (überschritten). Kein Badge wenn due_date null.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-3: Export: due_date
- Goal: due_date im Manifest und run.json
- Files: `src/app/api/admin/runs/[runId]/export/route.ts`
- Expected behavior: manifestJson und runJson enthalten due_date
- Verification: Build erfolgreich
- Dependencies: none

#### MT-4: i18n Deadline-Keys
- Goal: Badge-Texte und Admin-Labels dreisprachig
- Files: `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: deadline.* Keys (dueSoon, overdue, dueDate Label)
- Verification: JSON valide
- Dependencies: none

## Akzeptanzkriterien

1. Admin kann Deadline bei Run-Erstellung setzen
2. Teilnehmer sieht Deadline im Dashboard
3. Visueller Hinweis bei ≤3 Tage oder überschritten
4. Deadline im Export
5. Build erfolgreich
