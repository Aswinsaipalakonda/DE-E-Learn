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
  CheckCircle, 
  Database,
  GraduationCap,
  Users,
  Compass
} from "lucide-react";

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
    <div className="min-h-screen bg-bg flex flex-col text-primary selection:bg-secondary/20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white border border-border p-0.5 shadow-xs overflow-hidden shrink-0">
              <Image 
                src="/icon.jpg" 
                alt="MVGR Logo" 
                width={36} 
                height={36} 
                className="object-contain w-full h-full rounded-lg"
              />
            </div>
            <div>
              <span className="font-extrabold text-sm block tracking-tight text-primary leading-tight group-hover:text-secondary transition-colors">
                Data Engineering
              </span>
              <span className="text-[10px] text-primary/50 block font-bold tracking-widest uppercase leading-none mt-0.5">
                MVGR College
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-primary/70">
            <a href="#about" className="hover:text-primary transition-colors">About Department</a>
            <a href="#insights" className="hover:text-primary transition-colors">Insights</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
          </nav>

          <div>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Sign In Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
          {/* Decorative Background Blob */}
          <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-gradient-to-br from-secondary/10 to-accent/5 rounded-full blur-3xl opacity-70 pointer-events-none" />
          <div className="absolute -bottom-10 left-10 -z-10 w-80 h-80 bg-gradient-to-tr from-primary/5 to-secondary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider">
                <Database className="h-3 w-3" /> MVGR DE E-Learn Repository
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-primary">
                The Next Generation of <br />
                <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  Data Engineering
                </span> E-Learning
              </h1>
              <p className="text-sm md:text-base text-primary/60 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Unlock exclusive lecture notes, lab manuals, syllabus components, and reference guides designed specifically for the Data Engineering department at MVGR College of Engineering.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link 
                  href="/login"
                  className="px-6 py-3 rounded-full bg-[#111827] hover:bg-black text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
                >
                  Access Study Portal
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a 
                  href="#about"
                  className="px-6 py-3 rounded-full bg-surface border border-border text-primary/80 hover:text-primary hover:border-secondary text-xs font-bold transition-all"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Card / Visual Section */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm bg-surface p-8 rounded-3xl border border-border shadow-md space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="text-xs font-black text-primary/45 uppercase tracking-wider">Course Catalogue</span>
                  <span className="px-2 py-0.5 rounded-md bg-success/15 text-success text-[10px] font-bold">Live Portal</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-bg/50 border border-border/60">
                    <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center font-bold">
                      CIC
                    </div>
                    <div>
                      <span className="text-[10px] text-primary/40 block font-bold uppercase leading-none">Branch Code</span>
                      <span className="text-xs font-bold text-primary block mt-0.5">Cyber Security & IoT</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-bg/50 border border-border/60">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
                      CSD
                    </div>
                    <div>
                      <span className="text-[10px] text-primary/40 block font-bold uppercase leading-none">Branch Code</span>
                      <span className="text-xs font-bold text-primary block mt-0.5">Data Science Spec</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-3 rounded-xl bg-bg/50 border border-border/60">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      CSM
                    </div>
                    <div>
                      <span className="text-[10px] text-primary/40 block font-bold uppercase leading-none">Branch Code</span>
                      <span className="text-xs font-bold text-primary block mt-0.5">AI & Machine Learning</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-primary/50">
                  <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-success" /> Syllabus Aligned</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-success" /> 24/7 Access</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Insights / Stats Section */}
        <section id="insights" className="py-12 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="py-4">
                <span className="text-3xl lg:text-4xl font-black text-primary block">3+</span>
                <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest block mt-2">Data Engineering Branches</span>
              </div>
              <div className="py-4">
                <span className="text-3xl lg:text-4xl font-black text-secondary block">100%</span>
                <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest block mt-2">MVGR Syllabus Compliant</span>
              </div>
              <div className="py-4">
                <span className="text-3xl lg:text-4xl font-black text-accent block">24/7</span>
                <span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest block mt-2">Cloud Availability</span>
              </div>
            </div>
          </div>
        </section>

        {/* About the Department */}
        <section id="about" className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="ml-4 space-y-3">
                <h3 className="text-lg font-bold text-primary">Department Vision</h3>
                <p className="text-xs text-primary/60 leading-relaxed font-semibold">
                  To nurture proficient engineers capable of solving complex data processing challenges and building secure, scalable engineering systems.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-accent/15 text-accent px-2.5 py-0.5 rounded-full inline-block">
                MVGR COLLEGE OF ENGINEERING
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                Empowering the Future of Computing
              </h2>
              <p className="text-xs sm:text-sm text-primary/65 leading-relaxed font-semibold">
                MVGR Data Engineering delivers state-of-the-art academic instruction covering Cyber Security, IoT, Data Science, and Machine Learning. The portal acts as a central hub where professors upload validated materials, and students access resources on the fly to accelerate their learning curve.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features section */}
        <section id="features" className="py-16 bg-bg/50 border-t border-border">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-black text-primary tracking-tight">Curated Portal Features</h2>
              <p className="text-xs text-primary/50 font-semibold">Our platform is tailored to ensure quick access and minimal friction.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4 hover:border-secondary transition-all">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-primary">Interactive Semester Filtering</h3>
                <p className="text-xs text-primary/60 leading-relaxed font-semibold">
                  Select your current semester (Semester 1 to 8) from the dashboard to filter study materials on the fly.
                </p>
              </div>

              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4 hover:border-accent transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-primary">Diverse Resource Types</h3>
                <p className="text-xs text-primary/60 leading-relaxed font-semibold">
                  Access lecture slides, lab manuals, assignments, previous question papers, and references curated by faculty.
                </p>
              </div>

              <div className="p-6 bg-surface border border-border rounded-2xl space-y-4 hover:border-primary transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Compass className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-primary">Zero-friction Authentication</h3>
                <p className="text-xs text-primary/60 leading-relaxed font-semibold">
                  Instantly authenticate using college email and roll numbers as case-insensitive default passwords.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-border p-0.5 overflow-hidden">
              <Image 
                src="/icon.jpg" 
                alt="MVGR Logo" 
                width={32} 
                height={32} 
                className="object-contain w-full h-full rounded-md"
              />
            </div>
            <div>
              <span className="font-bold text-primary block leading-tight">Data Engineering</span>
              <span className="text-[9px] text-primary/45 uppercase block tracking-wider mt-0.5">MVGR College of Engineering</span>
            </div>
          </div>

          <p className="text-primary/40 font-bold text-center md:text-right">
            &copy; {new Date().getFullYear()} MVGR Data Engineering. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
