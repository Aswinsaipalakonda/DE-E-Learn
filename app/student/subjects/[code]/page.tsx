import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import Link from "next/link";
import { 
  FileText, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  User, 
  ShieldCheck 
} from "lucide-react";

import { getActiveExamLockout } from "@/utils/exam-lockout";
import { Clock, Lock } from "lucide-react";
import { formatSubjectTitle } from "@/lib/utils";

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SubjectDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const code = params.code;
  const query = (searchParams.q || "").trim();
  const selectedType = (searchParams.type || "").trim();

  const { user, profile, supabase } = await getCachedUserProfile();
  if (!user) return null;

  const studentBranch = profile?.branch || "CIC";

  // Fetch subject matching this course code and student's branch
  const { data: dbSubject } = await supabase
    .from("subjects")
    .select("*")
    .eq("code", code)
    .eq("branch", studentBranch)
    .maybeSingle();

  const { data: dbAnySubject } = dbSubject ? { data: dbSubject } : await supabase
    .from("subjects")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  const subject = dbSubject || dbAnySubject;

  if (!subject) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <Link 
          href="/student/subjects" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Subjects</span>
        </Link>
        <div role="alert" className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs text-center space-y-2">
          <p className="text-sm font-bold text-slate-900">Subject Not Found</p>
          <p className="text-xs text-slate-500 font-normal">No curriculum course found for code &quot;{code}&quot;.</p>
        </div>
      </div>
    );
  }

  // Check if subject's semester and subject code is in active Exam Lockout
  const examLockout = await getActiveExamLockout(subject.semester || 3, studentBranch, code);

  // Build Materials query from DB - strictly scoped to this subject and student's branch/section!
  const { data: dbMaterials } = await supabase
    .from("materials")
    .select(`
      id, 
      title, 
      type, 
      created_at, 
      tags,
      branch,
      subject,
      users:owner (
        name
      )
    `)
    .eq("subject", code)
    .eq("branch", studentBranch)
    .eq("state", "published")
    .order("created_at", { ascending: false });

  let rawMaterials: any[] = dbMaterials || [];

  // Normalize category mapping
  const normalizeType = (t: string) => {
    const s = (t || "").toLowerCase().trim();
    if (s.includes("note")) return "notes";
    if (s.includes("slide")) return "slides";
    if (s.includes("assignment")) return "assignments";
    if (s.includes("lab") || s.includes("manual")) return "labs";
    if (s.includes("question")) return "questions";
    return s;
  };

  let materials = rawMaterials;

  if (selectedType && selectedType !== "All") {
    const target = normalizeType(selectedType);
    materials = materials.filter((m: any) => normalizeType(m.type) === target);
  }

  if (query) {
    const q = query.toLowerCase();
    materials = materials.filter(
      (m: any) =>
        m.title.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.tags?.some((t: string) => t.toLowerCase().includes(q))
    );
  }

  const materialTypes = [
    "All",
    "Lecture Notes",
    "Lecture Slides",
    "Assignments",
    "Lab Manuals",
    "Question Banks",
  ];

  return (
    <div className="space-y-6 sm:space-y-7 w-full pb-10">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-800">
              {subject.regulation || "R23"} Regulation
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center gap-1">
              <Layers className="h-3 w-3 text-blue-600" />
              <span>Section {studentBranch} • Sem {subject.semester || 3}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {formatSubjectTitle(subject.title)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Curated syllabus materials uploaded by faculty specifically for <span className="font-semibold text-slate-700">Section {studentBranch}</span>.
          </p>
        </div>

        <Link
          href="/student/subjects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-semibold transition-all self-start md:self-auto cursor-pointer shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Subjects</span>
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {materialTypes.map((type) => {
          const isSelected = (!selectedType && type === "All") || (selectedType && normalizeType(selectedType) === normalizeType(type));
          const href = type === "All" 
            ? `/student/subjects/${code}${query ? `?q=${encodeURIComponent(query)}` : ""}` 
            : `/student/subjects/${code}?type=${encodeURIComponent(type)}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

          return (
            <Link
              key={type}
              href={href}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-normal"
              }`}
            >
              <span>{type}</span>
            </Link>
          );
        })}
      </div>

      {/* Materials List / Exam Lockout */}
      {examLockout.isLocked ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-200/90 shadow-xs space-y-3 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                {examLockout.examTitle || "Examination Lockout Active"}
              </h3>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Session Hours: {examLockout.startTimeText} – {examLockout.endTimeText} (IST)
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-normal">
            {examLockout.message || `Course materials for Semester ${subject.semester || 3} are temporarily locked during the scheduled evaluation window.`}
          </p>
          <div className="pt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-800">
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
              Locked for Examination Mode
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-slate-100">
          {materials && materials.length > 0 ? (
            materials.map((mat: any) => {
              const facultyName = mat.users?.name || "Faculty Incharge";
              return (
                <Link
                  key={mat.id}
                  href={`/student/materials/${mat.id}`}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/80 transition-all group cursor-pointer"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                        {mat.type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                        <User className="h-2.5 w-2.5" />
                        {facultyName}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        {new Date(mat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-primary transition-colors leading-snug">
                      {mat.title}
                    </h2>

                    {mat.tags && mat.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {mat.tags.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500 font-normal">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <div className="p-2 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 font-normal space-y-2">
              <p className="font-semibold text-slate-700 text-sm">No materials published yet for Section {studentBranch}</p>
              <p>Your faculty member will publish reference materials and syllabus decks here soon.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
