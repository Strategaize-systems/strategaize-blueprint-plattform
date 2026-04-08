# FEAT-035 — Free-Form Chat mit LLM-Mapping auf strukturierte Fragen

## Status
- Phase: requirements
- Version: V3.2
- Priority: P0 (V3.2 Kern-Feature)
- Discovery: RPT-043

## Problem Statement

Mirror-Teilnehmer (Führungskräfte, Abteilungsleiter, Schlüsselmitarbeiter) werden eingeladen, einen strukturierten Fragebogen zu beantworten — oft zu einem Tool, das sie nicht kennen, für einen Prozess, den sie nicht initiiert haben. Der aktuelle Frage-für-Frage-Modus zwingt sie in ein starres Format: Frage auswählen → Chat öffnen → antworten → nächste Frage.

Das ist unnatürlich. Die meisten Menschen — insbesondere in einer Interviewsituation — können besser erzählen als Formulare ausfüllen. Gleichzeitig enthalten freie Erzählungen oft emotionale, persönliche oder unkontrollierte Aussagen, die nicht 1:1 als Antwort taugen.

## Goal

Einen offenen Gesprächsmodus schaffen, in dem der Teilnehmer frei mit dem LLM spricht. Das LLM führt das Gespräch aktiv, lenkt es thematisch über die relevanten Fragebogenthemen und mappt am Ende die gewonnenen Erkenntnisse automatisch auf die strukturierten Fragen. Dabei werden alle Aussagen in sachliche, professionelle Draft-Antworten übersetzt — unabhängig davon, wie emotional oder persönlich der Input war.

## Primary Users

### Primär: Mirror-Teilnehmer
- L1 (Geschäftsführung/C-Level), L2 (Bereichsleitung), KS (Schlüsselmitarbeiter)
- Kennen die Plattform nicht oder kaum
- Haben begrenzte Zeit und Motivation
- Sollen frei und ehrlich antworten können, ohne Angst vor Rückverfolgbarkeit
- Sehen nur die ihnen zugewiesenen Blöcke

### Sekundär: Geschäftsführer / Tenant-Owner
- Können Free-Form als Alternative zum Frage-für-Frage-Modus nutzen
- Sehen alle 73 Fragen (9 Blöcke)
- Profitieren wenn sie lieber erzählen als ausfüllen

## Feature Scope

### FS-01: Modus-Auswahl im Workspace

Der Workspace bietet zwei Modi:
- **Fragebogen-Modus** (bestehend): Frage auswählen → Chat → Antworten
- **Free-Form Modus** (neu): Offenes Gespräch → automatisches Mapping

Der Teilnehmer wählt den Modus beim Einstieg in den Workspace. Er kann jederzeit wechseln.

### FS-02: Fragen-Übersicht vor Gesprächsstart

Bevor der Free-Form Chat startet, sieht der Teilnehmer eine Übersicht seiner zugewiesenen Fragen/Blöcke. Er weiß, welche Themen abgedeckt werden sollen. Free-Form wird als komfortabler Weg präsentiert, diese Fragen zu beantworten — nicht als Black Box.

Elemente:
- Block-Liste mit Themen (z.B. "Block A — Geschäftsmodell & Markt")
- Anzahl Fragen pro Block
- Welche Fragen bereits beantwortet sind (falls vorhanden)
- CTA "Gespräch starten"

### FS-03: Free-Form Chat Gespräch

Das LLM führt ein offenes Gespräch mit dem Teilnehmer:

- **Gesprächsstart:** LLM begrüßt den Teilnehmer, stellt sich kurz vor, erklärt den Ablauf (frei erzählen, System ordnet zu) und stellt eine offene Einstiegsfrage
- **Gesprächsführung:** LLM steuert thematisch durch die relevanten Blöcke, stellt offene Fragen, hakt bei oberflächlichen Aussagen nach
- **Profilkontext:** LLM nutzt Owner-Profil oder Mirror-Profil für personalisierte Ansprache (Du/Sie, Führungsstil, DISC-Typ)
- **Memory-Integration:** Run-Memory wird genutzt und nach Gespräch aktualisiert
- **Voice-Kompatibilität:** Whisper-Spracheingabe funktioniert im Free-Form Modus identisch zum bestehenden Chat

