"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Shield, Database, Brain, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BranchTrackItem {
  code: "CIC" | "CSD" | "CSM";
  heading: string;
  subheading: string;
  descp: string;
  color: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
}

export const departmentBranches: BranchTrackItem[] = [
  {
    code: "CIC",
    heading: "Cyber Security & IoT",
    subheading: "CSE (Cyber Security and Internet of Things)",
    descp: "In-depth syllabi, lecture notes, and lab manuals covering cryptographic protocols, network defense architectures, threat intelligence, and secure IoT embedded systems.",
    color: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Shield,
    highlights: ["Network Cryptography", "IoT Embedded Systems", "Ethical Hacking & Defense", "Autonomous Syllabi Sem 1-8"],
  },
  {
    code: "CSD",
    heading: "Data Science Specialization",
    subheading: "CSE (Data Science)",
    descp: "Comprehensive course materials and lab exercises focused on distributed data engineering, predictive statistics, data warehousing, and high-throughput data processing pipelines.",
    color: "text-emerald-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Database,
    highlights: ["Data Warehousing & Mining", "Big Data Analytics", "Statistical Modeling", "Autonomous Syllabi Sem 1-8"],
  },
  {
    code: "CSM",
    heading: "AI & Machine Learning",
    subheading: "CSE (Artificial Intelligence and Machine Learning)",
    descp: "Structured study modules covering deep neural networks, transformer architectures, computer vision pipelines, natural language processing, and reinforcement learning.",
    color: "text-indigo-600",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: Brain,
    highlights: ["Deep Neural Networks", "Computer Vision & NLP", "Reinforcement Learning", "Autonomous Syllabi Sem 1-8"],
  },
];

export function Services02Section() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeBranch = departmentBranches[activeIndex];
  const ActiveIcon = activeBranch.icon;

  return (
    <section id="specializations" className="bg-[#F8FAFC] py-16 sm:py-24 border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:gap-16 gap-10">
          
          {/* Header Row */}
          <div className="flex md:flex-row flex-col justify-between md:items-end items-start gap-6">
            <div className="flex flex-col gap-3 max-w-2xl">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 w-fit">
                Academic Tracks
              </span>
              <h2 className="sm:text-4xl text-3xl font-extrabold text-slate-900 tracking-tight">
                Department Specializations
              </h2>
              <p className="text-slate-600 sm:text-base text-sm font-normal leading-relaxed">
                Explore the three core degree programs offered under the Department of Data Engineering at MVGR College (A).
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all group shrink-0"
            >
              <span>Access All Syllabi</span>
              <div className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </div>

          {/* Interactive 12-Col Preview & List Grid */}
          <div className="grid grid-cols-12 gap-8 items-center">
            
            {/* Left Dynamic Visual Preview Card (5-cols) */}
            <div className="w-full col-span-12 lg:col-span-5">
              <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-6 transition-all duration-300">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border font-extrabold text-sm", activeBranch.badgeBg)}>
                      {activeBranch.code}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{activeBranch.code} Track</h4>
                      <p className="text-xs text-slate-500 font-medium">{activeBranch.subheading}</p>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Curriculum Pillars
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {activeBranch.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-900 border-t border-slate-100">
                  <span className="text-slate-500">Autonomous R20/R23</span>
                  <span className="text-blue-600">8 Semesters Verified</span>
                </div>

              </div>
            </div>

            {/* Right Interactive Branch List (7-cols) */}
            <div className="w-full flex flex-col col-span-12 lg:col-span-7 divide-y divide-slate-200">
              {departmentBranches.map((item, index) => {
                const isActive = activeIndex === index;
                const Icon = item.icon;

                return (
                  <div
                    key={item.code}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "group py-6 sm:py-8 cursor-pointer flex flex-col gap-3 transition-all duration-200",
                      isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center border transition-all",
                          isActive ? item.badgeBg : "bg-white text-slate-500 border-slate-200"
                        )}>
                          {item.code}
                        </span>
                        <h3 className={cn(
                          "text-xl sm:text-2xl font-bold transition-colors duration-200",
                          isActive ? item.color : "text-slate-900 group-hover:text-blue-600"
                        )}>
                          {item.heading}
                        </h3>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 text-slate-400 transition-transform duration-200",
                        isActive && "rotate-90 text-slate-900"
                      )} />
                    </div>

                    {isActive && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-11 animate-in fade-in slide-in-from-top-1 duration-200">
                        {item.descp}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default Services02Section;
