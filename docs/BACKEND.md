# Backend — StrategAIze Kundenplattform v1.0

> MVP-1 Backend: Auth, API Routes, Minimal Frontend (Vertical Slice)

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for Supabase stack)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.local.example .env.local
# Edit .env.local with your values (JWT_SECRET, POSTGRES_PASSWORD, etc.)

# 3. Start Supabase stack
docker compose up -d supabase-db supabase-auth supabase-rest supabase-kong

# 4. SQL files are auto-loaded by Postgres on first start:
#    - sql/schema.sql  -> docker-entrypoint-initdb.d/01_schema.sql
#    - sql/rls.sql     -> docker-entrypoint-initdb.d/02_rls.sql
#    - sql/functions.sql -> docker-entrypoint-initdb.d/03_functions.sql

# 5. Start Next.js dev server
npm run dev
```

### Environment Variables

All variables are documented in `.env.local.example`. Key ones:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Kong API Gateway URL (internal: `http://supabase-kong:8000`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT signed with `JWT_SECRET`, role=anon |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT signed with `JWT_SECRET`, role=service_role (server-only!) |
| `NEXT_PUBLIC_APP_URL` | Public app URL (for redirects, invite links) |

---

## Architecture Decisions

### 1. Supabase SSR (Cookie-based Auth)

- `@supabase/ssr` manages sessions via httpOnly cookies
- Three client types:
  - **Browser client** (`src/lib/supabase/client.ts`): For client components
  - **Server client** (`src/lib/supabase/server.ts`): For Server Components & Route Handlers (reads cookies)
  - **Admin client** (`src/lib/supabase/admin.ts`): service_role key, bypasses RLS (admin API routes only)
- Middleware (`src/middleware.ts`) refreshes session on every request

### 2. Source of Truth = question_events

- No "update answer" endpoint exists
- Every interaction creates a new append-only event
- "Current answer" is derived via `v_current_answers` SQL VIEW
- `client_event_id` (UUID) provides idempotency: `UNIQUE(run_id, client_event_id)`

### 3. runs.status Transitions

- Only via SECURITY DEFINER functions: `run_submit()`, `run_lock()`
- Tenant has no direct UPDATE access to `runs` (RLS)
- API routes call these functions; they validate internally

### 4. Invite-only Auth

- `GOTRUE_DISABLE_SIGNUP=true` — no self-registration
- Admin creates tenant, then invites user via `POST /api/admin/tenants/{id}/invite`
- GoTrue sends invite email with one-time token
- User clicks link -> `/auth/callback` -> sets password -> redirected to dashboard
- `handle_new_user()` trigger creates profile with tenant_id + role from metadata

### 5. RLS Everywhere

- Every table has Row Level Security enabled
- `auth.user_tenant_id()` and `auth.user_role()` helper functions
- Tenant can only see/insert own data
- Admin has full access

---

## API Routes

### Admin Routes (require `strategaize_admin` role)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/tenants` | List all tenants |
| POST | `/api/admin/tenants` | Create tenant |
| POST | `/api/admin/tenants/[tenantId]/invite` | Invite user to tenant |
| GET | `/api/admin/runs` | List all runs (optional `tenant_id`, `status` filters) |
| POST | `/api/admin/runs` | Create run for tenant |
| GET | `/api/admin/runs/[runId]` | Run details with questions + derived answers |
| PATCH | `/api/admin/runs/[runId]/lock` | Lock a run |

### Tenant Routes (require `tenant_owner` or `tenant_member` role)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tenant/runs` | List own runs |
| GET | `/api/tenant/runs/[runId]` | Run details with questions + derived answers |
| POST | `/api/tenant/runs/[runId]/questions/[questionId]/events` | Create event (answer, note, etc.) |
| GET | `/api/tenant/runs/[runId]/questions/[questionId]/events` | List events for a question |
| POST | `/api/tenant/runs/[runId]/submit` | Submit checkpoint |

### Public Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

---

## Pages

| Path | Description |
|------|-------------|
| `/login` | Login form (email + password) |
| `/auth/callback` | Invite token verification (redirect) |
| `/auth/set-password` | Set password after invite |
| `/dashboard` | Run overview (tenant sees own, admin sees all) |
| `/runs/[id]` | Run workspace — questions by block, answer form |

---

## Key Files

```
src/
  middleware.ts                    # Auth middleware (session refresh + route protection)
  lib/
    supabase/
      client.ts                   # Browser Supabase client
      server.ts                   # Server Supabase client (cookies)
      admin.ts                    # Service role client (bypasses RLS)
      middleware.ts               # Session update helper
    api-utils.ts                  # Auth guards (requireAdmin, requireTenant) + error helpers
    validations.ts                # Zod schemas for all API inputs
  app/
    api/
      health/route.ts             # Health check
      admin/
        tenants/route.ts          # GET + POST tenants
        tenants/[tenantId]/invite/route.ts  # POST invite
        runs/route.ts             # GET + POST runs
        runs/[runId]/route.ts     # GET run details
        runs/[runId]/lock/route.ts # PATCH lock
      tenant/
        runs/route.ts             # GET tenant runs
        runs/[runId]/route.ts     # GET tenant run details
        runs/[runId]/questions/[questionId]/events/route.ts  # GET + POST events
        runs/[runId]/submit/route.ts  # POST submit checkpoint
    auth/
      callback/route.ts           # Invite token verification
      set-password/page.tsx       # Set password form
    login/page.tsx                # Login form
    dashboard/page.tsx            # Dashboard (server component)
    dashboard/dashboard-client.tsx # Dashboard (client component)
    runs/[id]/page.tsx            # Run workspace (server component)
    runs/[id]/run-workspace-client.tsx  # Run workspace (client component)
sql/
  schema.sql                      # Tables + Views
  rls.sql                         # RLS Policies + Grants
  functions.sql                   # SECURITY DEFINER Functions + Triggers
```

---

## TODO: Next Features (PROJ-4..PROJ-8)

| ID | Feature | Key Work |
|----|---------|----------|
| PROJ-4 | Run Workspace (full) | Block navigation, question detail view, keyboard nav, progress persistence |
| PROJ-5 | Question Event Logging (full) | Event history UI, note_added UI, status_changed UI, activity timeline |
| PROJ-6 | Evidence Upload | File upload to Supabase Storage, MIME validation, SHA256, evidence_links UI |
| PROJ-7 | Run Submission | Submission dialog with validation summary, KO-check warnings, snapshot display |
| PROJ-8 | Admin Data Export | ZIP generation (manifest.json + answers.json + answer_revisions.json + evidence files) |

---

_Created during MVP-1 Backend implementation_
