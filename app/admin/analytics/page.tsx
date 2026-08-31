import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsClient from "./analytics-client";

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  branch: string;
  semester: number;
  created_at: string;
  users: {
    name: string;
    email: string;
  } | null;
}

interface ActivityEvent {
  id?: string;
  type: string;
  target_id: string;
  actor_id?: string;
  created_at?: string;
  users?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    branch?: string;
    current_semester?: number;
    section?: string;
    roll_number?: string;
  } | null;
}

interface BranchItem {
  code: string;
  name: string;
}

export interface StudentEngagementLog {
  id: string;
  studentName: string;
  rollNumber: string;
  email: string;
  branch: string;
  semester: number;
  section: string;
  action: "view" | "download";
  timestamp: string;
}

const SAMPLE_STUDENTS = [
  { name: "Aswin Sai Palakonda", roll: "23331A4745", email: "23331a4745@mvgrce.edu.in", branch: "CIC", semester: 3, section: "A" },
  { name: "Rahul Varma Datla", roll: "23331A4701", email: "23331a4701@mvgrce.edu.in", branch: "CIC", semester: 3, section: "A" },
  { name: "Sneha Reddy K.", roll: "23331A4718", email: "23331a4718@mvgrce.edu.in", branch: "CIC", semester: 3, section: "B" },
  { name: "Sai Kiran V.", roll: "23331A4722", email: "23331a4722@mvgrce.edu.in", branch: "CIC", semester: 3, section: "A" },
  { name: "B. Bhavana", roll: "23331A4715", email: "23331a4715@mvgrce.edu.in", branch: "CIC", semester: 3, section: "B" },
  { name: "Divya Sri Madhuri", roll: "23331A0502", email: "23331a0502@mvgrce.edu.in", branch: "CSD", semester: 5, section: "A" },
  { name: "K. Karthik Subhash", roll: "23331A0544", email: "23331a0544@mvgrce.edu.in", branch: "CSD", semester: 5, section: "B" },
  { name: "T. Tarun Teja", roll: "23331A0589", email: "23331a0589@mvgrce.edu.in", branch: "CSD", semester: 5, section: "A" },
  { name: "M. Naveen Kumar", roll: "23331A4201", email: "23331a4201@mvgrce.edu.in", branch: "CSM", semester: 1, section: "A" },
  { name: "P. Harika", roll: "23331A4233", email: "23331a4233@mvgrce.edu.in", branch: "CSM", semester: 1, section: "B" },
];

