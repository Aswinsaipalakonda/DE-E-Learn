import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TaxonomyClient from "./taxonomy-client";

interface BranchItem {
  code: string;
  name: string;
  active: boolean;
}

interface SemesterItem {
  number: number;
  name: string;
  active: boolean;
}

interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  active: boolean;
}

export default async function AdminTaxonomyPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch data
  const [branchesRes, semestersRes, subjectsRes] = await Promise.all([
    supabase.from("branches").select("code, name, active").order("code"),
    supabase.from("semesters").select("number, name, active").order("number"),
    supabase.from("subjects").select("code, title, branch, semester, active").order("code"),
  ]);

  if (branchesRes.error || semestersRes.error || subjectsRes.error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to fetch course data. Please refresh the page.
      </div>
    );
  }

  const branches = (branchesRes.data as unknown as BranchItem[]) || [];
  const semesters = (semestersRes.data as unknown as SemesterItem[]) || [];
  const subjects = (subjectsRes.data as unknown as SubjectItem[]) || [];

  return (
    <TaxonomyClient 
      branches={branches} 
      semesters={semesters} 
      subjects={subjects} 
    />
  );
}

