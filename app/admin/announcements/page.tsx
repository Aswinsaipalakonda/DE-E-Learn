import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnnouncementsClient from "./announcements-client";

export default async function AdminAnnouncementsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate Admin user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch announcements, branches, and semesters
  const [announcementsRes, branchesRes, semestersRes] = await Promise.all([
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("branches")
      .select("code, name")
      .eq("active", true),
    supabase
      .from("semesters")
      .select("number, name")
      .eq("active", true)
      .order("number", { ascending: true })
  ]);

  return (
    <AnnouncementsClient
      initialAnnouncements={announcementsRes.data || []}
      branches={branchesRes.data || []}
      semesters={semestersRes.data || []}
    />
  );
}
