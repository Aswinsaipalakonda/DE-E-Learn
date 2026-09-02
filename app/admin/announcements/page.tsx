import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
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

const FALLBACK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "mock-ann-1",
    title: "Mid-Term Examination Schedule & Syllabus Guidelines (AY 2026-27)",
    content: "All B.Tech Data Engineering and CS students are required to review the published Mid-Term 1 timetable. Exam halls and seating allotments are posted on the departmental notice board. Attendance is strictly mandatory.",
    scope_branch: null,
    scope_semester: null,
    priority: "important",
    start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-ann-2",
    title: "Guest Lecture: Scalable Distributed Systems by Industry Lead",
    content: "Department of Data Engineering is hosting a specialized session on Big Data Architectures and Real-time Stream Analytics by Google Cloud engineers. All 3rd and 5th semester students are invited.",
    scope_branch: "CIC",
    scope_semester: 3,
    priority: "normal",
    start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-ann-3",
    title: "Submission Deadline for Data Engineering Capstone Projects",
    content: "Final year students must submit their complete design documents and GitHub repositories through the portal before 11:59 PM. Late submissions will incur credit deductions.",
    scope_branch: "CSD",
    scope_semester: 5,
    priority: "important",
    start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-ann-4",
    title: "Library Book Bank Distribution for Semester 1",
    content: "Prescribed reference textbooks for Semester 1 Mathematics, Physics, and Introduction to Programming are available for collection at Central Library Desk 3.",
    scope_branch: null,
    scope_semester: 1,
    priority: "normal",
    start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

import { readLocalExamSchedules, ExamSchedule } from "@/utils/exam-lockout";

export default async function AdminAnnouncementsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate Admin user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch announcements, branches, semesters, and exam schedules
  const [announcementsRes, branchesRes, semestersRes, examSchedulesRes] = await Promise.all([
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
      .from("exam_schedules")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const dbAnnouncements = (announcementsRes.data as unknown as AnnouncementItem[]) || [];
  const allAnnouncements = dbAnnouncements.length > 0 ? dbAnnouncements : FALLBACK_ANNOUNCEMENTS;

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

  return (
    <AnnouncementsClient
      initialAnnouncements={allAnnouncements}
      initialExamSchedules={allExamSchedules}
      branches={branches}
      semesters={semesters}
    />
  );
}
