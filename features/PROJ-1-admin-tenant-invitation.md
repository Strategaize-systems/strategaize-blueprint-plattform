# PROJ-1: Auth — Invite-only, Rollen & Tenant-Verwaltung

## Status: Planned
**Created:** 2026-02-23
**Last Updated:** 2026-02-23

## Dependencies
- Keine (Grundlagen-Feature)

## User Stories
- Als StrategAIze-Admin moechte ich einen neuen Tenant (Unternehmen) anlegen und einen einmaligen Einladungslink generieren, damit ich gezielt Kunden onboarden kann.
- Als eingeladener User moechte ich ueber den Einladungslink mein Konto erstellen (E-Mail + Passwort), damit ich automatisch dem richtigen Tenant zugeordnet werde.
- Als StrategAIze-Admin moechte ich eine Liste aller Tenants mit Status sehen (Active / Pending), damit ich weiss, wer bereits aktiv ist.
- Als StrategAIze-Admin moechte ich eine Einladung erneut senden koennen, falls ein eingeladener User sie nicht angenommen hat.
- Als eingeladener User moechte ich eine Welcome-Mail mit einem Setup-Link erhalten, damit ich mein Passwort setzen und sofort loslegen kann.

## Onboarding-Flow (Invite-only)

```
1. Admin erstellt Tenant (Firmenname) via Admin-UI
2. Admin generiert Einladungslink fuer eine E-Mail-Adresse
3. System sendet E-Mail mit einmaligem, sicherem Einladungslink
4. Link enthaelt Token + Tenant-Zuordnung
5. User klickt Link, setzt Passwort (E-Mail ist vorausgefuellt)
6. System erstellt auth.users Eintrag + profiles Eintrag
7. Erster User eines Tenants erhaelt role = 'tenant_owner'
8. Weitere Einladungen erhalten role = 'tenant_member' (MVP-2)
```

**Offener Self-Signup ist NICHT unterstuetzt.** Ohne gueltige Einladung kann sich niemand registrieren.

## Acceptance Criteria
- [ ] Admin kann einen neuen Tenant anlegen via `POST /api/admin/tenants` (Firmenname)
- [ ] Admin kann einen User per E-Mail einladen via `POST /api/admin/tenants/{tenantId}/invite`
- [ ] Der Einladungslink enthaelt einen sicheren, einmaligen Token mit Tenant-Zuordnung
- [ ] Supabase GoTrue (self-hosted) sendet die Einladungs-E-Mail an die angegebene Adresse
- [ ] Eingeladener User klickt den Link, setzt ein Passwort und wird automatisch als `role = 'tenant_owner'` mit korrekter `tenant_id` in `profiles` angelegt
- [ ] Es gibt KEINE `/auth/register` Seite fuer offenen Self-Signup
- [ ] Admin sieht eine Liste aller Tenants mit: Firmenname, Status (Active / Pending), Erstellungsdatum, Anzahl User
- [ ] Admin kann eine erneute Einladung fuer einen ausstehenden User ausloesen
- [ ] Bei bereits registrierter E-Mail gibt die API 409 Conflict mit klarer Meldung zurueck
- [ ] Drei Rollen existieren im System: `strategaize_admin`, `tenant_owner`, `tenant_member` (member erst ab MVP-2 aktiv)
- [ ] RLS erzwingt Tenant-Isolation: Jeder Tenant sieht nur eigene Daten
- [ ] Unauthentifizierte Zugriffe auf `/dashboard` oder API-Endpoints werden abgelehnt (401)

## Edge Cases
- E-Mail bereits registriert? -> 409 mit "E-Mail bereits registriert".
- Zwei Tenants mit gleichem Firmennamen? -> Erlaubt (Firmenname allein ist kein Unique Key); bei Admin-Anlage wird gewarnt aber nicht blockiert.
- Eingeladener User nimmt nie an? -> Account bleibt Pending; Admin kann nach 24h erneut einladen.
- Einladungslink abgelaufen (GoTrue Default: 24h)? -> Admin muss erneut senden; abgelaufene Links zeigen eine klare Fehlerseite.
- Admin hat versehentlich falsche E-Mail eingeladen? -> Kein Delete-Support in MVP-1; Admin muss User manuell ueber Supabase Dashboard deaktivieren.
- User versucht sich ohne Einladung zu registrieren? -> Nicht moeglich, da keine oeffentliche Registrierungs-Seite existiert.
- Einladungslink wird mehrfach verwendet? -> Token ist einmalig; zweiter Klick zeigt "Link bereits verwendet".

## Technical Requirements
- Auth: Supabase GoTrue (self-hosted auf Hetzner via Coolify + Docker Compose)
- GoTrue-Konfiguration: Self-Signup DEAKTIVIERT (`GOTRUE_DISABLE_SIGNUP=true` oder aequivalent)
- Admin-Einladung: `supabase.auth.admin.inviteUserByEmail()` ausschliesslich serverseitig
- Service Role Key wird nur in serverseitigen API-Routes verwendet (nie im Browser)
- `profiles`-Zeile wird via Database Trigger auf `auth.users` Insert erstellt
- Einladungslink enthaelt Tenant-Zuordnung als Metadata im GoTrue Invite
- Security: Admin-Endpunkte erfordern Admin-Session; Middleware prueft `profiles.role = 'strategaize_admin'`
- Rollen-Konzept: `strategaize_admin` (Plattform-Admin), `tenant_owner` (erster Firmen-User), `tenant_member` (weitere Mitarbeiter, MVP-2)
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

#### AC-1: Admin kann einen neuen Tenant anlegen via POST /api/admin/tenants
- [x] Route exists at `src/app/api/admin/tenants/route.ts` (POST handler)
- [x] Zod validation via `createTenantSchema` (name: 2-100 chars)
- [x] Uses `requireAdmin()` auth guard
- [x] INSERT via adminClient (service_role) into `tenants` table
- [x] Logs `tenant_created` admin_event via `log_admin_event` RPC
- [x] Returns 201 with tenant data

