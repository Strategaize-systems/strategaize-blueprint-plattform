# SLC-047 — Nominations Backend (API + Validierung)

## Metadaten

- **ID:** SLC-047
- **Feature:** FEAT-032
- **Backlog:** BL-055
- **Version:** V3.1
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-07
- **Dependencies:** SLC-046

## Ziel

CRUD API-Routen für mirror_nominations. Tenant-Admin kann Nominations erstellen, lesen, bearbeiten, löschen. Admin sieht Nominations im Mirror-Respondents-Endpoint.

## Micro-Tasks

#### MT-1: Validierungs-Schema
- Goal: Zod-Schema für Nominations (name, email, respondent_layer, department)
- Files: `src/lib/validations.ts`
- Expected behavior: nominationSchema validiert alle Pflichtfelder, respondent_layer als enum
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Nominations CRUD API-Routen
- Goal: GET/POST auf /nominations, PATCH/DELETE auf /nominations/[id]
- Files: `src/app/api/tenant/mirror/nominations/route.ts`, `src/app/api/tenant/mirror/nominations/[id]/route.ts`
- Expected behavior: tenant_admin kann Nominations CRUD. Andere Rollen bekommen 403. RLS erzwingt Tenant-Isolation.
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-3: Admin Mirror-Respondents erweitern
- Goal: GET /mirror-respondents gibt auch Nominations zurück
- Files: `src/app/api/admin/tenants/[tenantId]/mirror-respondents/route.ts`
- Expected behavior: Response enthält `nominations` Array neben `respondents` Array
- Verification: Build erfolgreich
- Dependencies: MT-2

## Akzeptanzkriterien

1. tenant_admin kann Nominations CRUD über API
2. Andere Rollen bekommen 403
3. Admin sieht Nominations im Mirror-Tab Endpoint
4. Validierung lehnt ungültige Daten ab
5. Build erfolgreich
