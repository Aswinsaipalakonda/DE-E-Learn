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
  metadata?: {
    file_id?: string;
    file_name?: string;
    action?: string;
    mode?: string;
    material_title?: string;
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
  const events = (eventsRes.data as unknown as ActivityEvent[]) || [];
  const dbUsers = (usersRes.data as unknown as Record<string, unknown>[]) || [];
  const branches = (branchesRes.data as unknown as BranchItem[]) || [
    { code: "CIC", name: "Cyber Security & IoT" },
    { code: "CSD", name: "Data Science" },
    { code: "CSM", name: "AI & Machine Learning" },
  ];

  // User lookup map by ID and Email
  const userMap = new Map<string, Record<string, unknown>>();
  dbUsers.forEach((u) => {
    if (u.id) userMap.set(String(u.id), u);
    if (u.email) userMap.set(String(u.email).toLowerCase(), u);
  });

  const materialsWithMetrics = dbMaterials.map((m) => {
    const matEvents = events.filter((e) => e.target_id === m.id);
    const views = matEvents.filter((e) => e.type === "view").length;
    const downloads = matEvents.filter((e) => e.type === "download").length;

    const engagementLogs: StudentEngagementLog[] = matEvents.map((ev, idx) => {
      const userProfile = (ev.users as Record<string, unknown>) || (ev.actor_id ? userMap.get(String(ev.actor_id)) : null);
      const userEmail = (userProfile?.email as string) || "";
      const roll = (userProfile?.roll_number as string) || (userEmail.includes("@") ? userEmail.split("@")[0].toUpperCase() : "STUDENT");

      let actionDetail = "Viewed Material Workspace";
      const fileName = ev.metadata?.file_name;

      if (ev.type === "download") {
        actionDetail = fileName ? `Downloaded: ${fileName}` : "Downloaded Study File";
      } else if (ev.metadata?.action === "file_preview") {
        actionDetail = fileName ? `Previewed: ${fileName}` : "Previewed Study Document";
      }

      return {
        id: ev.id || `${m.id}-log-${idx}`,
        studentName: (userProfile?.name as string) || userEmail || "Enrolled Student",
        rollNumber: roll,
        email: userEmail,
        branch: (userProfile?.branch as string) || m.branch,
        semester: (userProfile?.current_semester as number) || m.semester,
        section: (userProfile?.section as string) || "A",
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
