import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MaterialsList from "./materials-list";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  version: number;
  storage_ref: string;
}

interface RawMaterial {
  id: string;
  title: string;
  type: string;
  state: string;
  created_at: string;
  subject: string;
  material_files: FileItem[];
}

const FALLBACK_FACULTY_INVENTORY: RawMaterial[] = [
  {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    type: "Lecture Notes",
    state: "published",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    material_files: [
      {
        id: "f-1",
        file_name: "DBMS_Unit1_Relational_Models.pdf",
        size: 3450000,
        mime_type: "application/pdf",
        version: 1,
        storage_ref: "#",
      },
      {
        id: "f-2",
        file_name: "ER_Diagrams_Practice_Set.pdf",
        size: 1200000,
        mime_type: "application/pdf",
        version: 1,
        storage_ref: "#",
      },
    ],
  },
  {
    id: "mock-mat-8",
    title: "Unit 2: SQL Advanced Queries, Nested Joins, and Trigger Stored Procedures",
    type: "Lecture Slides",
    state: "published",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    material_files: [
      {
        id: "f-3",
        file_name: "SQL_Advanced_Queries_Slides.pdf",
        size: 2800000,
        mime_type: "application/pdf",
        version: 2,
        storage_ref: "#",
      },
    ],
  },
  {
    id: "mock-mat-9",
    title: "Unit 3: Transaction Processing, ACID Properties, and Concurrency Control",
    type: "Lecture Notes",
    state: "published",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    material_files: [
      {
        id: "f-4",
        file_name: "Transaction_Processing_Notes.pdf",
        size: 3100000,
        mime_type: "application/pdf",
        version: 1,
        storage_ref: "#",
      },
    ],
  },
  {
    id: "mock-mat-14",
    title: "DBMS Lab Manual: MySQL & PostgreSQL Hands-on Practice",
    type: "Lab Manual",
    state: "published",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    material_files: [
      {
        id: "f-5",
        file_name: "DBMS_Lab_Manual_v2.pdf",
        size: 4500000,
        mime_type: "application/pdf",
        version: 2,
        storage_ref: "#",
      },
    ],
  },
  {
    id: "mock-mat-15",
    title: "DBMS Mid-Term 1 & End-Semester Model Question Bank",
    type: "Question Bank",
    state: "draft",
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    material_files: [
      {
        id: "f-6",
        file_name: "DBMS_Question_Bank_2026.pdf",
        size: 1900000,
        mime_type: "application/pdf",
        version: 1,
        storage_ref: "#",
      },
    ],
  },
  {
    id: "mock-mat-16",
    title: "Legacy Relational Database Architecture (Archived 2025)",
    type: "Reference Books",
    state: "archived",
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    subject: "23CIC301",
    material_files: [
      {
        id: "f-7",
        file_name: "Legacy_RDBMS_Design.pdf",
        size: 5600000,
        mime_type: "application/pdf",
        version: 1,
        storage_ref: "#",
      },
    ],
  },
];

export default async function FacultyMaterialsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch materials owned by uploader (excluding deleted state)
  const { data, error } = await supabase
    .from("materials")
    .select(`
      id,
      title,
      type,
      state,
      created_at,
      subject,
      material_files (
        id,
        file_name,
        size,
        mime_type,
        version,
        storage_ref
      )
    `)
    .eq("owner", user.id)
    .neq("state", "deleted")
    .order("created_at", { ascending: false });

  const rawMaterials = (data as unknown as RawMaterial[]) || [];
  const activeList = rawMaterials.length > 0 ? rawMaterials : FALLBACK_FACULTY_INVENTORY;

  // Cast values safely
  const materials = activeList.map(m => ({
    ...m,
    state: m.state as "draft" | "published" | "archived" | "deleted",
  }));

  return (
    <div className="space-y-6 sm:space-y-7 w-full max-w-6xl pb-10">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link 
            href="/faculty" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>

        <Link
          href="/faculty/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold text-xs sm:text-sm transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Material</span>
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Your Materials Inventory</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Manage your uploaded files, update metadata, archive outdated versions, or replace content with new revisions.
        </p>
      </header>

      <MaterialsList initialMaterials={materials} />
    </div>
  );
}
