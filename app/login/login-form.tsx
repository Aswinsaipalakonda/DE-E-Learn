"use client";

import { useState } from "react";
import { login } from "./actions";
import { Eye, EyeOff, Loader2, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";
import Image from "next/image";
import { KineticTextLoader } from "@/components/ui/kinetic-text-loader";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Kinetic Loading Animation State on Successful Authentication
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectRole, setRedirectRole] = useState<string>("student");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success && result.redirectTo) {
        // Activate clean white kinetic text loading animation
        setRedirectRole(result.role || (result.redirectTo.includes("admin") ? "admin" : result.redirectTo.includes("faculty") ? "faculty" : "student"));
        setIsRedirecting(true);

        // Smooth 2500ms delay to complete a full kinetic text animation cycle
        setTimeout(() => {
          window.location.href = result.redirectTo;
        }, 2500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <div 
            role="alert" 
            className="p-3.5 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            College Email
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <input
              id="email"
              type="email"
              required
              placeholder="e.g. 23331a4745@mvgrce.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10.5 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal shadow-xs"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10.5 pr-12 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || isRedirecting}
          className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition-all cursor-pointer mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Verifying Credentials...</span>
            </span>
          ) : (
            "Sign In to Portal"
          )}
        </button>
      </form>

      {/* ========================================================================= */}
      {/* CRISP WHITE FULLSCREEN KINETIC TEXT LOADER TRANSITION OVERLAY */}
      {/* ========================================================================= */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-6 text-center px-4 max-w-lg mx-auto">
            
            {/* Enhanced High-Definition Department Logo Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/90 flex items-center justify-center group">
              <Image
                src="/De_logo.jpg"
                alt="Department of Data Engineering Logo"
                width={100}
                height={100}
                priority
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            {/* Kinetic Text Loader with crisp slate text and primary dot */}
            <div className="py-2">
              <KineticTextLoader 
                text="Loading" 
                textColorClass="text-slate-900" 
                dotColorClass="bg-primary"
              />
            </div>

            {/* Role-Specific Information & College Subtitle */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 shadow-2xs">
                <Sparkles className="h-3 w-3 text-blue-600" />
                <span>
                  {redirectRole === "admin"
                    ? "Administrator Governance Console"
                    : redirectRole === "faculty"
                    ? "Faculty Teaching Workspace"
                    : "Student Learning Portal"}
                </span>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {redirectRole === "admin"
                  ? "Authenticating Administrator Console..."
                  : redirectRole === "faculty"
                  ? "Loading Faculty Course Workspace..."
                  : "Entering Student Academic Portal..."}
              </p>

              <p className="text-xs text-slate-500 font-normal">
                Department of Data Engineering • MVGR College of Engineering (Autonomous)
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
