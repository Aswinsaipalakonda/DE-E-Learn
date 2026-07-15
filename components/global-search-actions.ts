"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

interface SearchResult {
  materials: {
    id: string;
    title: string;
    type: string;
    subject: string;
    branch: string;
    semester: number;
    state: string;
  }[];
  subjects: {
    code: string;
    title: string;
    branch: string;
    semester: number;
  }[];
}

export async function searchPortalAction(query: string): Promise<SearchResult> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const cleanQuery = query.trim();
  if (!cleanQuery) return { materials: [], subjects: [] };

  // Fetch session & profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { materials: [], subjects: [] };

  const { data: profile } = await supabase
    .from("users")
    .select("role, branch, current_semester")
    .eq("id", user.id)
    .single();

  if (!profile) return { materials: [], subjects: [] };

  const isStudent = profile.role === "student";
  const isFaculty = profile.role === "faculty";

  // Query subjects matching search query
  let subjectsQuery = supabase
    .from("subjects")
    .select("code, title, branch, semester")
    .eq("active", true)
    .or(`code.ilike.%${cleanQuery}%,title.ilike.%${cleanQuery}%`);

  // If student, restrict subjects to current branch/semester
  if (isStudent && profile.branch) {
    subjectsQuery = subjectsQuery
      .eq("branch", profile.branch)
      .eq("semester", profile.current_semester || 1);
  }

  const { data: subjectsData } = await subjectsQuery.limit(5);
  const subjects = subjectsData || [];

  // Query materials matching search query
  let materialsQuery = supabase
    .from("materials")
    .select("id, title, type, subject, branch, semester, state")
    .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,type.ilike.%${cleanQuery}%`);

  // Apply Role/Scope constraints on materials
  if (isStudent) {
    if (profile.branch) {
      materialsQuery = materialsQuery
        .eq("branch", profile.branch)
        .eq("semester", profile.current_semester || 1);
    }
    materialsQuery = materialsQuery.eq("state", "published");
  } else if (isFaculty) {
    // Faculty sees all published resources, plus their own draft materials
    materialsQuery = materialsQuery.or(`state.eq.published,owner.eq.${user.id}`);
  } else {
    // Admin sees everything except soft-deleted
    materialsQuery = materialsQuery.neq("state", "deleted");
  }

  const { data: materialsData } = await materialsQuery.limit(10);
  const materials = materialsData || [];

  return {
    materials: materials as SearchResult["materials"],
    subjects: subjects as SearchResult["subjects"],
  };
}