Kein Mapping während des Gesprächs. Das LLM konzentriert sich auf gute Gesprächsführung.

### FS-04: Soft-Limit bei ~30 Nachrichten

Nach ca. 30 Nachrichten (≈15 Frage-Antwort-Paare) gibt das LLM eine klare, professionelle Empfehlung:

- Deutliche Begründung: die Zusammenfassungsqualität leidet ab diesem Punkt
- Klare Empfehlung: jetzt einen Cut machen, Ergebnisse überarbeiten, dann ggf. neues Gespräch
- Angebot: 1-2 weitere Antworten wenn gerade passend, aber danach Cut
- Kein weiches "vielleicht sollten wir..." — professionelle Berater-Empfehlung
- Kein hartes Abbrechen — wenn der Teilnehmer weitermacht, ist die Verantwortung bei ihm

### FS-05: Conversation Storage

Eigene Tabelle für Free-Form-Gesprächsverläufe:
- Run-Referenz
- Teilnehmer-Referenz
- Gesprächsverlauf (Messages Array oder JSONB)
- Status (active, mapping_pending, mapped, closed)
- Timestamps
- Conversation-Nummer (ein Teilnehmer kann mehrere Gespräche führen)

### FS-06: LLM-Mapping nach Gesprächsende

Nach Abschluss des Gesprächs (Teilnehmer sagt "fertig" oder akzeptiert den Cut):

1. Gesamtes Gespräch wird an das LLM geschickt mit dem vollständigen Fragenkatalog (nur zugewiesene Blöcke/Fragen)
2. LLM analysiert: welche Gesprächsinhalte betreffen welche Fragen?
3. LLM generiert pro erkannter Frage eine Draft-Antwort
4. **Neutralisierungslayer:** Alle Draft-Antworten werden sachlich, professionell und entpersonalisiert formuliert — unabhängig vom Ton des Inputs:
   - Emotionale Aussagen → sachliche Einordnung
   - Schuldzuweisungen → strukturelle Beobachtung
   - Namentliche Nennungen → Rollenbezeichnung (z.B. "der Vorgesetzte", "die Abteilungsleitung")
   - Persönliche Meinungen → beobachtungsbasierte Aussagen
5. Output: Liste von {question_id, draft_answer_text, confidence, source_segments}

### FS-07: Mapping-Review UI

Nach dem Mapping sieht der Teilnehmer eine Übersicht:
- Welche Fragen wurden aus dem Gespräch erkannt
- Draft-Antwort pro Frage (neutralisiert)
- Confidence-Indikator (wie sicher ist die Zuordnung)
- Aktionen pro Draft-Antwort:
  - **Übernehmen** — Draft wird als `answer_submitted` Event gespeichert (Append)
  - **Bearbeiten** — Teilnehmer kann Draft anpassen vor dem Speichern
  - **Verwerfen** — Draft wird nicht gespeichert
- "Alle übernehmen" Bulk-Aktion
- Hinweis bei bereits beantworteten Fragen: "Diese Frage hat bereits eine Antwort. Der Draft wird als Ergänzung hinzugefügt."

### FS-08: Antwort-Speicherung (Append)

Übernommene Draft-Antworten werden als reguläre `answer_submitted` Events in `question_events` gespeichert:
- Gleiche Struktur wie manuell eingegebene Antworten
- `payload.source: "freeform"` als Marker (damit Herkunft nachvollziehbar)
- `payload.conversation_id` als Referenz zum Gespräch
- Append-Only: bestehende Antworten werden nicht überschrieben
- `v_current_answers` zeigt automatisch die neueste Antwort

### FS-09: Block-gefilterter Katalog für Mirror

