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

// High-speed local JWT session parser (handles chunked cookies sb-*-auth-token.0, .1 in 0.05ms)
function parseLocalSession(request: NextRequest): { email: string; role: string; expired: boolean } | null {
  try {
    const cookies = request.cookies.getAll();
    const authCookies = cookies.filter((c) => c.name.includes("-auth-token"));
    if (!authCookies.length) return null;

    authCookies.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    let combinedVal = authCookies.map((c) => c.value).join("");

    if (combinedVal.startsWith("base64-")) {
      combinedVal = Buffer.from(combinedVal.slice(7), "base64").toString("utf-8");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(combinedVal);
    } catch {
      parsed = combinedVal;
    }

    let accessToken: string | null = null;
    if (Array.isArray(parsed)) {
      accessToken = parsed[0];
    } else if (parsed && typeof parsed === "object" && parsed.access_token) {
      accessToken = parsed.access_token;
    } else if (typeof parsed === "string") {
      accessToken = parsed;
    }

    if (!accessToken || typeof accessToken !== "string") return null;

    const parts = accessToken.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    const isExpired = !!(payload.exp && payload.exp * 1000 < Date.now());

    let role = (payload.user_metadata?.role as string) || (payload.role as string) || "";
    const email = (payload.email as string) || "";
    if (!role) {
      if (email.startsWith("admin")) role = "admin";
      else if (email.startsWith("faculty") || email.startsWith("testfaculty")) role = "faculty";
      else role = "student";
    }

    return { email, role, expired: isExpired };
  } catch {
    return null;
  }
}

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

  // 3. Fast-path: Check local decoded session first (avoids remote HTTPS roundtrip to Supabase)
  const localSession = parseLocalSession(request);

  if (localSession && !localSession.expired) {
    const role = localSession.role;

    // Logged in user visiting login page or root -> instant redirect
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

    // Authorized internal page navigation (e.g. /admin/users -> /admin/profile) -> instantaneous
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  // 4. If no local session token and accessing a protected page -> instant login redirect
  if (!localSession && isProtectedPath) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 5. Fallback full auth refresh only when token is expired or requires synchronization
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedPath) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  let role = (user.user_metadata?.role as string) || "";
  if (!role) {
    if (user.email?.startsWith("admin")) role = "admin";
    else if (user.email?.startsWith("faculty") || user.email?.startsWith("testfaculty")) role = "faculty";
    else role = "student";
  }

  if (isAuthPath || isRoot) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

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
