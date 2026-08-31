"use client";

import { useRef, useEffect, useState } from "react";
import { Sparkles, Quote, CheckCircle2, TrendingUp, GraduationCap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function Testimonials01Section() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="testimonials" className="py-16 sm:py-24 bg-white border-t border-slate-200/80 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12">
          
          {/* Section Heading */}
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 text-center transition-all duration-700 ease-out",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
            )}
          >
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Community Endorsements
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight max-w-2xl mx-auto leading-tight">
              Trusted by students &amp; faculty across every semester
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-lg">
              Hear how the Data Engineering E-Learn platform empowers daily coursework, lab preparation, and exam performance.
            </p>
          </div>

          {/* Asymmetrical 12-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 w-full">
            
            {/* Card 1: 8 Columns - Large Dark Feature Card */}
            <div
              className={cn(
                "col-span-1 lg:col-span-8 transition-all duration-700 ease-out delay-100",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <div className="rounded-3xl bg-[#0F172A] text-white border border-slate-800 p-8 sm:p-10 h-full flex flex-col justify-between space-y-8 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    Student Cohort Story
                  </span>
                  <Quote className="h-6 w-6 text-slate-700" />
                </div>

                <p className="text-lg sm:text-2xl font-medium text-slate-100 leading-relaxed max-w-2xl">
                  &ldquo;Having all unit-wise lecture notes and lab manuals organized under one clean portal made semester exam preparation 10x faster for our CIC cohort.&rdquo;
                </p>

                <div className="pt-4 border-t border-slate-800/90 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">P. Rajesh Kumar</h4>
                    <p className="text-xs text-slate-400 font-medium">3rd Year Student • CIC (Cyber Security &amp; IoT)</p>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Verified Student
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: 4 Columns - Blue Stat & Fact Card */}
            <div
              className={cn(
                "col-span-1 lg:col-span-4 transition-all duration-700 ease-out delay-200",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <div className="rounded-3xl bg-blue-600 text-white border border-blue-500 p-8 sm:p-10 h-full flex flex-col justify-between space-y-8 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                    Cohort Analytics
                  </span>
                  <TrendingUp className="h-5 w-5 text-blue-200" />
                </div>

                <div className="space-y-2">
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tight block">
                    98.4%
                  </span>
                  <p className="text-base sm:text-lg font-semibold text-blue-100 leading-snug">
                    Material access rate across enrolled semester cohorts.
                  </p>
                </div>

                <div className="pt-2 text-xs text-blue-200 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>100% Faculty Authenticated</span>
                </div>
              </div>
            </div>

            {/* Card 3: 4 Columns - Faculty Story Card */}
            <div
              className={cn(
                "col-span-1 lg:col-span-4 transition-all duration-700 ease-out delay-300",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 p-8 sm:p-10 h-full flex flex-col justify-between space-y-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                    Faculty Mentorship
                  </span>
                  <Award className="h-5 w-5 text-purple-400" />
                </div>

                <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
                  &ldquo;Managing versioned course material releases and monitoring cohort engagement metrics has transformed how our faculty delivers curriculum.&rdquo;
                </p>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-white">Dr. P. Satyanarayana</h4>
                  <p className="text-xs text-slate-400 font-medium">Professor &amp; Subject Coordinator</p>
                </div>
              </div>
            </div>

            {/* Card 4: 8 Columns - Soft Light Card */}
            <div
              className={cn(
                "col-span-1 lg:col-span-8 transition-all duration-700 ease-out delay-400",
                isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-8 sm:p-10 h-full flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Academic Productivity
                  </span>
                  <Quote className="h-6 w-6 text-slate-300" />
                </div>

                <p className="text-base sm:text-xl font-medium text-slate-800 leading-relaxed max-w-2xl">
                  &ldquo;The Personal Study Vault bookmarking feature eliminated scattered WhatsApp groups and ensures we always prepare with verified autonomous syllabus materials.&rdquo;
                </p>

                <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">K. Sneha</h4>
                    <p className="text-xs text-slate-500 font-medium">2nd Year Student • CSD (Data Science)</p>
                  </div>
                  <span className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Active Scholar
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default Testimonials01Section;
