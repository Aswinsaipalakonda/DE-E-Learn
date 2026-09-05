import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Explicit public routes that never require authentication
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/terms",
  "/privacy",
  "/contact",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/llms.txt",
  "/llms-full.txt",
];

// Protected route prefixes that strictly require an active session
const PROTECTED_PREFIXES = [
  "/student",
  "/faculty",
  "/admin",
  "/profile",
  "/change-password",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip assets, static files, and API endpoints
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPath = pathname === "/login";

  // Case A: Unauthenticated Visitor
  if (!user) {
    // If attempting to access a protected dashboard route, redirect to /login
    if (isProtectedPath) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Allow public pages (/about, /terms, /privacy, /contact, /, 404s, etc.)
    return supabaseResponse;
  }

  // Case B: Authenticated User
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

  // If logged in and visiting login page or root landing page, redirect to role dashboard
  if (isAuthPath || pathname === "/") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // Role-based Route Protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }
  if (pathname.startsWith("/faculty") && role === "student") {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  // Allow logged-in user to access their dashboard AND view informational pages (/about, /terms, /privacy, /contact)
  return supabaseResponse;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