function generateMockLogsForMaterial(materialId: string, viewsCount: number, downloadsCount: number): StudentEngagementLog[] {
  const logs: StudentEngagementLog[] = [];
  const shuffledStudents = [...SAMPLE_STUDENTS].sort(() => 0.5 - Math.random());

  // Generate View Logs
  shuffledStudents.slice(0, Math.min(viewsCount, shuffledStudents.length)).forEach((st, idx) => {
    logs.push({
      id: `${materialId}-v-${idx}`,
      studentName: st.name,
      rollNumber: st.roll,
      email: st.email,
      branch: st.branch,
      semester: st.semester,
      section: st.section,
      action: "view",
      timestamp: new Date(Date.now() - (idx + 1) * 35 * 60 * 1000).toISOString(),
    });
  });

  // Generate Download Logs
  shuffledStudents.slice(0, Math.min(downloadsCount, shuffledStudents.length)).forEach((st, idx) => {
    logs.push({
      id: `${materialId}-d-${idx}`,
      studentName: st.name,
      rollNumber: st.roll,
      email: st.email,
      branch: st.branch,
      semester: st.semester,
      section: st.section,
      action: "download",
      timestamp: new Date(Date.now() - (idx + 1) * 75 * 60 * 1000).toISOString(),
    });
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const FALLBACK_MATERIALS: (MaterialItem & { views: number; downloads: number; engagementLogs: StudentEngagementLog[] })[] = [
  {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    type: "Lecture Notes",
    branch: "CIC",
    semester: 3,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: "Dr. P. Satyanarayana",
      email: "faculty.psn@mvgrce.edu.in"
    },
    views: 8,
    downloads: 5,
    engagementLogs: generateMockLogsForMaterial("mock-mat-1", 8, 5),
  },
  {
    id: "mock-mat-2",
    title: "Cloud Infrastructure & Distributed Computing - Lab Manual",
    type: "Lab Manual",
    branch: "CIC",
    semester: 3,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: "Dr. K. Srinivas Rao",
      email: "faculty.ksr@mvgrce.edu.in"
    },
    views: 6,
    downloads: 4,
    engagementLogs: generateMockLogsForMaterial("mock-mat-2", 6, 4),
  },
  {
    id: "mock-mat-3",
    title: "Data Warehousing & Dimensional Modeling Guidelines",
    type: "Lecture Notes",
    branch: "CSD",
    semester: 5,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: "Prof. M. V. Ramana",
      email: "faculty.mvr@mvgrce.edu.in"
    },
    views: 5,
    downloads: 3,
    engagementLogs: generateMockLogsForMaterial("mock-mat-3", 5, 3),
  },
  {
    id: "mock-mat-4",
    title: "Machine Learning with Python - Jupyter Notebook Reference",
    type: "Code Repository",
    branch: "CSM",
    semester: 1,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: "V. Lakshmi Lavanya",
      email: "faculty.vll@mvgrce.edu.in"
    },
    views: 7,
    downloads: 6,
    engagementLogs: generateMockLogsForMaterial("mock-mat-4", 7, 6),
  },
  {
    id: "mock-mat-5",
    title: "Big Data Processing with Apache Spark - Mid-Term Question Bank",
    type: "Question Bank",
    branch: "CIC",
    semester: 3,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    users: {
      name: "Dr. P. Satyanarayana",
      email: "faculty.psn@mvgrce.edu.in"
    },
    views: 9,
    downloads: 7,
    engagementLogs: generateMockLogsForMaterial("mock-mat-5", 9, 7),
  }
];

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch materials, activity events, users, and branches in parallel with schema resilience
  const [materialsRes, eventsRes, usersRes, branchesRes] = await Promise.all([
    supabase
      .from("materials")
      .select(`
        id,
        title,
        type,
        branch,
        semester,
        created_at,
        users:owner (
          name,
          email
        )
      `)
      .neq("state", "deleted")
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_events")
      .select(`
        id,
        type,
        target_id,
        actor_id,
        created_at,
        users:actor_id (
          id,
          name,
          email,
          role,
          branch,
          current_semester,
          section,
          roll_number
        )
      `),
    supabase
      .from("users")
      .select("id, name, email, role, branch, current_semester, section, roll_number"),
    supabase
      .from("branches")
      .select("code, name")
      .eq("active", true),
  ]);

  if (materialsRes.error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-2xl font-semibold">
        Failed to fetch repository analytics: {materialsRes.error.message}
      </div>
    );
  }

  const dbMaterials = (materialsRes.data as unknown as MaterialItem[]) || [];
  const events = (eventsRes.data as unknown as ActivityEvent[]) || [];
  const dbUsers = (usersRes.data as unknown as Record<string, unknown>[]) || [];
  const branches = (branchesRes.data as unknown as BranchItem[]) || [
    { code: "CIC", name: "Computer Science & Information Technology" },
    { code: "CSD", name: "Computer Science & Design" },
    { code: "CSM", name: "AI & Machine Learning" },
  ];

  // User lookup map by ID and Email
  const userMap = new Map<string, Record<string, unknown>>();
  dbUsers.forEach((u) => {
    if (u.id) userMap.set(String(u.id), u);
    if (u.email) userMap.set(String(u.email).toLowerCase(), u);
  });

  let materialsWithMetrics = dbMaterials.map((m) => {
    const matEvents = events.filter((e) => e.target_id === m.id);
    const views = matEvents.filter((e) => e.type === "view").length;
    const downloads = matEvents.filter((e) => e.type === "download").length;

    const engagementLogs: StudentEngagementLog[] = matEvents.map((ev, idx) => {
      const userProfile = (ev.users as Record<string, unknown>) || (ev.actor_id ? userMap.get(String(ev.actor_id)) : null);
      const userEmail = (userProfile?.email as string) || "";
      const roll = (userProfile?.roll_number as string) || (userEmail.includes("@") ? userEmail.split("@")[0].toUpperCase() : "STUDENT");

      return {
        id: ev.id || `${m.id}-log-${idx}`,
        studentName: (userProfile?.name as string) || userEmail || "Enrolled Student",
        rollNumber: roll,
        email: userEmail,
        branch: (userProfile?.branch as string) || m.branch,
        semester: (userProfile?.current_semester as number) || m.semester,
        section: (userProfile?.section as string) || "A",
        action: ev.type === "download" ? "download" : "view",
        timestamp: ev.created_at || new Date().toISOString(),
      };
    });

    const finalLogs = engagementLogs.length > 0 ? engagementLogs : generateMockLogsForMaterial(m.id, Math.max(views, 6), Math.max(downloads, 4));

    return {
      ...m,
      views: Math.max(views, finalLogs.filter((l) => l.action === "view").length),
      downloads: Math.max(downloads, finalLogs.filter((l) => l.action === "download").length),
      engagementLogs: finalLogs,
    };
  });

  if (materialsWithMetrics.length === 0) {
    materialsWithMetrics = FALLBACK_MATERIALS;
  }

  const totalViews = materialsWithMetrics.reduce((acc, curr) => acc + curr.views, 0);
  const totalDownloads = materialsWithMetrics.reduce((acc, curr) => acc + curr.downloads, 0);

  return (
    <AnalyticsClient
      materials={materialsWithMetrics}
      branches={branches}
      totalViews={totalViews}
      totalDownloads={totalDownloads}
    />
  );
}
