import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import { redirect } from "next/navigation";
import StudentProfileClient from "./student-profile-client";

export default async function StudentProfilePage() {
  const { user, profile } = await getCachedUserProfile();
  if (!user) redirect("/login");

  const studentProfile = {
    name: profile?.name || user.user_metadata?.name || user.email?.split("@")[0].toUpperCase() || "Student",
    email: profile?.email || user.email || "",
    role: "student",
    branch: profile?.branch || "CIC",
    current_semester: typeof profile?.current_semester === "number" ? profile.current_semester : 3,
    roll_number: profile?.roll_number || user.email?.split("@")[0].toUpperCase() || "23331A4701",
    section: profile?.section || "A",
  };

  return <StudentProfileClient profile={studentProfile} />;
}
