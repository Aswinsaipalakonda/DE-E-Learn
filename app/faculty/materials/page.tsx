import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MaterialsList from "./materials-list";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FileItem {
  id: string;
  file_name: string;
  size: number;
  mime_type: string;
  version: number;
  storage_ref: string;
}

interface RawMaterial {
  id: string;
  title: string;
  type: string;
  state: string;
  created_at: string;
  subject: string;
  material_files: FileItem[];
}

export default async function FacultyMaterialsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch materials owned by uploader (excluding deleted state)
  const { data, error } = await supabase
    .from("materials")
    .select(`
      id,
      title,
      type,
      state,
      created_at,
      subject,
      material_files (
        id,
        file_name,
        size,
        mime_type,
        version,
        storage_ref
      )
    `)
    .eq("owner", user.id)
    .neq("state", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div role="alert" className="p-4 bg-danger/10 border border-danger/25 text-danger rounded-xl font-semibold">
        Failed to fetch your materials registry.
      </div>
    );
  }

  // Cast values safely
  const materials = (data as unknown as RawMaterial[] || []).map(m => ({
    ...m,
    state: m.state as "draft" | "published" | "archived" | "deleted",
  }));

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
        <h1 className="text-2xl font-bold text-primary tracking-tight">Your Materials Inventory</h1>
        <p className="text-sm text-primary/60">
          Manage your uploaded files, update metadata, archive outdated versions, or replace content with new revisions.
        </p>
      </header>

      <MaterialsList initialMaterials={materials} />
    </div>
  );
}
