import { getCachedAuthUser } from "@/utils/supabase/cached-auth";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./change-password-form";

export default async function ChangePasswordPage() {
  const { user } = await getCachedAuthUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-border shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-danger/5 text-danger mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Security Notice
          </h1>
          <p className="text-sm text-primary/60 mt-1">
            Please change your temporary password to secure your account.
          </p>
        </div>

        <ChangePasswordForm userEmail={user.email || ""} />
      </div>
    </main>
  );
}
