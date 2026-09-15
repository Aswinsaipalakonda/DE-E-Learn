import { type NextRequest, NextResponse } from "next/server";

// Explicit public routes that never require authentication
const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
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

// High-speed JWT session parser (0.01ms, no network latency)
function parseDeSession(request: NextRequest): { email: string; role: string; expired: boolean } | null {
  try {
    const token = request.cookies.get("de_token")?.value;
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    const isExpired = !!(payload.exp && payload.exp * 1000 < Date.now());

    let role = (payload.role as string) || "";
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
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
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

  // 2. Check session token
  const session = parseDeSession(request);

  if (session && !session.expired) {
    const role = session.role;

    // Logged in user visiting login page or root -> redirect to role dashboard
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

    return NextResponse.next();
  }

  // 3. If no valid session and accessing a protected page -> redirect to login
  if (isProtectedPath) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
