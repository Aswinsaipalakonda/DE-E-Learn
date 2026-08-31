import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import HelpClient from "./help-client";
import { ArrowLeft } from "lucide-react";

export default async function HelpCenterPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // If user is authenticated, retrieve role to determine backlink destination
  let backUrl = "/";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "student") backUrl = "/student";
    if (profile?.role === "faculty") backUrl = "/faculty";
    if (profile?.role === "admin") backUrl = "/admin";
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs">
        <Link href={backUrl} className="flex items-center gap-2 text-xs font-bold text-primary/70 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portal</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden border border-border bg-white p-0.5">
            <Image
              src="/De_logo.jpg"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-extrabold text-primary text-sm hidden sm:inline">MVGR DE E-Learn</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <HelpClient userEmail={user?.email} />
      </main>
    </div>
  );
}
