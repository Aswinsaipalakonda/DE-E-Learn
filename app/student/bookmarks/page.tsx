import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { Bookmark, ArrowRight, Sparkles, ChevronRight, FileText } from "lucide-react";

interface MaterialInfo {
  id: string;
  title: string;
  type: string;
  subjectTitle: string;
  subjectCode: string;
  facultyName: string;
}

const FALLBACK_BOOKMARKS: MaterialInfo[] = [
  {
    id: "mock-mat-1",
    title: "Database Management Systems (DBMS) - Unit 1 Relational Models",
    type: "Lecture Notes",
    subjectTitle: "Database Management Systems",
    subjectCode: "23CIC301",
    facultyName: "Dr. P. Satyanarayana",
  },
  {
    id: "mock-mat-2",
    title: "Cloud Infrastructure & Distributed Computing - Lab Manual",
    type: "Lab Manual",
    subjectTitle: "Cloud Computing & DevOps",
    subjectCode: "23CIC302",
    facultyName: "Dr. K. Srinivas Rao",
  },
  {
    id: "mock-mat-5",
    title: "Big Data Processing with Apache Spark - Mid-Term Question Bank",
    type: "Question Bank",
    subjectTitle: "Big Data Analytics",
    subjectCode: "23CIC303",
    facultyName: "Prof. M. V. Ramana",
  },
];

export default async function BookmarksPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Query bookmarks joining materials and subjects
  const { data: dbData } = await supabase
    .from("bookmarks")
    .select(`
      id,
      created_at,
      materials (
        id,
        title,
        type,
        subjects (title, code)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rawBookmarks: MaterialInfo[] = (dbData || [])
    .filter((b: any) => b.materials)
    .map((b: any) => ({
      id: b.materials.id,
      title: b.materials.title,
      type: b.materials.type,
      subjectTitle: b.materials.subjects?.title || "Department Subject",
      subjectCode: b.materials.subjects?.code || "",
      facultyName: "Faculty Member",
    }));

  const bookmarks: MaterialInfo[] = rawBookmarks.length > 0 ? rawBookmarks : FALLBACK_BOOKMARKS;

  return (
    <div className="space-y-6 sm:space-y-7 w-full pb-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
            <Bookmark className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
            <span>Personal Study Vault • {bookmarks.length} Saved Items</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bookmarked Learning Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Quickly retrieve your saved lecture notes, lab manuals, and exam preparation documents.
          </p>
        </div>

        <Link
          href="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-medium transition-all self-start md:self-auto border border-slate-200"
        >
          <span>Return to Dashboard</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Bookmarks List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {bookmarks.map((material) => (
          <Link
            key={material.id}
            href={`/student/materials/${material.id}`}
            className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/80 transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                <Bookmark className="h-5 w-5 fill-amber-500 text-amber-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                    {material.type}
                  </span>
                  {material.subjectCode && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-600">
                      {material.subjectCode}
                    </span>
                  )}
                </div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors leading-snug">
                  {material.title}
                </h2>
                <p className="text-xs text-slate-500 font-normal flex items-center gap-2">
                  <span>{material.subjectTitle}</span>
                  <span>•</span>
                  <span>{material.facultyName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <div className="p-2 rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-2xs">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
