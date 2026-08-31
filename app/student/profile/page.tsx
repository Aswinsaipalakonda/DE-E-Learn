import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "@/app/profile/profile-client";

export default async function StudentProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("users")
    .select("name, email, role, branch, current_semester, roll_number, section")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (!profile) {
    profile = {
      name: user.user_metadata?.name || user.email?.split("@")[0].toUpperCase() || "Student",
      email: user.email || "",
      role: "student",
      branch: "CIC",
      current_semester: 3,
      roll_number: user.email?.split("@")[0].toUpperCase() || "23331A4745",
      section: "A",
    };
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Student Profile</h1>
        <p className="text-sm text-slate-500">Manage your student credentials, branch allocation, and account details.</p>
      </header>

      <ProfileClient profile={profile} />
    </div>
  );
}
