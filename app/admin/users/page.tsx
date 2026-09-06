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

const FALLBACK_USERS: UserItem[] = [
  {
    id: "mock-student-1",
    email: "23331a4745@mvgrce.edu.in",
    name: "Aswin Sai Palakonda",
    role: "student",
    status: "active",
    branch: "CIC",
    current_semester: 3,
    section: "A",
    designation: null,
    roll_number: "23331A4745",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-student-2",
    email: "23331a4701@mvgrce.edu.in",
    name: "Rahul Varma Datla",
    role: "student",
    status: "active",
    branch: "CIC",
    current_semester: 3,
    section: "A",
    designation: null,
    roll_number: "23331A4701",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-student-3",
    email: "23331a4718@mvgrce.edu.in",
    name: "Sneha Reddy K.",
    role: "student",
    status: "active",
    branch: "CIC",
    current_semester: 3,
    section: "B",
    designation: null,
    roll_number: "23331A4718",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-student-4",
    email: "23331a0502@mvgrce.edu.in",
    name: "Divya Sri Madhuri",
    role: "student",
    status: "active",
    branch: "CSD",
    current_semester: 5,
    section: "A",
    designation: null,
    roll_number: "23331A0502",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-student-5",
    email: "23331a0544@mvgrce.edu.in",
    name: "K. Karthik Subhash",
    role: "student",
    status: "active",
    branch: "CSD",
    current_semester: 5,
    section: "B",
    designation: null,
    roll_number: "23331A0544",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-student-6",
    email: "23331a4201@mvgrce.edu.in",
    name: "M. Naveen Kumar",
    role: "student",
    status: "active",
    branch: "CSM",
    current_semester: 1,
    section: "A",
    designation: null,
    roll_number: "23331A4201",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-faculty-1",
    email: "faculty.psn@mvgrce.edu.in",
    name: "Dr. P. Satyanarayana",
    role: "faculty",
    status: "active",
    branch: null,
    current_semester: null,
    section: null,
    designation: "Professor",
    roll_number: null,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-faculty-2",
    email: "faculty.ksr@mvgrce.edu.in",
    name: "Dr. K. Srinivas Rao",
    role: "faculty",
    status: "active",
    branch: null,
    current_semester: null,
    section: null,
    designation: "Associate Professor",
    roll_number: null,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-faculty-3",
    email: "faculty.mvr@mvgrce.edu.in",
    name: "Prof. M. V. Ramana",
    role: "faculty",
    status: "active",
    branch: null,
    current_semester: null,
    section: null,
    designation: "Distinguished Associate Professor",
    roll_number: null,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-faculty-4",
    email: "faculty.vll@mvgrce.edu.in",
    name: "V. Lakshmi Lavanya",
    role: "faculty",
    status: "active",
    branch: null,
    current_semester: null,
    section: null,
    designation: "Assistant Professor",
    roll_number: null,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
