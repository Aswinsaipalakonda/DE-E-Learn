import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Resolve user role
  let role = user.user_metadata?.role;
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (profile?.role) {
    role = profile.role;
  }

  if (!role) {
    if (user.email?.startsWith("admin")) role = "admin";
    else if (user.email?.startsWith("faculty") || user.email?.startsWith("testfaculty")) role = "faculty";
    else role = "student";
  }

  redirect(`/${role}/profile`);
}
