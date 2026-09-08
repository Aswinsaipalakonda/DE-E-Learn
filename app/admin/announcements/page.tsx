import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import { redirect } from "next/navigation";
import AnnouncementsClient from "./announcements-client";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  scope_branch: string | null;
  scope_semester: number | null;
  priority: "normal" | "important";
  start_time: string;
  end_time: string;
  created_at: string;
}

interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  regulation?: string;
}

import { readLocalExamSchedules, ExamSchedule } from "@/utils/exam-lockout";

export default async function AdminAnnouncementsPage() {
  const { user, supabase } = await getCachedUserProfile();
  if (!user) redirect("/login");

  // Fetch announcements, branches, semesters, subjects, and exam schedules in parallel
  const [announcementsRes, branchesRes, semestersRes, subjectsRes, examSchedulesRes] = await Promise.all([
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("branches")
      .select("code, name")
      .eq("active", true),
    supabase
      .from("semesters")
      .select("number, name")
      .eq("active", true)
      .order("number", { ascending: true }),
    supabase
      .from("subjects")
      .select("code, title, branch, semester, regulation")
      .eq("active", true)
      .order("code", { ascending: true }),
    supabase
      .from("exam_schedules")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const dbAnnouncements = (announcementsRes.data as unknown as AnnouncementItem[]) || [];
  const allAnnouncements = dbAnnouncements;

  const localExamSchedules = readLocalExamSchedules();
  const dbExamSchedules = (examSchedulesRes.data as unknown as ExamSchedule[]) || [];
  const scheduleMap = new Map<string, ExamSchedule>();
  [...localExamSchedules, ...dbExamSchedules].forEach((s) => {
    if (!scheduleMap.has(s.id)) scheduleMap.set(s.id, s);
  });
  const allExamSchedules = Array.from(scheduleMap.values());

  const branches = (branchesRes.data as unknown as { code: string; name: string }[]) || [
    { code: "CIC", name: "Computer Science & Information Technology" },
    { code: "CSD", name: "Computer Science & Design" },
    { code: "CSM", name: "AI & Machine Learning" },
  ];

  const semesters = (semestersRes.data as unknown as { number: number; name: string }[]) || [
    { number: 1, name: "1st Semester" },
    { number: 2, name: "2nd Semester" },
    { number: 3, name: "3rd Semester" },
    { number: 4, name: "4th Semester" },
    { number: 5, name: "5th Semester" },
    { number: 6, name: "6th Semester" },
    { number: 7, name: "7th Semester" },
    { number: 8, name: "8th Semester" },
  ];

  const subjects = (subjectsRes.data as unknown as SubjectItem[]) || [];

  return (
    <AnnouncementsClient
      initialAnnouncements={allAnnouncements}
      initialExamSchedules={allExamSchedules}
      branches={branches}
      semesters={semesters}
      subjects={subjects}
    />
  );
}
