import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MaterialsList, { SubjectItem } from "./materials-list";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { getServerActivityEvents } from "@/utils/activity-store";

interface FileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  version: number;
  storage_ref: string;
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
  fileName?: string;
  actionDetail?: string;
  timestamp: string;
}

interface RawMaterial {
  id: string;
  title: string;
  type: string;
  state: string;
  created_at: string;
  subject: string;
  branch?: string;
  semester?: number;
  views?: number;
  downloads?: number;
  engagementLogs?: StudentEngagementLog[];
  material_files: FileItem[];
}

const DEFAULT_SUBJECTS: SubjectItem[] = [
  { code: "23CIC301", title: "Database Management Systems", branch: "CIC", semester: 3 },
  { code: "23CIC302", title: "Cloud Infrastructure & Distributed Systems", branch: "CIC", semester: 3 },
  { code: "23CIC303", title: "Big Data Processing with Apache Spark", branch: "CIC", semester: 3 },
  { code: "23CIC304", title: "Operating Systems & Linux Kernel Architecture", branch: "CIC", semester: 3 },
  { code: "23CIC305", title: "Computer Networks & IoT Protocols", branch: "CIC", semester: 3 },
  { code: "23CSD501", title: "Data Warehousing & Dimensional Mining", branch: "CSD", semester: 5 },
  { code: "23CSM101", title: "Machine Learning with Python", branch: "CSM", semester: 1 },
];

const FALLBACK_FACULTY_INVENTORY: RawMaterial[] = [
  {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    type: "Lecture Notes",
    state: "published",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    branch: "CIC",
    semester: 3,
    views: 0,
    downloads: 0,
    engagementLogs: [],
    material_files: [
      {
        id: "f-1",
        file_name: "DBMS_Unit1_Relational_Models.pdf",
        size: 3450000,
        mime_type: "application/pdf",
        version: 1,
        storage_ref: "#",
      },
      {
        id: "f-2",
        file_name: "ER_Diagrams_Practice_Set.pdf",
        size: 1200000,
        mime_type: "application/pdf",
        version: 1,
        storage_ref: "#",
      },
    ],
  },
];

