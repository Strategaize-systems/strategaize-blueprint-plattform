# SLC-050 — Mirror-Onboarding (E-Mail + Policy-Erweiterung)

## Metadaten

- **ID:** SLC-050
- **Feature:** FEAT-033
- **Backlog:** BL-056, BL-057
- **Version:** V3.1
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-07
- **Dependencies:** SLC-046

## Ziel

Mirror-Teilnehmer bekommt kontextreiche Einladungs-E-Mail. Policy-Seite wird um Erklärungsblock und Video-Platzhalter erweitert.

## Micro-Tasks

#### MT-1: Mirror-Invite-E-Mail-Template
- Goal: Eigenes E-Mail-Template für Mirror-Einladungen
- Files: `src/lib/email.ts`
- Expected behavior: MIRROR_INVITE_TEMPLATES (DE/EN/NL) mit: Wer ist Strategaize, Warum kontaktiert, Was erwartet, Zeitaufwand, Vertraulichkeit, KI-Hinweis, Deadline (wenn gesetzt). sendMirrorInviteEmail() Funktion.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: Invite-Route: automatische Template-Auswahl
- Goal: Bei role=mirror_respondent automatisch sendMirrorInviteEmail() nutzen
- Files: `src/app/api/admin/tenants/[tenantId]/invite/route.ts`
- Expected behavior: Wenn role=mirror_respondent → sendMirrorInviteEmail() mit Deadline aus Run (wenn vorhanden). Sonst → bestehende sendInviteEmail().
- Verification: Build erfolgreich
- Dependencies: MT-1

#### MT-3: Policy-Seite erweitern
- Goal: Erklärungsblock + Video-Platzhalter + KI-Hinweis
- Files: `src/app/mirror/policy/page.tsx`
- Expected behavior: Vor den 4 Vertraulichkeits-Punkten: 3 Absätze (Was ist die Realitätserhebung, Wie funktioniert es, Was passiert mit Ihren Antworten). Video-Platzhalter (ready für HTML5 video embed). Hinweis auf KI-Assistenten.
- Verification: Build erfolgreich
- Dependencies: none

#### MT-4: i18n Onboarding-Keys
- Goal: E-Mail-Templates + Policy-Erweiterung dreisprachig
- Files: `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: mirror.policyExplanation*, mirror.videoPlaceholder, email.mirror.* (wobei E-Mail-Templates inline in email.ts sind)
- Verification: JSON valide
- Dependencies: none

## Akzeptanzkriterien

1. Mirror-Teilnehmer erhalten separate, kontextreiche E-Mail
2. E-Mail enthält alle 7 Inhaltspunkte
3. Policy-Seite hat Erklärungsblock vor Vertraulichkeits-Punkten
4. Video-Platzhalter vorhanden
5. Dreisprachig
6. Build erfolgreich
