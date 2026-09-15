"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, LogIn } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B1F3B] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center text-white shadow-2xl">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-8 h-8 animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          The page encountered a temporary issue while loading. You can try refreshing or returning to the portal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/20"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