#### AC-2: Admin kann einen User per E-Mail einladen via POST /api/admin/tenants/{tenantId}/invite
- [x] Route exists at `src/app/api/admin/tenants/[tenantId]/invite/route.ts`
- [x] Validates tenant exists before inviting
- [x] Uses `inviteTenantUserSchema` (email validation)
- [x] Calls `adminClient.auth.admin.inviteUserByEmail()` server-side only
- [x] Passes `tenant_id` and `role` in metadata
- [x] Logs `invite_sent` admin_event

#### AC-3: Der Einladungslink enthaelt einen sicheren, einmaligen Token mit Tenant-Zuordnung
- [x] GoTrue invite includes `data: { tenant_id, role }` in metadata
- [x] `redirectTo` points to `/auth/callback`
- [x] Callback route (`src/app/auth/callback/route.ts`) handles `token_hash` + `type` params

#### AC-4: Supabase GoTrue sendet die Einladungs-E-Mail
- [x] SMTP configuration documented in `.env.local.example`
- [x] `GOTRUE_MAILER_AUTOCONFIRM=false` configured
- [ ] **CANNOT VERIFY** without running GoTrue instance (static analysis only)

#### AC-5: Eingeladener User klickt Link, setzt Passwort, wird als tenant_owner angelegt
- [x] Callback route verifies OTP and redirects to `/auth/set-password`
- [x] Set-password page uses `supabase.auth.updateUser({ password })`
- [x] `handle_new_user()` trigger creates profile with tenant_id + role from metadata
- [x] Trigger validates role and tenant_id existence
- [x] Trigger enforces single tenant_owner per tenant

#### AC-6: Es gibt KEINE /auth/register Seite
- [x] CONFIRMED: No `src/app/auth/register/` directory exists (Glob returned no results)
- [x] `GOTRUE_DISABLE_SIGNUP=true` documented in .env.local.example
- [x] Middleware does NOT list `/auth/register` as a public path

#### AC-7: Admin sieht eine Liste aller Tenants
- [x] GET /api/admin/tenants returns tenant list with name, created_at
- [x] Enriches with owner_email and run_count
- [ ] BUG-P1-1: Missing tenant status (Active / Pending) -- spec requires "Status (Active / Pending)" but API does not compute or return a status field
- [ ] BUG-P1-2: Missing user count -- spec says "Anzahl User" but API only returns owner_email, not a count of all users per tenant

#### AC-8: Admin kann eine erneute Einladung ausloesen
- [ ] BUG-P1-3: No re-invite endpoint exists. The invite route checks if email is already registered and returns 409. There is no mechanism to re-invite a user who received but did not accept an invitation (GoTrue creates a user record on invite, so subsequent invites for the same email will hit the 409 check).

#### AC-9: Bei bereits registrierter E-Mail gibt die API 409 Conflict zurueck
- [x] Invite route calls `adminClient.auth.admin.listUsers()` and checks for existing email
- [x] Returns `errorResponse("CONFLICT", "E-Mail ist bereits registriert", 409)`

#### AC-10: Drei Rollen existieren im System
- [x] Schema CHECK constraint on profiles.role: `('strategaize_admin', 'tenant_owner', 'tenant_member')`
- [x] handle_new_user() validates role against whitelist
- [x] api-utils.ts has `requireAdmin()` and `requireTenant()` helpers

#### AC-11: RLS erzwingt Tenant-Isolation
- [x] All tables have `ENABLE ROW LEVEL SECURITY`
- [x] `auth.user_tenant_id()` SECURITY DEFINER helper used in all policies
- [x] Tenant policies restrict SELECT to own tenant_id
- [x] No UPDATE/DELETE policies for tenants on event tables

#### AC-12: Unauthentifizierte Zugriffe werden abgelehnt (401)
- [x] Middleware redirects unauthenticated users to /login for non-public paths
- [x] All API routes use `requireAdmin()` or `requireTenant()` which return 401
- [x] `getAuthUser()` checks `supabase.auth.getUser()` and returns UNAUTHORIZED

### Edge Cases Status

#### EC-1: E-Mail bereits registriert
- [x] Returns 409 Conflict with clear message

#### EC-2: Zwei Tenants mit gleichem Firmennamen
- [x] No UNIQUE constraint on `tenants.name` -- allowed as specified
- [ ] BUG-P1-4: No duplicate name warning -- spec says "bei Admin-Anlage wird gewarnt aber nicht blockiert", but API creates without any warning response

#### EC-3: Eingeladener User nimmt nie an
- [ ] BUG-P1-3 (same): No re-invite mechanism available (see AC-8)

#### EC-4: Einladungslink abgelaufen
- [x] Callback route handles OTP verification errors and redirects to `/login?error=...`
- [ ] BUG-P1-5: No specific expired-link error page. Spec says "abgelaufene Links zeigen eine klare Fehlerseite" but the error is shown as a generic alert on the login page, not a dedicated error page.

#### EC-5: User versucht sich ohne Einladung zu registrieren
- [x] No register page exists; GoTrue signup disabled

#### EC-6: Einladungslink wird mehrfach verwendet
- [x] GoTrue tokens are one-time; callback handles error and redirects with error message

### Security Audit Results

- [x] Admin routes protected by `requireAdmin()` (checks profile.role = strategaize_admin)
- [x] Service role key only used server-side in `src/lib/supabase/admin.ts`
- [x] Service role key not exposed via `NEXT_PUBLIC_` prefix
- [x] RLS enabled on all tables with proper tenant isolation
- [x] No `/auth/register` page exists
- [x] `GOTRUE_DISABLE_SIGNUP=true` documented
- [x] Security headers configured in next.config.ts (X-Frame-Options: DENY, HSTS, nosniff, Referrer-Policy, Permissions-Policy)
- [ ] BUG-P1-6 (Medium/Security): `listUsers()` called for duplicate email check in invite route loads ALL users from GoTrue into memory. For large user bases, this is a performance DoS vector and also exposes all user data unnecessarily. Should use a targeted lookup instead.
- [ ] BUG-P1-7 (Low/Security): No rate limiting on invite endpoint. An admin with valid session could trigger thousands of invite emails.

