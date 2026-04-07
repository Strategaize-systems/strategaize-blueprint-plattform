# SLC-048 — Nominations Frontend (GF-Seite + Admin-Integration)

## Metadaten

- **ID:** SLC-048
- **Feature:** FEAT-032
- **Backlog:** BL-055
- **Version:** V3.1
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-07
- **Dependencies:** SLC-047

## Ziel

GF bekommt Nominations-Seite in der Plattform. Admin sieht Nominations im Mirror-Tab und kann daraus einladen.

## Micro-Tasks

#### MT-1: Nominations-Seite für GF
- Goal: /mirror/nominations mit Tabelle + Add/Edit/Delete Dialog
- Files: `src/app/mirror/nominations/page.tsx`, `src/app/mirror/nominations/nominations-client.tsx`
- Expected behavior: tenant_admin sieht Tabelle mit Name, Ebene, Abteilung, E-Mail. Add-Button öffnet Dialog. Edit/Delete inline. Kein Invite-Status sichtbar.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Sidebar-Navigation für tenant_admin
- Goal: Neuer Nav-Punkt "Mirror-Teilnehmer" in der Dashboard-Sidebar für tenant_admin
- Files: `src/app/dashboard/dashboard-client.tsx`
- Expected behavior: tenant_admin sieht "Mirror-Teilnehmer" Link in Sidebar. tenant_member und mirror_respondent sehen ihn nicht.
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-3: Admin Mirror-Tab: Nominations anzeigen + Invite-Prefill
- Goal: Nominations-Liste im Admin Mirror-Tab. "Aus Vorschlag einladen"-Button füllt Invite-Dialog vor.
- Files: `src/app/admin/tenants/tenants-client.tsx`
- Expected behavior: Admin sieht Nominations (Name, Ebene, E-Mail, Status). Button öffnet Invite-Dialog mit vorausgefüllten Feldern. Nach Invite: Nomination-Status → "invited".
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-4: i18n Nominations-Keys
- Goal: Alle UI-Texte dreisprachig
- Files: `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: mirror.nominations.* Keys für Seite, Dialog, Sidebar
- Verification: JSON valide
- Dependencies: none

## Akzeptanzkriterien

1. GF kann Nominations in der Plattform verwalten
2. GF sieht keinen Invite-Status
3. Admin sieht Nominations im Mirror-Tab
4. Admin kann aus Nomination direkt einladen
5. Nomination-Status wird nach Invite aktualisiert
6. Dreisprachig
7. Build erfolgreich
