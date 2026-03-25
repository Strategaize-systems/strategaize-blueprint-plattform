# PROJ-3: Tenant — Login & Dashboard

## Status: Planned
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

## Dependencies
- Requires: PROJ-1 (Auth & Tenant-Verwaltung) — Auth-System, Einladungs-Flow und Rollen muessen vorhanden sein

## User Stories
- Als eingeladener Tenant-User moechte ich meine Einladung annehmen und ein Passwort setzen, damit ich mich auf der Plattform einloggen kann.
- Als Tenant-User moechte ich mich mit E-Mail und Passwort einloggen, damit ich auf meine Assessment-Runs zugreifen kann.
- Als Tenant-User moechte ich auf meinem Dashboard alle zugewiesenen Runs mit Titel und Status sehen, damit ich weiss, was zu tun ist.
- Als Tenant-User moechte ich den Fortschritt pro Run sehen (wie viele der 73 Fragen beantwortet, wie viel Evidence), damit ich priorisieren kann.
- Als Tenant-User moechte ich mich sicher ausloggen koennen.

## Acceptance Criteria
- [ ] Einladungslink oeffnet die Passwort-setzen-Seite (`/auth/set-password`); nach Passwort-Setzen Redirect zum Dashboard
- [ ] Es gibt KEINE `/auth/register` Seite — Zugang nur ueber Einladung
- [ ] Login-Seite unter `/login` akzeptiert E-Mail + Passwort; bei Erfolg Redirect zu `/dashboard` via `window.location.href` (nicht `router.push`)
- [ ] Dashboard unter `/dashboard` zeigt alle Runs des authentifizierten Tenants
- [ ] Jede Run-Karte zeigt: Titel, Status-Badge (`Collecting` / `Submitted` / `Locked`), Fragen-Anzahl (z.B. 73), beantwortete Fragen, Evidence-Count
- [ ] `answered_count` wird aus `question_events` abgeleitet: Anzahl der Fragen mit mindestens einem `answer_submitted` Event
- [ ] Runs mit `status = 'locked'` sind visuell abgegrenzt (ausgegraut, "Abgeschlossen"-Label)
- [ ] Empty State wenn keine Runs zugewiesen: "Es wurden noch keine Assessment-Runs fuer Sie bereitgestellt."
- [ ] Logout-Button beendet die Supabase-Session und leitet zu `/login` weiter
- [ ] Unauthentifizierte User auf `/dashboard` werden zu `/login` weitergeleitet
- [ ] Tenant sieht NUR Runs der eigenen `tenant_id` (RLS)

## Edge Cases
- Einladungslink abgelaufen (>24h)? -> Fehlerseite: "Dieser Einladungslink ist abgelaufen. Bitte kontaktieren Sie StrategAIze fuer eine neue Einladung."
- Falsche Credentials? -> "Ungueltige E-Mail oder Passwort."
- Keine Runs zugewiesen? -> Empty State auf Dashboard.
- Session abgelaufen? -> Naechster API-Call gibt 401; Redirect zu `/login` mit "Ihre Sitzung ist abgelaufen."
- Tenant versucht Admin-Route zu besuchen? -> Middleware gibt 403, Redirect zu `/dashboard`.
- User navigiert direkt zu `/auth/register`? -> 404 oder Redirect zu `/login` (Seite existiert nicht).

## Technical Requirements
- Auth: Supabase GoTrue (self-hosted auf Hetzner) mit `@supabase/ssr` (Cookie-basierte Sessions)
- `window.location.href` fuer Post-Login Redirect (nicht `router.push`)
- Loading States auf Login-Formular (Button disabled waehrend Request)
- `answered_count` und Fortschritt werden serverseitig aus `question_events` berechnet (abgeleitete Werte, kein gespeicherter Zaehler)
- Browser Support: Chrome, Firefox, Safari (letzte 2 Versionen)
- Hosting: Self-hosted auf Hetzner + Coolify + Docker Compose (kein Vercel, kein Supabase Cloud)

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)

### Acceptance Criteria Status

#### AC-1: Einladungslink oeffnet Passwort-setzen-Seite (/auth/set-password)
- [x] Callback route at `src/app/auth/callback/route.ts` verifies OTP
- [x] On invite type, redirects to `/auth/set-password`
- [x] Set-password page exists at `src/app/auth/set-password/page.tsx`
- [x] Uses `supabase.auth.updateUser({ password })` to set password
- [x] After success, redirects to `/dashboard` via `window.location.href`
- [x] Client-side validation: minimum 8 characters, password confirmation match
- [x] Loading state on submit button