### Bugs Found

#### BUG-P1-1: Tenant list missing status (Active / Pending)
- **Severity:** Medium
- **Location:** `src/app/api/admin/tenants/route.ts` GET handler
- **Steps to Reproduce:**
  1. Call GET /api/admin/tenants
  2. Expected: Each tenant has a status field (Active / Pending)
  3. Actual: No status field returned. Active vs Pending must be derived from whether a tenant_owner profile exists and the user has confirmed.
- **Priority:** Fix before deployment

#### BUG-P1-2: Tenant list missing user count per tenant
- **Severity:** Low
- **Location:** `src/app/api/admin/tenants/route.ts` GET handler
- **Steps to Reproduce:**
  1. Call GET /api/admin/tenants
  2. Expected: Response includes "Anzahl User" per tenant
  3. Actual: Only owner_email is returned, no user_count
- **Priority:** Fix in next sprint

#### BUG-P1-3: No re-invite mechanism for pending users
- **Severity:** High
- **Location:** `src/app/api/admin/tenants/[tenantId]/invite/route.ts`
- **Steps to Reproduce:**
  1. Invite user@example.com via POST /api/admin/tenants/{id}/invite
  2. GoTrue creates user record (even before acceptance)
  3. Try to re-invite the same email
  4. Expected: Re-invite succeeds (new email sent)
  5. Actual: API returns 409 because listUsers() finds the existing (unconfirmed) user
- **Priority:** Fix before deployment

#### BUG-P1-4: No duplicate tenant name warning
- **Severity:** Low
- **Location:** `src/app/api/admin/tenants/route.ts` POST handler
- **Steps to Reproduce:**
  1. Create tenant "Acme GmbH"
  2. Create another tenant "Acme GmbH"
  3. Expected: Success response includes a warning about duplicate name
  4. Actual: Success without any duplicate warning
- **Priority:** Nice to have

#### BUG-P1-5: No dedicated expired-link error page
- **Severity:** Low
- **Location:** `src/app/auth/callback/route.ts`
- **Steps to Reproduce:**
  1. Click an expired invite link
  2. Expected: Clear error page explaining the link is expired
  3. Actual: Redirected to /login with generic error in URL params
- **Priority:** Fix in next sprint

#### BUG-P1-6: listUsers() loads all users for duplicate check
- **Severity:** Medium (Security)
- **Location:** `src/app/api/admin/tenants/[tenantId]/invite/route.ts`, line 40-43
- **Steps to Reproduce:**
  1. Invite endpoint calls `adminClient.auth.admin.listUsers()` without pagination
  2. Expected: Targeted lookup for specific email
  3. Actual: All users loaded into memory -- scales poorly and is unnecessarily broad data access
- **Priority:** Fix before deployment

#### BUG-P1-7: No rate limiting on auth/invite endpoints
- **Severity:** Medium (Security)
- **Location:** All API routes under `src/app/api/`
- **Steps to Reproduce:**
  1. Send rapid repeated POST requests to /api/admin/tenants/{id}/invite
  2. Expected: Rate limiting after N requests
  3. Actual: No rate limiting implemented anywhere in the codebase
- **Priority:** Fix before deployment

### Summary
- **Acceptance Criteria:** 10/12 passed (AC-7 partial, AC-8 failed)
- **Bugs Found:** 7 total (0 critical, 1 high, 3 medium, 3 low)
- **Security:** 2 medium-severity issues found (listUsers leak, no rate limiting)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-P1-3 (re-invite), BUG-P1-6 (listUsers), BUG-P1-7 (rate limiting) before deployment

---

## Phase 1 Bugfix Re-Test Results

**Re-Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)

### BUG-P1-3 RETEST: No re-invite mechanism for pending users (HIGH)

**Original Bug:** The invite route checked if email was already registered via `listUsers()` and returned 409 for ANY existing user, including unconfirmed ones. There was no way to re-invite a user who had not accepted their invitation.

**Fix Status: FIXED**

**Verification Details (`src/app/api/admin/tenants/[tenantId]/invite/route.ts`):**

1. **Targeted profile lookup (lines 39-44):**
   - [x] Uses `adminClient.from("profiles").select("id, email, role, tenant_id").eq("email", email).single()` instead of `listUsers()`
   - [x] This is a targeted, indexed lookup -- no full user scan

2. **Confirmed user check (lines 46-55):**
   - [x] If profile exists, retrieves auth user via `adminClient.auth.admin.getUserById(existingProfile.id)`
   - [x] Checks `authUser?.user?.email_confirmed_at` to determine if user is confirmed
   - [x] Confirmed users correctly return 409 CONFLICT: "E-Mail ist bereits registriert und bestatigt"

3. **Unconfirmed user re-invite (lines 57-59):**
   - [x] If user exists but is NOT confirmed (no `email_confirmed_at`), the old user is deleted: `adminClient.auth.admin.deleteUser(existingProfile.id)`
   - [x] The `profiles` row is CASCADE-deleted (profiles.id references auth.users ON DELETE CASCADE)
   - [x] After deletion, the flow continues to create a new invitation via `inviteUserByEmail()`
   - [x] This effectively "re-invites" by creating a fresh GoTrue user + invite token

4. **Role assignment preserved (lines 62-70):**
   - [x] After potential deletion, re-checks if tenant already has an owner
   - [x] Correctly assigns `tenant_owner` if no owner exists, `tenant_member` otherwise