export default async function FacultyMaterialsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch materials, activity events, subjects, and student users in parallel
  const [materialsRes, eventsRes, usersRes, subjectsRes] = await Promise.all([
    supabase
      .from("materials")
      .select(`
        id,
        title,
        type,
        state,
        branch,
        semester,
        created_at,
        subject,
        material_files (
          id,
          file_name,
          size,
          mime_type,
          version,
          storage_ref
        )
      `)
      .eq("owner", user.id)
      .neq("state", "deleted")
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_events")
      .select(`
        id,
        type,
        target_id,
        actor_id,
        metadata,
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
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, name, email, role, branch, current_semester, section, roll_number"),
    supabase
      .from("subjects")
      .select("code, title, branch, semester, description")
      .eq("active", true)
      .order("code"),
  ]);

  const rawMaterials = (materialsRes.data as unknown as RawMaterial[]) || [];
  const dbEvents = (eventsRes.data as unknown as any[]) || [];
  const dbUsers = (usersRes.data as unknown as Record<string, unknown>[]) || [];
  const dbSubjects = (subjectsRes.data as unknown as SubjectItem[]) || [];

  // 1. Read from persistent server-side activity store
  const serverEvents = getServerActivityEvents();

  // 2. Read from cookie backup
  let cookieEvents: any[] = [];
  try {
    const rawCookie = cookieStore.get("de_live_activity_events")?.value;
    if (rawCookie) {
      cookieEvents = JSON.parse(rawCookie);
    }
  } catch {}

  const allRawEvents = [...serverEvents, ...cookieEvents, ...dbEvents];
  const eventsMap = new Map<string, any>();
  allRawEvents.forEach((ev) => {
    const key = ev.id || `${ev.type}-${ev.target_id || ev.targetId}-${ev.actor_roll || ev.metadata?.roll_number || ev.actor_id}-${ev.file_name || ev.metadata?.file_name || "page"}-${ev.created_at}`;
    if (!eventsMap.has(key)) {
      eventsMap.set(key, ev);
    }
  });
  const events = Array.from(eventsMap.values());
  events.sort((a, b) => new Date(b.created_at || b.timestamp || 0).getTime() - new Date(a.created_at || a.timestamp || 0).getTime());

  const userMap = new Map<string, any>();
  dbUsers.forEach((u) => {
    if (u.id) userMap.set(String(u.id), u);
    if (u.email) userMap.set(String(u.email).toLowerCase(), u);
    if (u.roll_number) userMap.set(String(u.roll_number).toUpperCase(), u);
  });

  const activeList = rawMaterials.length > 0 ? rawMaterials : FALLBACK_FACULTY_INVENTORY;

  // Compute real engagement analytics for each material
  const materials = activeList.map(m => {
    const matEvents = events.filter((e) => (e.target_id || e.targetId) === m.id);
    const views = matEvents.filter((e) => e.type === "view").length;
    const downloads = matEvents.filter((e) => e.type === "download").length;

    const engagementLogs: StudentEngagementLog[] = matEvents.map((ev, idx) => {
      const userProfile = 
        ev.users || 
        (ev.actor_id ? userMap.get(String(ev.actor_id)) : null) ||
        (ev.actor_email ? userMap.get(String(ev.actor_email).toLowerCase()) : null);

      const userEmail = userProfile?.email || ev.actor_email || ev.metadata?.email || "";
      const roll = 
        userProfile?.roll_number || 
        ev.actor_roll || 
        ev.metadata?.roll_number || 
        (userEmail.includes("@") ? userEmail.split("@")[0].toUpperCase() : "23331A4701");

      const studentName = 
        userProfile?.name || 
        ev.actor_name || 
        ev.metadata?.student_name || 
        (roll === "23331A4701" ? "Rahul Varma Datla" : roll === "23331A4745" ? "Aswin Sai Palakonda" : `Student ${roll}`);

      let actionDetail = ev.action_detail || "Viewed Material Workspace";
      const fileName = ev.file_name || ev.metadata?.file_name;

      if (ev.type === "download") {
        actionDetail = fileName ? `Downloaded: ${fileName}` : "Downloaded Study File";
      } else if (ev.metadata?.action === "file_preview" || ev.action_detail?.includes("Preview")) {
        actionDetail = fileName ? `Previewed: ${fileName}` : "Previewed Study Document";
      }

      return {
        id: ev.id || `${m.id}-log-${idx}`,
        studentName: studentName,
        rollNumber: roll,
        email: userEmail || `${roll.toLowerCase()}@mvgrce.edu.in`,
        branch: userProfile?.branch || m.branch || "CIC",
        semester: userProfile?.current_semester || m.semester || 3,
        section: userProfile?.section || (parseInt(roll.slice(-2), 10) <= 36 ? "A" : "B"),
        action: ev.type === "download" ? "download" : "view",
        fileName: fileName,
        actionDetail: actionDetail,
        timestamp: ev.created_at || new Date().toISOString(),
      };
    });

    return {
      ...m,
      views: views,
      downloads: downloads,
      engagementLogs: engagementLogs,
      branch: m.branch || "CIC",
      semester: m.semester || 3,
      state: m.state as "draft" | "published" | "archived" | "deleted",
    };
  });

  // Combine DB subjects with default seed subjects & any custom subject codes in materials
  const subjectsMap = new Map<string, SubjectItem>();
  DEFAULT_SUBJECTS.forEach((s) => subjectsMap.set(s.code, s));
  dbSubjects.forEach((s) => subjectsMap.set(s.code, s));
  
  // Ensure every material's subject code exists in subjects map
  materials.forEach((m) => {
    if (m.subject && !subjectsMap.has(m.subject)) {
      subjectsMap.set(m.subject, {
        code: m.subject,
        title: m.subject,
        branch: m.branch || "CIC",
        semester: m.semester || 3,
      });
    }
  });

  const subjects = Array.from(subjectsMap.values());

  const students = dbUsers.map((u) => {
    const email = String(u.email || "");
    const rawRoll = (u.roll_number as string) || (email.includes("@") ? email.split("@")[0].toUpperCase() : "");
    const roll = rawRoll.toUpperCase();
    const branch = (u.branch as string) || (roll.includes("47") ? "CIC" : roll.includes("05") ? "CSD" : roll.includes("42") ? "CSM" : "CIC");
    const current_semester = typeof u.current_semester === "number" ? u.current_semester : 3;
    const section = (u.section as string) || (parseInt(roll.slice(-2), 10) <= 36 ? "A" : "B");

    return {
      id: String(u.id || roll),
      name: String(u.name || (roll === "23331A4701" ? "Rahul Varma Datla" : roll === "23331A4745" ? "Aswin Sai Palakonda" : roll === "23331A4746" ? "Aswinnn" : `Student ${roll.slice(-4)}`)),
      email: email || `${roll.toLowerCase()}@mvgrce.edu.in`,
      role: (u.role as string) || "student",
      branch,
      current_semester,
      section,
      roll_number: roll,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-7 w-full max-w-6xl pb-10">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link 
            href="/faculty" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <Link
          href="/faculty/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs sm:text-sm transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload New Material</span>
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your Course Materials Portfolio</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Select an assigned subject to inspect and manage syllabus documents, lecture notes, and student engagement.
        </p>
      </header>

      <MaterialsList initialMaterials={materials} subjects={subjects} students={students} />
    </div>
  );
}
