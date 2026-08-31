import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, 
  ArrowRight, 
  Layers, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  Database,
  Bookmark,
  TrendingUp,
  DownloadCloud,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export const metadata = {
  title: "Data Engineering Portal | MVGR College of Engineering",
  description: "Official E-Learning and Academic Materials Portal for the Department of Data Engineering, MVGR College of Engineering (Autonomous).",
};

export default async function LandingPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Retrieve authenticated session user
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already authenticated, redirect directly to their respective role dashboard
  if (user) {
    let role = user.user_metadata?.role;
    
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .or(`id.eq.${user.id},email.eq.${user.email}`)
      .single();

    if (profile?.role) {
      role = profile.role;
    }

    if (!role) {
      if (user.email?.startsWith("admin")) role = "admin";
      else if (user.email?.startsWith("faculty") || user.email?.startsWith("testfaculty")) role = "faculty";
      else role = "student";
    }

    redirect(`/${role}`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* ========================================================================= */}
      {/* TOP INSTITUTIONAL NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Department Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200/90 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Image 
                src="/De_logo.jpg" 
                alt="Department of Data Engineering Logo" 
                width={44} 
                height={44} 
                priority
                className="object-contain w-full h-full rounded-xl"
              />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base block tracking-tight text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                Data Engineering
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wider uppercase block">
                  MVGR College (Autonomous)
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#specializations" className="hover:text-slate-900 transition-colors">Specializations</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Portal Features</a>
            <a href="#curriculum" className="hover:text-slate-900 transition-colors">Curriculum</a>
            <a href="#roles" className="hover:text-slate-900 transition-colors">Role Portals</a>
          </nav>

          {/* Action Sign In Button */}
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-900/10 transition-all cursor-pointer"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN HERO SECTION */}
      {/* ========================================================================= */}
      <main className="flex-1">
        <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
          
          {/* Subtle Ambient Depth (Clean Slate & Light Blue Only) */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-[750px] h-[350px] bg-blue-50/70 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Copy & Actions */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left">
                
                {/* Accreditation Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/80 text-blue-800 text-xs font-semibold shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Department of Data Engineering • Academic Learning Cloud</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Curated Course Notes, Lab Manuals & Question Banks.
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  The centralized academic intelligence repository for MVGR Data Engineering. Students access verified semester syllabus materials, offline study vaults, and interactive cohort trackers.
                </p>

                {/* Call-to-Action Group */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link 
                    href="/login"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-lg shadow-slate-900/15 transition-all cursor-pointer group"
                  >
                    <span>Access Student Portal</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a 
                    href="#features"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold transition-all shadow-xs"
                  >
                    <span>Explore Features</span>
                  </a>
                </div>

                {/* Institutional Highlights Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/70 max-w-xl mx-auto lg:mx-0 text-left">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>UGC Autonomous</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>NAAC &apos;A&apos; Accredited</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>NBA Compliant</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Premium High-Definition Mockup Card Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md bg-white rounded-3xl sm:rounded-[32px] border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-7 space-y-5 relative">
                  
                  {/* Card Header Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                        DE
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Academic Study Vault</h4>
                        <p className="text-[10px] text-slate-500">Live Semester Repositories</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active 2026
                    </span>
                  </div>

                  {/* Mockup Subject Items */}
                  <div className="space-y-2.5">
                    
                    {/* Item 1 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-800 flex items-center justify-center shrink-0">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">23CIC301</span>
                            <span className="text-[10px] font-semibold text-slate-500">Unit 1 - 5</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-blue-700 transition-colors">
                            Database Management Systems
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </div>

                    {/* Item 2 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">23CIC302</span>
                            <span className="text-[10px] font-semibold text-slate-500">Lab Manual</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-emerald-700 transition-colors">
                            Cloud Infrastructure & DevOps
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </div>

                    {/* Item 3 */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
                          <Bookmark className="h-4 w-4 fill-amber-600 text-amber-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">23CIC303</span>
                            <span className="text-[10px] font-semibold text-slate-500">Question Bank</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-amber-800 transition-colors">
                            Big Data Processing & Spark
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                    </div>

                  </div>

                  {/* Micro Footer Badge */}
                  <div className="pt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 font-medium">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      Role-Verified Access
                    </span>
                    <span className="font-semibold text-slate-700">8 Semesters Ready</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* KPI METRICS RIBBON */}
        {/* ========================================================================= */}
        <section className="py-10 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block tracking-tight">3+</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">Specialized Branches</span>
              </div>

              <div className="pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-600 block tracking-tight">8</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">Curriculum Semesters</span>
              </div>

              <div className="pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 block tracking-tight">100%</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">Faculty Verified Notes</span>
              </div>

              <div className="pt-4 md:pt-0">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 block tracking-tight">24/7</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">Instant Cloud Downloads</span>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SPECIALIZATIONS GRID */}
        {/* ========================================================================= */}
        <section id="specializations" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Academic Tracks
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Data Engineering Specializations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Structured course material taxonomies aligned with autonomous department curricula.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Card 1: CIC */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all space-y-5 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-sm border border-blue-200 group-hover:scale-105 transition-transform">
                CIC
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Cyber Security & IoT</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  In-depth course repositories covering cryptographic protocols, threat intelligence, secure hardware interfaces, and embedded IoT architectures.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>Semester 1 to 8 Syllabi</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: CSD */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all space-y-5 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-sm border border-emerald-200 group-hover:scale-105 transition-transform">
                CSD
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Data Science Specialization</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Comprehensive notes and lab manuals on distributed computing, Apache Spark clusters, predictive statistics, and high-throughput data warehousing.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>Semester 1 to 8 Syllabi</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: CSM */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all space-y-5 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-sm border border-indigo-200 group-hover:scale-105 transition-transform">
                CSM
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">AI & Machine Learning</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Structured learning materials spanning deep neural networks, transformer architectures, reinforcement learning models, and computer vision pipelines.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>Semester 1 to 8 Syllabi</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* KEY PLATFORM FEATURES */}
        {/* ========================================================================= */}
        <section id="features" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
                Purpose-Built Experience
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Designed for Students & Faculty
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Engineered from the ground up for minimal friction, fast document retrieval, and transparent cohort analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Feature 1 */}
              <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4 hover:bg-slate-50 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Enrolled Semester Filtering</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Students seamlessly toggle between current and completed semesters up to their enrolled term to view verified study resources.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4 hover:bg-slate-50 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                  <Bookmark className="h-5 w-5 fill-amber-500 text-amber-700" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Personal Study Vault</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Save essential lecture units and lab experiments into a dedicated study vault for rapid access during mid-terms and semester exams.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-4 hover:bg-slate-50 transition-all">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Faculty Cohort Matrices</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Teaching faculty manage versioned course material releases and monitor cohort engagement metrics across student roll lists.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* ROLE PORTAL PATHWAYS */}
        {/* ========================================================================= */}
        <section id="roles" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-[32px] bg-[#0F172A] text-white border border-slate-800 shadow-xl space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
                Single Sign-On Architecture
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Role-Based Academic Governance
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                Direct authentication routes for enrolled students, teaching faculty mentors, and departmental administrators.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              <Link
                href="/login"
                className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <GraduationCap className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    Student Portal
                  </h4>
                  <p className="text-xs text-slate-400 font-normal">
                    Login with college email and roll number to access notes and bookmarks.
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                  Access Portal <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/login"
                className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Faculty Workspace
                  </h4>
                  <p className="text-xs text-slate-400 font-normal">
                    Upload course notes, update version histories, and view progress logs.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  Faculty Sign In <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/login"
                className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    Admin Console
                  </h4>
                  <p className="text-xs text-slate-400 font-normal">
                    Manage student rosters, course taxonomy, announcements, and metrics.
                  </p>
                </div>
                <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                  Admin Sign In <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-200/90 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 border border-slate-200 shrink-0">
              <Image 
                src="/De_logo.jpg" 
                alt="Logo" 
                width={36} 
                height={36} 
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Department of Data Engineering</span>
              <span className="text-[11px] text-slate-500 block font-medium">MVGR College of Engineering (Autonomous)</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-normal">
            © {new Date().getFullYear()} MVGR DE E-Learn Portal. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
