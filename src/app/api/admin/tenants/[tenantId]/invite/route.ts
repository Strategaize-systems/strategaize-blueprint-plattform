import { NextResponse } from "next/server";
import { requireAdmin, errorResponse, validationError } from "@/lib/api-utils";
import { inviteTenantUserSchema } from "@/lib/validations";

// POST /api/admin/tenants/[tenantId]/invite — Invite a user to a tenant
export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const auth = await requireAdmin();
  if (auth.errorResponse) return auth.errorResponse;

  const { supabase, adminClient } = auth;
  const { tenantId } = await params;

  // Validate tenant exists
  const { data: tenant, error: tenantError } = await adminClient!
    .from("tenants")
    .select("id, name")
    .eq("id", tenantId)
    .single();

  if (tenantError || !tenant) {
    return errorResponse("NOT_FOUND", "Tenant not found", 404);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const parsed = inviteTenantUserSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { email } = parsed.data;
  const emailLower = email.toLowerCase();
  let isReinvite = false;

  // Check if user already exists (targeted lookup with lowercase index)
  const { data: existingProfile } = await adminClient!
    .from("profiles")
    .select("id, email, role, tenant_id")
    .ilike("email", emailLower)
    .single();

  if (existingProfile) {
    // User exists with a profile — check if they're confirmed
    const { data: authUser } = await adminClient!.auth.admin.getUserById(
      existingProfile.id
    );

    if (authUser?.user?.email_confirmed_at) {
      // Fully confirmed user — cannot re-invite
      return errorResponse("CONFLICT", "E-Mail ist bereits registriert und bestätigt", 409);
    }

    // Unconfirmed user — allow re-invite by deleting the old user first
    // (GoTrue will re-create on inviteUserByEmail)
    isReinvite = true;
    await adminClient!.auth.admin.deleteUser(existingProfile.id);
  }

  // Check if tenant already has an owner
  const { data: existingOwner } = await adminClient!
    .from("profiles")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("role", "tenant_owner")
    .single();

  const role = existingOwner ? "tenant_member" : "tenant_owner";

  // Create user via GoTrue Admin API (invite flow)
  const { error: inviteError } = await adminClient!.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        tenant_id: tenantId,
        role,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  );

  if (inviteError) {
    return errorResponse("INTERNAL_ERROR", inviteError.message, 500);
  }

  // Log admin event (use user session so auth.uid() resolves)
  await supabase.rpc("log_admin_event", {
    p_event_type: isReinvite ? "reinvite_sent" : "invite_sent",
    p_tenant_id: tenantId,
    p_payload: { email, role },
  });

  return NextResponse.json({
    message: `Einladung gesendet an ${email}`,
    role,
  });
}
