"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Layers, 
  Bookmark, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  ChevronDown, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Lock, 
  Cpu, 
  Database,
  Cloud,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// 1. TECH STACK MARQUEE CLOUD
// =========================================================================
export function TechStackMarquee() {
  const technologies = [
    { name: "Python 3.12", category: "Core Programming" },
    { name: "Apache Spark", category: "Big Data Processing" },
    { name: "PostgreSQL", category: "Relational DB" },
    { name: "Docker", category: "Containers & DevOps" },
    { name: "Apache Kafka", category: "Stream Ingestion" },
    { name: "AWS Cloud", category: "Infrastructure" },
    { name: "TensorFlow", category: "Machine Learning" },
    { name: "Supabase", category: "Realtime Data Engine" },
    { name: "Git & Linux", category: "System Engineering" },
  ];

  return (
    <section className="py-8 bg-white/60 border-y border-slate-200/70 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest shrink-0">
            Curriculum Stack:
          </span>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
            {technologies.map((tech) => (
              <span
                key={tech.name}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/70 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// 2. BENTO GRID CAPABILITIES SHOWCASE
// =========================================================================
export function BentoGridSection() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Engineered For High-Performance Learning
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything you need for academic success
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Eliminating scattered PDF links, outdated files, and missing materials with a single verified institutional repository.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Item 1: Large Featured Card (8 cols) */}
          <div className="md:col-span-8 p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs">
                <Bookmark className="h-5 w-5 fill-blue-500 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Personal Study Vault & Smart Bookmarks</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                Bookmark specific lecture notes, lab manuals, and question banks for quick access. One-click synchronization across your mobile and desktop views during exam weeks.
              </p>
            </div>

            {/* Micro UI Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live Sync Vault
                </span>
                <span className="text-slate-500 text-[11px]">Instant Offline Ready</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-700 font-medium">DBMS - Unit 1 Relational Models</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Verified</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-700 font-medium">Cloud DevOps - Kubernetes Lab Manual</span>
                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">Lab Ready</span>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Semester Guard Card (4 cols) */}
          <div className="md:col-span-4 p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Enrolled Term Filtering</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Strict semester isolation dynamically limits tab selection up to the student&apos;s active enrollment, keeping study workflows clutter-free.
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              {["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"].map((sem, i) => (
                <span
                  key={sem}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold border",
                    i === 2
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200"
                  )}
                >
                  {sem}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Item 3: Faculty Version Control (4 cols) */}
          <div className="md:col-span-4 p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-xs">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Faculty Version Updates</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Professors upload updated versions (v1.1, v2.0) seamlessly without breaking student bookmark links or losing historical materials.
              </p>
            </div>
            <div className="text-[11px] font-mono text-purple-700 bg-purple-50 p-2.5 rounded-xl border border-purple-200/70">
              ✓ Multi-Version Audit Logs Enabled
            </div>
          </div>

          {/* Bento Item 4: Instant Document Previews (8 cols) */}
          <div className="md:col-span-8 p-8 rounded-3xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                <FileText className="h-5 w-5 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">In-Browser PDF Previews & High-Yield Summaries</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
                Read lecture notes directly inside the portal without having to download multi-megabyte files on slow campus connections. Complete with download timestamps and view counters.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Zero Download Required
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Mobile Document Responsive
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Direct Drive & Cloud Fallbacks
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

// =========================================================================
// 3. 3-STEP ACADEMIC WORKFLOW PIPELINE
// =========================================================================
export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Sign In with College Credentials",
      desc: "Log in using your registered college email and roll number as your default password for immediate role-based onboarding.",
      icon: Lock,
    },
    {
      num: "02",
      title: "Explore Your Semester Syllabi",
      desc: "Browse assigned course subjects, lecture note units, and verified lab manuals structured specifically for your branch (CIC, CSD, CSM).",
      icon: BookOpen,
    },
    {
      num: "03",
      title: "Save to Vault & Excel in Exams",
      desc: "Bookmark critical question banks into your personal study vault and preview slides anytime, anywhere on any device.",
      icon: Zap,
    },
  ];

  return (
    <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
          Seamless User Journey
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How Data Engineering E-Learn Works
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-normal">
          Designed with zero friction to get you straight into your coursework within seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-extrabold text-slate-300 group-hover:text-blue-600 transition-colors font-mono">
                  {step.num}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 pt-2">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// =========================================================================
// 4. STUDENT & FACULTY TESTIMONIALS
// =========================================================================
export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Having all unit-wise lecture notes and lab manuals organized under one clean portal made exam preparation 10x faster for our CIC cohort.",
      author: "P. Rajesh Kumar",
      role: "3rd Year Student • CIC Branch",
      avatar: "https://images.shadcnspace.com/assets/profiles/user-1.jpg",
    },
    {
      quote: "Managing course materials and releasing versioned lab assignments with cohort view tracking has transformed how our faculty delivers curriculum.",
      author: "Dr. P. Satyanarayana",
      role: "Professor & Subject Coordinator",
      avatar: "https://images.shadcnspace.com/assets/profiles/user-2.jpg",
    },
    {
      quote: "The personal study vault bookmarking feature is a lifesaver. I no longer have to dig through WhatsApp groups to find lab manuals.",
      author: "K. Sneha",
      role: "2nd Year Student • Data Science",
      avatar: "https://images.shadcnspace.com/assets/profiles/user-3.jpg",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Community Endorsements
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted across cohorts & faculty
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Hear from students and professors utilizing the portal for day-to-day academic instruction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-6"
            >
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full border border-white object-cover shadow-2xs"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.author}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// =========================================================================
// 5. INTERACTIVE FAQ ACCORDION
// =========================================================================
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do students log in for the first time?",
      a: "Students use their official college email (e.g. your-mail@mvgrce.edu.in) and their Registration Number (e.g. 23331A4701) as their default initial password. You can change your password anytime in your profile workspace.",
    },
    {
      q: "Can I view materials from previous completed semesters?",
      a: "Yes! Your student dashboard features interactive semester tab numbers allowing you to switch between Semester 1 and your current enrolled term to review prerequisite lecture notes and lab guides.",
    },
    {
      q: "How does the Personal Study Vault work?",
      a: "Clicking 'Save Bookmark' on any course material automatically stores it in your Study Vault. Your saved materials synchronize across devices so you can quickly review them before mid-term exams.",
    },
    {
      q: "How do faculty upload new versions of course materials?",
      a: "Faculty can navigate to 'My Materials' from their dashboard, open any subject card, and click 'Upload New Version'. The system records version histories while preserving student study vault links.",
    },
    {
      q: "Is the platform mobile-responsive for on-campus smartphone access?",
      a: "Yes! The portal is built mobile-first with touch-friendly navigation, quick-loading document viewers, and dedicated role drawers for on-the-go study.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
          Frequently Asked Questions
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Got Questions? We&apos;ve got answers.
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0",
                    isOpen && "rotate-180 text-slate-900"
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// =========================================================================
// 6. PRE-FOOTER CONVERSION CALL TO ACTION BANNER
// =========================================================================
export function PreFooterCTABanner() {
  return (
    <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="p-8 sm:p-14 rounded-[32px] bg-[#0F172A] text-white border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
        
        {/* Subtle Ambient Light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Official MVGR Data Engineering Repository</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to accelerate your academic performance?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
            Access verified semester syllabus materials, lecture units, and offline bookmarks today.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
