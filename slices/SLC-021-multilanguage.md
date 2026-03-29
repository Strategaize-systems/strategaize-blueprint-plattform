# SLC-021 — Mehrsprachigkeit (DE/EN/NL)

## Feature
BL-022

## Priority
High — noetig fuer internationale Kunden

## Scope
Dreisprachige Plattform: Deutsch, Englisch, Niederlaendisch.
Sprachauswahl auf Tenant-Ebene.

## Micro-Tasks

### MT-1: i18n Framework Setup (next-intl)
- Goal: next-intl installieren, Middleware konfigurieren, Ordnerstruktur
- Files: package.json, next.config.ts, src/middleware.ts, src/i18n/
- Expected behavior:
  - Locale-Detection aus Tenant-Profil (nicht Browser)
  - Fallback: Deutsch
  - Translations als JSON-Dateien (de.json, en.json, nl.json)
- Dependencies: none

### MT-2: Deutsche Texte extrahieren
- Goal: Alle hardcoded deutschen Strings in Translation Keys umwandeln
- Files: Alle Client-Components, Admin-Pages, Auth-Pages
- Expected behavior:
  - Statt "Ihre Antwort" → t("workspace.yourAnswer")
  - de.json enthaelt alle aktuellen deutschen Texte
  - App funktioniert identisch wie vorher (nur deutsch aus JSON statt hardcoded)
- Dependencies: MT-1

### MT-3: Englische Uebersetzung
- Goal: en.json mit allen Uebersetzungen
- Files: src/i18n/en.json
- Expected behavior: Vollstaendige englische Uebersetzung aller UI-Texte
- Dependencies: MT-2

### MT-4: Niederlaendische Uebersetzung
- Goal: nl.json mit allen Uebersetzungen
- Files: src/i18n/nl.json
- Expected behavior: Vollstaendige niederlaendische Uebersetzung
- Dependencies: MT-2

### MT-5: Tenant-Level Spracheinstellung
- Goal: Sprache wird pro Tenant gesetzt (DB + Admin UI)
- Files: DB Migration (profiles + language), Admin Tenant-Verwaltung
- Expected behavior:
  - profiles Tabelle: language Column (de/en/nl, default: de)
  - Admin kann Sprache beim Tenant setzen
  - Tenant-User sieht Plattform in zugewiesener Sprache
- Dependencies: MT-1

### MT-6: LLM Prompts mehrsprachig
- Goal: System-Prompts in der Sprache des Tenants
- Files: src/lib/llm.ts
- Expected behavior:
  - Prompts enthalten Sprach-Anweisung basierend auf Tenant-Sprache
  - LLM antwortet auf Deutsch/Englisch/Niederlaendisch
- Dependencies: MT-5

### MT-7: E-Mail Templates mehrsprachig
- Goal: Invite-E-Mail in Tenant-Sprache
- Files: src/lib/email.ts
- Expected behavior: E-Mail-Text je nach Tenant-Sprache
- Dependencies: MT-5

### MT-8: Fragenkataloge mehrsprachig
- Goal: 3 Katalog-Versionen (DE/EN/NL) importierbar
- Files: Katalog-Import Logik, Admin Catalog UI
- Expected behavior:
  - Admin kann Katalog mit Sprach-Tag importieren
  - Runs werden mit sprachlich passendem Katalog erstellt
- Dependencies: MT-5

## Estimated Effort
Gross — 3-5 Tage. MT-2 ist der aufwendigste (alle Strings extrahieren).

## Risiken
- Viele Dateien muessen angefasst werden (alle Components)
- Vergessene Strings → Mix aus Deutsch und Englisch
- LLM-Qualitaet auf Niederlaendisch weniger gut als Deutsch
