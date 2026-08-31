"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/utils/audit-logger";

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

  await logAuditAction("CREATE_SUBJECT", code, null, { title, branch, semester });

  revalidatePath("/admin/taxonomy");
  return { success: true };
}

// Update an existing subject
export async function updateSubjectAction(
  originalCode: string,
  originalBranch: string,
  updates: {
    code: string;
    title: string;
    branch: string;
    semester: number;
    active: boolean;
  }
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
    .update({
      code: updates.code.toUpperCase().trim(),
      title: updates.title.trim(),
      branch: updates.branch,
      semester: updates.semester,
      active: updates.active,
    })
    .eq("code", originalCode)
    .eq("branch", originalBranch);

  if (error) return { error: error.message };

  await logAuditAction("UPDATE_SUBJECT", updates.code, { originalCode, originalBranch }, updates);

  revalidatePath("/admin/taxonomy");
  return { success: true };
}

// Delete a subject
export async function deleteSubjectAction(code: string, branch: string) {
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
    .delete()
    .eq("code", code)
    .eq("branch", branch);

  if (error) return { error: error.message };

  await logAuditAction("DELETE_SUBJECT", code, { branch }, null);

  revalidatePath("/admin/taxonomy");
  return { success: true };
}

// Toggle subject active status
export async function toggleSubjectActiveAction(code: string, branch: string, currentActive: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("subjects")
    .update({ active: !currentActive })
    .eq("code", code)
    .eq("branch", branch);

  if (error) return { error: error.message };

  await logAuditAction("TOGGLE_SUBJECT_STATUS", code, { active: currentActive, branch }, { active: !currentActive, branch });

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

  await logAuditAction("CREATE_BRANCH", code, null, { name });

  revalidatePath("/admin/taxonomy");
  return { success: true };
}

// Delete a branch
export async function deleteBranchAction(code: string) {
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
    .from("branches")
    .delete()
    .eq("code", code);

  if (error) return { error: error.message };

  await logAuditAction("DELETE_BRANCH", code, null, null);

  revalidatePath("/admin/taxonomy");
  return { success: true };
}
