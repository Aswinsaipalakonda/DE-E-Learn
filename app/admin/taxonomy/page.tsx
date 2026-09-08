import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
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

interface RegulationItem {
  code: string;
  name: string;
  active: boolean;
}

interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  regulation?: string;
  active: boolean;
}

const DEFAULT_REGULATIONS: RegulationItem[] = [
  { code: "R23", name: "R23 Autonomous Regulation", active: true },
  { code: "R20", name: "R20 Autonomous Regulation", active: true },
  { code: "R19", name: "R19 Autonomous Regulation", active: true },
  { code: "A2", name: "A2 Autonomous Regulation", active: true },
];

const DEFAULT_BRANCHES: BranchItem[] = [
  { code: "CIC", name: "Computer Science & IoT, Cyber Security & Data Engineering", active: true },
  { code: "CSD", name: "Computer Science & Design", active: true },
  { code: "CSM", name: "Computer Science & Machine Learning", active: true },
];

const DEFAULT_SEMESTERS: SemesterItem[] = Array.from({ length: 8 }, (_, i) => ({
  number: i + 1,
  name: `Semester ${i + 1}`,
  active: true,
}));

export default async function AdminTaxonomyPage() {
  const { user, supabase } = await getCachedUserProfile();
  if (!user) redirect("/login");

  // Fetch data in parallel
  const [branchesRes, semestersRes, subjectsRes, regulationsRes] = await Promise.all([
    supabase.from("branches").select("code, name, active").order("code"),
    supabase.from("semesters").select("number, name, active").order("number"),
    supabase.from("subjects").select("code, title, branch, semester, regulation, active").order("code"),
    supabase.from("regulations").select("code, name, active").order("code"),
  ]);

  const dbBranches = (branchesRes.data as unknown as BranchItem[]) || [];
  const dbSemesters = (semestersRes.data as unknown as SemesterItem[]) || [];
  const dbSubjects = (subjectsRes.data as unknown as SubjectItem[]) || [];
  const dbRegulations = (regulationsRes.data as unknown as RegulationItem[]) || [];

  const branches = dbBranches.length > 0 ? dbBranches : DEFAULT_BRANCHES;
  const semesters = dbSemesters.length > 0 ? dbSemesters : DEFAULT_SEMESTERS;
  const subjects = dbSubjects;
  const regulations = dbRegulations.length > 0 ? dbRegulations : DEFAULT_REGULATIONS;

  return (
    <TaxonomyClient 
      branches={branches} 
      semesters={semesters} 
      subjects={subjects}
      regulations={regulations}
    />
  );
}
