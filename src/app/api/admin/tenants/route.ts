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
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return errorResponse("INTERNAL_ERROR", error.message, 500);
  }

  // Enrich with owner email and run count
  const enriched = await Promise.all(
    (tenants ?? []).map(async (t) => {
      const { data: owner } = await adminClient!
        .from("profiles")
        .select("email")
        .eq("tenant_id", t.id)
        .eq("role", "tenant_owner")
        .single();

      const { count } = await adminClient!
        .from("runs")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", t.id);

      return {
        ...t,
        owner_email: owner?.email ?? null,
        run_count: count ?? 0,
      };
    })
  );

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

  const { name } = parsed.data;

  const { data: tenant, error } = await adminClient!
    .from("tenants")
    .insert({ name, created_by: user!.id })
    .select("id, name, created_at")
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
