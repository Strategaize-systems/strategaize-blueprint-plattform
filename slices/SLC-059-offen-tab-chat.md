# SLC-059 — Offen-Tab mit eingebettetem Chat

## Feature
FEAT-037 Unified Tabbed Workspace

## Goal
FreeformChat Component im "Offen"-Tab einbetten mit korrektem Sidebar-Verhalten und State-Erhaltung beim Tab-Wechsel.

## Scope
- FreeformChat im "Offen"-Tab einbetten (CSS hidden Container)
- Sidebar im Offen-Tab: sichtbar aber alle Blöcke eingeklappt
- Beim Tab-Wechsel zu "Offen": Blöcke automatisch einklappen
- Chat-State bleibt erhalten beim Tab-Wechsel (CSS hidden Pattern)
- "Chat beenden" Logik: triggert Mapping-Phase (Overlay kommt in SLC-061)

## Dependencies
- SLC-058 (Tab-Infrastruktur)

## Micro-Tasks

### MT-1: FreeformChat in Offen-Tab einbetten
- Goal: Chat-Component im Tab-Container rendern
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: FreeformChat wird im "offen" Tab-Container angezeigt. Props: runId, conversationId, onConversationCreated, onEndChat. Chat ist vollständig funktional (Text, Voice, Soft-Limit).
- Verification: Build erfolgreich, Chat sichtbar im Offen-Tab
- Dependencies: none

### MT-2: Sidebar-Verhalten im Offen-Tab
- Goal: Sidebar bei Tab-Wechsel zu "Offen" automatisch einklappen
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: Beim Wechsel zu activeTab="offen" werden alle Blöcke eingeklappt (openBlocks = new Set()). Beim Wechsel zu "questionnaire" bleibt der letzte Zustand erhalten. User kann Sidebar im Offen-Tab manuell aufklappen um Fortschritt zu prüfen.
- Verification: Tab-Wechsel klappt Blöcke ein/aus korrekt
- Dependencies: MT-1

### MT-3: FreeformChat Height-Anpassung
- Goal: Chat füllt verfügbaren Platz im Tab korrekt
- Files: `src/components/freeform/freeform-chat.tsx`
- Expected behavior: Chat nutzt flex-1 oder calc() um den verfügbaren Platz im Tab-Container zu füllen (nicht mehr Viewport-Höhe wie im Vollbild-Modus).
- Verification: Chat scrollt korrekt, kein Overflow
- Dependencies: MT-1

## Acceptance Criteria
- FreeformChat funktioniert eingebettet im Offen-Tab
- Voice Recording funktioniert
- Chat-Verlauf bleibt erhalten beim Tab-Wechsel
- Sidebar klappt automatisch zu beim Wechsel zu Offen
- Sidebar kann manuell aufgeklappt werden