Mirror-Teilnehmer:
- LLM bekommt nur Fragen aus zugewiesenen Blöcken (via `member_block_access`)
- Gesprächsführung beschränkt sich auf diese Themen
- Mapping findet nur auf zugewiesene Fragen statt

Geschäftsführer / Tenant-Owner:
- LLM bekommt alle 73 Fragen
- Voller Fragenkatalog als Mapping-Ziel

### FS-10: i18n (DE/EN/NL)

Alle neuen UI-Elemente dreisprachig:
- Modus-Auswahl
- Fragen-Übersicht vor Start
- Chat-UI im Free-Form Modus
- Mapping-Review UI
- Soft-Limit Hinweis
- Status-Meldungen

Freiform-Prompt dreisprachig (Gesprächsführung in Tenant-Sprache).

## Out of Scope

- Automatische Evidence-Verknüpfung aus Gespräch (V3.3+)
- Multi-Session Free-Form / Gespräch pausieren und fortsetzen (V3.3+)
- Echtzeit-Block-Fortschrittsbalken während des Gesprächs (V3.3+)
- Conversation Analytics für Admin (V4)
- Automatische Antwort-Finalisierung ohne Review-Step (V4)
- Rollentrennung: tenant_member nicht mehr auf Management-Fragebogen (separates Feature)
- Feedback-Schleife nach Fragebogen-Abschluss (FEAT-036)
- Demo-Beispiel für User Guide (nach Implementation, /user-guide Skill)

## Constraints

- **DSGVO:** Alle Daten bleiben auf Hetzner (EU). Keine externen Dienste außer AWS Bedrock (eu-central-1 Frankfurt). Gesprächsverläufe werden serverseitig gespeichert (RLS-geschützt).
- **Token-Budget:** Freiform-System-Prompt mit Fragenkatalog (~5.800 Tokens) + Profil (~400) + Memory (~400) + Chat-History (wachsend, ~200-300 Tokens pro Nachrichtenpaar) = ~8.600+ Tokens pro Call. Innerhalb Claude Sonnet 4.6 Budget (200K).
- **Bestehende Architektur:** Append-only Events, RLS, Rollen-System müssen respektiert werden. Kein Breaking Change an bestehenden Datenstrukturen.
- **Bestehende LLM-Funktionen:** `chatWithLLM()`, `buildOwnerContext()`, `buildMirrorContext()`, `updateRunMemory()` werden wiederverwendet bzw. erweitert — nicht ersetzt.

## Risks

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Mapping-Qualität unzureichend | Mittel | Hoch | Empirische QA mit Testgesprächen. Prompt-Iteration. Confidence-Score als Indikator. |
| Token-Kosten höher als erwartet | Niedrig | Mittel | Monitoring. Soft-Limit reduziert Gesprächslänge. Batch-Mapping statt Echtzeit spart Calls. |
| Neutralisierung lässt persönliche Details durch | Niedrig | Hoch | Explizite Prompt-Regeln. QA-Tests mit provokativem Input. |
| Teilnehmer versteht Modus-Auswahl nicht | Niedrig | Niedrig | Klare UI, kurze Erklärung, jederzeit wechselbar. |

## Success Criteria

1. Mirror-Teilnehmer kann ein Free-Form Gespräch führen und daraus werden korrekte Draft-Antworten für seine zugewiesenen Fragen generiert
2. Draft-Antworten sind sachlich und professionell — auch bei emotionalem Input
3. Keine persönlichen Namen oder Schuldzuweisungen in Draft-Antworten
4. Teilnehmer kann jeden Draft einzeln übernehmen, bearbeiten oder verwerfen
5. Übernommene Drafts erscheinen als reguläre Antworten im Fragebogen
6. Bestehende Antworten werden durch Free-Form nicht überschrieben (Append)
7. Soft-Limit verhindert unkontrolliert lange Gespräche
8. Geschäftsführer kann denselben Modus mit vollem Fragenkatalog nutzen
9. Voice-Eingabe funktioniert im Free-Form Modus
10. Alle UI-Elemente in DE/EN/NL verfügbar

