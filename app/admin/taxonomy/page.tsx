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

const MOCK_DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    code: "23CI3001",
    title: "Database Management Systems",
    branch: "CIC",
    semester: 3,
    active: true,
  },
  {
    code: "23CI3002",
    title: "Data Warehousing & Data Mining",
    branch: "CIC",
    semester: 3,
    active: true,
  },
  {
    code: "23CI3003",
    title: "Big Data Analytics with Hadoop & Spark",
    branch: "CIC",
    semester: 4,
    active: true,
  },
  {
    code: "23CI3004",
    title: "Data Pipelines & Streaming Architecture",
    branch: "CIC",
    semester: 4,
    active: true,
  },
  {
    code: "23CI3005",
    title: "Cloud Infrastructure & Distributed Computing",
    branch: "CIC",
    semester: 5,
    active: true,
  },
  {
    code: "23CI3006",
    title: "Machine Learning Operations (MLOps)",
    branch: "CIC",
    semester: 5,
    active: true,
  },
  {
    code: "23CI1001",
    title: "Linear Algebra & Probability for Data Science",
    branch: "CIC",
    semester: 1,
    active: true,
  },
  {
    code: "23CI2001",
    title: "Data Structures & Advanced Algorithms",
    branch: "CIC",
    semester: 2,
    active: true,
  },
  {
    code: "23CD3001",
    title: "Design Thinking & UI/UX Systems",
    branch: "CSD",
    semester: 3,
    active: true,
  },
  {
    code: "23CD4001",
    title: "Interactive Web & Mobile App Architecture",
    branch: "CSD",
    semester: 4,
    active: true,
  },
  {
    code: "23CM3001",
    title: "Deep Learning & Neural Network Architectures",
    branch: "CSM",
    semester: 3,
    active: true,
  },
  {
    code: "23CM4001",
    title: "Natural Language Processing & Generative AI",
    branch: "CSM",
    semester: 4,
    active: true,
  },
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

  const dbBranches = (branchesRes.data as unknown as BranchItem[]) || [];
  const dbSemesters = (semestersRes.data as unknown as SemesterItem[]) || [];
  const dbSubjects = (subjectsRes.data as unknown as SubjectItem[]) || [];

  const branches = dbBranches.length > 0 ? dbBranches : DEFAULT_BRANCHES;
  const semesters = dbSemesters.length > 0 ? dbSemesters : DEFAULT_SEMESTERS;
  const subjects = dbSubjects.length > 0 ? dbSubjects : MOCK_DEFAULT_SUBJECTS;

  return (
    <TaxonomyClient 
      branches={branches} 
      semesters={semesters} 
      subjects={subjects} 
    />
  );
}


