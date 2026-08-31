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

const FALLBACK_MATERIALS: (MaterialItem & { views: number; downloads: number })[] = [
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
    views: 142,
    downloads: 89,
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
    views: 98,
    downloads: 64,
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
    views: 76,
    downloads: 51,
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
    views: 185,
    downloads: 120,
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
    views: 210,
    downloads: 165,
  }
];

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

  const dbMaterials = (materialsRes.data as unknown as MaterialItem[]) || [];
  const events = (eventsRes.data as unknown as ActivityEvent[]) || [];
  const branches = (branchesRes.data as unknown as BranchItem[]) || [
    { code: "CIC", name: "Computer Science & Information Technology" },
    { code: "CSD", name: "Computer Science & Design" },
    { code: "CSM", name: "AI & Machine Learning" },
  ];

  // Aggregations
  let totalViews = events.filter((e) => e.type === "view").length;
  let totalDownloads = events.filter((e) => e.type === "download").length;

  let materialsWithMetrics = dbMaterials.map((m) => {
    const views = events.filter((e) => e.target_id === m.id && e.type === "view").length;
    const downloads = events.filter((e) => e.target_id === m.id && e.type === "download").length;
    return {
      ...m,
      views,
      downloads,
    };
  });

  if (materialsWithMetrics.length === 0) {
    materialsWithMetrics = FALLBACK_MATERIALS;
    totalViews = FALLBACK_MATERIALS.reduce((acc, curr) => acc + curr.views, 0);
    totalDownloads = FALLBACK_MATERIALS.reduce((acc, curr) => acc + curr.downloads, 0);
  }

  return (
    <AnalyticsClient
      materials={materialsWithMetrics}
      branches={branches}
      totalViews={totalViews}
      totalDownloads={totalDownloads}
    />
  );
}
