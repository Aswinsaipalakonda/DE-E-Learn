import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import { redirect } from "next/navigation";
import FacultyProfileClient from "./faculty-profile-client";

export default async function FacultyProfilePage() {
  const { user, profile } = await getCachedUserProfile();
  if (!user) redirect("/login");

  const facultyProfile = {
    name: profile?.name || user.user_metadata?.name || "Faculty Member",
    email: profile?.email || user.email || "faculty1@mvgrce.edu.in",
    role: "faculty",
    designation: profile?.designation || "Assistant Professor",
    branch: profile?.branch || null,
  };

  return <FacultyProfileClient profile={facultyProfile} />;
}
