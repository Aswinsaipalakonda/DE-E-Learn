import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function IndexPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Retrieve authenticated session user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Retrieve user metadata profile
  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  // Redirect to corresponding portal dashboard
  switch (profile.role) {
    case "student":
      redirect("/student");
    case "faculty":
      redirect("/faculty");
    case "admin":
      redirect("/admin");
    default:
      redirect("/login");
  }
}
