import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import BookmarkButton from "./bookmark-button";
import FileList from "./file-list";
import { 
  User, 
  Calendar, 
  ArrowLeft 
} from "lucide-react";

interface MaterialFileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  storage_ref: string;
}

interface UserProfile {
  name: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MaterialDetailPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

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

  if (!profile) redirect("/login");

  // Fetch material details with uploader (owner) name and files (security check included in where filter)
  const { data: material, error } = await supabase
    .from("materials")
    .select(`
      id, 
      title, 
      description, 
      type, 
      created_at, 
      subject,
      branch,
      semester,
      state,
      users (name),
      material_files (id, file_name, size, mime_type, storage_ref)
    `)
    .eq("id", id)
    .eq("branch", profile.branch)
    .eq("semester", profile.current_semester)
    .eq("state", "published")
    .single();

  if (error || !material) {
    return (
      <div className="space-y-4">
        <Link 
          href="/student/subjects" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subjects
        </Link>
        <div role="alert" className="p-5 bg-danger/10 border border-danger/25 text-danger rounded-xl font-bold">
          Material not found or you do not have permission to access it.
        </div>
      </div>
    );
  }

  // Check if bookmarked
  const { data: bookmark } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("material_id", id)
    .maybeSingle();

  const isBookmarked = !!bookmark;

  // Log view event on the server during page load
  await supabase
    .from("activity_events")
    .insert({
      type: "view",
      actor_id: user.id,
      target_id: id,
    });

  const files = (material.material_files as unknown as MaterialFileItem[]) || [];
  const uploaderName = (material.users as unknown as UserProfile | null)?.name || "Faculty Member";

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link 
        href={`/student/subjects/${material.subject}`} 
        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary/50 hover:text-secondary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Subject
      </Link>

      {/* Header Panel */}
      <section className="flex flex-col md:flex-row md:items-start md:justify-between p-6 bg-surface rounded-2xl border border-border shadow-xs gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/15 px-2.5 py-1 rounded-md border border-secondary/10">
              {material.subject}
            </span>
            <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest bg-bg px-2.5 py-1 rounded-md border border-border">
              {material.type}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-primary leading-tight">
            {material.title}
          </h1>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-primary/50 font-semibold">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary/40" />
              <span>{uploaderName}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary/40" />
              <span>
                {new Date(material.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <BookmarkButton materialId={id} initialBookmarked={isBookmarked} />
        </div>
      </section>

      {/* Main Details and Files List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Description/Content Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-surface rounded-2xl border border-border space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Description</h2>
            <p className="text-sm text-primary/80 leading-relaxed font-medium whitespace-pre-line">
              {material.description || "No description provided for this material."}
            </p>
          </div>
        </div>

        {/* Files Panel */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-primary/40 uppercase tracking-widest">Files ({files.length})</h2>
          <FileList materialId={id} files={files} />
        </div>
      </div>
    </div>
  );
}
