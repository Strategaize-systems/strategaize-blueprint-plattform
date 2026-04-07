# SLC-052 — Learning Center Mirror-Inhalte

## Metadaten

- **ID:** SLC-052
- **Feature:** FEAT-033
- **Backlog:** BL-062
- **Version:** V3.1
- **Status:** planned
- **Priority:** Medium
- **Created:** 2026-04-07
- **Dependencies:** SLC-049

## Ziel

Learning Center zeigt rollenbasierte Inhalte. Mirror-Teilnehmer sehen angepasste Hilfe statt Owner-spezifische Inhalte.

## Micro-Tasks

#### MT-1: Role-Check im Learning Center
- Goal: LearningCenterPanel erkennt mirror_respondent und zeigt andere Inhalte
- Files: `src/components/learning-center/learning-center-panel.tsx`, `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Rolle wird als Prop durchgereicht. Mirror sieht: "Wie beantworte ich Fragen?", "KI-Assistent nutzen", "Vertraulichkeit". Mirror sieht NICHT: "Mitarbeiter einladen", "Profil bearbeiten" (Owner).
- Verification: Build erfolgreich
- Dependencies: none

#### MT-2: i18n Mirror Learning Center Keys
- Goal: Mirror-spezifische Learning Center Texte
- Files: `src/messages/de.json`, `en.json`, `nl.json`
- Expected behavior: learning.mirror.* Keys für Tabs, Tutorials, Guide-Inhalte
- Verification: JSON valide
- Dependencies: none

## Akzeptanzkriterien

1. Mirror-Teilnehmer sieht angepasste Learning Center Inhalte
2. Keine Owner-spezifischen Inhalte für Mirror sichtbar
3. Dreisprachig
4. Build erfolgreich
