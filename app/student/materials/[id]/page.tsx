import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import BookmarkButton from "./bookmark-button";
import FileList from "./file-list";
import { 
  User, 
  Calendar, 
  ArrowLeft,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  Download,
  Share2,
  CheckCircle2
} from "lucide-react";

interface MaterialFileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  storage_ref: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const FALLBACK_DETAIL_MATERIALS: Record<string, any> = {
  "mock-mat-1": {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    description: "Comprehensive lecture slides and reference notes covering the Relational Data Model, ER Diagrams, Relational Algebra operators, and Schema Normalization (1NF, 2NF, 3NF, BCNF).",
    type: "Lecture Notes",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    branch: "CIC",
    semester: 3,
    state: "published",
    facultyName: "Dr. P. Satyanarayana",
    subjectTitle: "Database Management Systems",
    material_files: [
      {
        id: "file-1",
        file_name: "DBMS_Unit_1_Relational_Models_Lecture_Notes.pdf",
        size: 3450000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
      {
        id: "file-2",
        file_name: "ER_Diagrams_and_Schema_Normalization_Slides.pdf",
        size: 1850000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
    ],
  },
  "mock-mat-2": {
    id: "mock-mat-2",
    title: "Cloud Infrastructure & Distributed Computing - Lab Manual",
    description: "Step-by-step hands-on laboratory exercises on Docker containerization, Kubernetes cluster orchestration, AWS S3 bucket integration, and Terraform infrastructure setup.",
    type: "Lab Manual",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC302",
    branch: "CIC",
    semester: 3,
    state: "published",
    facultyName: "Dr. K. Srinivas Rao",
    subjectTitle: "Cloud Computing & DevOps",
    material_files: [
      {
        id: "file-3",
        file_name: "Cloud_DevOps_Lab_Manual_AY2026.pdf",
        size: 4200000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
    ],
  },
  "mock-mat-3": {
    id: "mock-mat-3",
    title: "Data Warehousing & Dimensional Modeling Guidelines",
    description: "Star schema vs Snowflake schema design, ETL pipeline construction with Apache Airflow, and OLAP query optimization notes.",
    type: "Lecture Notes",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CSD501",
    branch: "CSD",
    semester: 5,
    state: "published",
    facultyName: "Prof. M. V. Ramana",
    subjectTitle: "Data Warehousing & Mining",
    material_files: [
      {
        id: "file-4",
        file_name: "Data_Warehousing_Dimensional_Modeling.pdf",
        size: 2800000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
    ],
  },
  "mock-mat-4": {
    id: "mock-mat-4",
    title: "Machine Learning with Python - Jupyter Notebook Reference",
    description: "Supervised & Unsupervised learning notebooks, Linear Regression, Decision Trees, and Random Forest implementations with Scikit-learn.",
    type: "Code Repository",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CSM101",
    branch: "CSM",
    semester: 1,
    state: "published",
    facultyName: "V. Lakshmi Lavanya",
    subjectTitle: "Introduction to AI & Python",
    material_files: [
      {
        id: "file-5",
        file_name: "Machine_Learning_Python_Labs.pdf",
        size: 5100000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
    ],
  },
  "mock-mat-5": {
    id: "mock-mat-5",
    title: "Big Data Processing with Apache Spark - Mid-Term Question Bank",
    description: "Collection of curated question bank problems, RDD transformation queries, Spark SQL benchmarks, and previous mid-term solutions.",
    type: "Question Bank",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC303",
    branch: "CIC",
    semester: 3,
    state: "published",
    facultyName: "Prof. M. V. Ramana",
    subjectTitle: "Big Data Analytics",
    material_files: [
      {
        id: "file-6",
        file_name: "Big_Data_Spark_Question_Bank.pdf",
        size: 1900000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
    ],
  },
};

export default async function MaterialDetailPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("branch, current_semester")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  // Query database for material details
  const { data: dbMaterial } = await supabase
    .from("materials")
    .select(`
      id, 
      title, 
      description, 
      type, 
      created_at, 
      subject,
      branch,
      semester,
      state,
      users (name),
      material_files (id, file_name, size, mime_type, storage_ref)
    `)
    .eq("id", id)
    .single();

  const fallback = FALLBACK_DETAIL_MATERIALS[id] || FALLBACK_DETAIL_MATERIALS["mock-mat-1"];
  const material = dbMaterial || (id.startsWith("mock-") ? fallback : null);

  if (!material) {
    return (
      <div className="space-y-5 max-w-4xl">
        <Link 
          href="/student" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div role="alert" className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs text-center space-y-2">
          <p className="text-sm font-bold text-slate-900">Material Document Not Found</p>
          <p className="text-xs text-slate-500 font-normal">The requested study file may have been archived or rescheduled.</p>
        </div>
      </div>
    );
  }

  // Check if bookmarked
  const { data: bookmark } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("material_id", id)
    .maybeSingle();

  const isBookmarked = !!bookmark || id === "mock-mat-1" || id === "mock-mat-2";
  const facultyName = material.users?.name || material.facultyName || "Faculty Member";
  const files: MaterialFileItem[] = material.material_files || [];

  return (
    <div className="space-y-6 sm:space-y-7 w-full max-w-5xl pb-10">
      {/* Navigation Breadcrumb */}
      <div>
        <Link 
          href="/student" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>

      {/* Main Material Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 border-b border-slate-100 pb-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                {material.type}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                {material.subject}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-normal text-slate-500">
                Semester {material.semester || 3}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              {material.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-normal flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <strong className="text-slate-700 font-semibold">{facultyName}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{new Date(material.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </span>
            </div>
          </div>

          {/* Action Bookmark Pill */}
          <div className="shrink-0">
            <BookmarkButton materialId={material.id} initialBookmarked={isBookmarked} />
          </div>
        </div>

        {/* Description Section */}
        {material.description && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Document Abstract & Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              {material.description}
            </p>
          </div>
        )}

        {/* Attached Files List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Downloadable Attachments ({files.length})
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              Validated PDF / Lecture Slides
            </span>
          </div>

          {files.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block truncate">
                        {file.file_name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.mime_type || "PDF Document"}
                      </span>
                    </div>
                  </div>

                  <a
                    href={file.storage_ref === "#" ? `data:application/pdf;base64,` : file.storage_ref}
                    download={file.file_name}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all shadow-xs shrink-0 self-start sm:self-center"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 font-normal">
              No physical attachments associated with this unit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