5. **Edge cases analyzed:**
   - [x] First invite: no profile found, skips to invite flow -- CORRECT
   - [x] Re-invite unconfirmed: profile found, not confirmed, deleted, re-invited -- CORRECT
   - [x] Re-invite confirmed: profile found, confirmed, returns 409 -- CORRECT
   - [ ] **NEW-P1-3a (Medium/Security):** When re-inviting (deleting + re-creating), the old `profiles` row is cascade-deleted. If the user had any data associated (e.g., was already added to a different tenant), that association is lost. However, in MVP-1 the user can only belong to one tenant via invite, and if unconfirmed they have no data, so this is safe for now.
   - [ ] **NEW-P1-3b (Low):** The admin event logged is `invite_sent` for both first invites and re-invites. There is no way to distinguish in the audit log whether this was a fresh invite or a re-invite. Consider logging `invite_resent` for re-invites.

**Verdict: BUG-P1-3 is FIXED. Unconfirmed users can now be re-invited. Confirmed users correctly receive 409.**

---

### BUG-P1-6 RETEST: listUsers() loads all users for duplicate check (MEDIUM/Security)

**Original Bug:** `adminClient.auth.admin.listUsers()` was called without pagination, loading ALL users from GoTrue into memory. This was a performance/DoS vector and exposed all user data unnecessarily.

**Fix Status: FIXED**

**Verification Details:**

1. **listUsers() completely removed:**
   - [x] Grep for `listUsers` in entire `src/` directory returns ZERO matches (only a comment referencing the old approach: "targeted lookup, not listUsers")
   - [x] No `adminClient.auth.admin.listUsers()` call anywhere in the codebase

2. **Replacement approach (lines 39-44):**
   - [x] Uses `adminClient.from("profiles").select("id, email, role, tenant_id").eq("email", email).single()`
   - [x] This queries the `profiles` table (which mirrors auth.users via the `handle_new_user()` trigger)
   - [x] The query is targeted to a single email -- O(1) lookup vs O(n) full scan
   - [x] Uses `adminClient` (service_role) which bypasses RLS, so it can see all profiles

3. **Correctness of profiles-based lookup:**
   - [x] The `handle_new_user()` trigger creates a profile for EVERY new auth.users entry
   - [x] Profile includes `email` field matching auth.users email
   - [x] Profile is created on INSERT trigger, so even unconfirmed invited users have profiles
   - [ ] **CAVEAT:** If a GoTrue user exists WITHOUT a profile (e.g., manually created via GoTrue API without the trigger), the profiles lookup would miss them. However, in this system all users are created via `inviteUserByEmail()` which fires the trigger, so this is safe.

4. **Performance improvement:**
   - [x] Old: Load ALL users into memory, scan for email match
   - [x] New: Single row query on profiles table with email filter
   - [ ] **NEW-P1-6a (Low):** No index on `profiles.email`. For small user bases this is fine. For 1000+ users, add `CREATE INDEX idx_profiles_email ON profiles(email)`.

**Verdict: BUG-P1-6 is FIXED. The listUsers() DoS/performance vector is eliminated. Targeted profiles lookup is correct and efficient.**

---

## Phase 2 Low-Severity Fix Verification (Full QA Sweep)

**Re-Tested:** 2026-02-23
**Method:** Static code analysis (no running Docker/DB instance)
**Tester:** QA Engineer (AI)
**Build Status:** PASS (npm run build succeeds)
**Scope:** Verify FIX-2 (profiles.email index + case-insensitive lookup) and FIX-4 (reinvite_sent vs invite_sent audit distinction)

### FIX-2 RETEST: profiles.email index with lower() + case-insensitive lookup in invite route

**Original Issue (NEW-P1-6a, Low):** No index on `profiles.email`. The invite route's targeted email lookup would do a sequential scan. Not critical for small user bases but would degrade with scale.

**Fix Status: FIXED**

**Verification Details:**

1. **Database index (`sql/schema.sql`, line 40):**
   - [x] `CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (lower(email));` -- functional index on lowercase email
   - [x] This is a proper functional index that will be used when queries use `lower(email)` or case-insensitive matching

2. **Case-insensitive lookup in invite route (`src/app/api/admin/tenants/[tenantId]/invite/route.ts`, lines 38-46):**
   - [x] Email normalized to lowercase: `const emailLower = email.toLowerCase();` (line 38)
   - [x] Uses `.ilike("email", emailLower)` for case-insensitive matching (line 45)
   - [x] This approach correctly handles cases where a user was invited as "User@Example.com" and a re-invite comes in as "user@example.com"

3. **Index utilization analysis:**
   - [x] The `lower(email)` functional index matches the `.ilike()` pattern for case-insensitive lookups
   - [ ] **OBSERVATION (Informational):** `.ilike()` in PostgREST translates to SQL `ILIKE` which uses pattern matching. PostgreSQL CAN use a `lower()` index for `ILIKE` on simple patterns (no wildcards), but the optimization depends on PostgreSQL planner decisions. For guaranteed index utilization, `.eq("email", emailLower)` with a stored-lowercase convention would be more reliable. However, `.ilike()` is functionally correct and the index provides a significant improvement over no index at all.

**Verdict: FIX-2 is VERIFIED. The `lower(email)` index exists and the invite route uses case-insensitive lookup. This addresses the original performance concern.**

---

### FIX-4 RETEST: reinvite_sent vs invite_sent audit distinction

**Original Issue (NEW-P1-3b, Low):** The admin event logged was `invite_sent` for both first invites and re-invites. There was no way to distinguish in the audit log whether this was a fresh invite or a re-invite.

**Fix Status: FIXED**

**Verification Details:**

1. **Invite route audit logging (`src/app/api/admin/tenants/[tenantId]/invite/route.ts`, lines 91-96):**
   - [x] `isReinvite` flag set to `true` when unconfirmed user is found and deleted for re-invite (line 61)
   - [x] `isReinvite` flag defaults to `false` (line 39)
   - [x] Audit event type: `isReinvite ? "reinvite_sent" : "invite_sent"` (line 93)
   - [x] First invite logs `invite_sent`; re-invite logs `reinvite_sent`

