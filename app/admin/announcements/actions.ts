"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/utils/audit-logger";

export async function createAnnouncement(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const scopeBranch = (formData.get("scope_branch") as string) || null;
  const scopeSemesterRaw = formData.get("scope_semester") as string;
  const scopeSemester = scopeSemesterRaw ? parseInt(scopeSemesterRaw, 10) : null;
  const priority = (formData.get("priority") as "normal" | "important") || "normal";
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  if (!title || !content || !startTime || !endTime) {
    return { error: "Title, content, start time, and end time are required." };
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title,
      content,
      scope_branch: scopeBranch === "ALL" ? null : scopeBranch,
      scope_semester: scopeSemester === 0 ? null : scopeSemester,
      priority,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  await logAuditAction(
    "create_announcement",
    data.id,
    null,
    { title, priority, scope_branch: scopeBranch, scope_semester: scopeSemester }
  );

  revalidatePath("/admin/announcements");
  revalidatePath("/student");
  revalidatePath("/faculty");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: beforeData } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await logAuditAction(
    "delete_announcement",
    id,
    beforeData || {},
    null
  );

  revalidatePath("/admin/announcements");
  revalidatePath("/student");
  revalidatePath("/faculty");
  return { success: true };
}

