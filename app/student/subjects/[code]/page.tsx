import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  FileText, 
  Search, 
  ArrowRight
} from "lucide-react";

interface PageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SubjectDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const code = params.code;
  const query = searchParams.q || "";
  const selectedType = searchParams.type || "";

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get student profile
  const { data: profile } = await supabase
    .from("users")
    .select("branch, current_semester")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch subject detail and verify scope compatibility (security guard)
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("code", code)
    .eq("branch", profile.branch)
    .eq("semester", profile.current_semester)
    .eq("active", true)
    .single();

  if (!subject) {
    return (
      <div role="alert" className="p-5 bg-danger/10 border border-danger/25 text-danger rounded-xl font-bold">
        Subject not found or you do not have permission to view it.
      </div>
    );
  }

  // Build Materials query
  let dbQuery = supabase
    .from("materials")
    .select("id, title, type, created_at, tags")
    .eq("subject", code)
    .eq("state", "published");

  if (selectedType) {
    dbQuery = dbQuery.eq("type", selectedType);
  }

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data: materials } = await dbQuery.order("created_at", { ascending: false });

  // List of material types for category pills
  const materialTypes = [
    "Notes",
    "Lecture Slides",
    "Assignments",
    "Lab Manuals",
    "Question Banks",
    "Reference Books",
    "Previous Papers",
  ];

  return (
    <div className="space-y-6">
      {/* Subject Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/15 px-2.5 py-1 rounded-md border border-secondary/10">
            {subject.code}
          </span>
          <h1 className="text-2xl font-bold text-primary tracking-tight mt-2">{subject.title}</h1>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        <form method="GET" className="relative flex-1">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search materials in this course..."
            className="w-full pl-11 pr-24 py-3 rounded-xl border border-border bg-surface text-primary text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
          />
          {selectedType && <input type="hidden" name="type" value={selectedType} />}
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-primary/40" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/95 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-1.5 shrink-0">
            <Link
              href={`/student/subjects/${code}${query ? `?q=${query}` : ""}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                !selectedType
                  ? "bg-primary border-primary text-white"
                  : "bg-surface border-border text-primary/70 hover:bg-bg hover:text-primary"
              }`}
            >
              All Types
            </Link>
            {materialTypes.map((type) => {
              const isActive = selectedType === type;
              const href = `/student/subjects/${code}?type=${encodeURIComponent(type)}${query ? `&q=${query}` : ""}`;
              return (
                <Link
                  key={type}
                  href={href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-primary border-primary text-white"
                      : "bg-surface border-border text-primary/70 hover:bg-bg hover:text-primary"
                  }`}
                >
                  {type}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {materials && materials.length > 0 ? (
          <div className="divide-y divide-border">
            {materials.map((item) => (
              <Link
                key={item.id}
                href={`/student/materials/${item.id}`}
                className="flex items-center justify-between p-5 hover:bg-bg/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-primary text-sm block group-hover:text-secondary transition-colors leading-tight">
                      {item.title}
                    </span>
                    <span className="text-xs text-primary/50 mt-1 inline-flex items-center gap-1.5 font-medium">
                      <span>{item.type}</span>
                      <span className="h-1 w-1 rounded-full bg-primary/20" />
                      <span>
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-primary/30 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-primary/40 text-sm font-semibold">
            No materials match your search parameters.
          </div>
        )}
      </div>
    </div>
  );
}
