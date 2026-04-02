# SLC-039 — Memory Frontend + Polish

## Metadaten

- **ID:** SLC-039
- **Feature:** FEAT-027
- **Backlog:** BL-049
- **Version:** V2.2
- **Status:** planned
- **Priority:** Medium
- **Created:** 2026-04-02
- **Dependencies:** SLC-038 (Memory Backend)

## Ziel

Memory-Anzeige für den Owner im Workspace, i18n-Keys für Memory-UI, und finaler Polish für V2.2 (Token-Budget-Check, Edge Cases). Nach diesem Slice ist V2.2 feature-complete.

## Scope

- Memory-Anzeige-Komponente (Read-Only, Collapsible)
- Integration in Workspace
- i18n-Keys für Memory-Anzeige (DE/EN/NL)
- Leer-Zustand wenn kein Memory existiert
- Profil-Link im Workspace (Sidebar oder Header)

## Micro-Tasks

#### MT-1: RunMemoryView Komponente
- Goal: Read-Only Anzeige des aktuellen Memory-Texts, collapsible
- Files: `src/components/learning-center/run-memory-view.tsx`
- Expected behavior: Lädt Memory via fetch GET /api/tenant/runs/[runId]/memory. Zeigt Text an. Leer-Zustand: "Die KI hat noch keine Notizen." Collapsible mit Chevron.
- Verification: Build erfolgreich, Komponente importierbar
- Dependencies: none

#### MT-2: i18n-Keys für Memory
- Goal: Übersetzungen für Memory-UI in DE/EN/NL
- Files: `src/messages/de.json`, `src/messages/en.json`, `src/messages/nl.json`
- Expected behavior: memory.* Namespace: title, emptyState, lastUpdated
- Verification: JSON valide, Keys konsistent
- Dependencies: none

#### MT-3: Integration in Workspace
- Goal: Memory-Anzeige im Workspace einbinden (z.B. im Learning Center Panel oder als eigener Bereich)
- Files: `src/app/runs/[id]/run-workspace-client.tsx`, ggf. `src/components/learning-center/learning-center-panel.tsx`
- Expected behavior: Memory-Anzeige erreichbar im Workspace. Zeigt aktuelles Memory für den aktiven Run.
- Verification: Build erfolgreich
- Dependencies: MT-1, MT-2

## Akzeptanzkriterien

1. Owner kann Memory im Workspace einsehen
2. Memory-Anzeige ist Read-Only
3. Leer-Zustand wird korrekt angezeigt
4. UI-Texte dreisprachig (DE/EN/NL)
5. Build erfolgreich
