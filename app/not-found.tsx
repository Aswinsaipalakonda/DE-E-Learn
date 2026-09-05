"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  Home, 
  BookOpen, 
  Search, 
  ShieldAlert, 
  GraduationCap, 
  Briefcase, 
  HelpCircle,
  Sparkles,
  FileQuestion
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if there is history to go back to
    if (typeof window !== "undefined" && window.history.length > 1) {
      setCanGoBack(true);
    }
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/student/materials?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white font-sans relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-6 max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 border border-white/20 backdrop-blur-md flex items-center justify-center">
            <Image
              src="/De_logo.jpg"
              alt="DataDock Logo"
              width={36}
              height={36}
              className="rounded-xl object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight block">
              DataDock
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
              Department of Data Engineering
            </span>
          </div>
        </Link>

        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>
      </header>

      {/* Main 404 Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto z-10 py-12">
        
        {/* Animated Error Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-6">
          <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          <span>HTTP 404 • Resource Not Found</span>
        </div>

        {/* 404 Big Glitch Title */}
        <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-white leading-none mb-4">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          Page Lost in the Academic Cloud
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed mb-8">
          The link you followed might be broken, outdated, or the semester study material may have been moved to a different unit catalog.
        </p>

        {/* Quick Recovery Search */}
        <form onSubmit={handleSearch} className="w-full max-w-md relative mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects, units, or question papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-white/5 border border-white/15 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 backdrop-blur-md"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Role-Aware & Navigation Action Tiles */}
        <div className="w-full space-y-3 text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Suggested Destinations &amp; Portal Hubs
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Student Portal */}
            <Link
              href="/student"
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 text-blue-400 mb-2">
                <GraduationCap className="w-5 h-5" />
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Notes, lab manuals &amp; question banks.
              </p>
            </Link>

            {/* Faculty Workspace */}
            <Link
              href="/faculty"
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 text-indigo-400 mb-2">
                <Briefcase className="w-5 h-5" />
                <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Faculty Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Publish curriculum &amp; manage cohorts.
              </p>
            </Link>

            {/* Academic Helpdesk */}
            <Link
              href="/contact"
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                <HelpCircle className="w-5 h-5" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Support &amp; Help
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Report broken links or syllabus issues.
              </p>
            </Link>

          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Previous Page
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Go to DataDock Home
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 text-center text-xs text-slate-500 z-10">
        © {new Date().getFullYear()} DataDock • Department of Data Engineering, MVGRCE (Autonomous).
      </footer>

    </div>
  );
}
