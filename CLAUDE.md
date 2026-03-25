# Strategaize Blueprint Plattform

## Purpose

Dieses Projekt wird über das Strategaize Dev System gesteuert. Das Dev System Repository (`strategaize-dev-system`) enthält alle Rules, Skills und Workflow-Definitionen.

> Self-hosted auf Hetzner. Kein Vercel, kein Supabase Cloud, keine externen Dienste.
> Deployment via Coolify + Docker Compose.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (copy-paste components)
- **Backend:** Supabase self-hosted (PostgreSQL + GoTrue Auth + Storage API) — required, nicht optional
- **Deployment:** Self-hosted auf Hetzner VM via Coolify + Docker Compose — KEIN Vercel
- **Validation:** Zod + react-hook-form
- **State:** React useState / Context API
- **AI-Services (nicht SoT, optional in MVP-1):** Dify (Orchestrierung), Ollama (lokales LLM), Whisper (Transkription, MVP-2)

## Core Principles

- **Source of Truth = Event-Log:** `question_events` ist die einzige Wahrheitsquelle für Antworten. "Aktuelle Antwort" wird serverseitig abgeleitet (jüngstes `answer_submitted` Event via SQL VIEW `v_current_answers`).
- **Append-only (Event-Tabellen):** `question_events`, `evidence_items`, `evidence_links`, `run_submissions` sind INSERT-only. Kein UPDATE, kein DELETE, kein UPSERT.
- **Status-managed:** `runs.status` wird nur serverseitig über definierte Endpoints geändert (collecting → submitted → locked).
- **Invite-only Auth:** Kein offener Self-Signup. Zugang nur über Admin-Einladung.
- **RLS mandatory:** PostgreSQL Row Level Security auf jeder Tabelle. Tenant-Isolation auf DB-Ebene.
- **Self-hosted:** Alle Dienste laufen auf Hetzner-VMs. Keine Daten verlassen die Infrastruktur.

## Project Structure

```
src/
  app/              Pages (Next.js App Router) + API Routes
  components/
    ui/             shadcn/ui components (NEVER recreate these)
  hooks/            Custom React hooks
  lib/              Utilities (supabase clients, api-utils, validations)
sql/
  schema.sql        Database tables + views
  rls.sql           RLS policies + grants
  functions.sql     SECURITY DEFINER functions
features/           Feature specifications
  INDEX.md          Feature status overview
slices/             Slice tracking
  INDEX.md          Slice status overview
docs/
  STATE.md          Current project state
  PRD.md            Product Requirements Document
  ARCHITECTURE.md   Technical architecture
  DATA_MODEL.md     Database schema & RLS policies
  API.md            API endpoints specification
  EXPORT.md         Export Data Contract v1.0
  BACKEND.md        Backend-specific notes
  DECISIONS.md      Key decisions log
  KNOWN_ISSUES.md   Known problems
  RELEASES.md       Release history
  MIGRATIONS.md     Schema/structural migrations
planning/
  roadmap.json      Version roadmap
  backlog.json      Work item backlog
```

## Build & Test Commands

```bash
npm run dev        # Development server (localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
npm run start      # Production server
```

## Workflow

Dieses Projekt folgt dem Strategaize Dev System Workflow:

1. `/discovery` (wenn Idee noch grob)
2. `/requirements`
3. `/architecture`
4. `/slice-planning`
5. `/frontend` und/oder `/backend` (pro Slice)
6. `/qa` (nach jedem Slice + Gesamt-QA)
7. `/final-check`
8. `/go-live`
9. `/deploy`
10. `/post-launch`

## Project Records

@docs/STATE.md
@docs/PRD.md
@features/INDEX.md

## Key Conventions

- **Feature IDs:** FEAT-001, FEAT-002, etc. (neue Strategaize-IDs)
- **Legacy Feature IDs:** PROJ-1 bis PROJ-8 (aus der lokalen Entwicklung, Referenz in features/)
- **Slice IDs:** SLC-001, SLC-002, etc.
- **Commits:** `feat(FEAT-XXX): description`, `fix(FEAT-XXX): description`
- **shadcn/ui first:** NEVER create custom versions of installed shadcn components
- **Single Responsibility:** One feature per spec file, one slice per implementation unit
- **Append-only tables:** NEVER generate UPDATE or DELETE statements for tenant event tables
- **Human-in-the-loop:** All workflows have user approval checkpoints
