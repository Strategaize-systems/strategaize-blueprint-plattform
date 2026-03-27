# SLC-015 — Block-basierte Checkpoints

## Feature
Checkpoint-System von "pro Run" auf "pro Block" umstellen

## Priority
High — Grundlage fuer den Block-fuer-Block Review-Workflow mit Kunden

## Scope
Checkpoints beziehen sich auf einzelne Bloecke (A-I), nicht auf den gesamten Run.
Jeder Block kann separat eingereicht werden. Das Checkpoint-Panel zeigt nur
Checkpoints des aktiven Blocks.

## Micro-Tasks

### MT-1: DB Migration — block Column + Function Update
- Goal: run_submissions bekommt block Column, run_submit() akzeptiert p_block
- Files: sql/migrations/003_block_checkpoints.sql (neu), sql/functions.sql (Referenz)
- Expected behavior:
  - ALTER TABLE run_submissions ADD COLUMN block text NOT NULL DEFAULT 'ALL'
  - UNIQUE constraint: (run_id, block, snapshot_version)
  - run_submit() akzeptiert p_block Parameter
  - snapshot_version zaehlt pro run_id + block (nicht nur pro run_id)
  - Run status bleibt unveraendert (kein auto-submitted mehr bei Block-Submit)
- Dependencies: none

### MT-2: API Update — Submit + GET mit Block-Parameter
- Files: submit/route.ts, submissions/route.ts
- Expected behavior:
  - POST akzeptiert { note?, block } — block ist required
  - GET akzeptiert ?block=A Query-Parameter (optional, filtert)
  - Response enthaelt block field
- Dependencies: MT-1

### MT-3: Frontend — Block-spezifische Checkpoints
- Files: run-workspace-client.tsx
- Expected behavior:
  - "Checkpoint einreichen" sendet aktiven Block mit
  - Checkpoints-Panel zeigt nur Checkpoints des aktiven Blocks
  - Checkpoint-Label zeigt Block + Anzahl beantworteter Fragen im Block
  - Wenn kein Block aktiv: "Block auswaehlen"
- Dependencies: MT-2