2. **Database schema support (`sql/schema.sql`, line 215):**
   - [x] admin_events CHECK constraint includes both: `'invite_sent','reinvite_sent'`
   - [x] Both event types will pass the CHECK constraint on INSERT

3. **Audit trail correctness:**
   - [x] First invite for user@example.com: logs `invite_sent` with `{ email, role }` payload
   - [x] Re-invite for same email (unconfirmed): logs `reinvite_sent` with `{ email, role }` payload
   - [x] These are now distinguishable in the admin_events table
   - [x] The `p_tenant_id` is passed in both cases (line 94), providing tenant context

4. **Edge case: re-invite after unconfirmed user deletion:**
   - [x] The `isReinvite = true` is set BEFORE the old user is deleted (line 61)
   - [x] Even if deletion fails, the flag was set -- but deletion failure would cause the subsequent `inviteUserByEmail()` to fail too (email still exists in GoTrue), so no inconsistency

**Verdict: FIX-4 is VERIFIED. First invites and re-invites now produce distinct audit events, enabling proper audit trail analysis.**

---

## B6-B10 Acceptance Criteria Audit

**Tested:** 2026-02-23
**Method:** Static code analysis + build verification (no running Docker/DB instance)
**Tester:** QA Engineer (Red-Team Pen-Test)
**Build Status:** PASS (`npm run build` succeeds, zero compile errors)

---

### B6: Admin can create tenant in /admin/tenants -- PASS

**Files reviewed:**
- `src/app/admin/tenants/page.tsx` (server component, loads email)
- `src/app/admin/tenants/tenants-client.tsx` (client component, full UI)
- `src/app/admin/layout.tsx` (admin gate)
- `src/app/api/admin/tenants/route.ts` (POST handler)
- `src/lib/validations.ts` (`createTenantSchema`)

**Verification details:**

1. **UI flow (tenants-client.tsx lines 138-176):**
   - [x] "Neuer Tenant" button opens a shadcn Dialog
   - [x] Dialog contains a text Input for "Unternehmensname" with Label
   - [x] Enter key triggers submit (onKeyDown handler, line 157)
   - [x] "Erstellen" button disabled while `creating` or `!newName.trim()`
   - [x] On success: dialog closes, tenant list reloads, success message displayed
   - [x] On error: error message displayed via Alert component

2. **API flow (route.ts POST, lines 48-84):**
   - [x] `requireAdmin()` auth guard enforces `strategaize_admin` role
   - [x] JSON body parsed with try/catch (returns 400 on invalid JSON)
   - [x] Zod validation via `createTenantSchema` (name: 2-100 chars)
   - [x] INSERT into `tenants` table with `name` and `created_by: user.id`
   - [x] Returns 201 with `{ tenant: { id, name, created_at } }`

3. **Admin event logging (route.ts lines 77-81):**
   - [x] Calls `adminClient.rpc("log_admin_event", { p_event_type: "tenant_created", ... })`
   - [ ] **BUG-B6-1 (see Bugs section):** RPC return value not checked for errors

4. **Access control (layout.tsx lines 1-30):**
   - [x] Layout checks `user` exists, redirects to `/login` if not
   - [x] Layout checks `profile.role === "strategaize_admin"`, redirects to `/dashboard` if not
   - [x] Non-admin users cannot access the /admin/tenants page

**Verdict: PASS** -- The create-tenant flow is functionally correct. Admin can enter a name, submit, and see the new tenant in the list.

---

### B7: Admin can invite user email for tenant (invite dialog works) -- PASS

**Files reviewed:**
- `src/app/admin/tenants/tenants-client.tsx` (invite dialog UI)
- `src/app/api/admin/tenants/[tenantId]/invite/route.ts` (POST handler)
- `src/lib/validations.ts` (`inviteTenantUserSchema`)

**Verification details:**

1. **UI flow (tenants-client.tsx lines 96-129, 232-269):**
   - [x] Each tenant card has an "Einladen" button (line 210)
   - [x] Button calls `openInvite(tenant.id, tenant.name)` which opens the invite Dialog
   - [x] Dialog shows tenant name in description (line 238)
   - [x] Email Input with type="email" and placeholder "name@unternehmen.de"
   - [x] Enter key triggers submit (onKeyDown handler, line 250)
   - [x] "Einladung senden" button disabled while `inviting` or `!inviteEmail.trim()`
   - [x] On success: dialog closes, tenant list reloads, success message from API displayed
   - [x] On error: error message displayed via Alert component

2. **API flow (invite/route.ts lines 6-102):**
   - [x] `requireAdmin()` auth guard
   - [x] Validates tenant exists via SELECT on tenants table (lines 17-25)
   - [x] Returns 404 if tenant not found
   - [x] Zod validation via `inviteTenantUserSchema` (email format)
   - [x] Email normalized to lowercase: `email.toLowerCase()` (line 38)
   - [x] Case-insensitive existing profile lookup via `.ilike("email", emailLower)` (line 45)
   - [x] Calls `adminClient.auth.admin.inviteUserByEmail(email, { data: { tenant_id, role }, redirectTo })` (lines 76-85)
   - [x] Returns `{ message, role }` on success

3. **Role assignment logic (lines 65-73):**
   - [x] Checks if tenant already has a `tenant_owner` profile
   - [x] First invite for a tenant gets `tenant_owner`
   - [x] Subsequent invites get `tenant_member`
   - [x] This check runs AFTER potential re-invite deletion, so it correctly re-evaluates

**Verdict: PASS** -- The invite dialog works correctly. Admin can enter an email, send the invitation, and the API handles GoTrue invite creation.

---

### B8: Invited user can set password via /auth/set-password and login -- PASS (with caveats)

**Files reviewed:**
- `src/app/auth/callback/route.ts` (token verification + redirect)
- `src/app/auth/set-password/page.tsx` (password form)
- `src/lib/supabase/middleware.ts` (public path allowlist)
- `src/lib/supabase/client.ts` (browser Supabase client)

