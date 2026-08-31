"use client";

import { useState } from "react";
import { login } from "./actions";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div 
            role="alert" 
            className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-md"
          >
            {error}
          </div>
        )}

        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-semibold text-primary mb-2"
          >
            College Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="e.g., your-clg-mail@mvgrce.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
          />
        </div>

        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-semibold text-primary mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-lg border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-primary/45 hover:text-primary transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isRedirecting}
          className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 transition-all cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying Credentials...</span>
            </span>
          ) : (
            "Sign In"
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
