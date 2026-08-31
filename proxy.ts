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

  // 2. If logged in, resolve role safely
  let role = user.user_metadata?.role;
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (profile?.role) {
    role = profile.role;
  }

  if (!role) {
    if (user.email?.startsWith("admin")) role = "admin";
    else if (user.email?.startsWith("faculty") || user.email?.startsWith("testfaculty")) role = "faculty";
    else role = "student";
  }

  // 3. Redirect logged-in users visiting landing page or login page directly to their role dashboard
  if (pathname === "/" || pathname === "/login" || pathname === "/change-password") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // 4. Role-based Route Protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }
  if (pathname.startsWith("/faculty") && role === "student") {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
