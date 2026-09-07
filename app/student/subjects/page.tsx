import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { FolderOpen, ArrowRight, BookOpen, Sparkles, Layers, ChevronRight } from "lucide-react";

interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  active: boolean;
  materialsCount: number;
  lastUpdatedStr: string;
}

const FALLBACK_SUBJECTS: Record<number, SubjectItem[]> = {
  1: [
    {
      code: "R23MATT101",
      title: "LINEAR ALGEBRA & CALCULUS",
      branch: "CIC",
      semester: 1,
      active: true,
      materialsCount: 4,
      lastUpdatedStr: "Sep 01, 2026",
    }
  ],
  3: [
    {
      code: "23CIC301",
      title: "Database Management Systems",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 1,
      lastUpdatedStr: "Aug 31, 2026",
    },
    {
      code: "23CIC302",
      title: "Cloud Infrastructure & Distributed Systems",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 3,
      lastUpdatedStr: "Aug 26, 2026",
    },
    {
      code: "23CIC303",
      title: "Big Data Processing with Apache Spark",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 2,
      lastUpdatedStr: "Aug 22, 2026",
    },
    {
      code: "23CIC304",
      title: "Operating Systems & Linux Kernel Architecture",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 3,
      lastUpdatedStr: "Aug 18, 2026",
    },
    {
      code: "23CIC305",
      title: "Computer Networks & IoT Protocols",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 4,
      lastUpdatedStr: "Aug 15, 2026",
    },
  ],
  7: [
    {
      code: "R23SE701",
      title: "Software Engineering",
      branch: "CIC",
      semester: 7,
      active: true,
      materialsCount: 3,
      lastUpdatedStr: "Sep 05, 2026",
    }
  ]
};

export default async function SubjectsBrowserPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("branch, current_semester")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  const branch = profile?.branch || "CIC";
  const semester = profile?.current_semester || 3;

  // Fetch subjects from DB scoped to student's branch & semester
  const { data: dbSubjects } = await supabase
    .from("subjects")
    .select("code, title, branch, semester, regulation, active")
    .eq("branch", branch)
    .eq("semester", semester)
    .eq("active", true);

  // Fetch published materials strictly for the student's branch
  const { data: dbMaterials } = await supabase
    .from("materials")
    .select("id, subject, updated_at, created_at")
    .eq("branch", branch)
    .eq("state", "published");

  const materialsList = dbMaterials || [];

  const rawSubjects = (dbSubjects && dbSubjects.length > 0 ? dbSubjects : (FALLBACK_SUBJECTS[semester] || FALLBACK_SUBJECTS[3])).map((sub: any) => {
    const subjectMaterials = materialsList.filter((m: any) => m.subject === sub.code);
    const count = subjectMaterials.length;
    let updatedStr = "Recent";

    if (count > 0) {
      const latestDate = new Date(
        Math.max(...subjectMaterials.map((m: any) => new Date(m.updated_at || m.created_at).getTime()))
      );
      updatedStr = latestDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return {
      code: sub.code,
      title: sub.title,
      branch: sub.branch,
      semester: sub.semester,
      regulation: sub.regulation || "R23",
      active: sub.active ?? true,
      materialsCount: count,
      lastUpdatedStr: updatedStr,
    };
  });

  return (
    <div className="space-y-6 sm:space-y-7 w-full pb-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>Branch {branch} • Semester {semester} Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Enrolled Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Select any registered subject to explore validated lecture notes, lab manuals, and assignments for your branch.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
            {rawSubjects.length} Active Courses
          </span>
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rawSubjects.map((sub: any) => (
          <Link
            key={`${sub.code}-${sub.branch}`}
            href={`/student/subjects/${sub.code}`}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {sub.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {sub.materialsCount} {sub.materialsCount === 1 ? "Document" : "Documents"}
                </span>
              </div>

              <h2 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors leading-snug">
                {sub.title}
              </h2>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-normal">
              <span>Updated: {sub.lastUpdatedStr}</span>
              <div className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-1 transition-transform">
                <span>View Notes</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
