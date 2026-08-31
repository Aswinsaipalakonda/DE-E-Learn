import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MaterialsList from "./materials-list";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

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
  views?: number;
  downloads?: number;
  engagementLogs?: StudentEngagementLog[];
  material_files: FileItem[];
}

const FALLBACK_FACULTY_INVENTORY: RawMaterial[] = [
  {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    type: "Lecture Notes",
    state: "published",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
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
  {
    id: "mock-mat-8",
    title: "Unit 2: SQL Advanced Queries, Nested Joins, and Trigger Stored Procedures",
    type: "Lecture Slides",
    state: "published",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    views: 0,
    downloads: 0,
    engagementLogs: [],
    material_files: [
      {
        id: "f-3",
        file_name: "SQL_Advanced_Queries_Slides.pdf",
        size: 2800000,
        mime_type: "application/pdf",
        version: 2,
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

  // Fetch materials, activity events, and student users in parallel
  const [materialsRes, eventsRes, usersRes] = await Promise.all([
    supabase
      .from("materials")
      .select(`
        id,
        title,
        type,
        state,
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
  ]);

  const rawMaterials = (materialsRes.data as unknown as RawMaterial[]) || [];
  const events = (eventsRes.data as any[]) || [];
  const dbUsers = (usersRes.data as any[]) || [];

  const userMap = new Map<string, any>();
  dbUsers.forEach((u) => {
    if (u.id) userMap.set(String(u.id), u);
    if (u.email) userMap.set(String(u.email).toLowerCase(), u);
  });

  const activeList = rawMaterials.length > 0 ? rawMaterials : FALLBACK_FACULTY_INVENTORY;

  // Compute real engagement analytics for each material
  const materials = activeList.map(m => {
    const matEvents = events.filter((e) => e.target_id === m.id);
    const views = matEvents.filter((e) => e.type === "view").length;
    const downloads = matEvents.filter((e) => e.type === "download").length;

    const engagementLogs: StudentEngagementLog[] = matEvents.map((ev, idx) => {
      const userProfile = ev.users || (ev.actor_id ? userMap.get(String(ev.actor_id)) : null);
      const userEmail = userProfile?.email || "";
      const roll = userProfile?.roll_number || (userEmail.includes("@") ? userEmail.split("@")[0].toUpperCase() : "STUDENT");

      let actionDetail = "Viewed Material Workspace";
      const fileName = ev.metadata?.file_name;

      if (ev.type === "download") {
        actionDetail = fileName ? `Downloaded: ${fileName}` : "Downloaded Study File";
      } else if (ev.metadata?.action === "file_preview") {
        actionDetail = fileName ? `Previewed: ${fileName}` : "Previewed Study Document";
      }

      return {
        id: ev.id || `${m.id}-log-${idx}`,
        studentName: userProfile?.name || userEmail || "Enrolled Student",
        rollNumber: roll,
        email: userEmail,
        branch: userProfile?.branch || "CIC",
        semester: userProfile?.current_semester || 3,
        section: userProfile?.section || "A",
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
      state: m.state as "draft" | "published" | "archived" | "deleted",
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
          <span>Upload Material</span>
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your Materials Inventory</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Manage your uploaded files, monitor live student engagement, and inspect verified file downloads.
        </p>
      </header>

      <MaterialsList initialMaterials={materials} />
    </div>
  );
}
