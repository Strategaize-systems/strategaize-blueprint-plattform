# SLC-044 — Mirror Workspace

## Metadaten

- **ID:** SLC-044
- **Feature:** FEAT-029
- **Backlog:** BL-051
- **Version:** V3
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-03
- **Dependencies:** SLC-040, SLC-041, SLC-043

## Ziel

Mirror-Teilnehmer kann den bestehenden Workspace nutzen mit eingeschränkter Sicht. Dashboard zeigt nur Mirror-Runs. Workspace zeigt nur zugewiesene Blöcke und eigene Antworten. Vertraulichkeits-Hinweis im Workspace.

## Scope

- Dashboard-Seite: mirror_respondent sieht nur Mirror-Runs (RLS macht das automatisch)
- Dashboard: Policy-Redirect wenn nicht bestätigt
- Workspace: funktioniert bereits über RLS (Mirror-Fragen aus Mirror-Katalog)
- Workspace: Vertraulichkeits-Hinweis-Banner für mirror_respondent
- Sidebar: angepasst für mirror_respondent (kein Profil-Link, kein Owner-spezifisches)
- LLM-Chat: funktioniert für Mirror (gleiche Prompts in Phase 1, ohne Owner-Profil)

## Micro-Tasks

#### MT-1: Dashboard für mirror_respondent
- Goal: Dashboard zeigt Mirror-Runs, Policy-Redirect, angepasste UI
- Files: `src/app/dashboard/page.tsx`, `src/app/dashboard/dashboard-client.tsx`
- Expected behavior: mirror_respondent sieht eigene Mirror-Runs. Policy-Check → Redirect wenn nicht bestätigt. Kein Owner-Profil-Check.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Workspace Mirror-Hinweis
- Goal: Banner im Workspace für mirror_respondent mit Vertraulichkeits-Hinweis
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Wenn User mirror_respondent → kleiner Hinweis-Banner "Ihre Antworten werden vertraulich behandelt"
- Verification: Build erfolgreich
- Dependencies: none

#### MT-3: Chat-Route Mirror-Kompatibilität
- Goal: Chat-Route funktioniert für Mirror-Runs (ohne Owner-Profil, ohne Memory in Phase 1)
- Files: `src/app/api/tenant/runs/[runId]/questions/[questionId]/chat/route.ts`
- Expected behavior: Wenn kein owner_profile gefunden → graceful fallback (schon implementiert). Memory für Mirror-Runs optional.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-4: i18n Mirror-Workspace Keys
- Goal: mirror.* Namespace mit Workspace-Texten
- Files: `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: mirror.confidentialityBanner, mirror.dashboardTitle etc.
- Verification: JSON valide
- Dependencies: none

## Akzeptanzkriterien

1. mirror_respondent sieht nur Mirror-Runs auf Dashboard
2. mirror_respondent kann zugewiesene Blöcke im Workspace bearbeiten
3. Vertraulichkeits-Hinweis ist sichtbar
4. Chat/LLM funktioniert für Mirror-Runs
5. Kein Zugriff auf Management-Daten
6. Build erfolgreich
