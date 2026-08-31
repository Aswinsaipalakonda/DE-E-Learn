import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Search, 
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Layers
} from "lucide-react";

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}

const FALLBACK_SUBJECT_CATALOG: Record<string, { title: string; branch: string; semester: number; materials: any[] }> = {
  "23CIC301": {
    title: "Database Management Systems (DBMS)",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-1",
        title: "Unit 1: Relational Data Models, ER Diagrams, and Schema Normalization",
        type: "Lecture Notes",
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
        type: "Lecture Notes",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Transactions", "ACID", "2PL Locking"],
      },
    ],
  },
  "23CIC302": {
    title: "Cloud Infrastructure & Distributed Computing",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-2",
        title: "Cloud Infrastructure & Distributed Computing - Complete Lab Manual",
        type: "Lab Manual",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Docker", "Kubernetes", "AWS"],
      },
    ],
  },
  "23CIC303": {
    title: "Big Data Processing & Stream Analytics",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-5",
        title: "Apache Spark RDD & DataFrames - Mid-Term Question Bank",
        type: "Question Bank",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Spark", "Hadoop", "MapReduce"],
      },
    ],
  },
};

export default async function SubjectDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const code = params.code;
  const query = searchParams.q || "";
  const selectedType = searchParams.type || "";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get student profile
  const { data: profile } = await supabase
    .from("users")
    .select("branch, current_semester")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  // Fetch subject from DB
  const { data: dbSubject } = await supabase
    .from("subjects")
    .select("*")
    .eq("code", code)
    .single();

  const fallbackData = FALLBACK_SUBJECT_CATALOG[code] || FALLBACK_SUBJECT_CATALOG["23CIC301"];
  const subject = dbSubject || {
    code: code,
    title: fallbackData.title,
    branch: fallbackData.branch,
    semester: fallbackData.semester,
  };

  // Build Materials query
  let dbQuery = supabase
    .from("materials")
    .select("id, title, type, created_at, tags")
    .eq("subject", code)
    .eq("state", "published");

  if (selectedType) {
    dbQuery = dbQuery.eq("type", selectedType);
  }

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data: dbMaterials } = await dbQuery.order("created_at", { ascending: false });
  const materials = (dbMaterials && dbMaterials.length > 0) ? dbMaterials : fallbackData.materials;

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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>Course Code: {subject.code} • Semester {subject.semester || 3}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {subject.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Curated syllabus materials, faculty lecture notes, and lab problem statements.
          </p>
        </div>

        <Link
          href="/student/subjects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-medium transition-all self-start md:self-auto border border-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>All Subjects</span>
        </Link>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {materialTypes.map((type) => {
          const isSelected = (!selectedType && type === "All") || selectedType === type;
          const href = type === "All" 
            ? `/student/subjects/${code}` 
            : `/student/subjects/${code}?type=${encodeURIComponent(type)}`;

          return (
            <Link
              key={type}
              href={href}
              className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-normal"
              }`}
            >
              <span>{type}</span>
            </Link>
          );
        })}
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {materials && materials.length > 0 ? (
          materials.map((mat: any) => (
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
                  <span className="text-xs text-slate-400 font-normal">
                    {new Date(mat.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors leading-snug">
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
                <div className="p-2 rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 font-normal">
            No study materials matched the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
