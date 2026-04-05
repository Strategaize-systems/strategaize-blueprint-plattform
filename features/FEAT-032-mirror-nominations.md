# FEAT-032 — GF Mirror-Nominierungsformular

## Metadaten

- **ID:** FEAT-032
- **Version:** V3.1
- **Priorität:** P0
- **Status:** planned
- **Erstellt:** 2026-04-05

## Zusammenfassung

Der Geschäftsführer (tenant_admin) bekommt in seiner Plattform-Ansicht ein Formular, über das er Mirror-Teilnehmer vorschlagen kann. Strategaize-Admin sieht die Vorschläge und kann daraus mit einem Klick einladen.

## Problem

Aktuell muss der GF die Teilnehmer-Infos (Name, Ebene, Abteilung, E-Mail) extern liefern (E-Mail, Excel). Das ist umständlich und fehleranfällig. Die Daten sollen direkt in der Plattform erfasst werden.

## Lösung

### GF-Sicht (Tenant-Dashboard)

- Neuer Bereich "Mirror-Teilnehmer vorschlagen" auf dem Dashboard oder als separate Seite
- Tabelle mit Add-Funktion: Name, Ebene, Funktion/Abteilung, E-Mail
- GF kann Einträge hinzufügen, bearbeiten, löschen
- GF sieht NICHT: ob eingeladen wurde, ob/was geantwortet wurde

### Admin-Sicht (Mirror-Tab)

- Im bestehenden Mirror-Tab: Nominations-Liste neben den eingeladenen Respondents
- "Aus Vorschlag einladen"-Button: übernimmt Daten in den Invite-Dialog (vorausgefüllt)
- Status pro Nomination: "vorgeschlagen" → "eingeladen"

### Datenmodell

- Neue Tabelle `mirror_nominations`: tenant_id, name, email, respondent_layer, department, status, created_at, created_by
- RLS: tenant_admin kann nur eigene Nominations sehen/schreiben
- Admin: sieht alle Nominations über adminClient

### Felder pro Nomination

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| name | text | Ja | z.B. "Herr Schmidt", "Frau Müller" |
| respondent_layer | enum | Ja | leadership_1, leadership_2, key_staff |
| department | text | Ja | z.B. "Vertrieb", "Finanzen", "IT" |
| email | text | Ja | Kontakt-E-Mail für Einladung |

## Akzeptanzkriterien

1. GF kann Teilnehmer-Vorschläge in der Plattform eintragen
2. GF kann Vorschläge bearbeiten und löschen
3. GF sieht keine Informationen über den Invite-Status oder Antworten
4. Admin sieht Nominations im Mirror-Tab
5. Admin kann aus einem Vorschlag direkt einladen
6. Nomination-Status wird nach Einladung aktualisiert
7. Dreisprachig (DE/EN/NL)
8. Build erfolgreich

## Out of Scope

- GF kann selbst einladen (bleibt bei Admin)
- Automatische Einladung nach Nomination (immer manueller Admin-Schritt)
- Bulk-Import (CSV/Excel) — V3.2+
