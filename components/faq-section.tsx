"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "How do students log in for the first time?",
    answer:
      "Students log in using their official college email (e.g. your-email@mvgrce.edu.in) and their Registration / Roll Number (e.g. 23331A4701) as their default initial password. Once logged in, you can update your password in your profile settings.",
  },
  {
    question: "Can I view materials from previous completed semesters?",
    answer:
      "Yes! The student dashboard features interactive semester tab filters allowing you to switch between Semester 1 and your currently enrolled semester to review prerequisite lecture notes and lab guides.",
  },
  {
    question: "How does the Personal Study Vault work?",
    answer:
      "Clicking 'Bookmark' on any lecture note, lab manual, or question bank automatically stores it in your Study Vault. Your saved materials synchronize across devices so you can quickly review high-yield concepts before exams.",
  },
  {
    question: "How are faculty material revisions and syllabus updates handled?",
    answer:
      "Teaching faculty upload versioned course materials directly through their workspace. Each update records audit timestamps while preserving existing student study vault links.",
  },
  {
    question: "Is the portal mobile-responsive for on-campus smartphone access?",
    answer:
      "Yes! The entire platform is built mobile-first with touch-friendly navigation, quick-loading in-browser document previews, and dedicated role drawers for convenient on-the-go study.",
  },
];

export function Faq01Section() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} id="faq" className="py-16 sm:py-24 bg-[#F8FAFC] scroll-mt-20">
      <div
        className={cn(
          "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12 sm:gap-16 transition-all duration-700 ease-out",
          isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        
        {/* Header */}
        <div className="flex flex-col gap-3 items-center text-center">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            FAQs
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight max-w-lg leading-tight">
            Got questions? We&apos;ve got answers ready
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-md">
            Common questions regarding authentication, study vaults, and curriculum access.
          </p>
        </div>

        {/* Accordion List */}
        <div className="w-full flex flex-col gap-4">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={`faq-${index}`}
                className={cn(
                  "p-6 border rounded-2xl flex flex-col gap-3 transition-all duration-200 cursor-pointer shadow-xs",
                  isOpen
                    ? "bg-white border-blue-200/90 shadow-md ring-1 ring-blue-500/10"
                    : "bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300"
                )}
                onClick={() => toggle(index)}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 text-left font-bold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                    isOpen ? "bg-blue-50 text-blue-600 rotate-45" : "bg-slate-100 text-slate-600"
                  )}>
                    <Plus className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default Faq01Section;
