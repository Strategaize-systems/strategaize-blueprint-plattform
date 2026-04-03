# FEAT-030 — Mirror-Einladung und Onboarding

## Metadaten

- **ID:** FEAT-030
- **Version:** V3 (Phase 1)
- **Priorität:** P0
- **Status:** planned
- **Erstellt:** 2026-04-03

## Zusammenfassung

Separater Einladungsflow für Mirror-Teilnehmer, gesteuert von StrategAIze-Admin. Vertraulichkeits-Policy als Pflicht beim ersten Login.

## Lösung

### Admin-Flow

1. StrategAIze-Admin öffnet Tenant-Verwaltung
2. Neuer Tab/Bereich: "Mirror-Teilnehmer"
3. Teilnehmer anlegen: E-Mail, respondent_layer, zugewiesene Blöcke
4. Einladungs-E-Mail versenden (separater Template, nicht Management-Invite)

### Mirror-Onboarding für Teilnehmer

1. Teilnehmer klickt Link in E-Mail
2. Passwort setzen (bestehender Set-Password-Flow)
3. Vertraulichkeits-Policy Seite (Pflicht-Bestätigung)
4. Redirect zum Mirror-Workspace (nur eigene Fragen sichtbar)

### Vertraulichkeits-Policy

Für Mirror-Teilnehmer:
- Ziel: strukturelle Realitätserhebung, keine Personenbewertung
- Antworten werden nicht personenbezogen an Geschäftsführung zurückgegeben
- Auswertung erfolgt verdichtet und entpersonalisiert
- Keine arbeitsrechtliche oder disziplinarische Nutzung

Für Inhaber:
- Hinweis: "Es findet eine strukturelle Realitätserhebung statt"
- Keine Einzelantworten, keine Zuordnung auf Personenebene
- Fokus auf Muster, Reibung, Abweichung, Klarheit

### i18n

- Alle Texte dreisprachig DE/EN/NL
- Einladungs-E-Mail Templates pro Sprache
- Vertraulichkeits-Policy pro Sprache

## Akzeptanzkriterien

1. StrategAIze-Admin kann Mirror-Teilnehmer anlegen und einladen
2. Einladungs-E-Mail ist für Mirror angepasst
3. Vertraulichkeits-Policy wird beim ersten Login angezeigt
4. Teilnehmer muss Policy bestätigen bevor er Fragen sieht
5. Tenant-Owner kann keine Mirror-Teilnehmer anlegen
6. Block-Zuweisung pro Teilnehmer konfigurierbar

## Abhängigkeiten

- FEAT-028 (survey_type)
- FEAT-029 (mirror_respondent Rolle)
