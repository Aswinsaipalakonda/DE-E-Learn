import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { FolderOpen, ArrowRight } from "lucide-react";

interface SubjectMaterial {
  id: string;
  updated_at: string;
}

interface SubjectItem {
  code: string;
  title: string;
  branch: string;
  semester: number;
  active: boolean;
  materials: SubjectMaterial[];
}

export default async function SubjectsBrowserPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("branch, current_semester")
    .eq("id", user.id)
    .single();

  const branch = profile?.branch || "";
  const semester = profile?.current_semester || 0;

  // Fetch subjects with nested materials count and dates
  const { data, error } = await supabase
    .from("subjects")
    .select("code, title, branch, semester, active, materials(id, updated_at)")
    .eq("branch", branch)
    .eq("semester", semester)
    .eq("active", true);

  if (error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to fetch subjects. Please try again.
      </div>
    );
  }

  const subjects = data as unknown as SubjectItem[];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Your Subjects</h1>
        <p className="text-sm text-primary/60">
          Select a subject to browse related syllabus materials, slides, and notes.
        </p>
      </header>

      {subjects && subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => {
            const materials = subject.materials || [];
            const filesCount = materials.length;

            // Find last updated material date
            let lastUpdatedStr = "No updates";
            if (filesCount > 0) {
              const latestDate = new Date(
                Math.max(...materials.map((m) => new Date(m.updated_at).getTime()))
              );
              lastUpdatedStr = latestDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            }

            return (
              <Link
                key={subject.code}
                href={`/student/subjects/${subject.code}`}
                className="flex flex-col justify-between p-6 bg-surface rounded-2xl border border-border hover:border-secondary transition-all group shadow-xs"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-wider bg-bg px-2.5 py-1 rounded-md border border-border">
                      {subject.code}
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary/30 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h2 className="font-bold text-primary text-base group-hover:text-secondary transition-colors line-clamp-1 leading-snug">
                      {subject.title}
                    </h2>
                    <p className="text-xs text-primary/50 mt-1.5 flex items-center gap-1.5 font-medium">
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>{filesCount} {filesCount === 1 ? "material" : "materials"} available</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-primary/45 font-semibold">
                  <span>Last updated</span>
                  <span className="text-primary/70">{lastUpdatedStr}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-surface border border-border rounded-2xl text-primary/45 text-sm font-semibold shadow-xs">
          No active subjects mapped to your semester profile.
        </div>
      )}
    </div>
  );
}
