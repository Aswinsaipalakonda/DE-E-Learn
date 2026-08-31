"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Cloud, 
  CheckCircle2, 
  Layers, 
  ChevronRight,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpecializationTrack {
  id: string;
  code: string;
  heading: string;
  descp: string;
  highlights: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  stats: string;
}

export const tracksData: SpecializationTrack[] = [
  {
    id: "cic",
    code: "CIC",
    heading: "Cyber Security & IoT",
    descp: "In-depth course repositories covering cryptographic protocols, threat intelligence, secure hardware interfaces, and embedded IoT architectures designed for autonomous industry benchmarks.",
    highlights: ["Network Cryptography & Protocols", "Embedded IoT Firmware & Sensors", "Threat Mitigation & Audits", "Hardware Security Labs"],
    icon: ShieldCheck,
    accentColor: "text-blue-400 group-hover:text-blue-300",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    stats: "8 Semesters • 24 Core Subjects • 6 Lab Modules",
  },
  {
    id: "csd",
    code: "CSD",
    heading: "Data Science Specialization",
    descp: "Comprehensive lecture notes and lab manuals on distributed computing, Apache Spark clusters, predictive statistical modeling, ETL pipelines, and high-throughput data warehousing.",
    highlights: ["Distributed Big Data Compute", "Predictive Analytics & Statistics", "Data Warehousing & Lakehouses", "Apache Spark Clusters"],
    icon: Database,
    accentColor: "text-emerald-400 group-hover:text-emerald-300",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    stats: "8 Semesters • 26 Core Subjects • 8 Lab Modules",
  },
  {
    id: "csm",
    code: "CSM",
    heading: "AI & Machine Learning",
    descp: "Structured learning materials spanning deep neural networks, transformer architectures, reinforcement learning models, computer vision pipelines, and scalable LLM engineering.",
    highlights: ["Deep Neural Networks & Vision", "Transformer & LLM Architectures", "Reinforcement Learning Models", "Autonomous Agents & Robotics"],
    icon: Sparkles,
    accentColor: "text-purple-400 group-hover:text-purple-300",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    stats: "8 Semesters • 28 Core Subjects • 8 Lab Modules",
  },
  {
    id: "cloud",
    code: "CLOUD",
    heading: "Cloud DevOps & Systems",
    descp: "Curated labs and guides on container orchestration with Docker & Kubernetes, CI/CD automated deployment pipelines, infrastructure as code, and cloud telemetry.",
    highlights: ["Docker & Kubernetes Orchestration", "CI/CD Automation Pipelines", "AWS & Hybrid Cloud Systems", "Microservices & Telemetry"],
    icon: Cloud,
    accentColor: "text-amber-400 group-hover:text-amber-300",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    stats: "Interdisciplinary • Cloud Labs & Projects",
  },
];

export function Services02Section() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeTrack = tracksData[activeIndex];
  const ActiveIcon = activeTrack.icon;

  return (
    <section id="specializations" className="bg-[#0B1120] text-white py-16 sm:py-24 lg:py-28 relative overflow-hidden border-y border-slate-800">
      
      {/* Background Subtle Radial Lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-12 sm:gap-16">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/30 px-3.5 py-1 rounded-full inline-block">
                Academic Specializations
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Curriculum Pathways &amp; Tracks
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                Explore autonomous undergraduate syllabus materials and specialized technology domains within the Department of Data Engineering at MVGR College of Engineering.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-full h-11 p-1 ps-5 pe-12 group transition-all duration-500 hover:ps-12 hover:pe-5 overflow-hidden shadow-lg cursor-pointer shrink-0"
            >
              <span className="relative z-10 transition-all duration-500 whitespace-nowrap">
                Access Study Portal
              </span>
              <span className="absolute right-1 w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-40px)] group-hover:rotate-45 shadow-xs">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Interactive Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Visual Preview Card (5 cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="p-7 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden transition-all duration-500 min-h-[360px] flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full border", activeTrack.badgeBg)}>
                      {activeTrack.code} Specialization
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Autonomous Track
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-inner">
                    <ActiveIcon className="h-7 w-7 text-blue-400" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {activeTrack.heading}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {activeTrack.descp}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Core Curriculum Modules:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {activeTrack.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Interactive List (7 cols) */}
            <div className="lg:col-span-7 flex flex-col divide-y divide-slate-800/90">
              {tracksData.map((track, index) => {
                const isActive = activeIndex === index;
                const Icon = track.icon;

                return (
                  <div
                    key={track.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "group py-5 sm:py-7 cursor-pointer transition-all duration-300 flex flex-col gap-2 rounded-2xl px-4 sm:px-6 -mx-4 sm:-mx-6",
                      isActive
                        ? "bg-slate-900/60 border-l-4 border-blue-500"
                        : "hover:bg-slate-900/30 border-l-4 border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border",
                          isActive
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {track.code}
                        </span>
                        <h3 className={cn(
                          "text-lg sm:text-2xl font-bold transition-colors",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                        )}>
                          {track.heading}
                        </h3>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 text-slate-500 transition-transform duration-300 shrink-0",
                        isActive ? "rotate-90 text-blue-400" : "group-hover:translate-x-1"
                      )} />
                    </div>

                    {isActive && (
                      <div className="pt-2 pl-0 sm:pl-12 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                          {track.descp}
                        </p>
                        <p className="text-[11px] font-mono text-blue-400 font-semibold">
                          ✦ {track.stats}
                        </p>
                      </div>
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
