# Export / Sync Data Contract v1.0

> Basiert auf: StrategAIze_Export_Sync_Data_Contract_v1.0.docx
>
> **Scope:** Produkt 1 (Kundenplattform) -> interne Verarbeitung
> **Zweck:** Stabiles, reproduzierbares Datenaustauschformat.
> **Prinzip:** Kundenplattform liefert Rohdaten + Metadaten; Scoring/Bewertung erfolgt intern.
> **Source of Truth im Export:** `answer_revisions.json` (= vollständiger Event-Log aus `question_events`)
> **Derived Convenience:** `answers.json` (= letzte Antwort pro Frage, berechnet aus Events)
> **Consumer:** StrategAIze internes Analysesystem
> **Format:** ZIP-Archiv mit JSON-Dateien + binären Evidence-Dateien
> **Trigger:** `run_status = 'submitted'` oder manuell via Admin

---

## 1. Einheiten / Objekte im Exportpaket

| Objekt | Beschreibung | SoT/Derived | MVP-1 |
|--------|-------------|:-----------:|:-----:|
| `run` | Run-Metadaten | — | Ja |
| `question_catalog_snapshot` | Version/Hash des Fragenkatalogs | — | Ja |
| `questions_meta` | Pro Frage: block/ebene/flags/weights | — | Ja |
| `answer_revisions` | **Vollständiger Event-Log (SOURCE OF TRUTH)** | **SoT** | Ja |
| `answers` | Letzte Antwort pro Frage (berechnet aus Events) | **Derived** | Ja |
| `evidence_items` | Dateien/Artefakte + Metadaten | SoT | Ja |
| `evidence_links` | Zuordnung Evidence -> Frage/Run mit Relation | SoT | Ja |
| `submissions` | Checkpoint-Historie | SoT | Ja |
| `conversation_logs` | Transkripte (Whisper) | SoT | MVP-2 |

---

## 2. ID-Konventionen (Pflicht)

| ID | Beschreibung |
|----|-------------|
| `tenant_id` | Mandant (UUID) |
| `run_id` | Durchlauf (UUID) |
| `question_id` | Stabil aus Blueprint Master, z.B. `F-BP-001` |
| `evidence_id` | UUID pro Evidence-Item |
| `contract_version` | `'v1.0'` |

---

## 3. Paketstruktur

```
export_{tenantId}_{runId}_{yyyyMMdd_HHmmss}.zip
+-- manifest.json
+-- run.json
+-- question_catalog_snapshot.json
+-- questions_meta.json
+-- answer_revisions.json              <-- SOURCE OF TRUTH
+-- answers.json                       <-- DERIVED (latest per question)
+-- evidence/
|   +-- index.json
|   +-- {evidence_id}/{original_file_name}
+-- evidence_links.json
+-- submissions.json
```

---

## 4. Dateispezifikationen

### `manifest.json`

```json
{
  "contract_version": "v1.0",
  "exported_at": "2026-02-23T14:35:00Z",
  "exported_by": "admin@strategaize.com",
  "tenant_id": "uuid",
  "tenant_name": "Acme GmbH",
  "run_id": "uuid",
  "run_title": "Q1 2026 Strategy Assessment",
  "run_status": "submitted",
  "blueprint_version": "1.0",
  "catalog_snapshot_hash": "sha256...",
  "total_questions": 73,
  "total_answers_derived": 45,
  "total_events": 120,
  "total_evidence_items": 12,
  "total_submissions": 2,
  "files": ["manifest.json", "run.json", "..."]
}
```

### `run.json`
Run-Metadaten.

### `question_catalog_snapshot.json`
Katalog-Version und Hash.

### `questions_meta.json`
Array aller 73 Fragen mit allen Metadaten (block, ebene, flags, weights).

### `answer_revisions.json` — SOURCE OF TRUTH
**Vollständiger append-only Event-Log** — alle `question_events`, sortiert nach `created_at` aufsteigend. Dies ist die einzige Daten-Wahrheit.

