import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UploadForm from "./upload-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function FacultyUploadPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch active subjects to select
  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("code, title, branch, semester")
    .eq("active", true);

  if (error) {
    return (
      <div role="alert" className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-semibold text-xs">
        Failed to load subjects options. Please reload.
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 w-full max-w-5xl pb-10">
      <div>
        <Link 
          href="/faculty" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Upload Syllabus Material</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          Upload verified reference notes, assignments, lecture slide decks, or laboratory manual guides.
        </p>
      </header>

      <UploadForm subjects={subjects || []} />
    </div>
  );
}
