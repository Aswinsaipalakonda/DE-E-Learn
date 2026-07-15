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
  UserCheck
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
    eventsRes
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "faculty"),
    supabase.from("materials").select("id", { count: "exact", head: true }),
    supabase.from("material_files").select("size"),
    supabase.from("activity_events").select("id, created_at, type, user_email, metadata").order("created_at", { ascending: false }).limit(5)
  ]);

  const totalStudents = studentsRes.count || 0;
  const totalFaculty = facultyRes.count || 0;
  const totalMaterials = materialsRes.count || 0;

  // Calculate storage consumed
  let totalStorageBytes = 0;
  if (filesRes.data) {
    filesRes.data.forEach(f => {
      totalStorageBytes += f.size || 0;
    });
  }

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
  };

  const events = (eventsRes.data as unknown as ActivityEvent[]) || [];

  return (
    <div className="space-y-8">
      {/* Header card */}
      <header className="p-6 bg-surface rounded-2xl border border-border shadow-xs">
        <h1 className="text-2xl font-bold text-primary">System Administrator</h1>
        <p className="text-sm text-primary/60 mt-1">
          Monitor user registrations, branch taxonomy, and overall digital repository metrics.
        </p>
      </header>

      {/* Stats cards grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{totalStudents}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Active Students</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{totalFaculty}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Registered Faculty</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{totalMaterials}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Total Resources</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{formatStorage(totalStorageBytes)}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Repository Storage</span>
          </div>
        </div>
      </section>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-primary tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" /> System Access Logs
          </h2>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            {events && events.length > 0 ? (
              <div className="divide-y divide-border">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 flex items-start gap-4 hover:bg-bg/20 transition-all text-xs">
                    <div className="mt-0.5 p-1.5 rounded-md bg-secondary/10 text-secondary shrink-0 font-bold uppercase text-[9px] tracking-wide">
                      {ev.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-primary block truncate">{ev.user_email}</span>
                      <span className="text-primary/50 mt-1 block leading-relaxed font-medium">
                        {ev.type === "download" 
                          ? `Downloaded: ${ev.metadata.title || "File"}`
                          : ev.type === "view"
                          ? `Viewed: ${ev.metadata.title || "Material"}`
                          : `Performed system event: ${ev.type}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-primary/40 shrink-0 font-semibold">
                      {new Date(ev.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-primary/45 font-semibold text-sm">
                No recent database activities logged.
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="space-y-6">
          <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Quick Operations</h2>
            <div className="flex flex-col gap-3 font-semibold text-sm">
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3.5 bg-bg hover:bg-border rounded-xl border border-border text-primary transition-all"
              >
                <span>Student Roster Manager</span>
                <ArrowRight className="h-4 w-4 text-primary/40" />
              </Link>
              <Link
                href="/admin/taxonomy"
                className="flex items-center justify-between p-3.5 bg-bg hover:bg-border rounded-xl border border-border text-primary transition-all"
              >
                <span>Taxonomy (Subjects/Branches)</span>
                <ArrowRight className="h-4 w-4 text-primary/40" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
