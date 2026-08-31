import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { LandingHeader, LandingHero } from "@/components/landing-hero";
import { AboutUsSection01 } from "@/components/about-us-section";
import { BentoGrid01Section } from "@/components/bento-grid-section";
import { Services02Section } from "@/components/services-section";
import { Testimonials01Section } from "@/components/testimonial-section";
import { Faq01Section } from "@/components/faq-section";
import { CookieConsent } from "@/components/cookie-consent";
import { 
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
      {/* 1. STATIC PILL NAVBAR */}
      {/* ========================================================================= */}
      <LandingHeader />

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH CRYSTAL WAVE BACKGROUND */}
      {/* ========================================================================= */}
      <main className="flex-1">
        <LandingHero />

        {/* ========================================================================= */}
        {/* 3. ABOUT US & IMPACT STATS SECTION (@shadcn-space/radix/about-us-section-01) */}
        {/* ========================================================================= */}
        <AboutUsSection01 />

        {/* ========================================================================= */}
        {/* 4. BENTO GRID 01 MODULES (@shadcn-space/radix/bento-grid-01) */}
        {/* ========================================================================= */}
        <BentoGrid01Section />

        {/* ========================================================================= */}
        {/* 5. ACADEMIC TRACKS - SERVICES 02 (@shadcn-space/radix/services-02) */}
        {/* ========================================================================= */}
        <Services02Section />

        {/* ========================================================================= */}
        {/* 6. TESTIMONIALS & COHORT ENDORSEMENTS (@shadcn-space/radix/testimonial-01) */}
        {/* ========================================================================= */}
        <Testimonials01Section />

        {/* ========================================================================= */}
        {/* 7. INTERACTIVE FAQ ACCORDION (@shadcn-space/radix/faq-01) */}
        {/* ========================================================================= */}
        <Faq01Section />

        {/* ========================================================================= */}
        {/* 10. PRE-FOOTER CTA CONVERSION BANNER */}
        {/* ========================================================================= */}
        <PreFooterCTABanner />
      </main>

      {/* ========================================================================= */}
      {/* 11. INSTITUTIONAL FOOTER */}
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

      {/* ========================================================================= */}
      {/* 12. COOKIE CONSENT BANNER (@shadcn-space/radix/cookie-consent-01) */}
      {/* ========================================================================= */}
      <CookieConsent />

    </div>
  );
}
