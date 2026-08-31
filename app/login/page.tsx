import Image from "next/image";
import LoginForm from "./login-form";
import { BookOpen, Sparkles, Shield, GraduationCap, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Login | Data Engineering Academic Portal",
  description: "Sign in to access your Department of Data Engineering course materials, lecture notes, lab manuals, and academic resources at MVGR College of Engineering.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-[#0B0F19] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive Grid Container */}
      <div className="w-full max-w-5xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl sm:rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: BRANDING & ACADEMIC VALUE PROPOSITION (Desktop) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-8 relative z-10">
            {/* Department Emblem */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-white p-1.5 shadow-lg shadow-black/40 border border-slate-700/80 flex items-center justify-center shrink-0">
                <Image
                  src="/De_logo.jpg"
                  alt="Department of Data Engineering"
                  width={48}
                  height={48}
                  priority
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <span className="text-white font-bold text-base tracking-tight block">
                  Data Engineering
                </span>
                <span className="text-[11px] text-blue-400 font-semibold tracking-wider uppercase block">
                  MVGR College (Autonomous)
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Unified Academic Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Curated Course Notes, Lab Manuals & Question Banks.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Access your semester-specific syllabus materials, lecture resources, and departmental updates with role-based access.
              </p>
            </div>

            {/* Feature Bullet Points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span>Semester-wise syllabus classification (CIC & DE)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span>Single-click download and offline study bookmarks</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span>Faculty version management & cohort view matrices</span>
              </div>
            </div>
          </div>

          {/* Institutional Accreditation Footer */}
          <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>UGC Autonomous • NAAC &apos;A&apos; Grade</span>
            <span className="font-semibold text-slate-400">Est. 1997</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LOGIN FORM WORKSPACE */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header Title */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Sign In to Your Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Enter your registered college email and credentials to continue.
              </p>
            </div>

            {/* Interactive Form Component */}
            <LoginForm />

            {/* Role Credentials Guide Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>Student Default Credentials</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                For first-time student logins, use your college email (e.g. <span className="font-mono font-medium text-slate-900">23331a4745@mvgrce.edu.in</span>) and your <span className="font-semibold text-slate-900">Registration Number</span> as the initial password.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
