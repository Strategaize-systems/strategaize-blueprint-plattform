# SLC-043 — Mirror Invite + Onboarding

## Metadaten

- **ID:** SLC-043
- **Feature:** FEAT-030
- **Backlog:** BL-052
- **Version:** V3
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-03
- **Dependencies:** SLC-040, SLC-041

## Ziel

StrategAIze-Admin kann Mirror-Teilnehmer einladen. Separater Einladungsflow mit Rolle mirror_respondent, respondent_layer, Block-Zuweisung. Vertraulichkeits-Policy als Pflicht-Seite. Mirror-E-Mail-Template.

## Scope

- Admin-UI: Mirror-Teilnehmer Tab in Tenant-Verwaltung
- Admin-API: Mirror-Teilnehmer einladen (mirror_respondent + respondent_layer + blocks)
- Mirror-Einladungs-E-Mail Template (DE/EN/NL)
- Vertraulichkeits-Policy Seite (/mirror/policy)
- Policy-Bestätigungs-API (POST /api/tenant/mirror/confirm-policy)
- Dashboard-Redirect für mirror_respondent wenn Policy nicht bestätigt
- handle_new_user() Trigger erweitern für mirror_respondent

## Micro-Tasks

#### MT-1: Admin Mirror-Teilnehmer API
- Goal: Erweiterung des Invite-Endpunkts oder neuer Endpunkt für mirror_respondent Einladung
- Files: `src/app/api/admin/tenants/[tenantId]/invite/route.ts` oder neuer Endpunkt
- Expected behavior: Akzeptiert role=mirror_respondent, respondent_layer, allowedBlocks. Erstellt User mit korrekter Rolle.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Admin Mirror-Teilnehmer-Liste API
- Goal: GET Endpunkt für Mirror-Teilnehmer eines Tenants
- Files: `src/app/api/admin/tenants/[tenantId]/mirror-respondents/route.ts`
- Expected behavior: Listet alle mirror_respondent Profiles für den Tenant mit respondent_layer + Block-Zuweisungen
- Verification: Build erfolgreich
- Dependencies: none

#### MT-3: Admin UI — Mirror-Teilnehmer Tab
- Goal: Tab in Tenant-Verwaltung für Mirror-Teilnehmer (Liste + Einladen-Dialog)
- Files: `src/app/admin/tenants/tenants-client.tsx` oder neue Komponente
- Expected behavior: Mirror-Tab zeigt Liste, Einladen-Button öffnet Dialog mit E-Mail, respondent_layer, Blocks
- Verification: Build erfolgreich
- Dependencies: MT-1, MT-2

#### MT-4: Vertraulichkeits-Policy Seite + API
- Goal: /mirror/policy Seite mit Policy-Text + Bestätigungs-Button. POST API für Bestätigung.
- Files: `src/app/mirror/policy/page.tsx`, `src/app/api/tenant/mirror/confirm-policy/route.ts`, `src/app/api/tenant/mirror/policy-status/route.ts`
- Expected behavior: Policy-Text dreisprachig. Bestätigung speichert in mirror_policy_confirmations. Dashboard-Redirect wenn nicht bestätigt.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-5: Mirror-E-Mail-Template + i18n
- Goal: Separates E-Mail-Template für Mirror-Einladung + i18n-Keys
- Files: Nodemailer send-Logik, `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: Mirror-Einladungs-E-Mail erklärt vertraulichen Charakter
- Verification: Build erfolgreich
- Dependencies: none

#### MT-6: handle_new_user() Trigger erweitern
- Goal: DB-Trigger verarbeitet mirror_respondent korrekt (Block-Zuweisung mit survey_type=mirror)
- Files: SQL Migration oder separate Datei
- Expected behavior: Bei Invite mit role=mirror_respondent werden member_block_access Einträge mit survey_type=mirror erstellt
- Verification: SQL auf DB ausführen
- Dependencies: SLC-040 (Schema)

## Akzeptanzkriterien

1. Admin kann Mirror-Teilnehmer einladen mit E-Mail + Layer + Blocks
2. Einladungs-E-Mail ist Mirror-spezifisch
3. Mirror-Teilnehmer sieht Policy beim ersten Login
4. Policy muss bestätigt werden bevor Fragen sichtbar
5. Tenant-Owner kann keine Mirror-Teilnehmer einladen
6. handle_new_user() erstellt korrekte Block-Zuweisungen
