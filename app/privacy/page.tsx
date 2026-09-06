import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck, Database, Eye } from "lucide-react";
import { LandingHeader } from "@/components/landing-hero";
import { LandingFooter } from "@/components/landing-footer";

export const metadata: Metadata = {
  title: "Privacy Policy | DataDock",
  description:
    "Student and faculty privacy policy, data protection standards, and institutional data policies for DataDock — MVGR College of Engineering.",
  alternates: {
    canonical: "https://datadock.aswinsai.tech/privacy",
  },
};

export default function PrivacyPage() {
  const privacyJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy | DataDock",
    description: "Student and faculty privacy policy, data protection standards, and institutional data policies for DataDock.",
    url: "https://datadock.aswinsai.tech/privacy",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />
      <LandingHeader />

      <main className="flex-1 pt-36 sm:pt-40 lg:pt-44 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
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

        {/* Page Header */}
        <div className="space-y-4 pb-8 border-b border-slate-200">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy &amp; Data Protection Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            At <strong className="text-slate-900">DataDock</strong> (Department of Data Engineering, MVGR College of Engineering Autonomous), we maintain strict data protection standards to safeguard student, faculty, and academic institutional records.
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-10 space-y-10 text-slate-700 text-sm sm:text-[15px] leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              1. Information Collected &amp; Scope
            </h2>
            <p>
              When you authenticate with DataDock, the platform collects only essential academic identity data necessary to provide personalized curriculum access:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Student Profiles:</strong> Full Name, College Roll Number, Institutional Email, Academic Branch (CIC/CSD/CSM), Semester, and Section.</li>
              <li><strong>Faculty Profiles:</strong> Faculty Name, Departmental Designation, Assigned Subject Allocations, and Faculty ID.</li>
              <li><strong>Usage Telemetry:</strong> Material download metrics, bookmarking history, and security authentication audit timestamps.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              2. How Your Data Is Protected
            </h2>
            <p className="text-slate-600">
              All user records and academic documents are managed through secure cloud infrastructure powered by Supabase with Row Level Security (RLS) policies. Authentication tokens are encrypted with industry-standard AES-256 and HTTPS/TLS transmission protocols.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Zero Commercial Data Monetization</p>
              <p>DataDock is a strictly academic, non-commercial institution platform. Student and faculty information is never sold, shared, or leased to third-party marketing companies.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              3. Cookies &amp; Local Storage Usage
            </h2>
            <p className="text-slate-600">
              DataDock uses essential HTTP session cookies solely to preserve authentication state across page navigations and retain your preferred dark/light UI tokens. No third-party tracking or advertising cookies are utilized.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              4. Data Retention &amp; Account Deletion
            </h2>
            <p className="text-slate-600">
              Student profile information is maintained for the duration of the student&apos;s academic enrollment at MVGR College of Engineering. Upon graduation or program completion, accounts may be archived according to institutional records retention guidelines.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              5. Privacy Inquiries
            </h2>
            <p className="text-slate-600">
              For queries concerning student data rights, audit logs, or privacy considerations, reach out to our team at{" "}
              <Link href="/contact" className="text-blue-600 font-semibold hover:underline">
                DataDock Support
              </Link>.
            </p>
          </section>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
