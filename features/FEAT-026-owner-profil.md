# FEAT-026 — Owner-Profil ("Frage Null") (DE/EN/NL)

## Metadaten

- **ID:** FEAT-026
- **Version:** V2.2
- **Priorität:** P0
- **Status:** planned
- **Erstellt:** 2026-04-02

## Zusammenfassung

Pflicht-Formular auf Tenant-Ebene, das der Owner vor dem ersten Run ausfüllt. Enthält persönliche Informationen, Anrede-Präferenz, Führungsstil-Selbsteinordnung, DISC-Kommunikationsstil und freie Vorstellung. Profil wird in alle LLM-Prompts injiziert, damit das LLM den Owner ab der ersten Frage persönlich ansprechen und kontextsensitiv nachfragen kann.

## Problem

Das LLM behandelt jeden Kunden gleich und hat bei der ersten Frage keinen Kontext über den Menschen oder seine Situation. Für Geschäftsführer (50-65), die einen signifikanten Exit-Prozess durchlaufen, ist das unpersönlich und nutzt das Potenzial der KI nicht aus.

## Lösung

### Profil-Bereiche

1. **Persönliche Informationen**
   - Name (Vor- und Nachname)
   - Alter / Altersbereich (Dropdown: 30-39, 40-49, 50-59, 60+)
   - Ausbildungshintergrund (Freitext: höchster Abschluss, Fachrichtung)
   - Beruflicher Werdegang (Freitext: Kurzfassung, max 500 Zeichen)
   - Wie lange Inhaber/GF (Dropdown: <5 Jahre, 5-10, 10-20, 20+)

2. **Anrede-Präferenz**
   - Du oder Sie (Radio)
   - Anrede mit Vorname oder Nachname (Radio)
   - Wird in allen LLM-Antworten verwendet

3. **Führungsstil** (Single-Select mit Beschreibung)
   - Patriarchisch, Kooperativ, Delegativ, Coaching, Visionär
   - Kurzbeschreibung pro Option (1 Satz)

4. **DISC-Kommunikationsstil** (Single-Select mit Beschreibung + Farbcode)
   - Dominant (Rot), Initiativ (Gelb), Stetig (Grün), Gewissenhaft (Blau)
   - Kurzbeschreibung pro Option (2-3 Sätze)

5. **Freie Vorstellung**
   - Textfeld (max 2000 Zeichen) + optional Whisper-Spracheingabe
   - Leitfragen als Inspiration (kein Pflichtformat)

### Profil-Injection in LLM-Prompts

Alle 4 Prompt-Typen (Rückfrage, Zusammenfassung, Bewertung, Dokumentanalyse) erhalten einen zusätzlichen System-Kontext-Block:

```
PROFIL DES KUNDEN:
- Name: Richard Bellaerts (Anrede: Du, Richard)
- Alter: 50-59, Ausbildung: BWL-Studium
- Inhaber seit: 15 Jahren, vorher CFO bei Mittelständler
- Führungsstil: Kooperativ
- Kommunikation: Gewissenhaft (Blau) — bevorzugt Zahlen/Fakten/Strukturen
- Über sich: "Ich leite ein Immobilienunternehmen mit 45 Mitarbeitern..."
```

Geschätzter Token-Bedarf: 300-500 Tokens.

### Platzierung und Flow

- **Wann:** Beim ersten Login nach Tenant-Erstellung (vor Dashboard-Zugriff)
- **Wo:** Eigene Seite `/profile` oder Modal-Overlay
- **Pflicht:** Run-Zugriff wird blockiert bis Profil ausgefüllt
- **Bearbeitbar:** Jederzeit über Profil-Link in Sidebar oder Menü

## Akzeptanzkriterien

1. Owner wird bei erstem Login zum Profil geleitet
2. Alle 5 Bereiche sind ausfüllbar
3. Spracheingabe im Freitext-Feld funktioniert (Whisper)
4. Profil gespeichert und jederzeit bearbeitbar
5. LLM verwendet gewählte Anrede korrekt
6. LLM zeigt Kontextwissen aus Profil
7. Formular dreisprachig (DE/EN/NL)
8. Run-Zugriff ohne Profil nicht möglich

## Technische Hinweise

- DB: neue Tabelle `owner_profiles` oder Erweiterung `profiles` mit JSON-Spalte
- Frontend: neue Route `/profile` mit Formular-Komponente
- Backend: Profil laden in `requireTenant()` Helper, an LLM-Calls weitergeben
- LLM: System-Prompt erweitern in `src/lib/llm.ts`
- i18n: Neue Keys für Formular-Labels, Führungsstil-Beschreibungen, DISC-Beschreibungen

## Abhängigkeiten

- Whisper-Integration (V2) für Spracheingabe im Freitext-Feld
- Bestehende i18n-Infrastruktur (next-intl)

## Out of Scope

- Mitarbeiter-Profile (erst bei Multi-User-Bedarf)
- Vollständiger DISC-Test
- Profil-Import aus externen Systemen
- KI-gestützte Profil-Analyse oder -Empfehlung
