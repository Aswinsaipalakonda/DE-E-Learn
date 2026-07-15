import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnnouncementForm from "./announcement-form";

export default async function AdminAnnouncementsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch branches and semesters
  const [branchesRes, semestersRes] = await Promise.all([
    supabase.from("branches").select("code, name").eq("active", true),
    supabase.from("semesters").select("number, name").eq("active", true),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">System Announcements Builder</h1>
        <p className="text-sm text-primary/60">
          Broadcast system notifications, mid-term updates, timetables, or academic alarms.
        </p>
      </header>

      <AnnouncementForm 
        branches={branchesRes.data || []} 
        semesters={semestersRes.data || []} 
      />
    </div>
  );
}
