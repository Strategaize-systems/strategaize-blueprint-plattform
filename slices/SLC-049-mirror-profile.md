# SLC-049 — Mirror-Profil (Backend + Frontend + LLM-Kontext)

## Metadaten

- **ID:** SLC-049
- **Feature:** FEAT-033
- **Backlog:** BL-060, BL-061
- **Version:** V3.1
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-07
- **Dependencies:** SLC-046

## Ziel

Mirror-Teilnehmer füllt nach Policy ein Profil aus. Felder respondent_layer-abhängig. Profil fließt über buildMirrorContext() in LLM-Prompts ein.

## Micro-Tasks

#### MT-1: Mirror-Profil API-Routen
- Goal: GET/PUT /api/tenant/mirror/profile
- Files: `src/app/api/tenant/mirror/profile/route.ts`, `src/lib/validations.ts`
- Expected behavior: mirror_respondent kann eigenes Profil laden und speichern. Andere Rollen 403. Upsert auf profile_id.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Mirror-Profil Formular-Seite
- Goal: /mirror/profile mit respondent_layer-abhängigen Feldern
- Files: `src/app/mirror/profile/page.tsx`, `src/app/mirror/profile/mirror-profile-client.tsx`
- Expected behavior: L1/L2 sehen: Name, Anrede, Abteilung, Position, Führungsstil-Ranking, DISC-Auswahl, Vorstellung. KS sehen: Name, Anrede, Abteilung, Position, vereinfachter Kommunikationsstil, Vorstellung. respondent_layer wird aus profiles gelesen.
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-3: Dashboard Redirect-Chain erweitern
- Goal: Nach Policy-Check auch Mirror-Profil-Check
- Files: `src/app/dashboard/page.tsx`
- Expected behavior: mirror_respondent: Policy? → Profil? → Dashboard. Wenn Profil fehlt → /mirror/profile
- Verification: Build erfolgreich
- Dependencies: MT-2

#### MT-4: buildMirrorContext() + Chat-Route Anpassung
- Goal: Neuer LLM-Kontext-Builder für Mirror-Teilnehmer
- Files: `src/lib/llm.ts`, `src/app/api/tenant/runs/[runId]/questions/[questionId]/chat/route.ts`
- Expected behavior: MirrorProfileData Interface. buildMirrorContext() analog zu buildOwnerContext() aber ohne age_range/education/years_as_owner. Chat-Route: wenn mirror_respondent → mirror_profiles laden + buildMirrorContext().
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-5: i18n Mirror-Profil-Keys
- Goal: Formular-Labels, Beschreibungen, Optionen dreisprachig
- Files: `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: mirror.profile.* Keys
- Verification: JSON valide
- Dependencies: none

## Akzeptanzkriterien

1. Mirror-Teilnehmer muss Profil ausfüllen vor Dashboard-Zugang
2. Felder sind respondent_layer-abhängig (L1/L2 vs. KS)
3. Profil wird im LLM-Chat als Kontext verwendet
4. LLM verwendet korrekte Anrede
5. Dreisprachig
6. Build erfolgreich
