import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";

interface MaterialInfo {
  id: string;
  title: string;
  type: string;
  subject: string;
  subjects: { title: string } | null;
}

interface BookmarkItem {
  id: string;
  created_at: string;
  materials: MaterialInfo | null;
}

export default async function BookmarksPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Query bookmarks joining materials and subjects
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      id,
      created_at,
      materials (
        id,
        title,
        type,
        subject,
        subjects (title)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to fetch bookmarks. Please try again.
      </div>
    );
  }

  const bookmarks = data as unknown as BookmarkItem[];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Your Bookmarks</h1>
        <p className="text-sm text-primary/60">
          Quick access to your saved files and lecture notes.
        </p>
      </header>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
        {bookmarks && bookmarks.length > 0 ? (
          <div className="divide-y divide-border">
            {bookmarks.map((bookmark) => {
              const material = bookmark.materials;
              if (!material) return null;

              return (
                <Link
                  key={bookmark.id}
                  href={`/student/materials/${material.id}`}
                  className="flex items-center justify-between p-5 hover:bg-bg/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/5 text-accent flex items-center justify-center shrink-0 mt-0.5">
                      <Bookmark className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                      <span className="font-bold text-primary text-sm block group-hover:text-secondary transition-colors leading-tight">
                        {material.title}
                      </span>
                      <span className="text-xs text-primary/50 mt-1 inline-flex items-center gap-1.5 font-medium">
                        <span>{material.subject}</span>
                        <span className="h-1 w-1 rounded-full bg-primary/20" />
                        <span>{material.type}</span>
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary/30 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-primary/40 text-sm font-semibold flex flex-col items-center justify-center gap-3">
            <Bookmark className="h-10 w-10 text-primary/20" />
            <span>You haven&apos;t bookmarked any materials yet.</span>
          </div>
        )}
      </div>
    </div>
  );
}