#### AC-2: Es gibt KEINE /auth/register Seite
- [x] No `src/app/auth/register/` directory exists
- [x] No route matching `/auth/register` in the app

#### AC-3: Login-Seite unter /login
- [x] Login page exists at `src/app/login/page.tsx` with `LoginForm` component
- [x] Uses `supabase.auth.signInWithPassword({ email, password })`
- [x] On success, redirects to `/dashboard` via `window.location.href` (not router.push -- correct per spec)
- [x] Verifies `data.session` exists before redirecting
- [x] Loading state disabled on button during request
- [x] Error states handled: authError message, missing session, catch block
- [x] Loading reset in `finally` block (all code paths)
- [x] Wrapped in `<Suspense>` for useSearchParams

#### AC-4: Dashboard unter /dashboard zeigt alle Runs
- [x] Dashboard page at `src/app/dashboard/page.tsx` (server component, checks auth)
- [x] Redirects to /login if no user
- [x] Loads profile, passes to `DashboardClient`
- [x] `DashboardClient` fetches from `/api/tenant/runs` (or `/api/admin/runs` for admin)
- [x] RLS ensures tenant isolation on server side

#### AC-5: Jede Run-Karte zeigt Titel, Status-Badge, Fragen-Anzahl, beantwortete Fragen, Evidence-Count
- [x] Run card shows: title, status badge (Collecting/Submitted/Locked), description
- [x] Shows `answered_count / question_count` with progress bar and percentage
- [x] Shows evidence_count
- [x] Shows submitted_at date when available

#### AC-6: answered_count wird aus question_events abgeleitet
- [x] `GET /api/tenant/runs` queries `v_current_answers` view with count for answered_count
- [x] `v_current_answers` is a derived VIEW from question_events (not a stored counter)

#### AC-7: Locked Runs sind visuell abgegrenzt
- [x] `statusColor` returns "outline" for locked runs
- [x] `statusLabel` returns "Gesperrt" for locked status
- [ ] BUG-P3-1: Locked runs are not visually "ausgegraut" (greyed out) as spec requires. They use an "outline" badge variant but the card itself has no opacity/greyed-out styling. Spec says "ausgegraut, Abgeschlossen-Label" but label says "Gesperrt" not "Abgeschlossen".

#### AC-8: Empty State wenn keine Runs zugewiesen
- [x] Empty state card shown when `runs.length === 0`
- [ ] BUG-P3-2: Empty state text for tenants reads "Noch keine Runs zugewiesen. Bitte warten Sie auf eine Zuweisung durch StrategAIze." but spec requires exact text "Es wurden noch keine Assessment-Runs fuer Sie bereitgestellt."

#### AC-9: Logout-Button beendet Session
- [x] Logout button calls `supabase.auth.signOut()`
- [x] Redirects to `/login` via `window.location.href`

#### AC-10: Unauthentifizierte User auf /dashboard werden zu /login weitergeleitet
- [x] Middleware checks `supabase.auth.getUser()` and redirects if no user
- [x] Dashboard server component also checks and redirects

#### AC-11: Tenant sieht NUR Runs der eigenen tenant_id (RLS)
- [x] `GET /api/tenant/runs` uses user session supabase client (not admin)
- [x] RLS policy `tenant_select_own_runs` restricts to own tenant_id

### Edge Cases Status

#### EC-1: Einladungslink abgelaufen
- [x] Callback error redirects to `/login?error=...`
- [x] Login form displays `callbackError` in Alert component
- [ ] BUG-P3-3: No specific "expired" error page; spec says "Fehlerseite: Dieser Einladungslink ist abgelaufen..."

#### EC-2: Falsche Credentials
- [x] Error message from Supabase displayed: typically "Invalid login credentials"
- [ ] BUG-P3-4: Error message is Supabase's English default, not the spec-required German "Ungueltige E-Mail oder Passwort."

#### EC-3: Keine Runs zugewiesen
- [x] Empty state rendered (see AC-8)

#### EC-4: Session abgelaufen
- [x] Middleware refreshes session on each request; if expired, redirects to /login
- [ ] BUG-P3-5: No explicit "Ihre Sitzung ist abgelaufen" message. User is silently redirected to login without explanation.

