import { NextResponse } from "next/server";
import { requireAdmin, errorResponse, validationError } from "@/lib/api-utils";
import { createTenantSchema } from "@/lib/validations";

// GET /api/admin/tenants — List all tenants
export async function GET() {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;

  const { adminClient } = auth;

  const { data: tenants, error } = await adminClient!
    .from("tenants")
    .select("id, name, language, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return errorResponse("INTERNAL_ERROR", error.message, 500);
  }

  // Batch-fetch owner emails and run counts (avoids N+1 queries)
  const tenantIds = (tenants ?? []).map((t) => t.id);

  // Single query: all tenant_admin/owner profiles
  const { data: owners } = tenantIds.length > 0
    ? await adminClient!
        .from("profiles")
        .select("tenant_id, email")
        .in("tenant_id", tenantIds)
        .eq("role", "tenant_admin")
    : { data: [] };

  const ownerByTenant = new Map<string, string>();
  for (const o of owners ?? []) {
    ownerByTenant.set(o.tenant_id, o.email);
  }

  // Single query: all runs for these tenants
  const { data: runRows } = tenantIds.length > 0
    ? await adminClient!
        .from("runs")
        .select("tenant_id")
        .in("tenant_id", tenantIds)
    : { data: [] };

  const runsByTenant = new Map<string, number>();
  for (const r of runRows ?? []) {
    runsByTenant.set(r.tenant_id, (runsByTenant.get(r.tenant_id) ?? 0) + 1);
  }

  // Enrich tenants with pre-fetched data
  const enriched = (tenants ?? []).map((t) => ({
    ...t,
    owner_email: ownerByTenant.get(t.id) ?? null,
    run_count: runsByTenant.get(t.id) ?? 0,
  }));

  return NextResponse.json({ tenants: enriched });
}

// POST /api/admin/tenants — Create a new tenant
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;

  const { user, supabase, adminClient } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const parsed = createTenantSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { name, language } = parsed.data;

  const { data: tenant, error } = await adminClient!
    .from("tenants")
    .insert({ name, language, created_by: user!.id })
    .select("id, name, language, created_at")
    .single();

  if (error) {
    return errorResponse("INTERNAL_ERROR", error.message, 500);
  }

  // Log admin event (use user session so auth.uid() resolves)
  await supabase.rpc("log_admin_event", {
    p_event_type: "tenant_created",
    p_tenant_id: tenant.id,
    p_payload: { name },
  });

  return NextResponse.json({ tenant }, { status: 201 });
}
