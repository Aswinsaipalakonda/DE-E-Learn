"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createAnnouncementAction(
  title: string,
  content: string,
  priority: "low" | "medium" | "high",
  scopeBranch: string | null,
  scopeSemester: number | null,
  startTime: string,
  endTime: string
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
    .from("announcements")
    .insert({
      title,
      content,
      priority,
      scope_branch: scopeBranch || null,
      scope_semester: scopeSemester || null,
      start_time: startTime,
      end_time: endTime,
      created_by: user.id
    });

  if (error) return { error: error.message };

  revalidatePath("/admin/announcements");
  return { success: true };
}
