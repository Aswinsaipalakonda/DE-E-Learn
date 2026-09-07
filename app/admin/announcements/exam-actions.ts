"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/utils/audit-logger";
import { 
  ExamSchedule, 
  readLocalExamSchedules, 
  saveLocalExamSchedules 
} from "@/utils/exam-lockout";

export async function createExamScheduleAction(data: {
  title: string;
  semesters: number[];
  branch: string;
  subjects?: string[];
  startDate: string;
  endDate: string;
  isDailyRecurring: boolean;
  dailyStartTime: string;
  dailyEndTime: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  if (!data.title || !data.semesters || data.semesters.length === 0) {
    return { error: "Title and at least one semester are required." };
  }

  const subjectsList = data.subjects && data.subjects.length > 0 ? data.subjects : ["ALL"];

  const newSchedule: ExamSchedule = {
    id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: data.title.trim(),
    semesters: data.semesters,
    branch: data.branch || "ALL",
    subjects: subjectsList,
    start_date: data.startDate,
    end_date: data.endDate,
    is_daily_recurring: data.isDailyRecurring ?? true,
    daily_start_time: data.dailyStartTime || "10:00",
    daily_end_time: data.dailyEndTime || "11:30",
    active: true,
    created_by: user.id,
    created_at: new Date().toISOString(),
  };

  // 1. Save to local resilient JSON store
  const localSchedules = readLocalExamSchedules();
  localSchedules.unshift(newSchedule);
  saveLocalExamSchedules(localSchedules);

  // 2. Save to Supabase DB
  try {
    await supabase.from("exam_schedules").insert({
      id: newSchedule.id,
      title: newSchedule.title,
      semesters: newSchedule.semesters,
      branch: newSchedule.branch,
      subjects: newSchedule.subjects,
      start_date: newSchedule.start_date,
      end_date: newSchedule.end_date,
      is_daily_recurring: newSchedule.is_daily_recurring,
      daily_start_time: newSchedule.daily_start_time,
      daily_end_time: newSchedule.daily_end_time,
      active: true,
      created_by: user.id,
    });
  } catch (dbErr) {
    console.warn("Exam schedule DB save notice:", dbErr);
  }

  await logAuditAction("create_exam_schedule", newSchedule.id, null, {
    title: newSchedule.title,
    semesters: newSchedule.semesters,
    branch: newSchedule.branch,
    subjects: newSchedule.subjects,
    daily_window: `${newSchedule.daily_start_time} - ${newSchedule.daily_end_time}`,
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/student");
  revalidatePath("/student/subjects");
  return { success: true, schedule: newSchedule };
}

export async function toggleExamScheduleAction(id: string, active: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Update local store
  const localSchedules = readLocalExamSchedules();
  const updated = localSchedules.map((s) => (s.id === id ? { ...s, active } : s));
  saveLocalExamSchedules(updated);

  // 2. Update Supabase
  try {
    await supabase
      .from("exam_schedules")
      .update({ active })
      .eq("id", id);
  } catch {}

  await logAuditAction("toggle_exam_schedule", id, null, { active });

  revalidatePath("/admin/announcements");
  revalidatePath("/student");
  revalidatePath("/student/subjects");
  return { success: true };
}

export async function deleteExamScheduleAction(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Update local store
  const localSchedules = readLocalExamSchedules();
  const filtered = localSchedules.filter((s) => s.id !== id);
  saveLocalExamSchedules(filtered);

  // 2. Update Supabase
  try {
    await supabase
      .from("exam_schedules")
      .delete()
      .eq("id", id);
  } catch {}

  await logAuditAction("delete_exam_schedule", id, null, null);

  revalidatePath("/admin/announcements");
  revalidatePath("/student");
  revalidatePath("/student/subjects");
  return { success: true };
}
