import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch session user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch corresponding user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const handleSignOut = async () => {
    "use server";
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <main className="min-h-screen bg-bg p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 bg-surface rounded-2xl border border-border shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Welcome back, {profile?.name || user.email}
            </h1>
            <p className="text-sm text-primary/60 mt-1">
              Role: <span className="capitalize font-semibold text-secondary">{profile?.role || "Student"}</span>
            </p>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-semibold text-sm rounded-lg shadow-sm cursor-pointer transition-all"
            >
              Sign Out
            </button>
          </form>
        </header>

        {/* Dashboard Skeleton Body */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-surface rounded-2xl border border-border shadow-sm col-span-2">
            <h2 className="text-lg font-bold text-primary mb-4">Latest Uploads</h2>
            <div className="py-12 text-center text-primary/40 border-2 border-dashed border-border rounded-xl">
              No recent uploads available.
            </div>
          </div>
          <div className="p-6 bg-surface rounded-2xl border border-border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-primary">Your Academic Profile</h2>
            <div className="space-y-3 text-sm text-primary/80">
              <div>
                <span className="block font-semibold text-primary/55">Branch</span>
                <span>{profile?.branch || "Not Specified"}</span>
              </div>
              <div>
                <span className="block font-semibold text-primary/55">Current Semester</span>
                <span>Semester {profile?.current_semester || "N/A"}</span>
              </div>
              <div>
                <span className="block font-semibold text-primary/55">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success">
                  {profile?.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