#### EC-5: Tenant versucht Admin-Route zu besuchen
- [ ] BUG-P3-6: Middleware does NOT enforce admin-only routes. There is no path check for `/admin/*` or `/api/admin/*` in the middleware. The middleware only checks auth (logged in vs not). The admin check happens in API routes via `requireAdmin()`, which returns 403 JSON -- but for page routes, there are no admin-only page routes yet, so this is a potential gap if admin pages are added later.

#### EC-6: User navigiert zu /auth/register
- [x] No such route exists; Next.js will serve 404

### Security Audit Results

- [x] Authentication enforced via middleware + server component checks
- [x] `window.location.href` used for post-login redirect (not router.push) -- prevents state issues
- [x] Session verification via `supabase.auth.getUser()` (server-side, not just getSession)
- [x] No sensitive data exposed in client bundle (service_role key only server-side)
- [x] Password field uses `type="password"` with autocomplete attributes
- [ ] BUG-P3-7 (Low/Security): Login error message directly displays Supabase error text, which could leak implementation details (e.g., "Database error", "Auth service unavailable"). Should normalize error messages.

### Bugs Found

#### BUG-P3-1: Locked runs not greyed out in dashboard
- **Severity:** Low
- **Location:** `src/app/dashboard/dashboard-client.tsx`
- **Steps to Reproduce:**
  1. View dashboard with a locked run
  2. Expected: Card is greyed out with "Abgeschlossen" label
  3. Actual: Same card styling with "Gesperrt" badge, no opacity change
- **Priority:** Fix in next sprint

#### BUG-P3-2: Empty state text does not match spec
- **Severity:** Low
- **Location:** `src/app/dashboard/dashboard-client.tsx`, line 127
- **Steps to Reproduce:**
  1. View dashboard with no runs
  2. Expected: "Es wurden noch keine Assessment-Runs fuer Sie bereitgestellt."
  3. Actual: "Noch keine Runs zugewiesen. Bitte warten Sie auf eine Zuweisung durch StrategAIze."
- **Priority:** Nice to have

#### BUG-P3-3: No dedicated expired invite link error page
- **Severity:** Low
- **Location:** `src/app/auth/callback/route.ts`
- **Steps to Reproduce:**
  1. Click expired invite link
  2. Expected: Dedicated error page with specific expired message
  3. Actual: Generic redirect to /login with error param
- **Priority:** Fix in next sprint

#### BUG-P3-4: Login error messages not in German
- **Severity:** Low
- **Location:** `src/app/login/login-form.tsx`
- **Steps to Reproduce:**
  1. Enter wrong credentials
  2. Expected: "Ungueltige E-Mail oder Passwort."
  3. Actual: Supabase English error message (e.g., "Invalid login credentials")
- **Priority:** Fix in next sprint

#### BUG-P3-5: No session-expired message on redirect
- **Severity:** Low
- **Location:** `src/lib/supabase/middleware.ts`
- **Steps to Reproduce:**
  1. Session expires while on dashboard
  2. Expected: Redirect to /login with "Ihre Sitzung ist abgelaufen" message
  3. Actual: Silent redirect to /login without explanation
- **Priority:** Fix in next sprint

#### BUG-P3-6: Middleware does not enforce role-based route protection
- **Severity:** Medium
- **Location:** `src/lib/supabase/middleware.ts`
- **Steps to Reproduce:**
  1. Log in as tenant user
  2. Navigate to any future /admin/* page route
  3. Expected: Middleware returns 403 and redirects to /dashboard
  4. Actual: Middleware only checks authentication, not authorization. API routes are protected but page routes are not.
- **Note:** Currently no admin page routes exist, so impact is low. But this is an architecture gap.
- **Priority:** Fix before deployment

#### BUG-P3-7: Raw Supabase error messages exposed to users
- **Severity:** Low (Security)
- **Location:** `src/app/login/login-form.tsx`, line 41
- **Steps to Reproduce:**
  1. Trigger a database/auth error during login
  2. Expected: Generic error message
  3. Actual: Raw Supabase error string displayed
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 9/11 passed (AC-7 partial, AC-8 partial)
- **Bugs Found:** 7 total (0 critical, 0 high, 1 medium, 6 low)
- **Security:** 1 low-severity issue (error message leakage)
- **Production Ready:** CONDITIONALLY YES (with BUG-P3-6 fix for middleware role check)
- **Recommendation:** Fix BUG-P3-6 (middleware role protection) before deployment; remaining bugs are cosmetic/low priority

## Deployment
_To be added by /deploy_
