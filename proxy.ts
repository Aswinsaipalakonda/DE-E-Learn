import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define assets and public paths to skip proxy execution
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  // Retrieve user session safely
  const { data: { user } } = await supabase.auth.getUser();

  // 1. If not logged in and not on login or landing page -> redirect to /login
  if (!user) {
    if (pathname !== "/login" && pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  // 2. If logged in, fetch user profile to check first_login_pending
  const { data: profile, error } = await supabase
    .from("users")
    .select("role, first_login_pending")
    .eq("id", user.id)
    .single();

  // If there's an error or no profile, redirect to login
  if (error || !profile) {
    if (pathname === "/login") return supabaseResponse;
    // Sign out user and redirect to login
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isFirstLoginPending = false;

  // 4. Redirect logged-in users away from /login and /change-password
  if (pathname === "/login" || pathname === "/change-password") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
