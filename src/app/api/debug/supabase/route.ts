import { NextResponse } from "next/server";

// Temporary debug endpoint — remove after auth is working
export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const results: Record<string, unknown> = {
    SUPABASE_URL: process.env.SUPABASE_URL ? "set" : "NOT SET",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "NOT SET",
    resolved_url: supabaseUrl || "MISSING",
    anon_key_set: !!anonKey,
    timestamp: new Date().toISOString(),
  };

  // Test: Can we reach Kong/GoTrue?
  if (supabaseUrl && anonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        signal: AbortSignal.timeout(5000),
      });
      results.kong_reachable = true;
      results.kong_status = res.status;
      if (res.ok) {
        const data = await res.json();
        results.gotrue_external_url = data.external_url;
      } else {
        results.kong_body = await res.text().catch(() => "could not read");
      }
    } catch (err) {
      results.kong_reachable = false;
      results.kong_error = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json(results, { status: 200 });
}
