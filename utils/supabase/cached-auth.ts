import { cache } from "react";
import { createClient } from "./server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "de-elearn-mvgrce-super-secure-jwt-secret-key-2026";

export interface CachedUserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  branch?: string | null;
  current_semester?: number | null;
  section?: string | null;
  designation?: string | null;
  phone?: string | null;
  roll_number?: string | null;
  status?: string;
}

const profileMemCache = new Map<string, { profile: CachedUserProfile; expiresAt: number }>();

export function invalidateProfileCache(idOrEmail?: string) {
  if (!idOrEmail) {
    profileMemCache.clear();
  } else {
    profileMemCache.delete(idOrEmail);
  }
}

export const getCachedAuthUser = cache(async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    const token = cookieStore.get("de_token")?.value;
    if (!token) return { user: null, supabase };

    const payload: any = jwt.verify(token, JWT_SECRET);
    if (!payload || !payload.id) return { user: null, supabase };

    const user = {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role || "student") as "student" | "faculty" | "admin",
      user_metadata: {
        name: payload.name,
        role: payload.role,
        branch: payload.branch,
        current_semester: payload.current_semester,
        section: payload.section,
      },
      app_metadata: { role: payload.role },
      created_at: new Date().toISOString(),
    };

    return { user, supabase };
  } catch {
    return { user: null, supabase };
  }
});

export const getCachedUserProfile = cache(async (): Promise<{ user: any; profile: CachedUserProfile | null; supabase: any }> => {
  const { user, supabase } = await getCachedAuthUser();
  if (!user) {
    return { user: null, profile: null, supabase };
  }

  // Fast path: memory cache
  const cached = profileMemCache.get(user.id) || profileMemCache.get(user.email);
  if (cached && cached.expiresAt > Date.now()) {
    return { user, profile: cached.profile, supabase };
  }

  // Fetch directly from MySQL users table
  try {
    const [rows]: any = await pool.query(
      "SELECT id, name, email, role, branch, current_semester, section, designation, phone, roll_number, status FROM users WHERE id = ? OR email = ? LIMIT 1",
      [user.id, user.email]
    );

    if (rows && rows.length > 0) {
      const profile = rows[0] as CachedUserProfile;
      profileMemCache.set(user.id, { profile, expiresAt: Date.now() + 60_000 });
      profileMemCache.set(user.email, { profile, expiresAt: Date.now() + 60_000 });
      return { user, profile, supabase };
    }
  } catch (dbErr) {
    console.warn("MySQL getCachedUserProfile error:", dbErr);
  }

  const fallbackProfile: CachedUserProfile = {
    id: user.id,
    name: user.name || "User",
    email: user.email,
    role: user.role || "student",
    branch: user.user_metadata?.branch || null,
    current_semester: user.user_metadata?.current_semester || null,
    section: user.user_metadata?.section || null,
    designation: null,
    phone: null,
    roll_number: user.email?.includes("@") ? user.email.split("@")[0].toUpperCase() : null,
    status: "active",
  };

  profileMemCache.set(user.id, { profile: fallbackProfile, expiresAt: Date.now() + 60_000 });
  return { user, profile: fallbackProfile, supabase };
});
