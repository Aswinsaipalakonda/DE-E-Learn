import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { LandingHeader } from "@/components/landing-hero";
import { LandingFooter } from "@/components/landing-footer";

export const metadata: Metadata = {
  title: "Terms and Conditions | DataDock",
  description:
    "Official terms and conditions, academic honor code, and acceptable usage policy for DataDock — MVGR College of Engineering Department of Data Engineering.",
  alternates: {
    canonical: "https://datadock.aswinsai.tech/terms",
  },
};

export default function TermsPage() {
  const termsJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms & Academic Conditions | DataDock",
    description: "Official terms and conditions, academic honor code, and acceptable usage policy for DataDock.",
    url: "https://datadock.aswinsai.tech/terms",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>Institutional Policy • Last Updated September 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Terms &amp; Academic Conditions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Welcome to <strong className="text-slate-900">DataDock</strong>, the official academic learning and repository portal for the Department of Data Engineering, MVGR College of Engineering (Autonomous). By accessing or using this portal, you agree to comply with the terms set forth below.
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-10 space-y-10 text-slate-700 text-sm sm:text-[15px] leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              1. Authorized Access &amp; Role Authentication
            </h2>
            <p>
              DataDock is intended strictly for enrolled undergraduate students, faculty members, researchers, and administrative personnel affiliated with MVGR College of Engineering (Autonomous).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Users must maintain the confidentiality of their credentials and Supabase authentication tokens.</li>
              <li>Unauthorized account sharing, impersonation, or credential distribution is strictly prohibited under institutional regulations.</li>
              <li>Administrative personnel reserve the right to revoke or suspend access for accounts violating campus IT policies.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              2. Intellectual Property &amp; Course Materials
            </h2>
            <p>
              All academic courseware, including faculty lecture notes, unit presentations, laboratory manuals, assignment guidelines, and question archives hosted on DataDock, are the intellectual property of the Department of Data Engineering and contributing faculty members.
            </p>
            <p className="text-slate-600">
              Materials are provided exclusively for personal study, revision, and academic non-commercial research. Commercial redistribution, re-hosting, or scraping of department intellectual property is strictly forbidden.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              3. Academic Integrity &amp; Acceptable Usage
            </h2>
            <p>
              Users agree not to utilize materials obtained from DataDock in violation of the MVGR Academic Honor Code. Plagiarism in laboratory assessments, unauthorized distribution of mid-term examinations prior to conduct, or abuse of the download services will result in disciplinary action under the Autonomous Academic Board regulations.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              4. System Availability &amp; Modifications
            </h2>
            <p className="text-slate-600">
              While the Department strives to ensure 99.9% uptime for cloud services, access may be temporarily interrupted for scheduled maintenance, database migrations, or university-wide curriculum updates. The Department reserves the right to modify course structures and syllabus guidelines in accordance with UGC and Academic Council notifications.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">
              5. Contact for Legal &amp; Academic Inquiries
            </h2>
            <p className="text-slate-600">
              For questions concerning these Terms, copyright permissions, or institutional verification, please reach out to the Department of Data Engineering via the{" "}
              <Link href="/contact" className="text-blue-600 font-semibold hover:underline">
                Contact &amp; Support Page
              </Link>.
            </p>
          </section>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
