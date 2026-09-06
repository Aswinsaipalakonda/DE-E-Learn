import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import { redirect } from "next/navigation";
import AdminProfileClient from "./admin-profile-client";

export default async function AdminProfilePage() {
  const { user, profile } = await getCachedUserProfile();
  if (!user || profile?.role !== "admin") redirect("/login");

  const adminProfile = {
    name: profile?.name || user.user_metadata?.name || "System Administrator",
    email: profile?.email || user.email || "admin@mvgrce.edu.in",
    role: "admin",
    branch: profile?.branch || "ALL",
    current_semester: typeof profile?.current_semester === "number" ? profile.current_semester : null,
  };

  return <AdminProfileClient profile={adminProfile} />;
}
