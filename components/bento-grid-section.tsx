"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { 
  BookOpen, 
  Layers, 
  Bookmark, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Database,
  Check,
  Cpu,
  Lock,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// 1. VERTICAL LOOPING MATERIAL REMINDER CAROUSEL (Card 1)
// =========================================================================
interface ReminderItem {
  id: string;
  title: string;
  code: string;
  icon: LucideIcon;
  badge: string;
  badgeColor: string;
}

const REMINDER_DATA: ReminderItem[] = [
  {
    id: "1",
    title: "DBMS - Unit 1 Relational Models",
    code: "23CIC301",
    icon: Database,
    badge: "Verified Notes",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "2",
    title: "Cloud Infrastructure Lab Manual",
    code: "23CIC302",
    icon: Cpu,
    badge: "Lab Manual",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "3",
    title: "Big Data Spark - Question Bank",
    code: "23CIC303",
    icon: Layers,
    badge: "Question Bank",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "4",
    title: "Network Security Cryptography",
    code: "23CIC304",
    icon: Lock,
    badge: "Lecture Slides",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "5",
    title: "Deep Learning Transformers",
    code: "23CSM401",
    icon: Sparkles,
    badge: "AI Syllabus",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
];

function ReminderCarousel() {
  const [pointer, setPointer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPointer((prev) => (prev + 1) % REMINDER_DATA.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Display 3 stacked items
  const visibleItems = [
    REMINDER_DATA[pointer],
    REMINDER_DATA[(pointer + 1) % REMINDER_DATA.length],
    REMINDER_DATA[(pointer + 2) % REMINDER_DATA.length],
  ];

  return (
    <div className="relative flex flex-col items-center rounded-2xl h-56 w-full overflow-hidden justify-center">
      {visibleItems.map((item, index) => {
        const Icon = item.icon;
        const isMiddle = index === 1;
        const isTop = index === 0;

        return (
          <div
            key={item.id + "-" + index}
            className={cn(
              "absolute w-full px-4 py-3.5 rounded-2xl border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs flex items-center justify-between",
              isMiddle
                ? "bg-white border-blue-200/90 shadow-md scale-100 opacity-100 z-20 translate-y-0"
                : isTop
                ? "bg-slate-50/90 border-slate-200 scale-95 opacity-50 z-10 -translate-y-16"
                : "bg-slate-50/90 border-slate-200 scale-95 opacity-50 z-10 translate-y-16"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs",
                  item.badgeColor
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {item.title}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">
                  {item.code} • {item.badge}
                </span>
              </div>
            </div>

            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Check className="h-3.5 w-3.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =========================================================================
// 2. ORBITING FLOATING SATELLITE TILES (Card 2)
// =========================================================================
function AnimatedUiBlock() {
  return (
    <div className="relative h-60 w-full flex items-center justify-center overflow-hidden">
      
      {/* Background Orbit Track */}
      <div className="absolute w-72 h-72 rounded-full border border-dashed border-slate-200/90 pointer-events-none animate-[spin_60s_linear_infinite]" />
      
      {/* Central Identity Badge */}
      <div className="relative z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-2 border-2 border-blue-200/80 shadow-xl flex items-center justify-center">
        <Image
          src="/De_logo.jpg"
          alt="MVGR DE Logo"
          width={72}
          height={72}
          className="object-contain w-full h-full rounded-2xl"
        />
        <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-[9px] font-bold text-white tracking-wider uppercase shadow-xs">
          DE Core
        </span>
      </div>

      {/* Floating Satellites */}
      <div className="absolute top-2 right-[20%] z-10 animate-bounce duration-[3000ms]">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-slate-800 text-xs font-semibold">
          <Bookmark className="h-3.5 w-3.5 text-blue-600 fill-blue-500" />
          <span>Study Vault</span>
        </div>
      </div>

      <div className="absolute top-[48%] right-[6%] z-10 animate-pulse duration-[2500ms]">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-md flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute bottom-3 right-[18%] z-10 animate-bounce duration-[3500ms]">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-slate-800 text-xs font-semibold">
          <Layers className="h-3.5 w-3.5 text-purple-600" />
          <span>Syllabi Tracks</span>
        </div>
      </div>

      <div className="absolute top-3 left-[18%] z-10 animate-bounce duration-[3200ms]">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-slate-800 text-xs font-semibold">
          <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
          <span>Student Portals</span>
        </div>
      </div>

      <div className="absolute top-[48%] left-[6%] z-10 animate-pulse duration-[2800ms]">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 shadow-md flex items-center justify-center">
          <BookOpen className="h-5 w-5" />
        </div>
      </div>

      <div className="absolute bottom-3 left-[18%] z-10 animate-bounce duration-[3800ms]">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md text-slate-800 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Autonomous Rigor</span>
        </div>
      </div>

    </div>
  );
}

// =========================================================================
// 3. COMPLETE BENTO GRID COMPONENT
// =========================================================================
export function BentoGrid01Section() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-16 sm:py-24 bg-white border-t border-slate-200/80 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Section Title */}
        <div
          className={cn(
            "flex flex-col gap-3 items-center justify-center max-w-3xl mx-auto text-center transition-all duration-700 ease-out",
            isInView ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
          )}
        >
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Bento Grid Modules
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Balanced architectural modules built for seamless learning
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-xl">
            Everything students and faculty need for high-throughput semester preparation in one coherent ecosystem.
          </p>
        </div>

        {/* Bento Grid 12-Column Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Card 1: 4 Columns with Looping Reminder Carousel */}
          <div
            className={cn(
              "col-span-12 lg:col-span-4 overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/70 hover:shadow-md transition-all duration-700 delay-100 ease-out flex flex-col justify-between group",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="p-6 bg-slate-100/70 border-b border-slate-200/80 relative">
              <ReminderCarousel />
            </div>
            <div className="p-7 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Personal Study Vault &amp; Live Bookmarks
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Real-time bookmarking for high-yield lecture notes and lab experiments with instant synchronization across mobile and desktop.
              </p>
            </div>
          </div>

          {/* Card 2: 8 Columns with Orbiting Central DE Core */}
          <div
            className={cn(
              "col-span-12 lg:col-span-8 overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/70 hover:shadow-md transition-all duration-700 delay-200 ease-out flex flex-col justify-between group",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="p-6 bg-slate-100/70 border-b border-slate-200/80 relative">
              <AnimatedUiBlock />
            </div>
            <div className="p-7 space-y-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Autonomous Department Unified Cloud
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-2xl">
                Connecting students, subject teachers, and college administrators to single-source syllabi, lab guidelines, and question archives without scattered links.
              </p>
            </div>
          </div>

          {/* Card 3: 4 Columns - Enrolled Term Filtering */}
          <div
            className={cn(
              "col-span-12 lg:col-span-4 overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/70 hover:shadow-md transition-all duration-700 delay-300 ease-out flex flex-col justify-between group",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="p-8 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-center min-h-[170px]">
              <div className="flex flex-wrap gap-2 justify-center max-w-[240px]">
                {["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"].map((sem, i) => (
                  <span
                    key={sem}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105",
                      i === 2
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200"
                    )}
                  >
                    {sem}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-7 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Enrolled Semester Filtering
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Dynamically limits visible terms up to the student&apos;s active enrollment, keeping workflows clean and focused on current exams.
              </p>
            </div>
          </div>

          {/* Card 4: 4 Columns - Multi-Version Faculty Releases */}
          <div
            className={cn(
              "col-span-12 lg:col-span-4 overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/70 hover:shadow-md transition-all duration-700 delay-400 ease-out flex flex-col justify-between group",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="p-8 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-center min-h-[170px]">
              <div className="w-full max-w-[240px] space-y-2 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 pb-1 border-b border-slate-100">
                  <span>Version Release</span>
                  <span className="bg-purple-50 px-2 py-0.5 rounded-full">v2.1 Live</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono">
                  ✓ DBMS_Unit1_Revised.pdf
                </div>
              </div>
            </div>
            <div className="p-7 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Faculty Multi-Version Audits
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Professors publish material revisions effortlessly while preserving student study vault links and historical change logs.
              </p>
            </div>
          </div>

          {/* Card 5: 4 Columns - In-Browser PDF Previews */}
          <div
            className={cn(
              "col-span-12 lg:col-span-4 overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/70 hover:shadow-md transition-all duration-700 delay-500 ease-out flex flex-col justify-between group",
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="p-8 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-center min-h-[170px]">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Instant In-Browser PDF</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Zero Download Overhead</span>
                </div>
              </div>
            </div>
            <div className="p-7 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Zero-Friction Document Previews
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Inspect slides and lab manuals directly in the browser with view counter tracking and responsive mobile reading view.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default BentoGrid01Section;
