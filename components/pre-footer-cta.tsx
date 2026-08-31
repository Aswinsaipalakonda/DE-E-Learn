"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, CheckCircle2, ShieldCheck, BookOpen, Layers } from "lucide-react";

export function PreFooterCTA() {
  return (
    <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-[36px] bg-[#0F172A] text-white border border-slate-800 p-8 sm:p-14 lg:p-16 overflow-hidden shadow-2xl">
        
        {/* Ambient Glow Lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
          
          {/* Left Text Block */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 text-blue-300 text-xs font-semibold border border-blue-500/30 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Official MVGR Data Engineering Repository</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.14]">
              Elevate your semester preparation with{" "}
              <span className="font-serif italic font-normal text-blue-400 tracking-normal">
                curated academic rigor
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
              Access verified semester course notes, lab manuals, question banks, and offline study bookmarks today.
            </p>

            {/* Micro Feature Proof */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Faculty Verified
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Single Sign-On Access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Zero Download Lag
              </span>
            </div>
          </div>

          {/* Right Action Button with Hero-01 Sliding Arrow Animation */}
          <div className="shrink-0">
            <Link
              href="/login"
              className="relative inline-flex items-center text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 active:scale-[0.99] rounded-full h-14 p-1 ps-7 pe-16 group transition-all duration-500 hover:ps-16 hover:pe-7 overflow-hidden shadow-xl cursor-pointer"
            >
              <span className="relative z-10 transition-all duration-500 whitespace-nowrap">
                Sign In to Portal
              </span>
              <span className="absolute right-1 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-52px)] group-hover:rotate-45 shadow-sm">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

export default PreFooterCTA;
