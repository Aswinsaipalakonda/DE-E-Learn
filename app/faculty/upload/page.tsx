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
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to load subjects options. Please reload.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link 
        href="/faculty" 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary/50 hover:text-secondary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Upload Syllabus Material</h1>
        <p className="text-sm text-primary/60">
          Upload reference files, assignments, lecture slides, or manual notebooks.
        </p>
      </header>

      <UploadForm subjects={subjects || []} />
    </div>
  );
}
