import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UsersClient from "./users-client";

interface BranchItem {
  code: string;
  name: string;
}

interface SemesterItem {
  number: number;
  name: string;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "student" | "faculty" | "admin";
  status: "active" | "deactivated";
  branch: string | null;
  current_semester: number | null;
  section: string | null;
  designation: string | null;
  roll_number: string | null;
  created_at: string;
}

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch users with schema resilience
  let usersData: Record<string, unknown>[] | null = null;
  let fetchError: { message: string } | null = null;

  const usersWithAllCols = await supabase
    .from("users")
    .select("id, email, name, role, status, branch, current_semester, section, designation, roll_number, created_at")
    .order("created_at", { ascending: false });

  if (usersWithAllCols.error) {
    // Fallback query if optional columns are not present in schema yet
    const fallbackUsers = await supabase
      .from("users")
      .select("id, email, name, role, status, branch, current_semester, created_at")
      .order("created_at", { ascending: false });

    if (fallbackUsers.error) {
      fetchError = fallbackUsers.error;
    } else {
      usersData = fallbackUsers.data as unknown as Record<string, unknown>[];
    }
  } else {
    usersData = usersWithAllCols.data as unknown as Record<string, unknown>[];
  }

  // Fetch branches and semesters
  const [branchesRes, semestersRes] = await Promise.all([
    supabase.from("branches").select("code, name").eq("active", true),
    supabase.from("semesters").select("number, name").eq("active", true),
  ]);

  if (fetchError || !usersData) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to load users directory: {fetchError?.message || "Unknown error"}
      </div>
    );
  }

  // Cast values safely
  const users: UserItem[] = (usersData || []).map((u) => ({
    id: String(u.id || ""),
    email: String(u.email || ""),
    name: String(u.name || ""),
    role: (u.role as "student" | "faculty" | "admin") || "student",
    status: (u.status as "active" | "deactivated") || "active",
    branch: (u.branch as string) || null,
    current_semester: typeof u.current_semester === "number" ? u.current_semester : null,
    section: (u.section as string) || null,
    designation: (u.designation as string) || null,
    roll_number: (u.roll_number as string) || (String(u.email || "").includes("@") ? String(u.email || "").split("@")[0].toUpperCase() : null),
    created_at: String(u.created_at || ""),
  }));



  const branches = (branchesRes.data as unknown as BranchItem[]) || [];
  const semesters = (semestersRes.data as unknown as SemesterItem[]) || [];

  return (
    <UsersClient 
      initialUsers={users} 
      branches={branches} 
      semesters={semesters} 
    />
  );
}


