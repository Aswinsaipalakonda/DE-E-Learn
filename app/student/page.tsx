import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { 
  BookOpen, 
  Bookmark, 
  Clock, 
  FileText, 
  Megaphone,
  ArrowRight
} from "lucide-react";

import SemesterSelect from "@/components/semester-select";

interface SubjectInfo {
  title: string;
  code: string;
}

interface MaterialDashboardItem {
  id: string;
  title: string;
  type: string;
  subjects: { title: string } | null;
}

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ sem?: string }>;
}) {
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
  
  // Resolve selected semester from search params, default to user profile semester or Sem 1
  const resolvedParams = await searchParams;
  const selectedSemester = resolvedParams.sem ? parseInt(resolvedParams.sem, 10) : (profile?.current_semester || 1);

  // 1. Fetch announcements active today matching scope
  const nowStr = new Date().toISOString();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .lte("start_time", nowStr)
    .gte("end_time", nowStr)
    .or(`scope_branch.eq.${branch},scope_branch.is.null`)
    .or(`scope_semester.eq.${selectedSemester},scope_semester.is.null`)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  // 2. Fetch latest uploads in student scope matching selected semester
  const { data: latestUploads } = await supabase
    .from("materials")
    .select("id, title, type, created_at, subjects(title, code)")
    .eq("branch", branch)
    .eq("semester", selectedSemester)
    .eq("state", "published")
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. Fetch recently viewed materials for the user (from activity_events table joining materials)
  const { data: recentEvents } = await supabase
    .from("activity_events")
    .select("target_id, created_at, materials(id, title, type, subjects(title))")
    .eq("actor_id", user.id)
    .eq("type", "view")
    .order("created_at", { ascending: false })
    .limit(3);

  // 4. Fetch total bookmarks count
  const { count: bookmarksCount } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-primary to-primary/90 p-8 rounded-2xl border border-border text-white shadow-xs">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
        <p className="text-white/70 mt-2 font-medium max-w-xl text-sm leading-relaxed">
          Access your courses, bookmarks, and announcements for Branch <span className="text-secondary font-bold">{branch}</span>.
        </p>
      </section>

      {/* Semester Selection Dropdown */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-primary/50 uppercase tracking-widest">Select Semester</h2>
        <SemesterSelect selectedSemester={selectedSemester} />
      </section>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions Grid */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-primary tracking-tight">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/student/subjects" 
                className="flex items-center gap-4 p-5 bg-surface rounded-xl border border-border hover:border-secondary transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-primary text-sm block group-hover:text-secondary transition-colors">Browse Subjects</span>
                  <span className="text-xs text-primary/55 mt-0.5 block">Access your semester notes & labs</span>
                </div>
              </Link>

              <Link 
                href="/student/bookmarks" 
                className="flex items-center gap-4 p-5 bg-surface rounded-xl border border-border hover:border-accent transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-bold text-primary text-sm block group-hover:text-accent transition-colors">Bookmarks ({bookmarksCount || 0})</span>
                  <span className="text-xs text-primary/55 mt-0.5 block">Quickly view saved documents</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Latest Uploads */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-primary tracking-tight">Latest Uploads</h2>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              {latestUploads && latestUploads.length > 0 ? (
                <div className="divide-y divide-border">
                  {latestUploads.map((material) => (
                    <Link 
                      key={material.id}
                      href={`/student/materials/${material.id}`}
                      className="flex items-center justify-between p-5 hover:bg-bg/50 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="font-bold text-primary text-sm block group-hover:text-secondary transition-colors leading-tight">
                            {material.title}
                          </span>
                          <span className="text-xs text-primary/60 mt-1 inline-flex items-center gap-1.5 font-medium">
                            <span>{(material.subjects as unknown as SubjectInfo | null)?.title || "Subject"}</span>
                            <span className="h-1 w-1 rounded-full bg-primary/20" />
                            <span>{material.type}</span>
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary/30 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-primary/40 text-sm font-semibold">
                  No materials published for your semester yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Announcements Feed */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-primary tracking-tight">Announcements</h2>
            <div className="space-y-4">
              {announcements && announcements.length > 0 ? (
                announcements.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-5 rounded-2xl border ${
                      item.priority === "important" 
                        ? "bg-accent/5 border-accent/15" 
                        : "bg-surface border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone className={`h-4 w-4 ${item.priority === "important" ? "text-accent" : "text-primary/60"}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${item.priority === "important" ? "text-accent" : "text-primary/50"}`}>
                        {item.priority}
                      </span>
                    </div>
                    <h3 className="font-bold text-primary text-sm leading-snug">{item.title}</h3>
                    <p className="text-xs text-primary/70 mt-1.5 leading-relaxed">{item.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-surface border border-border rounded-2xl text-center text-primary/45 text-xs font-semibold">
                  No active announcements.
                </div>
              )}
            </div>
          </section>

          {/* Recently Viewed */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-primary tracking-tight">Recently Viewed</h2>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              {recentEvents && recentEvents.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentEvents.map((event) => {
                    const material = event.materials as unknown as MaterialDashboardItem | null;
                    if (!material) return null;
                    return (
                      <Link 
                        key={event.target_id}
                        href={`/student/materials/${material.id}`}
                        className="flex items-start gap-3.5 p-4 hover:bg-bg/50 transition-all group"
                      >
                        <Clock className="h-4 w-4 text-primary/40 mt-1 shrink-0 group-hover:text-secondary transition-colors" />
                        <div>
                          <span className="font-bold text-primary text-xs block leading-tight group-hover:text-secondary transition-colors">
                            {material.title}
                          </span>
                          <span className="text-[10px] text-primary/50 mt-1 block">
                            {material.subjects?.title || "Subject"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-primary/40 text-xs font-semibold">
                  No recently viewed materials.
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
