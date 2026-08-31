import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import Breadcrumbs from "@/components/breadcrumbs";
import BottomNav from "@/components/bottom-nav";
import NotificationBell from "@/components/notification-bell";
import GlobalSearch from "@/components/global-search";
import { ShieldCheck, User } from "lucide-react";

export default async function AdminLayout({
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
    .select("name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar 
        userRole="admin" 
        signOutAction={handleSignOut}
      />

      {/* Main Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-24 lg:pb-8">
        {/* Top Header Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-3">
            {/* Live System Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-xs font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Portal Live</span>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Admin Profile Pill */}
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 text-xs font-medium text-slate-800 transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                <ShieldCheck className="h-3 w-3" />
              </div>
              <span className="hidden md:inline font-semibold">{profile.name || "Admin"}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 w-full">
          {children}
        </main>
      </div>

      <BottomNav 
        userRole="admin" 
        signOutAction={handleSignOut}
      />
      <GlobalSearch />
    </div>
  );
}
