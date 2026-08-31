import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/sidebar";
import Breadcrumbs from "@/components/breadcrumbs";
import BottomNav from "@/components/bottom-nav";
import NotificationBell from "@/components/notification-bell";
import GlobalSearch from "@/components/global-search";
import { BookOpen } from "lucide-react";

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

  // Fetch user profile by ID or Email
  let { data: profile } = await supabase
    .from("users")
    .select("id, name, role, designation")
    .or(`id.eq.${user.id},email.eq.${user.email}`)
    .single();

  if (!profile) {
    const facultyRole = user.user_metadata?.role || (user.email?.startsWith("admin") ? "admin" : "faculty");
    const rawName = user.user_metadata?.name || user.email?.split("@")[0] || "Faculty";
    const formattedName = rawName.includes("@") 
      ? rawName.split("@")[0].replace(/([a-zA-Z]+)(\d+)/, "$1 $2").replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      : rawName;

    const { data: newProfile } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email!,
        name: formattedName,
        role: facultyRole,
        status: "active",
        designation: "Assistant Professor",
        first_login_pending: false,
      })
      .select()
      .single();

    profile = newProfile;
  } else if (profile.id !== user.id) {
    await supabase.from("users").update({ id: user.id }).eq("email", user.email!);
  }

  const userRole = profile?.role || user.user_metadata?.role || "faculty";
  if (userRole !== "faculty" && userRole !== "admin") {
    redirect("/login");
  }

  let displayName = profile?.name;
  if (!displayName || displayName === "Faculty Member") {
    if (user.user_metadata?.name && user.user_metadata.name !== "Faculty Member") {
      displayName = user.user_metadata.name;
    } else if (user.email) {
      const emailPrefix = user.email.split("@")[0];
      displayName = emailPrefix
        .replace(/([a-zA-Z]+)(\d+)/, "$1 $2")
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
    } else {
      displayName = "Faculty";
    }
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
        userRole="faculty" 
        signOutAction={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-24 lg:pb-8">
        {/* Top Header Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-3">
            {/* Mobile Logo Branding */}
            <Link href="/faculty" className="flex items-center gap-2.5 lg:hidden">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0 shadow-2xs">
                <Image
                  src="/De_logo.jpg"
                  alt="DE Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div className="leading-tight">
                <span className="text-xs font-bold text-slate-900 block">Data Engineering</span>
                <span className="text-[10px] text-slate-500 font-medium block">MVGR College</span>
              </div>
            </Link>

            {/* Desktop Breadcrumbs */}
            <div className="hidden lg:block">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Clean Faculty Role Badge with Real Faculty Name */}
            <Link
              href="/faculty/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-primary text-white shadow-2xs hover:bg-primary/95 transition-all cursor-pointer"
              title="Faculty Profile"
            >
              <BookOpen className="h-3.5 w-3.5 text-slate-300 shrink-0" />
              <span>{displayName}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 w-full">
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
