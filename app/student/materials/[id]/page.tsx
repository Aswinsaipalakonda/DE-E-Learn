import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { 
  FileText, 
  ArrowLeft, 
  Layers,
  Sparkles
} from "lucide-react";
import BookmarkButton from "./bookmark-button";
import FileList from "./file-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MaterialFileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  storage_ref: string;
}

const FALLBACK_MATERIALS: Record<string, any> = {
  "mock-mat-1": {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    description: "Comprehensive lecture notes covering relational data model foundations, ER to relational schema mapping, tuple and domain relational calculus, and Boyce-Codd Normal Form (BCNF) decomposition rules.",
    type: "Notes",
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
        file_name: "DBMS_Unit1_Relational_Models.pdf",
        size: 3450000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
      {
        id: "file-2",
        file_name: "ER_Diagrams_Practice_Set.pdf",
        size: 1200000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
    ],
  },
  "mock-mat-2": {
    id: "mock-mat-2",
    title: "Cloud Infrastructure & Distributed Computing - Lab Manual",
    description: "Official departmental lab manual with step-by-step setup guides for Docker container orchestration, Kubernetes cluster provisioning, and AWS Elastic Compute Cloud instances.",
    type: "Lab Manuals",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC302",
    branch: "CIC",
    semester: 3,
    state: "published",
    facultyName: "Dr. K. Srinivas Rao",
    subjectTitle: "Cloud Infrastructure & Distributed Systems",
    material_files: [
      {
        id: "file-3",
        file_name: "Cloud_Lab_Manual_2026.pdf",
        size: 4200000,
        mime_type: "application/pdf",
        storage_ref: "#",
      },
    ],
  },
};

export default async function MaterialDetailsPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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
      subjects (title, code),
      material_files (id, file_name, size, mime_type, storage_ref)
    `)
    .eq("id", id)
    .maybeSingle();

  // If real material found in database, track view event for the student
  if (user && dbMaterial) {
    try {
      await supabase.from("activity_events").insert({
        type: "view",
        actor_id: user.id,
        target_id: dbMaterial.id,
        metadata: {
          action: "material_page_view",
          material_title: dbMaterial.title,
          subject: dbMaterial.subject,
        },
      });
    } catch {}
  }

  // Resilient fallback for preview and sample items
  const material = dbMaterial || FALLBACK_MATERIALS[id] || FALLBACK_MATERIALS["mock-mat-1"];

  if (!material) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <Link 
          href="/student" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition-all shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Dashboard</span>
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>

      {/* Main Material Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 border-b border-slate-100 pb-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                {material.type}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                {material.subjects?.code || material.subject || "23CIC301"}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                Sem {material.semester || 3}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              {material.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 font-normal flex items-center gap-2 flex-wrap">
              <span>{material.subjects?.title || material.subjectTitle || "Department Subject"}</span>
              <span>•</span>
              <span>Uploaded by {facultyName}</span>
              <span>•</span>
              <span>{new Date(material.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <BookmarkButton materialId={id} initialBookmarked={isBookmarked} />
          </div>
        </div>

        {/* Material Description / Syllabus Abstract */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Material Overview & Learning Objectives
          </h2>
          <p className="text-sm text-slate-700 font-normal leading-relaxed">
            {material.description || "Official study and reference materials prepared in accordance with the Department of Data Engineering syllabus curriculum guidelines."}
          </p>
        </div>

        {/* Attached Resource Files */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span>Verified Study Files ({files.length})</span>
          </h2>

          <FileList materialId={id} files={files} />
        </div>
      </div>
    </div>
  );
}
