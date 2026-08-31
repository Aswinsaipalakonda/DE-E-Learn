"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, WandSparkles, Zap, Target, BookOpen, ShieldCheck, Database, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutUsPillar {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  color: string;
}

interface StatItem {
  title: string;
  count: number;
  suffix?: string;
}

const aboutusData: AboutUsPillar[] = [
  {
    icon: BookOpen,
    title: "Verified Curriculum",
    color: "bg-blue-500/10 text-blue-600 border border-blue-200/60",
  },
  {
    icon: Zap,
    title: "Instant Study Vaults",
    color: "bg-emerald-500/10 text-emerald-600 border border-emerald-200/60",
  },
  {
    icon: ShieldCheck,
    title: "Autonomous Rigor",
    color: "bg-purple-500/10 text-purple-600 border border-purple-200/60",
  },
];

const statisticsCounter: StatItem[] = [
  {
    title: "Specialized Engineering Branches",
    count: 3,
  },
  {
    title: "Autonomous Curriculum Semesters",
    count: 8,
  },
  {
    title: "Verified Lecture Units & Lab Guides",
    count: 100,
    suffix: "%",
  },
];

function AnimatedCounter({ value, isInView, suffix }: { value: number; isInView: boolean; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1600;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export function AboutUsSection01() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-16 sm:py-24 lg:py-28 bg-white border-y border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-12 sm:gap-16">
          
          {/* Headline & Value Pillars Container */}
          <div className="flex flex-col items-center justify-center gap-6 max-w-4xl text-center">
            
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
              Department Profile & Standards
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
              Empowering academic excellence, data-driven intelligence &amp; autonomous instruction with
            </h2>

            {/* Colored Value Pillars */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {aboutusData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2.5 px-5 py-2 rounded-full transition-transform hover:scale-105 duration-200 shadow-2xs",
                      item.color
                    )}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                    <span className="text-lg sm:text-2xl font-serif italic tracking-normal">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Large Stat Counters Grid */}
          <div
            ref={statsRef}
            className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 pt-4"
          >
            {statisticsCounter.map((value, index) => (
              <div
                key={index}
                className="relative px-6 py-6 sm:py-10 flex flex-col items-center justify-center text-center"
              >
                {index !== 0 && (
                  <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-32 bg-slate-200" />
                )}
                
                <div className="flex items-center gap-1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight">
                  <Plus
                    strokeWidth={3}
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-blue-600 shrink-0"
                  />
                  <AnimatedCounter
                    value={value.count}
                    isInView={isInView}
                    suffix={value.suffix}
                  />
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mt-3 max-w-[240px]">
                  {value.title}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default AboutUsSection01;
