import Image from "next/image";
import LoginForm from "./login-form";

export const metadata = {
  title: "Sign In | Data Engineering Portal",
  description: "Sign in to access course materials, lecture notes, lab manuals, and academic resources at MVGR College of Engineering.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.06)] space-y-6">
        
        {/* Header with High-Definition Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-2 border border-slate-200/90 shadow-sm">
            <Image
              src="/De_logo.jpg"
              alt="Department of Data Engineering Logo"
              width={56}
              height={56}
              priority
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Data Engineering Portal
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              MVGR College of Engineering (Autonomous)
            </p>
          </div>
        </div>

        {/* Login Form Component */}
        <LoginForm />

        {/* Clean Student Helper Note */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-normal">
            For students: Your initial password is your registration number.
          </p>
        </div>

      </div>
    </main>
  );
}
