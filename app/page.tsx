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
import { PreFooterCTA } from "@/components/pre-footer-cta";
import { LandingFooter } from "@/components/landing-footer";
import { CookieConsent } from "@/components/cookie-consent";

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
        {/* 8. PRE-FOOTER CTA CONVERSION BANNER */}
        {/* ========================================================================= */}
        <PreFooterCTA />
      </main>

      {/* ========================================================================= */}
      {/* 9. INSTITUTIONAL FOOTER */}
      {/* ========================================================================= */}
      <LandingFooter />

      {/* ========================================================================= */}
      {/* 10. COOKIE CONSENT BANNER (@shadcn-space/radix/cookie-consent-01) */}
      {/* ========================================================================= */}
      <CookieConsent />

    </div>
  );
}