```json
[
  {
    "id": "uuid",
    "question_id": "F-BP-001",
    "run_id": "uuid",
    "tenant_id": "uuid",
    "event_type": "answer_submitted|note_added|evidence_attached|status_changed",
    "payload": {},
    "created_at": "ISO 8601",
    "created_by": "uuid"
  }
]
```

### `answers.json` — DERIVED (Convenience Snapshot)
**Abgeleitete aktuelle Antwort pro Frage.** Berechnet als `payload.text` des jüngsten `answer_submitted` Events pro `question_id`. Enthält NIE Daten, die nicht auch in `answer_revisions.json` stehen.

```json
[
  {
    "tenant_id": "uuid",
    "run_id": "uuid",
    "question_id": "F-BP-001",
    "answer_text": "Wir verkaufen konkret...",
    "answered_at": "ISO 8601",
    "answer_source": "platform_input",
    "created_by": "uuid",
    "derived_from_event_id": "uuid"
  }
]
```

> **Kein Tenant hat dieses Feld je direkt geschrieben.** Es ist eine serverseitige Berechnung.

### `evidence/index.json`
Evidence-Metadaten inkl. Labels, MIME, SHA256.

### `evidence_links.json`
Alle Verknüpfungen mit `link_type`, `link_id`, `relation`.

### `submissions.json`
Checkpoint-Historie.

---

## 5. Delta-/Update-Regeln

| Objekt | Regel |
|--------|-------|
| **Events (SoT)** | Append-only. Jedes neue `answer_submitted` Event ist ein neuer Datensatz. Der Tenant überschreibt nie. |
| **Answers (derived)** | `answers.json` zeigt den jüngsten Stand pro Frage. Wird zur Export-Zeit aus Events berechnet. |
| **Evidence** | Append-only; neue Version = neues `evidence_id`; `relation='supersedes'` auf Vorgänger. |
| **Run locked** | Keine Änderungen mehr. |

---

## 6. Validierung (Minimum Checks)

- [ ] `contract_version` bekannt (v1.0)
- [ ] Alle `question_id` Werte existieren im `questions_meta` Snapshot
- [ ] Alle `evidence_links` referenzieren vorhandene `evidence_id`
- [ ] `mime_type` Whitelist: pdf, docx, xlsx, png, jpg
- [ ] Max file size: 200 MB
- [ ] Optional: SHA256 Integritätsprüfung
- [ ] Jeder Eintrag in `answers.json` hat ein korrespondierendes Event in `answer_revisions.json`

---

## 7. Security / DSGVO (Minimal)

- Tenant-scoped Pfade/URIs, keine Vermischung zwischen Mandanten
- Audit-Felder: `created_by` / Zeitstempel auf allen Objekten
- Evidence-Dateien werden aus Supabase Storage (self-hosted) in das ZIP gestreamt
- Keine externen Dienste involviert (alles Hetzner-lokal)

---

## 8. Versionierung

| Feld | Wert | Beschreibung |
|------|------|-------------|
| `contract_version` | `"v1.0"` | Wird bei Breaking Changes erhöht |
| `blueprint_version` | `"1.0"` | Version des Exit Ready Blueprint Master |
| `snapshot_version` | Integer 1, 2, 3... | Pro-Run Submission-Zähler |
| `catalog_snapshot.hash` | SHA256 | Prüfsumme des Fragenkatalogs |

---

## MVP-2 Erweiterungen

- **Audio:** `evidence_items.item_type` erhält `'audio'`; Whisper (self-hosted) transkribiert async
- **Conversation Logs:** Neues Objekt `conversation_logs` im Exportpaket

---

## Explizite Annahmen

> **[ANNAHME]** Export wird on-demand generiert. Timeout 30s für MVP-1.
> **[ANNAHME]** Dateien werden aus Supabase Storage (self-hosted) in das ZIP gestreamt.
> **[ANNAHME]** `created_by` UUIDs werden im Export NICHT zu Namen aufgelöst.

---

_Updated by /requirements skill on 2026-02-23_
