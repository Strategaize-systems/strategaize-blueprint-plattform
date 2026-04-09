# FEAT-037 — Unified Tabbed Workspace

## Problem Statement

Der aktuelle Blueprint Run-Workspace erzwingt eine Vorab-Entscheidung: Der Teilnehmer muss sich zwischen "Offenes Gespräch" und "Frage für Frage" entscheiden, bevor er beginnt. Danach ist er in einem separaten Vollbild-Screen gefangen. Das widerspricht der natürlichen Arbeitsweise — Teilnehmer wollen frei zwischen beiden Modi wechseln, zwischendurch Fragen prüfen, und erst am Ende strukturiert abgeben.

## Goal

Den Run-Workspace von einem Entweder-Oder-Modell zu einem integrierten Arbeitsbereich mit drei gleichwertigen Tabs umbauen. Der Teilnehmer soll jederzeit zwischen "Offen" und "Frage für Frage" wechseln können, ohne die Navigation verlassen zu müssen.

## Primary Users

- **Geschäftsführer / Owner** — bearbeitet den Management-Fragebogen (alle Blöcke)
- **Mirror-Respondenten** — bearbeiten den Mirror-Fragebogen (zugewiesene Blöcke)

Beide Nutzergruppen profitieren von der gleichen Workspace-Struktur.

## V3.3 Scope

### Was gebaut wird

#### 1. Drei-Tab-Layout im Run-Workspace

Drei horizontal angeordnete Tabs im Hauptbereich:

| Tab | Label | Status | Verhalten |
|-----|-------|--------|-----------|
| 1 | **Offen** | Aktiv | Free-Form Chat eingebettet |
| 2 | **Frage für Frage** | Aktiv | Bestehender Fragebogen mit Blöcken/Fragen |
| 3 | **Feedback** | Gesperrt | Platzhalter mit "Kommt bald"-Hinweis |

- Tabs sind jederzeit klickbar (außer Feedback)
- Aktiver Tab ist visuell hervorgehoben
- Tab-Wechsel behält den State beider Modi (Chat-Verlauf, ausgewählte Frage)

#### 2. Direkteinstieg ohne Mode-Selector

- User landet direkt im Workspace wenn er seinen Run öffnet
- Kein Auswahl-Screen, kein Zwischenschritt
- Default-Tab beim Einstieg: "Offen" (empfohlener Startpunkt)
- ModeSelector-Component wird nicht mehr als Screen verwendet
- QuestionOverview wird nicht mehr als Zwischenseite verwendet

#### 3. Tab "Offen" — Eingebetteter Free-Form Chat

- FreeformChat-Component eingebettet in den Tab-Bereich (nicht mehr Vollbild)
- Volle Funktionalität: Chat, Voice, Soft-Limit, Conversation-API
- Sidebar ist sichtbar aber eingeklappt (User kann Blöcke/Fragen-Status prüfen)
- Chat-Verlauf bleibt erhalten beim Tab-Wechsel

#### 4. Tab "Frage für Frage" — Erweiterter Fragebogen

- Bestehende Block/Fragen-Struktur bleibt exakt wie implementiert
- Sidebar bleibt wie implementiert (aufklappbare Blöcke mit Fragen)
- Innerer Bereich (Frage → Antwort/Chat/Evidence) bleibt unverändert
- **NEU:** Globales Auf-/Zuklappen aller Blöcke (Button "Alle öffnen" / "Alle schließen")
- Block-Submission (Abgabe pro Block) bleibt wie implementiert

#### 5. Tab "Feedback" — Platzhalter

- Tab ist sichtbar aber visuell als "nicht verfügbar" gekennzeichnet
- Klick zeigt Hinweis: "Dieser Bereich wird bald freigeschaltet"
- Keine Funktionalität — reiner Platzhalter für FEAT-036

#### 6. Mapping/Review als Vollbild-Overlay

- Wenn der Chat im "Offen"-Tab endet und Mapping startet: Vollbild-Review-Screen
- Chat bleibt im Hintergrund erhalten (State wird nicht gelöscht)
- User kann über "Zurück"-Button zurück zum Chat navigieren
- Erst bei "Akzeptieren" werden:
  - Antworten in die strukturierten Fragen übernommen
  - Chat-Verlauf und Review geleert
  - User kehrt zum Workspace zurück (kann neuen Chat starten oder Fragen prüfen)

### Was wegfällt

| Component/Screen | Grund |
|-----------------|-------|
| ModeSelector als Einstiegs-Screen | Wird durch direkten Workspace-Einstieg ersetzt |
| QuestionOverview als Zwischenseite | Wird durch Tab "Frage für Frage" ersetzt |
| Separate Vollbild-Screens für Chat | Wird durch eingebetteten Chat in Tab ersetzt |
| `workspaceMode === null` State | Kein Auswahl-Zustand mehr nötig |

### Was unverändert bleibt

- Alle API-Endpoints
- FreeformChat Component (Wiederverwendung, intern unverändert)
- MappingReview Component (Wiederverwendung, intern unverändert)
- Frage-für-Frage innerer Bereich
- Sidebar Grundstruktur und Navigation
- Voice Recording / Whisper
- LLM-Chat bei Einzelfragen
- Evidence Upload/Download
- Block-Submission

## Out of Scope

