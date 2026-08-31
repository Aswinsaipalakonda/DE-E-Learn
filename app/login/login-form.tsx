"use client";

import { useState } from "react";
import { login } from "./actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
        // Activate full-screen kinetic text loading animation
        setRedirectRole(result.role || (result.redirectTo.includes("admin") ? "admin" : result.redirectTo.includes("faculty") ? "faculty" : "student"));
        setIsRedirecting(true);

        // Smooth 2000ms delay to complete a full kinetic text animation cycle
        setTimeout(() => {
          window.location.href = result.redirectTo;
        }, 2000);
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
            placeholder="e.g., 23331a4745@mvgrce.edu.in"
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
      {/* FULLSCREEN KINETIC TEXT LOADER TRANSITION OVERLAY */}
      {/* ========================================================================= */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white animate-in fade-in duration-300">
          <div className="flex flex-col items-center space-y-6 text-center px-4 max-w-md mx-auto">
            
            {/* Department Logo Emblem */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl p-1 bg-white/10 backdrop-blur-md">
              <Image
                src="/De_logo.jpg"
                alt="Department of Data Engineering Logo"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            </div>

            {/* Kinetic Text Loader from VengeanceUI */}
            <div className="py-2 text-white">
              <KineticTextLoader text="Loading" />
            </div>

            {/* Role-Specific Context Subtitle */}
            <div className="space-y-1.5 pt-2">
              <p className="text-sm sm:text-base font-semibold text-slate-100 tracking-wide">
                {redirectRole === "admin"
                  ? "Authenticating Administrator Console..."
                  : redirectRole === "faculty"
                  ? "Loading Faculty Course Workspace..."
                  : "Entering Student Academic Portal..."}
              </p>
              <p className="text-xs text-slate-400 font-normal">
                Department of Data Engineering • MVGR College of Engineering
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
