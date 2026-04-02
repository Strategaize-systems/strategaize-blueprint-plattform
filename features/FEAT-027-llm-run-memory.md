# FEAT-027 — LLM Run Memory (DE/EN/NL)

## Metadaten

- **ID:** FEAT-027
- **Version:** V2.2
- **Priorität:** P0
- **Status:** planned
- **Erstellt:** 2026-04-02

## Zusammenfassung

Das LLM schreibt nach jeder Interaktion ein kurzes Memory-Update, das auf dem Server gespeichert wird. Bei der nächsten Session wird das Memory als System-Kontext geladen. Das LLM kann anknüpfen, offene Punkte aufgreifen und konsistentere Rückfragen stellen.

## Problem

Chat-History ist aktuell client-side only — bei Seiten-Reload oder neuem Login ist alles weg. Das LLM startet bei jeder Session bei Null, obwohl der Owner vielleicht gestern 2 Stunden gearbeitet hat. Für einen Fragebogen, der über Tage/Wochen bearbeitet wird, ist das ein massiver Bruch in der Benutzererfahrung.

## Lösung

### Memory-Konzept

**Was:** Eine kuratierte Zusammenfassung (max 500-800 Tokens), die das LLM selbst schreibt und die den "Wissensstand" des LLM über den Owner und seinen Run repräsentiert.

**Wer schreibt:** Das LLM selbst — nach jeder Chat-Interaktion wird ein separater "Memory Update" Call gemacht, in dem das LLM sein bisheriges Memory mit den neuen Erkenntnissen aktualisiert.

**Was drin steht:**
- Zusammenfassung der Kernthemen aus bisherigen Antworten
- Erkannte Muster und Schwerpunkte
- Offene Punkte und geplante Rückfragen
- Kontext der letzten Interaktion
- Beobachtungen zum Antwortstil

**Was NICHT drin steht:**
- Rohe Antworten (sind in `question_events`)
- Vollständige Chat-Histories (zu groß)
- Evidence-Inhalte (separat abrufbar)

### Memory-Lifecycle

```
1. Owner startet Chat zu einer Frage
2. System lädt: Memory (DB) + Owner-Profil (DB) + Question + Evidence
3. LLM antwortet mit Rückfrage
4. Owner antwortet
5. LLM antwortet erneut
6. [... Chat geht weiter ...]
7. Owner verlässt die Frage oder schließt den Browser
8. System sendet Memory-Update-Request an LLM:
   Input: bisheriges Memory + aktuelle Chat-Zusammenfassung
   Output: aktualisiertes Memory (max 800 Tokens)
9. Aktualisiertes Memory wird in DB gespeichert
10. Nächste Session: Memory wird aus DB geladen und injiziert
```

### Memory-Update-Prompt (neuer 5. Prompt-Typ)

```
Du bist ein Memory-Manager für einen M&A Exit-Readiness-Berater.
Aktualisiere das folgende Memory basierend auf der neuen Konversation.

Regeln:
- Halte das Memory unter 800 Tokens
- Behalte nur strategisch relevante Informationen
- Lösche Redundanzen
- Notiere offene Punkte, die noch angesprochen werden sollten
- Beobachte Antwortmuster des Kunden

BISHERIGES MEMORY:
{memory}

NEUE KONVERSATION:
{chatSummary}

AKTUALISIERTES MEMORY:
```

### Memory-Anzeige für Owner

- Sichtbar im Workspace (z.B. als ausklappbarer Bereich oder im Learning Center)
- Read-Only — Owner kann lesen, aber nicht bearbeiten
- Überschrift: "Was die KI sich gemerkt hat" / "What the AI remembers" / "Wat de AI heeft onthouden"
- Einfache Textanzeige des Memory-Inhalts

### Token-Budget-Management

| Kontext-Teil | Budget |
|-------------|--------|
| Owner-Profil | ~300-500 Tokens |
| Run Memory | ~500-800 Tokens |
| Question + Metadaten | ~100-200 Tokens |
| Evidence (linked) | ~500-2000 Tokens |
| Chat-History (Session) | ~1000-3000 Tokens |
| **Total System-Kontext** | **~2500-6500 Tokens** |
| Verbleibend für Antwort | ~25K+ Tokens |

Bei Qwen 2.5 14B (32K Context) ist das komfortabel. Falls Evidence-Kontext zu groß wird (viele Dokumente), muss eine Zusammenfassung statt Volltext injiziert werden.

## Akzeptanzkriterien

1. Memory wird nach jeder Chat-Interaktion automatisch aktualisiert
2. Bei erneutem Login enthält der LLM-Kontext das Memory
3. LLM zeigt Kontinuität (referenziert frühere Antworten/Themen)
4. Memory-Anzeige ist für Owner sichtbar
5. Token-Budget wird eingehalten (keine Qualitätsverschlechterung)
6. Memory funktioniert über Tage/Wochen
7. Memory ist pro Run isoliert

## Technische Hinweise

- DB: neue Tabelle `run_memory` (run_id, memory_text, updated_at) oder JSON-Spalte auf `runs`
- Backend: neuer Prompt-Typ "Memory Update" in `src/lib/llm.ts`
- Backend: Memory-Update nach Chat-Response (async, non-blocking)
- Backend: Memory laden in Chat- und Generate-Routes
- Frontend: Memory-Anzeige-Komponente im Workspace
- Token-Monitoring: Logging der tatsächlichen Token-Nutzung pro Request

## Abhängigkeiten

- FEAT-026 (Owner-Profil) — Memory und Profil werden zusammen in Prompts injiziert
- Bestehende LLM-Integration (src/lib/llm.ts)
- Bestehende Chat-Route

## Out of Scope

- Chat-History-Persistierung (Memory ersetzt das effektiver)
- Cross-Run Memory (verschiedene Runs sind unabhängig)
- Memory-Bearbeitung durch Owner
- Automatische Memory-Bereinigung / Vergessen
