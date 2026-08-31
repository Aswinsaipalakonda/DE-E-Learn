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
  created_at: string;
}

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch users, branches, semesters
  const [usersRes, branchesRes, semestersRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, name, role, status, branch, current_semester, section, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("branches").select("code, name").eq("active", true),
    supabase.from("semesters").select("number, name").eq("active", true),
  ]);


  if (usersRes.error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to load users directory. Please reload.
      </div>
    );
  }

  // Cast values safely
  const users = (usersRes.data as unknown as UserItem[]) || [];
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


