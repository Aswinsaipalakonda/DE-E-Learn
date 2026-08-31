import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FacultyProfileClient from "./faculty-profile-client";

export default async function FacultyProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("users")
    .select("name, email, role, designation, branch")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (!profile) {
    const rawFacultyName = user.user_metadata?.name || user.email?.split("@")[0] || "Faculty";
    const facultyName = rawFacultyName.includes("@")
      ? rawFacultyName.split("@")[0].replace(/([a-zA-Z]+)(\d+)/, "$1 $2").replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      : rawFacultyName;

    profile = {
      name: facultyName,
      email: user.email || "faculty1@mvgrce.edu.in",
      role: "faculty",
      designation: "Assistant Professor",
      branch: "CIC",
    };
  }

  return <FacultyProfileClient profile={profile} />;
}
