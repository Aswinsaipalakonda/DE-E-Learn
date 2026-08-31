import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Users, 
  BookOpen, 
  HardDrive, 
  Activity, 
  ArrowRight,
  UserCheck,
  Megaphone,
  ShieldAlert,
  BarChart3,
  Layers,
  Sparkles,
  ChevronRight,
  Calendar
} from "lucide-react";

interface ActivityEvent {
  id: string;
  created_at: string;
  type: string;
  user_email: string;
  metadata: {
    title?: string;
    subject?: string;
  };
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Run aggregate queries
  const [
    studentsRes,
    facultyRes,
    materialsRes,
    filesRes,
    eventsRes,
    branchesRes
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "faculty"),
    supabase.from("materials").select("id", { count: "exact", head: true }),
    supabase.from("material_files").select("size"),
    supabase.from("activity_events").select("id, created_at, type, user_email, metadata").order("created_at", { ascending: false }).limit(6),
    supabase.from("branches").select("code", { count: "exact", head: true })
  ]);

  const totalStudents = studentsRes.count || 0;
  const totalFaculty = facultyRes.count || 0;
  const totalMaterials = materialsRes.count || 0;
  const totalBranches = branchesRes.count || 0;

  // Calculate storage consumed
  let totalStorageBytes = 0;
  if (filesRes.data) {
    filesRes.data.forEach((f) => {
      totalStorageBytes += f.size || 0;
    });
  }

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return mb.toFixed(2) + " MB";
    return (mb / 1024).toFixed(2) + " GB";
  };

  const events = (eventsRes.data as unknown as ActivityEvent[]) || [];

  return (
    <div className="space-y-6 sm:space-y-7 w-full pb-6">
      {/* ========================================================================= */}
      {/* EXECUTIVE WELCOME HERO CARD */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-4px_rgba(11,31,59,0.05)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Department Administration Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Academic Operations Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Real-time monitoring of student cohorts, faculty syllabus repositories, and departmental cloud infrastructure.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all shadow-xs"
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </Link>
            <Link
              href="/admin/taxonomy"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium transition-all"
            >
              <Layers className="h-4 w-4 text-slate-600" />
              <span>Taxonomy</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METRICS TILES: 2-COLUMNS ON MOBILE / 4-COLUMNS ON DESKTOP */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Card 1: Active Students */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{totalStudents}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Active Learners</span>
          </div>
        </div>

        {/* Card 2: Registered Faculty */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{totalFaculty}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Educators & Ranks</span>
          </div>
        </div>

        {/* Card 3: Curriculum Resources */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Materials</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <BookOpen className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <span className="block text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{totalMaterials}</span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Learning Units</span>
          </div>
        </div>

        {/* Card 4: Cloud Storage */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <HardDrive className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{formatStorage(totalStorageBytes)}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">Healthy</span>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5 block">Storage Bucket</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2-COLUMN PANELS: RECENT SYSTEM ACTIVITY & QUICK ACCESS DIRECTORY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Activity Audit */}
        <section className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Activity className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Recent Activity Logs</h2>
            </div>
            <Link
              href="/admin/logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              <span>View All Logs</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {events.map((ev) => (
                <div key={ev.id} className="py-3.5 flex items-start justify-between gap-3 group">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase">
                        {ev.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {ev.metadata?.title || ev.user_email || "System Operation"}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal block truncate">
                      Triggered by {ev.user_email}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal shrink-0">
                    {new Date(ev.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Activity className="h-5 w-5" />
              </div>
              <p className="text-xs text-slate-500 font-normal">No recent administrative events logged.</p>
            </div>
          )}
        </section>

        {/* Right Column: Quick Operations Navigation */}
        <section className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Operations
          </h2>

          <div className="space-y-2">
            {[
              { title: "User Management & Roster", href: "/admin/users", desc: "Manage students, faculty & sections", icon: Users },
              { title: "Curriculum Taxonomy", href: "/admin/taxonomy", desc: "Subjects & branch specializations", icon: Layers },
              { title: "Announcements & Broadcast", href: "/admin/announcements", desc: "Push departmental notices", icon: Megaphone },
              { title: "System Audit Logs", href: "/admin/logs", desc: "Inspect security events", icon: ShieldAlert },
              { title: "Usage & Storage Analytics", href: "/admin/analytics", desc: "Monitor repository downloads", icon: BarChart3 },
            ].map((op) => {
              const Icon = op.icon;
              return (
                <Link
                  key={op.href}
                  href={op.href}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/80 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 group-hover:text-slate-900 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {op.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                        {op.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
