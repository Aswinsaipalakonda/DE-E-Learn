import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminProfileClient from "./admin-profile-client";

export default async function AdminProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("name, email, role, branch, current_semester")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  const adminProfile = profile || {
    name: user.user_metadata?.name || "System Administrator",
    email: user.email || "admin@mvgrce.edu.in",
    role: "admin",
    branch: "ALL",
    current_semester: null,
  };

  return <AdminProfileClient profile={adminProfile} />;
}
