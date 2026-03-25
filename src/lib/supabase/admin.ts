import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS.
// Use ONLY in API routes for admin operations.
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
