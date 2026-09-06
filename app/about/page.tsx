import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  Layers, 
  Server, 
  BookOpen, 
  Award,
  Cpu,
  BrainCircuit,
  Database
} from "lucide-react";
import { LandingHeader } from "@/components/landing-hero";
import { LandingFooter } from "@/components/landing-footer";

export const metadata: Metadata = {
  title: "About DataDock • Data Engineering | MVGR College of Engineering",
  description:
    "Learn about DataDock, the centralized academic learning repository for the Department of Data Engineering at MVGR College of Engineering (Autonomous). Discover our programs in CIC, CSD, and CSM.",
  alternates: {
    canonical: "https://datadock.aswinsai.tech/about",
  },
};

export default function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About DataDock • Department of Data Engineering",
    description:
      "Learn about DataDock, the centralized academic learning repository for the Department of Data Engineering at MVGR College of Engineering (Autonomous).",
    url: "https://datadock.aswinsai.tech/about",
    mainEntity: {
      "@type": "EducationalOrganization",
      name: "Department of Data Engineering, MVGR College of Engineering (Autonomous)",
      url: "https://datadock.aswinsai.tech",
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "MVGR College of Engineering (Autonomous)",
        url: "https://www.mvgrce.edu.in",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <LandingHeader />

      <main className="flex-1 pt-36 sm:pt-40 lg:pt-44 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white/80 border border-slate-200/90 px-3.5 py-1.5 rounded-full shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to DataDock Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Academic Platform Overview • Department of Data Engineering</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Bridging Curriculum, Intelligence, and Student Mastery.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            <strong className="text-slate-900">DataDock</strong> is the official digital infrastructure engineered for the Department of Data Engineering at <strong className="text-slate-900">MVGR College of Engineering (Autonomous)</strong>. It provides a unified, verified vault for undergraduate course notes, lab guides, autonomous syllabi, and semester learning resources.
          </p>
        </div>

        {/* Accreditations Bar */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <Image
                src="/De_logo.jpg"
                alt="MVGR Logo"
                width={40}
                height={40}
                className="rounded-lg object-contain"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">MVGR College of Engineering (A)</h3>
              <p className="text-xs text-slate-500 font-medium">UGC Autonomous Institution • Estd. 1997 • Vizianagaram</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-600" /> UGC Autonomous
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> NAAC &apos;A&apos; Grade
            </span>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> NBA Accredited
            </span>
          </div>
        </div>

        {/* Department Specializations Grid */}
        <div className="mt-16 space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Academic Tracks &amp; Specializations
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Curated study materials, syllabus copies, and lab guides for three flagship engineering disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CIC */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Branch Code: CIC</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Cyber Security &amp; IoT</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialized in defensive cybersecurity, network penetration testing, cryptography, IoT hardware prototyping, and edge device telemetry.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Explore CIC Materials <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CSD */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Branch Code: CSD</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Data Science</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Focuses on big data engineering, distributed analytics (Hadoop/Spark), data warehousing, statistical modeling, and business intelligence pipelines.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Explore CSD Materials <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CSM */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider block">Branch Code: CSM</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">AI &amp; Machine Learning</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Advanced machine learning, deep neural networks, computer vision, natural language processing, and scalable AI system deployment.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
                >
                  Explore CSM Materials <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Pillars / Features */}
        <div className="mt-16 bg-slate-900 text-white p-8 sm:p-12 rounded-3xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Architecture &amp; Mission</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Why DataDock was built</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Traditional WhatsApp groups and fragmented Google Drives lead to lost documents, outdated syllabus versions, and exam confusion. DataDock solves this by establishing a single point of truth verified directly by department faculty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Faculty Verified
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every document uploaded is cataloged with academic unit tags, subject code, and author metadata.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Instant Access
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search across all semesters (1 to 8), subject codes, lab manuals, and previous year university papers in milliseconds.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> Personal Vault
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students can bookmark high-priority revision units and access their saved vault across desktop and mobile devices.
              </p>
            </div>
          </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
