# FEAT-023 — In-App Learning Center: Hilfe-Button + Navigation (DE/EN/NL)

## Metadaten

- **ID:** FEAT-023
- **Version:** V2.1
- **Priorität:** P0
- **Status:** planned
- **Backlog:** BL-042
- **Erstellt:** 2026-04-01

## Zusammenfassung

Ein dauerhaft sichtbarer Hilfe-Button im Tenant-Bereich (Dashboard + Workspace), der ein Learning Center als Sheet-Panel von rechts öffnet. Das Learning Center ist die Container-Struktur für Video-Tutorials (FEAT-024) und Bedienungsanleitung (FEAT-025).

## Problem

Kunden haben keinen In-App-Zugang zu Hilfe-Inhalten. Bei Fragen müssen sie Strategaize kontaktieren. Es gibt keinen zentralen Ort für Tutorials, Anleitungen oder Dokumentation innerhalb der eingeloggten Plattform.

## Lösung

### Hilfe-Button

- Floating Button (unten rechts) auf allen Tenant-Seiten
- Sichtbar auf: Dashboard (`/dashboard`) und Workspace (`/runs/[id]`)
- Icon: Fragezeichen oder Buch-Icon (Lucide)
- Unaufdringlich, aber erkennbar
- Z-Index über dem Content, unter Modals

### Learning Center Panel

- Öffnet als Sheet-Komponente (shadcn/ui) von rechts
- Breite: ~480px Desktop, Full-Screen auf Mobile (< 768px)
- Tab-Navigation oben: **Videos** | **Anleitung**
- Scrollbar innerhalb des Panels
- Schließbar via: X-Button, Escape-Taste, Klick auf Overlay

### i18n

- Alle UI-Texte (Tab-Labels, Button-Text, Überschriften) über next-intl
- Neue Message-Keys unter `learning.*` Namespace in de.json, en.json, nl.json
- Inhalte (Videos, Anleitung) werden separat sprachgesteuert (FEAT-024, FEAT-025)

### Responsiveness

- Desktop: Sheet 480px Breite, Push-Overlay
- Tablet: Sheet 100% Breite unter 1024px
- Mobile: Full-Screen-Overlay unter 768px

## Akzeptanzkriterien

1. Hilfe-Button ist auf `/dashboard` und `/runs/[id]` sichtbar
2. Klick öffnet Sheet-Panel mit Tab-Navigation (Videos + Anleitung)
3. Panel zeigt UI-Texte in Tenant-Sprache (DE/EN/NL)
4. Panel ist auf Desktop (1440px), Tablet (768px) und Mobile (375px) nutzbar
5. Schließen per X, Escape oder Klick außerhalb funktioniert
6. Kein Layout-Shift im darunterliegenden Content beim Öffnen/Schließen
7. Button stört keine bestehende Interaktion (kein Overlap mit Submit-Buttons)

## Technische Hinweise

- Verwendet bestehende `Sheet`-Komponente aus `/src/components/ui/sheet.tsx`
- Hilfe-Button als eigene Komponente: `/src/components/help-button.tsx`
- Learning Center Panel als eigene Komponente: `/src/components/learning-center.tsx`
- State-Management: lokaler React-State (open/closed, activeTab)
- Keine DB-Anbindung nötig
- Keine Auth-Änderung nötig (Button nur im eingeloggten Bereich)

## Abhängigkeiten

- Keine Abhängigkeit von anderen V2.1-Features (ist die Grundstruktur)
- FEAT-024 und FEAT-025 hängen von dieser Struktur ab

## Out of Scope

- Kontextsensitive Hilfe (Tooltip an einzelnen UI-Elementen)
- Chat-Bot oder Support-Integration
- Admin-Interface zum Bearbeiten von Hilfe-Inhalten
- Tracking welche Hilfe-Inhalte der User gesehen hat