## Acceptance Criteria (pro Feature-Scope)

### FS-01: Modus-Auswahl
- [ ] Workspace zeigt Toggle oder Auswahl: Fragebogen-Modus / Free-Form Modus
- [ ] Wechsel zwischen Modi jederzeit möglich
- [ ] Bestehende Fragebogen-Funktion bleibt unverändert

### FS-02: Fragen-Übersicht
- [ ] Vor Gesprächsstart: Block-Liste mit Themen und Fragenanzahl sichtbar
- [ ] Bereits beantwortete Fragen markiert
- [ ] CTA "Gespräch starten" startet den Chat

### FS-03: Free-Form Chat
- [ ] LLM begrüßt Teilnehmer, erklärt Ablauf, stellt Einstiegsfrage
- [ ] LLM steuert thematisch durch zugewiesene Blöcke
- [ ] Profil-Kontext wird genutzt (Anrede, Führungsstil)
- [ ] Memory wird genutzt und aktualisiert
- [ ] Whisper-Spracheingabe funktioniert

### FS-04: Soft-Limit
- [ ] Nach ~30 Nachrichten: klare Berater-Empfehlung zum Cut
- [ ] Begründung: Zusammenfassungsqualität leidet
- [ ] Nutzer kann 1-2 Nachrichten weitermachen
- [ ] Kein hartes Abbrechen

### FS-05: Conversation Storage
- [ ] Gespräch wird in eigener Tabelle gespeichert
- [ ] RLS auf tenant_id
- [ ] Mehrere Gespräche pro Teilnehmer/Run möglich
- [ ] Status-Tracking (active → mapping_pending → mapped → closed)

### FS-06: LLM-Mapping
- [ ] Gesamtes Gespräch wird nach Abschluss als Batch gemappt
- [ ] Nur zugewiesene Fragen als Mapping-Ziel (Mirror: Block-Filter)
- [ ] Draft-Antworten sind neutralisiert und professionell
- [ ] Keine persönlichen Namen in Drafts
- [ ] Keine Schuldzuweisungen in Drafts
- [ ] Confidence-Score pro Mapping

### FS-07: Mapping-Review
- [ ] Übersicht aller erkannten Fragen mit Draft-Antworten
- [ ] Einzeln: Übernehmen / Bearbeiten / Verwerfen
- [ ] Bulk: "Alle übernehmen"
- [ ] Hinweis bei bereits beantworteten Fragen (Ergänzung, nicht Überschreibung)
- [ ] Confidence-Indikator sichtbar

### FS-08: Antwort-Speicherung
- [ ] Übernommene Drafts als `answer_submitted` Events gespeichert
- [ ] `payload.source: "freeform"` Marker
- [ ] `payload.conversation_id` Referenz
- [ ] Append-Only (keine Überschreibung)
- [ ] `v_current_answers` zeigt neueste Antwort

### FS-09: Block-Filter
- [ ] Mirror: nur Fragen aus zugewiesenen Blöcken im Kontext
- [ ] GF: alle 73 Fragen im Kontext
- [ ] Mapping beschränkt auf verfügbare Fragen

### FS-10: i18n
- [ ] Alle neuen UI-Texte in DE/EN/NL
- [ ] Freiform-Prompt in Tenant-Sprache
- [ ] Soft-Limit Hinweis in Tenant-Sprache

## Delivery Mode

SaaS Product — volle QA-Tiefe, Neutralisierung ist Compliance-relevant.

## Dependencies

- Bestehende Chat-Infrastruktur (llm.ts, chatWithLLM, Bedrock)
- Bestehende Profil-Infrastruktur (owner_profiles, mirror_profiles)
- Bestehende Memory-Infrastruktur (run_memory, updateRunMemory)
- Bestehende Block-Zugriffskontrolle (member_block_access)
- Bestehende Event-Sourcing-Infrastruktur (question_events)
- Bestehende i18n-Infrastruktur (next-intl, DE/EN/NL Messages)
- Bestehende Whisper-Integration (Voice Input)
