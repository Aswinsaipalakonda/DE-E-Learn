import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "@/app/profile/profile-client";

export default async function FacultyProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, role, branch, current_semester")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">My Profile</h1>
        <p className="text-sm text-primary/60">Manage your faculty details and credentials settings.</p>
      </header>

      <ProfileClient profile={profile} />
    </div>
  );
}
