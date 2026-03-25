# Known Issues

## KI-001: Permission denied for table tenants

**Entdeckt:** 2026-03-25
**Severity:** Blocker
**Seite:** `/admin/tenants`
**Fehlermeldung:** `permission denied for table tenants`
**Kontext:** Nach erfolgreichem Login als Admin-User (immo@bellaerts.de) wird die Tenant-Verwaltung geladen. Die Seite rendert korrekt (Layout, Navigation, "Neuer Tenant"-Button), aber der Datenabruf schlägt fehl.
**Wahrscheinliche Ursache:** RLS (Row Level Security) Policies auf der `tenants`-Tabelle fehlen oder sind falsch konfiguriert. Der eingeloggte User hat die Rolle `authenticated`, aber es existiert keine Policy die SELECT auf `tenants` für diese Rolle erlaubt. Alternativ: der Request kommt als `anon` statt `authenticated` durch (Token wird nicht korrekt an PostgREST weitergeleitet).
**Betroffene Komponenten:** Supabase RLS Policies, PostgREST, eventuell Middleware-Token-Handling
**Status:** open
**Nächster Schritt:** RLS Policies auf der `tenants`-Tabelle prüfen. Verifizieren ob der User als `authenticated` oder `anon` bei PostgREST ankommt.
