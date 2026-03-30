# SLC-024 — i18n Foundation: DB + next-intl + Locale-Middleware

## Feature
BL-022 — Mehrsprachigkeit (DE/EN/NL)

## Goal
next-intl installieren, Tenant-Sprache in DB speichern, Middleware setzt Locale-Cookie basierend auf Tenant.

## Scope
- DB: `tenants.language` Spalte (de/en/nl, default de)
- next-intl installieren + konfigurieren (Cookie-basiert, kein URL-Prefix)
- Middleware: nach Login Locale-Cookie setzen basierend auf tenant.language
- Deutsche Translation-Datei als Startpunkt (messages/de.json)
- Leere en.json und nl.json als Skeleton

## Out of Scope
- Tatsächliche UI-String-Extraktion (SLC-025)
- LLM-Prompts (SLC-026)
- Katalog-Sprache (SLC-027)

## Acceptance
1. `tenants.language` Spalte existiert mit CHECK constraint
2. next-intl ist installiert und konfiguriert
3. Middleware setzt NEXT_LOCALE Cookie
4. useTranslations() funktioniert in einer Test-Komponente
5. Admin kann beim Tenant-Erstellen Sprache wählen

### Micro-Tasks

#### MT-1: DB-Migration — tenants.language Spalte
- Goal: Language-Spalte auf tenants-Tabelle hinzufügen
- Files: `sql/schema.sql`
- Expected behavior: `tenants.language` existiert mit CHECK ('de','en','nl'), DEFAULT 'de'
- Verification: SQL auf Production ausführen, bestehende Tenants bekommen 'de'
- Dependencies: none

#### MT-2: next-intl installieren + konfigurieren
- Goal: next-intl als Dependency, i18n Config-Dateien erstellen
- Files: `package.json`, `src/i18n/request.ts`, `src/i18n/config.ts`, `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: next-intl ist installiert, Config lädt Locale aus Cookie
- Verification: `npx tsc --noEmit` erfolgreich, Dev-Server startet
- Dependencies: none

#### MT-3: Middleware — Locale-Cookie setzen
- Goal: Nach Auth-Check Tenant-Sprache laden und als Cookie setzen
- Files: `src/middleware.ts`
- Expected behavior: Eingeloggte User bekommen NEXT_LOCALE Cookie mit Tenant-Sprache
- Verification: Login → Cookie im Browser prüfen
- Dependencies: MT-1, MT-2

#### MT-4: Admin — Sprach-Selektor beim Tenant-Erstellen
- Goal: Dropdown für Sprache im Tenant-Erstellungs-Dialog
- Files: `src/app/admin/tenants/tenants-client.tsx`, `src/app/api/admin/tenants/route.ts`
- Expected behavior: Admin sieht Sprach-Dropdown (DE/EN/NL), Sprache wird beim Erstellen gespeichert
- Verification: Neuer Tenant erstellen → DB prüfen ob language gesetzt
- Dependencies: MT-1
