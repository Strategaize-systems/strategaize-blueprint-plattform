import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /auth/callback — Handle invite token verification
// GoTrue redirect: /auth/callback?token=...&type=invite
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const token = searchParams.get("token");

  const redirectBase = process.env.NEXT_PUBLIC_APP_URL || "";

  const supabase = await createClient();

  // Handle token_hash (new GoTrue format) or token (legacy)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "invite" | "email",
    });

    if (error) {
      return NextResponse.redirect(
        `${redirectBase}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    // For invite: user needs to set password
    if (type === "invite") {
      return NextResponse.redirect(`${redirectBase}/auth/set-password`);
    }

    return NextResponse.redirect(`${redirectBase}/dashboard`);
  }

  // Legacy token format
  if (token && type === "invite") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "invite",
    });

    if (error) {
      return NextResponse.redirect(
        `${redirectBase}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(`${redirectBase}/auth/set-password`);
  }

  return NextResponse.redirect(`${redirectBase}/login?error=Invalid+callback+parameters`);
}
