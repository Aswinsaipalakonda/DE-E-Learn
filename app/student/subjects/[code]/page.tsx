import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
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

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}

const FALLBACK_SUBJECT_CATALOG: Record<string, { title: string; branch: string; semester: number; materials: any[] }> = {
  "R23MATT101": {
    title: "LINEAR ALGEBRA & CALCULUS",
    branch: "CIC",
    semester: 1,
    materials: [
      {
        id: "mock-mat-la-1",
        title: "Unit 1: Matrices, Rank of Matrix & System of Linear Equations",
        type: "Notes",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Matrices", "Rank", "Linear Equations"],
      },
      {
        id: "mock-mat-la-2",
        title: "Unit 2: Eigenvalues, Eigenvectors & Cayley-Hamilton Theorem",
        type: "Lecture Slides",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Eigenvalues", "Cayley-Hamilton"],
      },
    ],
  },
  "R23SE701": {
    title: "Software Engineering",
    branch: "CIC",
    semester: 7,
    materials: [
      {
        id: "mock-mat-se-1",
        title: "Unit 1: Software Process Models, Agile Methodologies & Scrum Framework",
        type: "Notes",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Agile", "Scrum", "Process Models"],
      },
      {
        id: "mock-mat-se-2",
        title: "Unit 2: Requirements Engineering & SRS Documentation Standards",
        type: "Lecture Slides",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["SRS", "Requirements", "Use Cases"],
      },
    ],
  },
  "23CIC301": {
    title: "Database Management Systems (DBMS)",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-1",
        title: "Unit 1: Relational Data Models, ER Diagrams, and Schema Normalization",
        type: "Notes",
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Relational Model", "ER Diagrams", "BCNF"],
      },
      {
        id: "mock-mat-8",
        title: "Unit 2: SQL Advanced Queries, Nested Joins, and Trigger Stored Procedures",
        type: "Lecture Slides",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["SQL", "Triggers", "Indexing"],
      },
      {
        id: "mock-mat-9",
        title: "Unit 3: Transaction Processing, ACID Properties, and Concurrency Control",
        type: "Notes",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Transactions", "ACID", "2PL Locking"],
      },
      {
        id: "mock-mat-14",
        title: "DBMS Lab Manual: MySQL & PostgreSQL Hands-on Practice",
        type: "Lab Manuals",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["MySQL", "PostgreSQL", "DDL/DML"],
      },
    ],
  },
  "23CIC302": {
    title: "Cloud Infrastructure & Distributed Systems",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-2",
        title: "Cloud Infrastructure & Distributed Computing - Complete Lab Manual",
        type: "Lab Manuals",
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["AWS", "Docker", "Kubernetes"],
      },
    ],
  },
};

export default async function SubjectDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const code = params.code;
  const query = (searchParams.q || "").trim();
  const selectedType = (searchParams.type || "").trim();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get student profile (branch, semester, section)
  const { data: profile } = await supabase
    .from("users")
    .select("branch, current_semester, section, name")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

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

  const fallbackData = FALLBACK_SUBJECT_CATALOG[code] || FALLBACK_SUBJECT_CATALOG["23CIC301"];
  const subject = dbSubject || dbAnySubject || {
    code: code,
    title: fallbackData.title,
    branch: studentBranch,
    semester: fallbackData.semester,
    regulation: "R23",
  };

  // Check if subject's semester is in active Exam Lockout
  const examLockout = await getActiveExamLockout(subject.semester || 3, studentBranch);

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

  // Prioritize real uploaded materials from database
  let rawMaterials: any[] = [];
  if (dbMaterials && dbMaterials.length > 0) {
    rawMaterials = dbMaterials;
  } else {
    rawMaterials = fallbackData.materials;
  }

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
    <div className="space-y-6 sm:space-y-7 w-full max-w-5xl pb-10">
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
            {subject.title}
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
