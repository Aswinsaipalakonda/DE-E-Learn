import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Eye, Download, User, Calendar, BookOpen, Layers } from "lucide-react";

interface MaterialItem {
  id: string;
  title: string;
  type: string;
  branch: string;
  semester: number;
  created_at: string;
  users: {
    name: string;
    email: string;
  } | null;
}

interface ActivityEvent {
  type: string;
  target_id: string;
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all materials with uploader profile
  const { data: materialsData, error: mError } = await supabase
    .from("materials")
    .select(`
      id,
      title,
      type,
      branch,
      semester,
      created_at,
      users:owner (
        name,
        email
      )
    `)
    .neq("state", "deleted")
    .order("created_at", { ascending: false });

  // Fetch all activity events
  const { data: eventsData, error: eError } = await supabase
    .from("activity_events")
    .select("type, target_id");

  if (mError || eError) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to fetch repository statistics.
      </div>
    );
  }

  const materials = (materialsData as unknown as MaterialItem[]) || [];
  const events = (eventsData as unknown as ActivityEvent[]) || [];

  // Aggregations
  const totalViews = events.filter((e) => e.type === "view").length;
  const totalDownloads = events.filter((e) => e.type === "download").length;

  const materialsWithMetrics = materials.map((m) => {
    const views = events.filter((e) => e.target_id === m.id && e.type === "view").length;
    const downloads = events.filter((e) => e.target_id === m.id && e.type === "download").length;
    return {
      ...m,
      views,
      downloads,
    };
  });

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Repository Usage Metrics</h1>
        <p className="text-sm text-primary/60">
          Monitor student interactions, document downloads, and faculty upload logs.
        </p>
      </header>

      {/* Analytics Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Total Material Views</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{totalViews}</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Total Downloads</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{totalDownloads}</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest block">Uploaded Materials</span>
            <span className="text-2xl font-black text-primary block mt-0.5">{materials.length}</span>
          </div>
        </div>
      </section>

      {/* Detailed Material Logs Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary tracking-tight">Material Engagement Logs</h2>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          {materialsWithMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg/40 text-primary/50 font-bold border-b border-border">
                    <th className="p-4">Material Info</th>
                    <th className="p-4">Faculty Uploader</th>
                    <th className="p-4">Scope</th>
                    <th className="p-4 text-center">Views</th>
                    <th className="p-4 text-center">Downloads</th>
                    <th className="p-4 text-right">Uploaded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {materialsWithMetrics.map((m) => (
                    <tr key={m.id} className="hover:bg-bg/25 transition-all font-medium">
                      <td className="p-4">
                        <span className="font-bold text-primary block leading-tight">{m.title}</span>
                        <span className="text-[10px] text-primary/45 mt-0.5 block">{m.type}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-primary block">{m.users?.name || "System"}</span>
                        <span className="text-[10px] text-primary/45 block">{m.users?.email || "-"}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex gap-1.5 items-center">
                          <span className="px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[9px] font-bold uppercase">{m.branch}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-secondary/10 border border-secondary/10 text-[9px] font-bold">Sem {m.semester}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 bg-secondary/10 text-secondary border border-secondary/10 font-bold rounded-lg text-[10px]">
                          {m.views}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 bg-accent/10 text-accent border border-accent/10 font-bold rounded-lg text-[10px]">
                          {m.downloads}
                        </span>
                      </td>
                      <td className="p-4 text-right text-primary/60">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center text-primary/40 font-semibold">
              No materials have been uploaded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
