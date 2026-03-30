# SLC-025 — UI-Texte extrahieren + übersetzen (DE/EN/NL)

## Feature
BL-022 — Mehrsprachigkeit (DE/EN/NL)

## Goal
Alle hardcodierten deutschen UI-Texte durch next-intl Translation-Keys ersetzen. Übersetzungen in EN und NL bereitstellen.

## Scope
- ~50-70 UI-Strings aus 8-12 Komponenten extrahieren
- messages/de.json mit allen Keys befüllen
- messages/en.json + messages/nl.json übersetzen
- Betrifft: Workspace, Evidence, Event-History, Auth-Pages, Validierungen

## Out of Scope
- Admin-UI (bleibt Deutsch)
- LLM-Prompts (SLC-026)
- E-Mail-Templates (SLC-026)

## Acceptance
1. Keine hardcodierten deutschen Strings mehr in Tenant-facing Komponenten
2. Sprachwechsel (via Tenant-Sprache) zeigt alle Texte korrekt in DE/EN/NL
3. Build erfolgreich, keine fehlenden Translation-Keys

### Micro-Tasks

#### MT-1: Workspace-Komponente — Strings extrahieren
- Goal: Alle deutschen Strings aus run-workspace-client.tsx in Translation-Keys umwandeln
- Files: `src/app/runs/[id]/run-workspace-client.tsx`, `src/messages/de.json`
- Expected behavior: useTranslations() für alle UI-Texte (Block-Namen, Labels, Buttons, Meldungen)
- Verification: Build erfolgreich, UI zeigt gleiche deutschen Texte
- Dependencies: SLC-024 abgeschlossen

#### MT-2: Event-History + Validierungen — Strings extrahieren
- Goal: Event-Labels, Validation-Messages in Translation-Keys umwandeln
- Files: `src/components/event-history.tsx`, `src/lib/validations.ts`, `src/messages/de.json`
- Expected behavior: Event-Labels und Fehlermeldungen über Translation-Keys
- Verification: Build erfolgreich, Verlauf zeigt korrekte Labels
- Dependencies: MT-1

#### MT-3: Auth-Pages — Strings extrahieren
- Goal: Login, Set-Password Formulare internationalisieren
- Files: `src/app/login/login-form.tsx`, `src/app/auth/set-password/set-password-form.tsx`, `src/messages/de.json`
- Expected behavior: Auth-Texte über Translation-Keys
- Verification: Login-Seite zeigt korrekte Texte
- Dependencies: MT-1

#### MT-4: EN + NL Übersetzungen erstellen
- Goal: Alle Keys in en.json und nl.json übersetzen
- Files: `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: Vollständige Übersetzung aller UI-Texte
- Verification: Tenant mit language='en' sieht englische UI, language='nl' niederländische
- Dependencies: MT-1, MT-2, MT-3
