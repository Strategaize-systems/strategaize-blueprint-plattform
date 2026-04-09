# SLC-061 — Mapping/Review als Vollbild-Overlay

## Feature
FEAT-037 Unified Tabbed Workspace

## Goal
Mapping/Review-Flow als Vollbild-Overlay über dem Workspace implementieren mit Rückkehr-Option zum Chat und State-Clearing bei Accept.

## Scope
- `showMappingOverlay` State einführen
- Mapping-Trigger: Chat "beenden" → Mapping-API → Overlay öffnen
- MappingReview Component als Overlay-Content (wiederverwendet)
- "Zurück zum Chat" Button: Overlay schließen, Chat-State erhalten
- "Akzeptieren" Flow: Antworten übernehmen, Chat + Review State leeren, loadRun()
- Mapping-Loading-State im Overlay anzeigen
- Cleanup: alte Mapping-Phase-Logik (freeformPhase "mapping"/"review") vereinfachen

## Dependencies
- SLC-058 (Tab-Infrastruktur)
- SLC-059 (Offen-Tab mit Chat)

## Micro-Tasks

### MT-1: showMappingOverlay State + Overlay-Shell
- Goal: Overlay-Container der über dem gesamten Workspace liegt
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: `showMappingOverlay` State. Wenn true: fixed overlay (inset-0, z-50, bg-white) über dem Workspace. Schließen-Button. Workspace darunter bleibt gemountet (Chat-State erhalten).
- Verification: Overlay öffnet/schließt, Workspace darunter unverändert
- Dependencies: none

### MT-2: Mapping-Trigger + Loading im Overlay
- Goal: Chat "beenden" triggert Mapping-API und zeigt Loading im Overlay
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: `onEndChat` Callback von FreeformChat setzt showMappingOverlay=true und triggert mapping API (POST /freeform/map). Loading-Spinner im Overlay während API-Call. Error-Handling mit Retry-Option.
- Verification: Mapping-Loading sichtbar im Overlay, API wird aufgerufen
- Dependencies: MT-1

### MT-3: MappingReview im Overlay + Accept-Flow
- Goal: Mapping-Ergebnisse reviewen und akzeptieren
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: MappingReview Component rendert im Overlay nach erfolgreichem Mapping. "Zurück" schließt Overlay (Chat erhalten). "Akzeptieren" ruft accept-API, leert Chat-State (messages, conversationId, mappingResult), schließt Overlay, triggert loadRun() für aktualisierte Antworten.
- Verification: Accept-Flow funktioniert end-to-end, State wird korrekt geleert
- Dependencies: MT-1, MT-2

### MT-4: Alte Phase-Logik aufräumen
- Goal: Nicht mehr benötigte freeformPhase-Logik entfernen
- Files: `src/app/runs/[id]/run-workspace-client.tsx`
- Expected behavior: `freeformPhase` State vereinfachen oder entfernen. Alte conditional returns für mapping/review Screens entfernen (jetzt Overlay). useEffect für mapping-Trigger in Overlay-Logik integriert.
- Verification: Build erfolgreich, keine toten Code-Pfade
- Dependencies: MT-3

## Acceptance Criteria
- Chat "beenden" öffnet Mapping-Overlay
- Loading-State sichtbar während Mapping
- MappingReview zeigt Zuordnungen im Overlay
- "Zurück zum Chat" schließt Overlay, Chat-Verlauf erhalten
- "Akzeptieren" übernimmt Antworten, leert Chat + Review
- Nach Accept: Workspace mit aktualisierten Fragen
- Keine Regressionen im bestehenden Mapping-Flow
