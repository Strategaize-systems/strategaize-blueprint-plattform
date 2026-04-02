# SLC-036 — Owner-Profil: Backend + Frontend

## Metadaten

- **ID:** SLC-036
- **Feature:** FEAT-026
- **Backlog:** BL-046
- **Version:** V2.2
- **Status:** planned
- **Priority:** High
- **Created:** 2026-04-02
- **Dependencies:** SLC-035 (DB-Schema)

## Ziel

Komplettes Owner-Profil-Feature: API-Route zum Laden/Speichern, Profil-Formular mit 5 Bereichen (persönlich, Anrede, Führungsstil, DISC, freie Vorstellung), Dashboard-Redirect wenn kein Profil existiert, Whisper-Integration im Freitext-Feld. Nach diesem Slice kann der Owner sein Profil ausfüllen und bearbeiten.

## Scope

- API Route: GET/PUT /api/tenant/profile
- Profil-Seite: /profile (Server + Client Component)
- Formular-Komponenten: LeadershipSelect, DiscSelect
- Dashboard-Redirect wenn kein Profil
- Whisper-Integration im Freitext-Feld (bestehende Mic-Logik wiederverwenden)
- i18n-Keys für alle Formular-Labels und Beschreibungen (DE/EN/NL)
- Profil-Link in Sidebar für späteres Bearbeiten

## Micro-Tasks

#### MT-1: Profil API-Route
- Goal: GET und PUT Endpunkt für Owner-Profil (Upsert)
- Files: `src/app/api/tenant/profile/route.ts`
- Expected behavior: GET liefert Profil oder 404, PUT erstellt/aktualisiert Profil. Auth via requireTenant(). Validierung der Eingaben.
- Verification: Build erfolgreich, API-Route existiert
- Dependencies: none (SLC-035 DB muss existieren)

#### MT-2: LeadershipSelect + DiscSelect Komponenten
- Goal: Wiederverwendbare Auswahl-Komponenten mit Beschreibungstexten
- Files: `src/components/profile/leadership-select.tsx`, `src/components/profile/disc-select.tsx`
- Expected behavior: Single-Select mit 5 bzw. 4 Optionen, jede Option hat Titel + Beschreibung, DISC hat Farbcode. Alle Texte via i18n.
- Verification: Build erfolgreich, Komponenten importierbar
- Dependencies: none

#### MT-3: Profil-Formular Seite
- Goal: Profil-Seite mit Server Component (Auth + Redirect) und Client Component (Formular)
- Files: `src/app/profile/page.tsx`, `src/app/profile/profile-form-client.tsx`
- Expected behavior: 5 Bereiche als Sections. Persönlich (Textfelder + Dropdowns), Anrede (Radio), Führungsstil (LeadershipSelect), DISC (DiscSelect), freie Vorstellung (Textarea + Mic-Button). Speichern-Button → PUT /api/tenant/profile → Redirect zu /dashboard.
- Verification: Build erfolgreich, Seite rendert
- Dependencies: MT-1, MT-2

#### MT-4: i18n-Keys für Profil
- Goal: Alle Formular-Labels, Führungsstil-Beschreibungen, DISC-Beschreibungen in DE/EN/NL
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: profile.* Namespace mit allen Keys konsistent in 3 Sprachen
- Verification: JSON valide, Keys konsistent
- Dependencies: none

#### MT-5: Dashboard-Redirect + Sidebar-Link
- Goal: Dashboard prüft ob Profil existiert und redirected wenn nicht. Sidebar zeigt Profil-Link.
- Files: `src/app/dashboard/page.tsx`, `src/app/dashboard/dashboard-client.tsx`
- Expected behavior: Kein Profil → redirect("/profile"). Profil vorhanden → normal. Sidebar hat Profil-Link.
- Verification: Build erfolgreich
- Dependencies: MT-1

## Akzeptanzkriterien

1. Owner wird bei erstem Login zum Profil geleitet
2. Alle 5 Bereiche sind ausfüllbar
3. Spracheingabe im Freitext-Feld funktioniert (Whisper)
4. Profil gespeichert und jederzeit bearbeitbar
5. Formular dreisprachig (DE/EN/NL)
6. Run-Zugriff ohne Profil nicht möglich
7. Build erfolgreich
