import { NextResponse } from "next/server";
import { requireTenant, errorResponse } from "@/lib/api-utils";

// GET /api/tenant/runs/[runId]/submissions — List checkpoint history
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const auth = await requireTenant();
  if (auth.errorResponse) return auth.errorResponse;

  const { supabase } = auth;
  const { runId } = await params;

  const { data: submissions, error } = await supabase
    .from("run_submissions")
    .select("id, run_id, snapshot_version, submitted_at, note")
    .eq("run_id", runId)
    .order("snapshot_version", { ascending: false });

  if (error) {
    return errorResponse("INTERNAL_ERROR", error.message, 500);
  }

  return NextResponse.json({ submissions: submissions ?? [] });
}