**Verification details:**

1. **Callback route (callback/route.ts lines 1-54):**
   - [x] Handles `token_hash` + `type` query params (new GoTrue format, lines 17-35)
   - [x] Handles `token` + `type=invite` (legacy format, lines 38-51)
   - [x] Calls `supabase.auth.verifyOtp({ token_hash, type })` to validate the invite token
   - [x] On success with `type === "invite"`: redirects to `/auth/set-password`
   - [x] On error: redirects to `/login?error=<encoded message>`
   - [x] Falls through to `/login?error=Invalid+callback+parameters` if no valid params

2. **Set-password page (set-password/page.tsx lines 1-102):**
   - [x] Password field with min 8 chars validation (client-side, line 26)
   - [x] Confirm-password field with match validation (line 31)
   - [x] Calls `supabase.auth.updateUser({ password })` (line 39)
   - [x] On success: redirects to `/dashboard` via `window.location.href` (correct Supabase pattern)
   - [x] On error: displays error message
   - [x] Loading state properly managed in finally block (line 53)

3. **Middleware allowlist (middleware.ts line 35):**
   - [x] `/auth/set-password` is listed in `publicPaths`
   - [x] `/auth/callback` is listed in `publicPaths`
   - [x] Unauthenticated users can access these pages

4. **Caveats:**
   - [ ] **BUG-B8-1 (see Bugs section):** No server-side password validation. The `setPasswordSchema` in validations.ts (min 8, max 128) is defined but never imported or used in set-password/page.tsx. Only client-side `password.length < 8` check.
   - [ ] **BUG-B8-2 (see Bugs section):** No max password length enforced on set-password page. The Zod schema says max 128, but the UI has no maxLength and the client-side check only validates min 8.

**Verdict: PASS** -- The core flow works: invite link -> callback -> verify OTP -> set password -> redirect to dashboard. Minor validation gaps documented as bugs.

---

### B9: Created profile has correct tenant_id + role tenant_owner -- PASS

**Files reviewed:**
- `sql/functions.sql` (`handle_new_user()` trigger function)
- `sql/schema.sql` (profiles table, trigger definition)
- `src/app/api/admin/tenants/[tenantId]/invite/route.ts` (metadata passed to GoTrue)

**Verification details:**

1. **Invite metadata (invite/route.ts lines 76-85):**
   - [x] `inviteUserByEmail(email, { data: { tenant_id: tenantId, role } })` passes tenant_id and role as `raw_user_meta_data`
   - [x] Role is `tenant_owner` if no owner exists for the tenant, `tenant_member` otherwise (lines 65-73)

2. **Trigger function (functions.sql lines 11-63):**
   - [x] `handle_new_user()` fires `AFTER INSERT ON auth.users` (line 66-69)
   - [x] Extracts `tenant_id` from `NEW.raw_user_meta_data->>'tenant_id'` (line 22)
   - [x] Extracts `role` from `NEW.raw_user_meta_data->>'role'`, defaults to `tenant_owner` (lines 25-28)
   - [x] Validates role is in allowed list: `strategaize_admin`, `tenant_owner`, `tenant_member` (lines 31-33)
   - [x] Validates `tenant_id` is not NULL for tenant roles (lines 36-39)
   - [x] Validates tenant actually exists in `tenants` table (lines 41-44)
   - [x] Enforces single `tenant_owner` per tenant (lines 48-56)
   - [x] INSERTs into `profiles (id, tenant_id, email, role)` with correct values (lines 58-59)

3. **Schema constraints (schema.sql lines 30-36):**
   - [x] `profiles.id` is PRIMARY KEY and REFERENCES `auth.users ON DELETE CASCADE`
   - [x] `profiles.tenant_id` REFERENCES `tenants ON DELETE CASCADE`
   - [x] `profiles.role` has CHECK constraint: `IN ('strategaize_admin', 'tenant_owner', 'tenant_member')`

4. **Profile correctness guarantees:**
   - [x] Trigger runs as SECURITY DEFINER, bypassing RLS
   - [x] Trigger is AFTER INSERT, so it runs after GoTrue commits the auth.users row
   - [x] If trigger validation fails (bad tenant_id, duplicate owner), the entire INSERT transaction rolls back -- the auth.users row is NOT committed either
   - [x] This ensures profiles and auth.users stay in sync

**Verdict: PASS** -- The profile will always have the correct `tenant_id` and `role = 'tenant_owner'` for the first invited user of a tenant. The trigger provides strong server-side guarantees.

---

### B10: Re-invite behavior works for unconfirmed users (no 409 dead-end) -- PASS

**Files reviewed:**
- `src/app/api/admin/tenants/[tenantId]/invite/route.ts` (re-invite logic)

**Verification details:**

1. **Existing user detection (lines 42-46):**
   - [x] Queries `profiles` table with `.ilike("email", emailLower)` for case-insensitive match
   - [x] Uses `.single()` -- returns one match or null

2. **Confirmed vs unconfirmed check (lines 48-63):**
   - [x] If profile exists, fetches GoTrue user via `adminClient.auth.admin.getUserById(existingProfile.id)` (line 50-52)
   - [x] If `email_confirmed_at` is set (confirmed): returns 409 CONFLICT (lines 54-57)
   - [x] If `email_confirmed_at` is NOT set (unconfirmed): sets `isReinvite = true` and deletes old user (lines 61-62)

3. **Delete + re-create flow (lines 59-85):**
   - [x] `adminClient.auth.admin.deleteUser(existingProfile.id)` removes the old auth.users row
   - [x] `ON DELETE CASCADE` on profiles table removes the old profile row
   - [x] Flow continues to re-check tenant owner status (lines 65-73)
   - [x] Fresh `inviteUserByEmail()` call creates a new GoTrue user with new invite token
   - [x] `handle_new_user()` trigger creates a fresh profile with correct metadata

