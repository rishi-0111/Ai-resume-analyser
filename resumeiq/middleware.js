import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Middleware: protect /dashboard routes and redirect authenticated
 * users away from /login and /signup.
 */
export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  let supabase;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Middleware: Missing Supabase Environment Variables!");
      return supabaseResponse; // Let it pass if env vars are missing so we don't crash the whole site
    }

    supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });
  } catch (error) {
    console.error("Middleware initialization error:", error);
    return supabaseResponse;
  }

  // Refresh session — IMPORTANT: do not remove this call
  let user = null;
  if (supabase) {
    try {
      // Using getSession() instead of getUser() avoids a network fetch in Edge runtime,
      // bypassing the local Windows 'failed to fetch' timeout issue.
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user ?? null;
    } catch (error) {
      console.error("Middleware Supabase Error:", error);
    }
  }

  const { pathname } = request.nextUrl;

  // 1) Unauthenticated user trying to access /dashboard → redirect to /login
  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 2) Authenticated user trying to visit /login or /signup → redirect to /dashboard
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, public assets
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