| Item | Grund |
|------|-------|
| Feedback-Funktionalität (FEAT-036) | Eigenes Feature, Tab ist nur Platzhalter |
| Compliance-differenzierte Datenweitergabe | Eigene Architektur-Entscheidung nötig (GF vs. Mirror) |
| Rollentrennung GF vs. Mirror Fragensicht | Separates Feature |
| Learning Center Content-Update | Content-Aufgabe, kein Code |
| Sidebar-Redesign | Sidebar bleibt wie sie ist |
| API-Änderungen | Kein Backend-Umbau nötig |
| Neue Datenbank-Tabellen | Kein Schema-Änderung nötig |

## User Stories

### US-1: Direkter Workspace-Einstieg
**Als** Teilnehmer
**möchte ich** direkt im Workspace landen wenn ich meinen Run öffne
**damit** ich sofort anfangen kann ohne eine Modus-Auswahl treffen zu müssen.

**Akzeptanzkriterien:**
- Run-Seite zeigt direkt den Workspace mit Tabs
- Kein Mode-Selector Screen wird angezeigt
- Default-Tab ist "Offen"

### US-2: Tab-Navigation
**Als** Teilnehmer
**möchte ich** jederzeit zwischen "Offen" und "Frage für Frage" wechseln können
**damit** ich flexibel zwischen freiem Erzählen und strukturiertem Beantworten wechseln kann.

**Akzeptanzkriterien:**
- Drei Tabs sind sichtbar: Offen, Frage für Frage, Feedback
- Klick auf Tab wechselt den aktiven Bereich
- Chat-Verlauf bleibt erhalten beim Wechsel zu "Frage für Frage" und zurück
- Ausgewählte Frage und Antwort-State bleiben erhalten beim Wechsel zu "Offen" und zurück
- Feedback-Tab zeigt "Kommt bald"-Hinweis

### US-3: Eingebetteter Free-Form Chat
**Als** Teilnehmer
**möchte ich** im "Offen"-Tab frei über mein Unternehmen erzählen können
**damit** das System meine Antworten automatisch den richtigen Fragen zuordnet.

**Akzeptanzkriterien:**
- Chat ist vollständig funktional im Tab (Text, Voice, Soft-Limit)
- Sidebar ist sichtbar aber eingeklappt
- Sidebar kann aufgeklappt werden um Fortschritt zu prüfen

### US-4: Globales Block-Collapse
**Als** Teilnehmer
**möchte ich** alle Blöcke gleichzeitig auf- oder zuklappen können
**damit** ich schnell einen Überblick bekomme oder alles aufräumen kann.

**Akzeptanzkriterien:**
- "Alle öffnen" Button klappt alle Blöcke in der Sidebar auf
- "Alle schließen" Button klappt alle Blöcke zu
- Einzelnes Auf-/Zuklappen funktioniert weiterhin

### US-5: Mapping/Review mit Rückkehr-Option
**Als** Teilnehmer
**möchte ich** nach dem Chat die Zuordnungen prüfen und bei Bedarf zum Chat zurückkehren können
**damit** ich Ergänzungen machen kann bevor ich die Antworten endgültig übernehme.

**Akzeptanzkriterien:**
- Mapping/Review erscheint als Vollbild-Screen
- "Zurück"-Button führt zurück zum Chat (Chat-Verlauf erhalten)
- "Akzeptieren" übernimmt Antworten, leert Chat und Review
- Nach Akzeptieren: Workspace mit aktualisierten Fragen

### US-6: Gesperrter Feedback-Tab
**Als** Teilnehmer
**sehe ich** einen "Feedback"-Tab der noch nicht verfügbar ist
**damit** ich weiß, dass später ein Feedback-Bereich kommt.

**Akzeptanzkriterien:**
- Tab ist sichtbar, visuell als gesperrt erkennbar
- Klick zeigt kurzen Hinweis
- Keine Funktionalität

## Constraints

- **Kein Backend-Umbau** — reine Frontend-Arbeit
- **Wiederverwendung** — bestehende Components nutzen, nicht neu schreiben
- **Style Guide v2** — Tabs und Layout konsistent mit bestehendem Design
- **Performance** — Tab-Wechsel muss sofort reagieren (kein Neuladen)
- **Mobile** — Tabs müssen auf mobilen Viewports funktional bleiben

## Risks / Assumptions

| Typ | Beschreibung |
|-----|-------------|
| Risk | `run-workspace-client.tsx` ist bereits ~1500 Zeilen — Tab-Logik muss sauber extrahiert werden |
| Assumption | FreeformChat Component funktioniert eingebettet genau wie im Vollbild |
| Assumption | Sidebar-Collapse-State und Chat-State können parallel existieren |
| Risk | Tab-State muss den Mapping/Review-Overlay-Zustand korrekt handhaben |

## Success Criteria

1. User landet direkt im Workspace — kein Auswahl-Screen
2. Drei Tabs sichtbar, zwei funktional, einer als Platzhalter
3. Free-Form Chat funktioniert eingebettet im "Offen"-Tab
4. Tab-Wechsel behält State in beiden Modi
5. Mapping/Review funktioniert als Vollbild mit Rückkehr-Option
6. Globales Block-Collapse funktioniert in Sidebar
7. Keine API-Änderungen nötig
8. Keine Regressionen im bestehenden Fragebogen-Workflow

## Delivery Mode

SaaS (unverändert)

## Version

V3.3

## Next Step

`/architecture`
