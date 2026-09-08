import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
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
  phone: string | null;
  roll_number: string | null;
  created_at: string;
}

export default async function AdminUsersPage() {
  const { user, supabase } = await getCachedUserProfile();
  if (!user) redirect("/login");

  // Fetch student users from database
  let usersData: Record<string, unknown>[] | null = null;
  let fetchError: { message: string } | null = null;

  const usersWithAllCols = await supabase
    .from("users")
    .select("id, email, name, role, status, branch, current_semester, section, roll_number, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (usersWithAllCols.error) {
    const fallbackUsers = await supabase
      .from("users")
      .select("id, email, name, role, status, branch, current_semester, created_at")
      .eq("role", "student")
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
  const dbUsers: UserItem[] = (usersData || []).map((u) => ({
    id: String(u.id || ""),
    email: String(u.email || ""),
    name: String(u.name || ""),
    role: (u.role as "student" | "faculty" | "admin") || "student",
    status: (u.status as "active" | "deactivated") || "active",
    branch: (u.branch as string) || null,
    current_semester: typeof u.current_semester === "number" ? u.current_semester : null,
    section: (u.section as string) || null,
    designation: (u.designation as string) || null,
    phone: (u.phone as string) || null,
    roll_number: (u.roll_number as string) || (String(u.email || "").includes("@") ? String(u.email || "").split("@")[0].toUpperCase() : null),
    created_at: String(u.created_at || ""),
  }));

  // Use real DB users directly
  const allUsers = dbUsers;

  const branches = (branchesRes.data as unknown as BranchItem[]) || [
    { code: "CIC", name: "Computer Science & Information Technology" },
    { code: "CSD", name: "Computer Science & Design" },
    { code: "CSM", name: "AI & Machine Learning" },
  ];
  const semesters = (semestersRes.data as unknown as SemesterItem[]) || [
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
    <UsersClient 
      initialUsers={allUsers} 
      branches={branches} 
      semesters={semesters} 
    />
  );
}
