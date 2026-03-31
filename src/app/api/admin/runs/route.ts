import { NextResponse } from "next/server";
import { requireAdmin, errorResponse, validationError } from "@/lib/api-utils";
import { createRunSchema } from "@/lib/validations";

// GET /api/admin/runs — List all runs (optional filters)
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;

  const { adminClient } = auth;
  const { searchParams } = new URL(request.url);
  const tenantFilter = searchParams.get("tenant_id");
  const statusFilter = searchParams.get("status");

  let query = adminClient!
    .from("runs")
    .select(
      `
      id, tenant_id, title, status, contract_version,
      created_at, submitted_at,
      catalog_snapshot_id,
      tenants!inner(name),
      question_catalog_snapshots!inner(version, question_count)
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (tenantFilter) query = query.eq("tenant_id", tenantFilter);
  if (statusFilter) query = query.eq("status", statusFilter);

  const { data: runs, error } = await query;

  if (error) {
    return errorResponse("INTERNAL_ERROR", error.message, 500);
  }

  // Batch-fetch answered counts and evidence counts (avoids N+1 queries)
  const runIds = (runs ?? []).map((r) => r.id);

  // Single query: answered count per run
  const { data: answerCounts } = runIds.length > 0
    ? await adminClient!
        .from("v_current_answers")
        .select("run_id")
        .in("run_id", runIds)
    : { data: [] };

  const answeredByRun = new Map<string, number>();
  for (const row of answerCounts ?? []) {
    answeredByRun.set(row.run_id, (answeredByRun.get(row.run_id) ?? 0) + 1);
  }

  // Single query: evidence count per run
  const { data: evidenceCounts } = runIds.length > 0
    ? await adminClient!
        .from("evidence_items")
        .select("run_id")
        .in("run_id", runIds)
    : { data: [] };

  const evidenceByRun = new Map<string, number>();
  for (const row of evidenceCounts ?? []) {
    evidenceByRun.set(row.run_id, (evidenceByRun.get(row.run_id) ?? 0) + 1);
  }

  // Enrich runs with pre-fetched counts
  const enriched = (runs ?? []).map((r) => {
    const tenantData = r.tenants as unknown as { name: string };
    const catalogData = r.question_catalog_snapshots as unknown as {
      version: string;
      question_count: number;
    };

    return {
      id: r.id,
      tenant_id: r.tenant_id,
      tenant_name: tenantData?.name ?? null,
      title: r.title,
      status: r.status,
      catalog_version: catalogData?.version ?? null,
      question_count: catalogData?.question_count ?? 0,
      answered_count: answeredByRun.get(r.id) ?? 0,
      evidence_count: evidenceByRun.get(r.id) ?? 0,
      created_at: r.created_at,
      submitted_at: r.submitted_at,
    };
  });

  return NextResponse.json({ runs: enriched });
}

// POST /api/admin/runs — Create a new run for a tenant
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

  const parsed = createRunSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { tenant_id, catalog_snapshot_id, title, description } = parsed.data;

  // Validate tenant exists
  const { data: tenant } = await adminClient!
    .from("tenants")
    .select("id")
    .eq("id", tenant_id)
    .single();

  if (!tenant) {
    return errorResponse("NOT_FOUND", "Tenant not found", 404);
  }

  // Validate catalog snapshot exists
  const { data: snapshot } = await adminClient!
    .from("question_catalog_snapshots")
    .select("id")
    .eq("id", catalog_snapshot_id)
    .single();

  if (!snapshot) {
    return errorResponse("NOT_FOUND", "Catalog snapshot not found", 404);
  }

  const { data: run, error } = await adminClient!
    .from("runs")
    .insert({
      tenant_id,
      catalog_snapshot_id,
      title,
      description: description ?? null,
      status: "collecting",
      contract_version: "v1.0",
      created_by: user!.id,
    })
    .select("id, tenant_id, catalog_snapshot_id, title, status, contract_version, created_at")
    .single();

  if (error) {
    return errorResponse("INTERNAL_ERROR", error.message, 500);
  }

  // Copy block access from existing runs to the new run for tenant_members.
  // When a member was invited with allowed_blocks, entries were created for
  // runs that existed at invite time. New runs need the same block entries.
  const { data: existingMembers } = await adminClient!
    .from("profiles")
    .select("id")
    .eq("tenant_id", tenant_id)
    .eq("role", "tenant_member");

  if (existingMembers && existingMembers.length > 0) {
    // Find another run of this tenant to copy block access from
    const { data: otherRuns } = await adminClient!
      .from("runs")
      .select("id")
      .eq("tenant_id", tenant_id)
      .neq("id", run.id)
      .limit(1);

    if (otherRuns && otherRuns.length > 0) {
      const sourceRunId = otherRuns[0].id;
      for (const member of existingMembers) {
        const { data: existingAccess } = await adminClient!
          .from("member_block_access")
          .select("block")
          .eq("profile_id", member.id)
          .eq("run_id", sourceRunId);

        if (existingAccess && existingAccess.length > 0) {
          const newEntries = existingAccess.map((a) => ({
            profile_id: member.id,
            run_id: run.id,
            block: a.block,
          }));
          await adminClient!
            .from("member_block_access")
            .upsert(newEntries, { onConflict: "profile_id,run_id,block" });
        }
      }
    }
  }

  // Log admin event (use user session so auth.uid() resolves)
  await supabase.rpc("log_admin_event", {
    p_event_type: "run_created",
    p_tenant_id: tenant_id,
    p_run_id: run.id,
    p_payload: { title, catalog_snapshot_id },
  });

  return NextResponse.json({ run }, { status: 201 });
}
