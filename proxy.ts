import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Explicit public routes that never require authentication or server roundtrips
const PUBLIC_ROUTES = new Set([
  "/about",
  "/terms",
  "/privacy",
  "/contact",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
  "/llms.txt",
  "/llms-full.txt",
]);

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

  // 1. Skip assets, static files, and API endpoints immediately (0ms overhead)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Fast-path: Return immediately for public informational and legal routes
  if (PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const isProtectedPath = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPath = pathname === "/login";
  const isRoot = pathname === "/";

  // If not visiting a protected dashboard, login, or root landing, proceed directly
  if (!isProtectedPath && !isAuthPath && !isRoot) {
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

  // Retrieve user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Case A: Unauthenticated Visitor
  if (!user) {
    // If attempting to access a protected dashboard route, redirect to /login
    if (isProtectedPath) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    // Allow public root and login page
    return supabaseResponse;
  }

  // Case B: Authenticated User - Fast metadata/heuristic resolution (avoids blocking DB query on every route change)
  let role = (user.user_metadata?.role as string) || "";

  if (!role) {
    if (user.email?.startsWith("admin")) {
      role = "admin";
    } else if (user.email?.startsWith("faculty") || user.email?.startsWith("testfaculty")) {
      role = "faculty";
    } else if (/^\d{5}[a-zA-Z0-9]{5}@/i.test(user.email || "") || /^\d{2}/.test(user.email || "")) {
      role = "student";
    } else {
      // Fallback query only when metadata is absent
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role || "student";
    }
  }

  // If logged in and visiting login page or root landing page, redirect to role dashboard
  if (isAuthPath || isRoot) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // Role-based Route Protection
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }
  if (pathname.startsWith("/faculty") && role === "student") {
    return NextResponse.redirect(new URL("/student", request.url));
  }

  return supabaseResponse;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
