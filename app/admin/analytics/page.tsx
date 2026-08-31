import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnalyticsClient from "./analytics-client";
import { getServerActivityEvents } from "@/utils/activity-store";

interface MaterialFileItem {
  id: string;
  file_name: string;
  size?: number;
}

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  branch: string;
  semester: number;
  created_at: string;
  material_files?: MaterialFileItem[];
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
  actor_email?: string;
  actor_roll?: string;
  created_at?: string;
  metadata?: {
    file_id?: string;
    file_name?: string;
    action?: string;
    mode?: string;
    material_title?: string;
    roll_number?: string;
    email?: string;
    student_name?: string;
  };
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
  fileName?: string;
  actionDetail?: string;
  timestamp: string;
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch materials, activity events, users, and branches in parallel
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
        ),
        material_files (
          id,
          file_name,
          size
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
      .from("branches")
      .select("code, name")
      .eq("active", true),
  ]);

  if (materialsRes.error) {
    return (
      <div role="alert" className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold text-xs">
        Failed to fetch repository analytics: {materialsRes.error.message}
      </div>
    );
  }

  const dbMaterials = (materialsRes.data as unknown as MaterialItem[]) || [];
  const dbEvents = (eventsRes.data as unknown as ActivityEvent[]) || [];
  const dbUsers = (usersRes.data as unknown as Record<string, unknown>[]) || [];
  const branches = (branchesRes.data as unknown as BranchItem[]) || [
    { code: "CIC", name: "Cyber Security & IoT" },
    { code: "CSD", name: "Data Science" },
    { code: "CSM", name: "AI & Machine Learning" },
  ];

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

  // Merge and normalize all activity events
  const allRawEvents = [...serverEvents, ...cookieEvents, ...dbEvents];
  const eventsMap = new Map<string, any>();
  allRawEvents.forEach((ev) => {
    const key = `${ev.type}-${ev.target_id || ev.targetId}-${ev.actor_roll || ev.metadata?.roll_number || ev.actor_id}-${ev.file_name || ev.metadata?.file_name || "page"}-${ev.created_at?.slice(0, 16)}`;
    if (!eventsMap.has(key)) {
      eventsMap.set(key, ev);
    }
  });
  const events = Array.from(eventsMap.values());

  // User lookup map by ID, Email, and Roll Number
  const userMap = new Map<string, Record<string, unknown>>();
  dbUsers.forEach((u) => {
    if (u.id) userMap.set(String(u.id), u);
    if (u.email) userMap.set(String(u.email).toLowerCase(), u);
    if (u.roll_number) userMap.set(String(u.roll_number).toUpperCase(), u);
  });

  const materialsWithMetrics = dbMaterials.map((m) => {
    const matEvents = events.filter((e) => (e.target_id || e.targetId) === m.id);
    const views = matEvents.filter((e) => e.type === "view").length;
    const downloads = matEvents.filter((e) => e.type === "download").length;

    const engagementLogs: StudentEngagementLog[] = matEvents.map((ev, idx) => {
      const userProfile = 
        (ev.users as Record<string, unknown>) || 
        (ev.actor_id ? userMap.get(String(ev.actor_id)) : null) ||
        (ev.actor_email ? userMap.get(String(ev.actor_email).toLowerCase()) : null);

      const userEmail = (userProfile?.email as string) || ev.actor_email || ev.metadata?.email || "";
      const roll = 
        (userProfile?.roll_number as string) || 
        ev.actor_roll || 
        ev.metadata?.roll_number || 
        (userEmail.includes("@") ? userEmail.split("@")[0].toUpperCase() : "23331A4701");

      const studentName = 
        (userProfile?.name as string) || 
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
        branch: (userProfile?.branch as string) || m.branch,
        semester: (userProfile?.current_semester as number) || m.semester,
        section: (userProfile?.section as string) || (parseInt(roll.slice(-2), 10) <= 36 ? "A" : "B"),
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
      material_files: m.material_files || [],
    };
  });

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
