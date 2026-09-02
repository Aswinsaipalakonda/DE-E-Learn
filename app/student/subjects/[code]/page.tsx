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
  Sparkles
} from "lucide-react";

import { getActiveExamLockout } from "@/utils/exam-lockout";
import { Clock, Lock } from "lucide-react";

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
      {
        id: "mock-mat-15",
        title: "DBMS Mid-Term 1 & End-Semester Model Question Bank",
        type: "Question Banks",
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Question Bank", "Mid-1", "Exam Prep"],
      },
      {
        id: "mock-mat-16",
        title: "Assignment 1: Complex ER Modeling & BCNF Decomposition Problems",
        type: "Assignments",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Assignment", "BCNF", "Normalization"],
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
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Docker", "Kubernetes", "AWS"],
      },
      {
        id: "mock-mat-17",
        title: "Unit 1: Cloud Service Models (IaaS, PaaS, SaaS) & Virtualization Slides",
        type: "Lecture Slides",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["IaaS", "PaaS", "Virtualization"],
      },
      {
        id: "mock-mat-18",
        title: "Unit 2: AWS Elastic Compute Cloud (EC2) & S3 Storage Architecture",
        type: "Notes",
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["AWS", "EC2", "S3"],
      },
    ],
  },
  "23CIC303": {
    title: "Big Data Processing with Apache Spark",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-5",
        title: "Big Data Processing with Apache Spark - Mid-Term Question Bank",
        type: "Question Banks",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Spark", "Big Data", "MapReduce"],
      },
      {
        id: "mock-mat-19",
        title: "Unit 1: Hadoop Distributed File System (HDFS) & MapReduce Paradigms",
        type: "Notes",
        created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Hadoop", "HDFS", "MapReduce"],
      },
      {
        id: "mock-mat-20",
        title: "PySpark Resilient Distributed Datasets (RDD) Architecture Slides",
        type: "Lecture Slides",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["PySpark", "RDD", "Transformations"],
      },
    ],
  },
  "23CIC304": {
    title: "Operating Systems & Linux Kernel Architecture",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-6",
        title: "Operating Systems & Linux Kernel Architecture - Complete Slide Deck",
        type: "Lecture Slides",
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Linux", "Kernel", "Processes"],
      },
      {
        id: "mock-mat-21",
        title: "Unit 1: CPU Scheduling Algorithms & Process Synchronization Notes",
        type: "Notes",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Scheduling", "Semaphores", "Mutex"],
      },
      {
        id: "mock-mat-22",
        title: "Linux System Programming & Shell Scripting Lab Manual",
        type: "Lab Manuals",
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Bash", "System Calls", "POSIX"],
      },
    ],
  },
  "23CIC305": {
    title: "Computer Networks & IoT Protocols",
    branch: "CIC",
    semester: 3,
    materials: [
      {
        id: "mock-mat-23",
        title: "Unit 1: OSI 7-Layer Architecture & TCP/IP Protocol Stack Notes",
        type: "Notes",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["OSI", "TCP/IP", "Subnetting"],
      },
      {
        id: "mock-mat-24",
        title: "Unit 2: Wireless Sensor Networks & MQTT / CoAP IoT Protocols Slides",
        type: "Lecture Slides",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["MQTT", "CoAP", "IoT"],
      },
      {
        id: "mock-mat-25",
        title: "Cisco Packet Tracer Network Topology Simulation Lab Manual",
        type: "Lab Manuals",
        created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Packet Tracer", "Routing", "VLANs"],
      },
      {
        id: "mock-mat-26",
        title: "Computer Networks Question Bank & Solved Numerical Problems",
        type: "Question Banks",
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Question Bank", "Subnet Calculations", "Exams"],
      },
      {
        id: "mock-mat-27",
        title: "Assignment 1: IP Subnetting & CIDR Address Planning",
        type: "Assignments",
        created_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ["Assignment", "CIDR", "Subnets"],
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

  // Fetch subject from DB
  const { data: dbSubject } = await supabase
    .from("subjects")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  const fallbackData = FALLBACK_SUBJECT_CATALOG[code] || FALLBACK_SUBJECT_CATALOG["23CIC301"];
  const subject = dbSubject || {
    code: code,
    title: fallbackData.title,
    branch: fallbackData.branch,
    semester: fallbackData.semester,
  };

  // Check if subject's semester is in active Exam Lockout
  const examLockout = await getActiveExamLockout(subject.semester || 3, subject.branch);

  // Build Materials query from DB
  const { data: dbMaterials } = await supabase
    .from("materials")
    .select("id, title, type, created_at, tags")
    .eq("subject", code)
    .eq("state", "published")
    .order("created_at", { ascending: false });

  // Prioritize real uploaded materials from database!
  let rawMaterials: any[] = [];
  if (dbMaterials && dbMaterials.length > 0) {
    // Show real uploaded materials
    rawMaterials = dbMaterials;
  } else {
    // Fallback demo catalog
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
            {examLockout.message || `Course materials for Semester ${subject.semester || 3} are temporarily locked during the scheduled evaluation window. Materials will automatically unlock when the session concludes.`}
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
            ))
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 font-normal space-y-2">
              <p className="font-semibold text-slate-700 text-sm">No materials found for &quot;{selectedType || query}&quot;</p>
              <p>Try selecting another category pill or clear the search query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
