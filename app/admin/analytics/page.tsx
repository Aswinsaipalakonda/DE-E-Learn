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
  type: string;
  target_id: string;
}

interface BranchItem {
  code: string;
  name: string;
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch materials, activity events, and branches in parallel
  const [materialsRes, eventsRes, branchesRes] = await Promise.all([
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
      .select("type, target_id"),
    supabase
      .from("branches")
      .select("code, name")
      .eq("active", true),
  ]);

  if (materialsRes.error || eventsRes.error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-2xl font-semibold">
        Failed to fetch repository analytics: {materialsRes.error?.message || eventsRes.error?.message}
      </div>
    );
  }

  const materials = (materialsRes.data as unknown as MaterialItem[]) || [];
  const events = (eventsRes.data as unknown as ActivityEvent[]) || [];
  const branches = (branchesRes.data as unknown as BranchItem[]) || [];

  // Aggregations
  const totalViews = events.filter((e) => e.type === "view").length;
  const totalDownloads = events.filter((e) => e.type === "download").length;

  const materialsWithMetrics = materials.map((m) => {
    const views = events.filter((e) => e.target_id === m.id && e.type === "view").length;
    const downloads = events.filter((e) => e.target_id === m.id && e.type === "download").length;
    return {
      ...m,
      views,
      downloads,
    };
  });

  return (
    <AnalyticsClient
      materials={materialsWithMetrics}
      branches={branches}
      totalViews={totalViews}
      totalDownloads={totalDownloads}
    />
  );
}
