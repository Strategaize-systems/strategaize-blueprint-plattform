import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const publicPaths = ["/login", "/auth/callback", "/auth/set-password"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isApiHealth = pathname === "/api/health";

  // Not logged in → redirect to login (unless on public path)
  if (!user && !isPublicPath && !isApiHealth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in → redirect away from login
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Set NEXT_LOCALE cookie from tenant language (if logged in and not already set correctly)
  if (user && !isApiHealth && !pathname.startsWith("/api/")) {
    const currentLocale = request.cookies.get("NEXT_LOCALE")?.value;
    if (!currentLocale) {
      // Load tenant language from profile → tenant
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

      if (profile?.tenant_id) {
        const { data: tenant } = await supabase
          .from("tenants")
          .select("language")
          .eq("id", profile.tenant_id)
          .single();

        const locale = tenant?.language ?? "de";
        supabaseResponse.cookies.set("NEXT_LOCALE", locale, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
          sameSite: "lax",
        });
      }
    }
  }

  return supabaseResponse;
}
