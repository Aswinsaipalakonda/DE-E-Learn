"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavigationLink {
  title: string;
  href: string;
  isActive?: boolean;
}

const navigationData: NavigationLink[] = [
  { title: "About", href: "#about" },
  { title: "Features", href: "#features" },
  { title: "Specializations", href: "#specializations" },
  { title: "Testimonials", href: "#testimonials" },
  { title: "FAQ", href: "#faq" },
];

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pt-3.5 pb-2 pointer-events-none transition-all duration-300">
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-md pointer-events-auto hover:shadow-lg transition-shadow">
        
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 shadow-xs border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/De_logo.jpg"
              alt="Department of Data Engineering Logo"
              width={38}
              height={38}
              priority
              className="object-contain w-full h-full rounded-xl"
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-sm text-slate-900 tracking-tight block leading-tight group-hover:text-blue-600 transition-colors">
              Data Engineering
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
              MVGR College (A)
            </span>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
          {navigationData.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-200"
            >
              {item.title}
            </a>
          ))}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Animated Hero-01 Style Button */}
          <Link
            href="/login"
            className="relative inline-flex items-center text-xs sm:text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] rounded-full h-10 p-1 ps-5 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-5 overflow-hidden shadow-md shadow-slate-900/10 cursor-pointer shrink-0"
          >
            <span className="relative z-10 transition-all duration-500 whitespace-nowrap">
              Sign In Portal
            </span>
            <span className="absolute right-1 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-36px)] group-hover:rotate-45 shadow-xs">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {isOpen && (
        <div className="lg:hidden mt-2 p-5 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-xl max-w-6xl mx-auto space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
          <div className="flex flex-col gap-2">
            {navigationData.map((item) => (
              <a
                key={item.title}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-colors"
              >
                {item.title}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-sm"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function LandingHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger text reveal immediately on mount
    const timer = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const headlineWords = [
    { text: "Architecting", isItalic: false },
    { text: "Data", isItalic: false },
    { text: "Intelligence", isItalic: false },
    { text: "with", isItalic: false },
    { text: "academic", isItalic: true },
    { text: "excellence", isItalic: true },
  ];

  return (
    <section className="relative pt-24 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
      
      {/* Background Image placed at z-0 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.webp"
          alt="Data Engineering Hero Background"
          className="w-full h-full object-cover object-bottom sm:object-center"
        />
        {/* Soft fade at the bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none" />
      </div>

      {/* Foreground Content at z-10 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Top Status Badge with Reveal Animation */}
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-xs transition-all duration-700 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Department of Data Engineering • Academic Learning Cloud</span>
          </div>

          {/* Staggered Word Reveal Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12] flex flex-wrap justify-center gap-x-3.5 sm:gap-x-4 gap-y-1">
            {headlineWords.map((item, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden py-1"
              >
                <span
                  style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  className={cn(
                    "inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    mounted ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
                    item.isItalic && "font-serif italic font-normal text-blue-600 tracking-normal"
                  )}
                >
                  {item.text}
                </span>
              </span>
            ))}
          </h1>

          {/* Subtitle with Reveal Animation */}
          <p
            style={{ transitionDelay: "750ms" }}
            className={cn(
              "text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed transition-all duration-700 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            The centralized learning and materials platform for MVGR College of Engineering. Access verified semester course notes, lab manuals, question banks, and cohort trackers.
          </p>

          {/* Interactive CTA Group with Staggered Entrance */}
          <div
            style={{ transitionDelay: "900ms" }}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2 transition-all duration-700 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            
            {/* Primary Action Button */}
            <Link
              href="/login"
              className="relative inline-flex items-center text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] active:scale-[0.99] rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 overflow-hidden shadow-lg shadow-slate-900/15 cursor-pointer shrink-0"
            >
              <span className="relative z-10 transition-all duration-500">
                Access Student Portal
              </span>
              <span className="absolute right-1 w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45 shadow-sm">
                <ArrowUpRight className="h-4.5 w-4.5" />
              </span>
            </Link>

            {/* Exact Hero-01 Style Avatar Stack & 5-Star Rating */}
            <div className="flex items-center sm:gap-4 gap-3 py-1">
              <ul className="flex flex-row items-center">
                {[
                  "https://images.shadcnspace.com/assets/profiles/user-1.jpg",
                  "https://images.shadcnspace.com/assets/profiles/user-2.jpg",
                  "https://images.shadcnspace.com/assets/profiles/user-3.jpg",
                  "https://images.shadcnspace.com/assets/profiles/user-5.jpg",
                ].map((avatarUrl, index) => (
                  <li key={index} className="-mr-2.5 z-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt="Student Avatar"
                      width={38}
                      height={38}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-2xs"
                    />
                  </li>
                ))}
              </ul>
              <div className="flex flex-col items-start text-left gap-0.5">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      className="w-4 h-4 fill-amber-500 text-amber-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-700">
                  Trusted by 1000+ students
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
