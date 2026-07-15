"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Create a new subject
export async function createSubjectAction(
  code: string,
  title: string,
  branch: string,
  semester: number
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Permission denied." };
  }

  const { error } = await supabase
    .from("subjects")
    .insert({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      branch,
      semester,
      active: true
    });

  if (error) return { error: error.message };

  revalidatePath("/admin/taxonomy");
  return { success: true };
}

// Toggle subject active status
export async function toggleSubjectActiveAction(code: string, currentActive: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("subjects")
    .update({ active: !currentActive })
    .eq("code", code);

  if (error) return { error: error.message };

  revalidatePath("/admin/taxonomy");
  return { success: true };
}

// Create a new branch
export async function createBranchAction(code: string, name: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("branches")
    .insert({
      code: code.toUpperCase().trim(),
      name: name.trim(),
      active: true
    });

  if (error) return { error: error.message };

  revalidatePath("/admin/taxonomy");
  return { success: true };
}
