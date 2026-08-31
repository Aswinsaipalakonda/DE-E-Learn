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
  ChevronRight
} from "lucide-react";
import { LandingHeader, LandingHero } from "@/components/landing-hero";
import { 
  TechStackMarquee, 
  BentoGridSection, 
  HowItWorksSection, 
  TestimonialsSection, 
  FAQSection, 
  PreFooterCTABanner 
} from "@/components/landing-sections";

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
      {/* 1. HERO-01 INSPIRED FLOATING PILL NAVBAR */}
      {/* ========================================================================= */}
      <LandingHeader />

      {/* ========================================================================= */}
      {/* 2. HERO-01 ACCENT HERO SECTION WITH CRYSTAL WAVE BACKGROUND */}
      {/* ========================================================================= */}
      <main className="flex-1">
        <LandingHero />

        {/* ========================================================================= */}
        {/* 3. TECH STACK MARQUEE CLOUD */}
        {/* ========================================================================= */}
        <TechStackMarquee />

        {/* ========================================================================= */}
        {/* 4. KPI METRICS RIBBON */}
        {/* ========================================================================= */}
        <section className="py-10 bg-white border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        {/* 5. BENTO GRID FEATURES SHOWCASE */}
        {/* ========================================================================= */}
        <BentoGridSection />

        {/* ========================================================================= */}
        {/* 6. SPECIALIZATIONS GRID */}
        {/* ========================================================================= */}
        <section id="specializations" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Academic Tracks
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
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
        {/* 7. HOW IT WORKS 3-STEP PIPELINE */}
        {/* ========================================================================= */}
        <HowItWorksSection />

        {/* ========================================================================= */}
        {/* 8. ROLE PORTAL PATHWAYS */}
        {/* ========================================================================= */}
        <section id="roles" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* ========================================================================= */}
        {/* 9. TESTIMONIALS & COHORT ENDORSEMENTS */}
        {/* ========================================================================= */}
        <TestimonialsSection />

        {/* ========================================================================= */}
        {/* 10. INTERACTIVE FAQ ACCORDION */}
        {/* ========================================================================= */}
        <FAQSection />

        {/* ========================================================================= */}
        {/* 11. PRE-FOOTER CTA CONVERSION BANNER */}
        {/* ========================================================================= */}
        <PreFooterCTABanner />
      </main>

      {/* ========================================================================= */}
      {/* 12. INSTITUTIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-200/90 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 text-center sm:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-slate-200 shadow-2xs shrink-0">
                <Image 
                  src="/De_logo.jpg" 
                  alt="Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain w-full h-full rounded-xl"
                />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">Department of Data Engineering</span>
                <span className="text-xs text-slate-500 block font-medium">Maharaj Vijayaram Gajapathi Raj College of Engineering (Autonomous)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
            <span>UGC Autonomous • NAAC &apos;A&apos; Grade • NBA Accredited</span>
            <span>© {new Date().getFullYear()} MVGR DE E-Learn Portal. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
