import { cache } from "react";
import { createClient } from "./server";
import { cookies } from "next/headers";

export interface CachedUserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  branch?: string | null;
  current_semester?: number | null;
  section?: string | null;
  designation?: string | null;
  roll_number?: string | null;
  status?: string;
}

// In-memory process cache for profiles to avoid redundant DB queries across page navigations
const profileMemCache = new Map<string, { profile: CachedUserProfile; expiresAt: number }>();

export function invalidateProfileCache(idOrEmail?: string) {
  if (!idOrEmail) {
    profileMemCache.clear();
  } else {
    profileMemCache.delete(idOrEmail);
  }
}

export function extractJwtPayloadFromCookies(allCookies: { name: string; value: string }[]): { token: string; payload: any } | null {
  try {
    const authCookies = allCookies.filter((c) => c.name.includes("-auth-token"));
    if (!authCookies.length) return null;

    authCookies.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    let combinedValue = authCookies.map((c) => c.value).join("");

    if (combinedValue.startsWith("base64-")) {
      combinedValue = Buffer.from(combinedValue.slice(7), "base64").toString("utf-8");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(combinedValue);
    } catch {
      parsed = combinedValue;
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
    return { token: accessToken, payload };
  } catch {
    return null;
  }
}

// React cache deduplicates calls within the same request lifecycle (0ms for subsequent calls in layout & page)
export const getCachedAuthUser = cache(async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fast-path: Parse JWT directly from local cookies (0.01ms, 0 network requests)
  try {
    const allCookies = cookieStore.getAll();
    const extracted = extractJwtPayloadFromCookies(allCookies);

    if (extracted && extracted.payload) {
      const payload = extracted.payload;
      const isExpired = !!(payload.exp && payload.exp * 1000 < Date.now());

      if (!isExpired && payload.sub) {
        const user = {
          id: payload.sub as string,
          email: (payload.email as string) || "",
          user_metadata: payload.user_metadata || {},
          app_metadata: payload.app_metadata || {},
          role: payload.role || payload.user_metadata?.role,
          aud: payload.aud || "authenticated",
          created_at: payload.created_at || new Date().toISOString(),
        };
        return { user, supabase };
      }
    }
  } catch {
    // proceed to fallback
  }

  // Fallback: network round-trip to Supabase Auth only if token is expired or parsing failed
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, supabase };
  }
  return { user, supabase };
});

export const getCachedUserProfile = cache(async (): Promise<{ user: any; profile: CachedUserProfile | null; supabase: any }> => {
  const { user, supabase } = await getCachedAuthUser();
  if (!user) {
    return { user: null, profile: null, supabase };
  }

  // Fast-path: In-memory cache for database profile (0.01ms, 0 DB queries)
  const cached = profileMemCache.get(user.id) || (user.email ? profileMemCache.get(user.email) : undefined);
  if (cached && cached.expiresAt > Date.now()) {
    return { user, profile: cached.profile, supabase };
  }

  // Query database profile
  try {
    const { data: dbProfile } = await supabase
      .from("users")
      .select("id, name, email, role, branch, current_semester, section, designation, roll_number, status")
      .or(`id.eq.${user.id},email.eq.${user.email}`)
      .single();

    if (dbProfile) {
      const profile = dbProfile as CachedUserProfile;
      profileMemCache.set(user.id, { profile, expiresAt: Date.now() + 60_000 });
      if (user.email) profileMemCache.set(user.email, { profile, expiresAt: Date.now() + 60_000 });
      return { user, profile, supabase };
    }
  } catch {}

  // Fallback default profile if not in DB
  const metaRole = user.user_metadata?.role as "student" | "faculty" | "admin" | undefined;
  const metaName = user.user_metadata?.name as string | undefined;

  const fallbackRole: "student" | "faculty" | "admin" = 
    metaRole || 
    (user.email?.startsWith("admin") ? "admin" : user.email?.startsWith("faculty") || user.email?.startsWith("testfaculty") ? "faculty" : "student");

  const fallbackRoll = fallbackRole === "student" && user.email?.includes("@") ? user.email.split("@")[0].toUpperCase() : null;

  const fallbackProfile: CachedUserProfile = {
    id: user.id,
    name: metaName || (fallbackRole === "admin" ? "System Administrator" : fallbackRole === "faculty" ? "Faculty Member" : `Student ${fallbackRoll || ""}`),
    email: user.email || "",
    role: fallbackRole,
    branch: fallbackRole === "student" ? "CIC" : null,
    current_semester: fallbackRole === "student" ? 3 : null,
    section: fallbackRole === "student" ? "A" : null,
    designation: fallbackRole === "faculty" ? "Assistant Professor" : null,
    roll_number: fallbackRoll,
    status: "active",
  };

  profileMemCache.set(user.id, { profile: fallbackProfile, expiresAt: Date.now() + 60_000 });
  return { user, profile: fallbackProfile, supabase };
});
