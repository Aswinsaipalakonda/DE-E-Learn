import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Eye, 
  Download, 
  HardDrive,
  Upload,
  Plus
} from "lucide-react";

interface MaterialFileItem {
  size: number;
}

interface MaterialWithFiles {
  id: string;
  title: string;
  type: string;
  state: string;
  created_at: string;
  material_files: MaterialFileItem[];
}

export default async function FacultyDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all materials owned by this faculty user with nested file sizes
  const { data: materialsData, error: materialsError } = await supabase
    .from("materials")
    .select("id, title, type, state, created_at, material_files(size)")
    .eq("owner", user.id);

  if (materialsError) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to load dashboard metrics.
      </div>
    );
  }

  const materials = (materialsData as unknown as MaterialWithFiles[]) || [];
  const totalUploads = materials.length;

  // Calculate total storage consumed (sum of all file sizes)
  let totalStorageBytes = 0;
  materials.forEach((m) => {
    const files = m.material_files || [];
    files.forEach((f) => {
      totalStorageBytes += f.size;
    });
  });

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " MB";
  };

  // Fetch activity events related to materials owned by this faculty user
  let totalViews = 0;
  let totalDownloads = 0;
  const materialIds = materials.map((m) => m.id);

  if (materialIds.length > 0) {
    const { data: events } = await supabase
      .from("activity_events")
      .select("type")
      .in("target_id", materialIds);

    if (events) {
      events.forEach((ev) => {
        if (ev.type === "view") totalViews++;
        if (ev.type === "download") totalDownloads++;
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-surface rounded-2xl border border-border shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Faculty Dashboard</h1>
          <p className="text-sm text-primary/60 mt-1">
            Manage your course uploads and track student engagement metrics.
          </p>
        </div>
        <Link
          href="/faculty/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-full shadow-sm cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Upload Material
        </Link>
      </header>

      {/* Stats grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{totalUploads}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Total Uploads</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{totalViews}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Total Views</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{totalDownloads}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Total Downloads</span>
          </div>
        </div>

        <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-primary">{formatStorage(totalStorageBytes)}</span>
            <span className="text-xs text-primary/50 font-semibold uppercase tracking-wider mt-0.5 block">Storage Used</span>
          </div>
        </div>
      </section>

      {/* Main content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular / Active list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-primary tracking-tight">Your Course Materials</h2>
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            {materials && materials.length > 0 ? (
              <div className="divide-y divide-border">
                {materials.slice(0, 5).map((m) => (
                  <div key={m.id} className="p-5 flex items-center justify-between hover:bg-bg/25 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center mt-0.5 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-bold text-primary text-sm block leading-tight">{m.title}</span>
                        <span className="text-xs text-primary/50 mt-1 inline-flex items-center gap-1.5 font-medium">
                          <span>{m.type}</span>
                          <span className="h-1 w-1 rounded-full bg-primary/20" />
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.state === "published" 
                              ? "bg-success/10 text-success border border-success/10" 
                              : m.state === "draft"
                              ? "bg-primary/5 text-primary/60 border border-primary/10"
                              : "bg-danger/10 text-danger border border-danger/10"
                          }`}>
                            {m.state}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/student/materials/${m.id}`} // Preview as student
                      className="px-3 py-1.5 bg-bg hover:bg-border text-primary/80 hover:text-primary text-xs font-semibold rounded-lg border border-border transition-all"
                    >
                      Preview
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-primary/40 text-sm font-semibold">
                You haven&apos;t uploaded any materials yet.
              </div>
            )}
          </div>
        </div>

        {/* Storage status & tips */}
        <div className="space-y-6">
          <div className="p-6 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Storage Status</h2>
            <div className="space-y-2">
              <div className="h-2 w-full bg-bg rounded-full overflow-hidden">
                {/* 1GB quota bar indicator */}
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((totalStorageBytes / (1024 * 1024 * 1000)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-primary/50 font-semibold">
                <span>Quota used</span>
                <span>{((totalStorageBytes / (1024 * 1024 * 1000)) * 100).toFixed(1)}% of 1 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
