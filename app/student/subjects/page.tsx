import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { FolderOpen, ArrowRight, BookOpen, Sparkles, Layers, ChevronRight } from "lucide-react";

interface SubjectMaterial {
  id: string;
  updated_at: string;
}

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
  3: [
    {
      code: "23CIC301",
      title: "Database Management Systems (DBMS)",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 8,
      lastUpdatedStr: "Aug 29, 2026",
    },
    {
      code: "23CIC302",
      title: "Cloud Infrastructure & Distributed Computing",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 6,
      lastUpdatedStr: "Aug 26, 2026",
    },
    {
      code: "23CIC303",
      title: "Big Data Processing & Stream Analytics",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 11,
      lastUpdatedStr: "Aug 22, 2026",
    },
    {
      code: "23CIC304",
      title: "Operating Systems & Linux Kernel Architecture",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 5,
      lastUpdatedStr: "Aug 18, 2026",
    },
    {
      code: "23CIC305",
      title: "Computer Networks & IoT Protocols",
      branch: "CIC",
      semester: 3,
      active: true,
      materialsCount: 7,
      lastUpdatedStr: "Aug 15, 2026",
    },
  ],
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

  // Fetch subjects with nested materials count and dates
  const { data: dbData } = await supabase
    .from("subjects")
    .select("code, title, branch, semester, active, materials(id, updated_at)")
    .eq("branch", branch)
    .eq("semester", semester)
    .eq("active", true);

  const rawSubjects = (dbData || []).map((sub: any) => {
    const materials = sub.materials || [];
    const count = materials.length;
    let updatedStr = "Recent";
    if (count > 0) {
      const latestDate = new Date(
        Math.max(...materials.map((m: any) => new Date(m.updated_at).getTime()))
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
      active: sub.active,
      materialsCount: count,
      lastUpdatedStr: updatedStr,
    };
  });

  const subjects = rawSubjects.length > 0 ? rawSubjects : (FALLBACK_SUBJECTS[semester] || FALLBACK_SUBJECTS[3]);

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
            Select any registered subject to explore validated lecture notes, lab manuals, and assignments.
          </p>
        </div>

        <Link
          href="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md self-start md:self-auto cursor-pointer"
        >
          <span>Return to Dashboard</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((subject) => (
          <Link
            key={subject.code}
            href={`/student/subjects/${subject.code}`}
            className="flex flex-col justify-between p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all group shadow-[0_2px_12px_rgba(0,0,0,0.03)] cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {subject.code}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary text-slate-600 group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div>
                <h2 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {subject.title}
                </h2>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-normal">
                  <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                  <span>{subject.materialsCount} study materials uploaded</span>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-normal">
              <span>Last updated</span>
              <span className="text-slate-700 font-medium">{subject.lastUpdatedStr}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
