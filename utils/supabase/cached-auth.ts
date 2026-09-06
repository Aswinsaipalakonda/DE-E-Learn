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

// React cache deduplicates calls within the same request lifecycle (0ms for subsequent calls in layout & page)
export const getCachedAuthUser = cache(async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  // Fast-path heuristic from metadata if present
  const metaRole = user.user_metadata?.role as "student" | "faculty" | "admin" | undefined;
  const metaName = user.user_metadata?.name as string | undefined;

  const { data: dbProfile } = await supabase
    .from("users")
    .select("id, name, email, role, branch, current_semester, section, designation, roll_number, status")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (dbProfile) {
    return { user, profile: dbProfile as CachedUserProfile, supabase };
  }

  // Fallback default profile if not found in db yet
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

  return { user, profile: fallbackProfile, supabase };
});