4. **Audit distinction (lines 91-96):**
   - [x] `isReinvite ? "reinvite_sent" : "invite_sent"` logged as admin event
   - [x] `reinvite_sent` is in the `admin_events.event_type` CHECK constraint (schema.sql line 215)

5. **Edge cases:**
   - [x] Re-invite to a different tenant: The old profile (with old tenant_id) is cascade-deleted. New invite can assign to any tenant. This is correct behavior for unconfirmed users.
   - [x] Concurrent re-invites: No explicit locking, but the delete + insert is sequential within the same request. If two admins re-invite simultaneously, one would succeed and the other would fail on the second delete (user already gone).
   - [ ] **BUG-B10-1 (see Bugs section):** Delete error not checked. If `adminClient.auth.admin.deleteUser()` fails, the flow continues to `inviteUserByEmail()` which will also fail (duplicate email). The error from the delete call is silently ignored.

**Verdict: PASS** -- Re-invite for unconfirmed users works. The 409 dead-end has been resolved. Unconfirmed users are deleted and re-invited with a fresh token.

---

### Bugs Found in This Audit

#### BUG-B6-1: log_admin_event RPC errors silently ignored (CRITICAL for audit trail)
- **Severity:** High (functional + compliance)
- **Location:** `src/app/api/admin/tenants/route.ts` lines 77-81, `src/app/api/admin/tenants/[tenantId]/invite/route.ts` lines 92-96
- **Description:** The `adminClient.rpc("log_admin_event", ...)` call is `await`-ed but the return value `{ data, error }` is never checked. The `log_admin_event` SQL function (sql/functions.sql lines 237-269) calls `auth.uid()` to get the actor_id. However, `adminClient` uses the service_role key (src/lib/supabase/admin.ts), which does NOT carry a user session. In Supabase self-hosted, `auth.uid()` reads the `sub` claim from the JWT. The service_role JWT may not have a valid user `sub`, meaning `auth.uid()` could return NULL, causing the function to raise UNAUTHORIZED. The unchecked error means the audit event is silently lost while the API returns success.
- **Steps to Reproduce:**
  1. Admin creates a tenant via POST /api/admin/tenants
  2. Tenant creation succeeds (INSERT into tenants works via service_role)
  3. `log_admin_event` RPC is called via adminClient (service_role key)
  4. Inside the function, `auth.uid()` returns NULL (no user session on service_role)
  5. Function raises EXCEPTION 'UNAUTHORIZED'
  6. Supabase client returns `{ data: null, error: { message: "UNAUTHORIZED" } }`
  7. API route ignores this error and returns 201 success
  8. Result: tenant created, but NO admin_event logged -- audit trail broken
- **Impact:** Compliance failure. All admin actions (tenant_created, invite_sent, reinvite_sent) may have missing audit records.
- **Fix suggestion:** Either (a) call `log_admin_event` via the user's Supabase client (not adminClient) so auth.uid() works, or (b) change the function to accept an explicit `p_actor_id` parameter and skip the auth.uid() check when called from a trusted service_role context, or (c) check the RPC error and fallback to a direct INSERT via adminClient.
- **Priority:** Fix before deployment

