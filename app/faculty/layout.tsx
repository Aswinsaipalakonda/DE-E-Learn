import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Breadcrumbs from "@/components/breadcrumbs";
import BottomNav from "@/components/bottom-nav";
import NotificationBell from "@/components/notification-bell";
import GlobalSearch from "@/components/global-search";

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch session user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "faculty" && profile.role !== "admin")) {
    redirect("/login");
  }

  const handleSignOut = async () => {
    "use server";
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      <Sidebar 
        userRole="faculty" 
        signOutAction={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full mt-0 lg:mt-0">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Breadcrumbs />
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </div>
          {children}
        </main>
      </div>

      <BottomNav 
        userRole="faculty" 
        signOutAction={handleSignOut}
      />
      <GlobalSearch />
    </div>
  );
}
