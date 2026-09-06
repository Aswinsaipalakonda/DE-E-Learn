import { getCachedUserProfile } from "@/utils/supabase/cached-auth";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
  const { user, profile } = await getCachedUserProfile();
  if (!user) {
    redirect("/login");
  }

  const role = profile?.role || user.user_metadata?.role || "student";
  redirect(`/${role}/profile`);
}
