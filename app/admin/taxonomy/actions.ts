"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/utils/audit-logger";

// Create a new subject (Supports single branch or multiple branches simultaneously)
export async function createSubjectAction(
  code: string,
  title: string,
  branches: string[] | string,
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

  const branchList = (Array.isArray(branches) ? branches : [branches]).filter(Boolean);
  if (branchList.length === 0) {
    return { error: "Please select at least one branch for this subject." };
  }

  const formattedCode = code.toUpperCase().trim();
  const formattedTitle = title.trim();

  const insertPayloads = branchList.map((branch) => ({
    code: formattedCode,
    title: formattedTitle,
    branch,
    semester,
    active: true
  }));

  // Perform multi-row insert/upsert
  let lastError: string | null = null;
  for (const item of insertPayloads) {
    const { error } = await supabase
      .from("subjects")
      .upsert(item, { onConflict: "code,branch" });

    if (error) {
      // Fallback try simple insert
      const retry = await supabase.from("subjects").insert(item);
      if (retry.error) {
        lastError = retry.error.message;
      }
    }
  }

  if (lastError && insertPayloads.length === 1) {
    return { error: lastError };
  }

  await logAuditAction("CREATE_SUBJECT", formattedCode, null, { 
    title: formattedTitle, 
    branches: branchList, 
    semester,
    count: branchList.length 
  });

  revalidatePath("/admin/taxonomy");
  revalidatePath("/student/subjects");
  revalidatePath("/faculty/upload");
  revalidatePath("/faculty/materials");
  return { success: true };
}

// Update an existing subject
export async function updateSubjectAction(
  originalCode: string,
  originalBranch: string,
  updates: {
    code: string;
    title: string;
    branches?: string[];
    branch?: string;
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

  const formattedCode = updates.code.toUpperCase().trim();
  const formattedTitle = updates.title.trim();
  const branchList = updates.branches && updates.branches.length > 0 
    ? updates.branches 
    : [updates.branch || originalBranch];

  // If branch changed or multiple branches specified
  if (branchList.length === 1 && branchList[0] === originalBranch && originalCode === formattedCode) {
    const { error } = await supabase
      .from("subjects")
      .update({
        code: formattedCode,
        title: formattedTitle,
        branch: branchList[0],
        semester: updates.semester,
        active: updates.active,
      })
      .eq("code", originalCode)
      .eq("branch", originalBranch);

    if (error) return { error: error.message };
  } else {
    // Delete old record if code/branch changed
    await supabase
      .from("subjects")
      .delete()
      .eq("code", originalCode)
      .eq("branch", originalBranch);

    // Upsert new branch records
    for (const b of branchList) {
      await supabase.from("subjects").upsert({
        code: formattedCode,
        title: formattedTitle,
        branch: b,
        semester: updates.semester,
        active: updates.active,
      }, { onConflict: "code,branch" });
    }
  }

  await logAuditAction("UPDATE_SUBJECT", formattedCode, { originalCode, originalBranch }, updates);

  revalidatePath("/admin/taxonomy");
  revalidatePath("/student/subjects");
  revalidatePath("/faculty/upload");
  revalidatePath("/faculty/materials");
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