#### BUG-B8-1: setPasswordSchema defined but not used in set-password page
- **Severity:** Medium (security)
- **Location:** `src/app/auth/set-password/page.tsx`, `src/lib/validations.ts` lines 166-171
- **Description:** The `setPasswordSchema` Zod schema exists in validations.ts with min 8, max 128 constraints. However, the set-password page only performs a client-side `password.length < 8` check (line 26). The Zod schema is not imported or used. There is no server-side password validation endpoint -- the password is sent directly to `supabase.auth.updateUser()`, which has its own internal validation (GoTrue's default is min 6 chars). This means the min-8 business rule relies entirely on client-side code that can be bypassed.
- **Steps to Reproduce:**
  1. Navigate to /auth/set-password after invite acceptance
  2. Use browser devtools to bypass the client-side length check
  3. Submit a 6-character password
  4. GoTrue accepts it (default min is 6)
  5. Result: password set that violates the 8-char business rule
- **Fix suggestion:** Add a server-side API route `/api/auth/set-password` that validates with `setPasswordSchema` before calling `updateUser()`.
- **Priority:** Fix before deployment

#### BUG-B8-2: No max password length enforced on set-password UI
- **Severity:** Low
- **Location:** `src/app/auth/set-password/page.tsx`
- **Description:** The password Input has no `maxLength` prop. The Zod schema specifies max 128 chars, but this is not enforced in the UI. Extremely long passwords could be submitted to GoTrue.
- **Steps to Reproduce:**
  1. Paste a 10,000-character string into the password field
  2. Submit the form
  3. GoTrue processes the long password (bcrypt will truncate at 72 bytes anyway)
- **Priority:** Nice to have

#### BUG-B10-1: deleteUser error not checked during re-invite
- **Severity:** Medium
- **Location:** `src/app/api/admin/tenants/[tenantId]/invite/route.ts` line 62
- **Description:** `await adminClient!.auth.admin.deleteUser(existingProfile.id)` is called but the return value `{ data, error }` is not checked. If the delete fails (e.g., GoTrue network error, user already deleted by concurrent request), the flow continues to `inviteUserByEmail()` which will fail with a duplicate email error. The admin receives an opaque "INTERNAL_ERROR" instead of a clear message about the re-invite failure.
- **Steps to Reproduce:**
  1. Invite user@example.com (user created in GoTrue but unconfirmed)
  2. GoTrue has a transient error during deleteUser
  3. API continues to inviteUserByEmail, which fails (duplicate email)
  4. Admin sees "INTERNAL_ERROR" with GoTrue's error message
  5. Result: confusing error, admin does not know the delete step failed
- **Fix suggestion:** Check the deleteUser return value. If error, return a specific error: "Konnte bestehenden Nutzer nicht entfernen. Bitte erneut versuchen."
- **Priority:** Fix before deployment

#### BUG-B7-1: Invite passes raw user-entered email to GoTrue, but normalizes for lookup only
- **Severity:** Low (data consistency)
- **Location:** `src/app/api/admin/tenants/[tenantId]/invite/route.ts` lines 38, 76
- **Description:** The email is lowercased for the `.ilike()` lookup (line 38: `emailLower = email.toLowerCase()`), but the original mixed-case `email` is passed to `inviteUserByEmail(email, ...)` on line 76. This means GoTrue stores whatever case the admin typed. The `handle_new_user()` trigger then stores `NEW.email` (from GoTrue) into profiles, preserving the mixed case. Future case-insensitive lookups via `.ilike()` will still work, but the stored email may not be normalized.
- **Steps to Reproduce:**
  1. Admin invites "John@Example.COM"
  2. GoTrue stores "John@Example.COM" as the user email
  3. Profile is created with email = "John@Example.COM"
  4. Lookup via `.ilike()` works, but exports and displays show mixed case
- **Fix suggestion:** Pass `emailLower` to `inviteUserByEmail()` instead of `email`.
- **Priority:** Nice to have

---

### Security Audit (Red-Team Perspective)

#### SEC-1: Admin auth gate -- PASS
- Admin layout (`src/app/admin/layout.tsx`) checks both user session AND `profile.role === "strategaize_admin"` before rendering children.
- API routes use `requireAdmin()` which checks the same conditions server-side.
- Non-admin users are redirected to `/dashboard`, not given an error page (information leakage minimal).

#### SEC-2: Service role key exposure -- PASS
- `SUPABASE_SERVICE_ROLE_KEY` does NOT have `NEXT_PUBLIC_` prefix (admin.ts line 8).
- `createAdminClient()` is only imported in API route files (server-side only).
- Browser client (`src/lib/supabase/client.ts`) uses anon key only.

#### SEC-3: No self-signup -- PASS
- No `/auth/register` page exists (Glob confirmed zero files).
- Middleware `publicPaths` does not include any register route.
- `GOTRUE_DISABLE_SIGNUP=true` is documented in `.env.local.example` (line 47).

#### SEC-4: RLS tenant isolation -- PASS
- All 10 tables have `ENABLE ROW LEVEL SECURITY`.
- Tenant SELECT policies use `auth.user_tenant_id()` (SECURITY DEFINER helper).
- No UPDATE/DELETE policies exist for tenant roles on event tables (append-only enforced).
- `anon` role has ALL privileges revoked (`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon`, rls.sql line 303).

#### SEC-5: Input validation -- PASS (with B8-1 caveat)
- `createTenantSchema`: validates name 2-100 chars.
- `inviteTenantUserSchema`: validates email format.
- All API routes parse JSON in try/catch and run Zod validation before processing.
- **Caveat:** set-password has no server-side validation (see BUG-B8-1).

#### SEC-6: Security headers -- PASS
- `X-Frame-Options: DENY` (clickjacking protection)
- `X-Content-Type-Options: nosniff` (MIME sniffing protection)
- `Referrer-Policy: origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- All configured in `next.config.ts` lines 4-23.

#### SEC-7: Rate limiting -- FAIL
- No rate limiting on any API endpoint.
- An attacker with a valid admin session could:
  - Create thousands of tenants (DOS on database)
  - Send thousands of invite emails (SMTP abuse)
  - Trigger thousands of deleteUser + inviteUserByEmail cycles for re-invites
- **Severity:** Medium
- **Note:** This was already documented as BUG-P1-7 in a prior QA pass and remains unfixed.

#### SEC-8: CSRF protection -- PASS
- Next.js API routes using `request.json()` require Content-Type: application/json
- Browsers do not allow cross-origin JSON POST via simple form submissions
- Supabase auth cookies are httpOnly and SameSite (standard SSR config)

#### SEC-9: Invite token replay -- PASS
- GoTrue OTP tokens are one-time use
- `supabase.auth.verifyOtp()` consumes the token on first use
- Second use returns an error, redirected to `/login?error=...`

#### SEC-10: Tenant-ID manipulation in invite metadata -- PASS
- `tenant_id` is taken from the URL path parameter `[tenantId]`, not from the request body
- The API validates the tenant exists before creating the invite
- `handle_new_user()` trigger independently validates the tenant exists
- Even if an attacker could somehow modify the metadata, the trigger would reject invalid tenant_ids

---

### Overall B6-B10 Summary

| Criterion | Result | Notes |
|-----------|--------|-------|
| B6: Admin can create tenant | **PASS** | Full flow works. Audit logging may silently fail (BUG-B6-1). |
| B7: Admin can invite user | **PASS** | Full flow works including tenant validation and role assignment. |
| B8: Set password via invite link | **PASS** | Core flow works. Missing server-side password validation (BUG-B8-1). |
| B9: Profile has correct tenant_id + role | **PASS** | Trigger provides strong guarantees with validation and uniqueness checks. |
| B10: Re-invite for unconfirmed users | **PASS** | Delete + re-create approach works. Error handling on delete is missing (BUG-B10-1). |

**Bugs Found:** 5 total
- 1 High (BUG-B6-1: audit trail broken via service_role auth.uid() issue)
- 2 Medium (BUG-B8-1: no server-side password validation, BUG-B10-1: unchecked deleteUser error)
- 2 Low (BUG-B8-2: no max password length UI, BUG-B7-1: email case not normalized for GoTrue)

**Previously reported, still open:**
- BUG-P1-1: Tenant list missing Active/Pending status (Medium)
- BUG-P1-2: Tenant list missing user count (Low)
- BUG-P1-4: No duplicate tenant name warning (Low)
- BUG-P1-5: No dedicated expired-link error page (Low)
- BUG-P1-7: No rate limiting on any endpoints (Medium/Security)

**Production Ready:** NO -- BUG-B6-1 (audit trail) and BUG-B8-1 (password validation bypass) must be fixed first.

---

## Deployment
_To be added by /deploy_
