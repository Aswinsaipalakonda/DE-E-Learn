"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchPortalAction } from "./global-search-actions";
import { Search, X, FileText, BookOpen, Loader2 } from "lucide-react";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    materials: {
      id: string;
      title: string;
      type: string;
      subject: string;
      branch: string;
      semester: number;
      state: string;
    }[];
    subjects: {
      code: string;
      title: string;
      branch: string;
      semester: number;
    }[];
  }>({ materials: [], subjects: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Hotkey Event Listeners (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) {
            setQuery("");
            setResults({ materials: [], subjects: [] });
            setActiveIndex(0);
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // 2. Query change handler
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ materials: [], subjects: [] });
        return;
      }
      setLoading(true);
      const data = await searchPortalAction(query);
      setResults(data);
      setLoading(false);
      setActiveIndex(0);
    };

    const delayDebounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Flattened results for keyboard navigation
  const flatResults = [
    ...results.subjects.map((s) => ({ ...s, typeTag: "subject", id: s.code })),
    ...results.materials.map((m) => ({ ...m, typeTag: "material" })),
  ];

  // 3. Keyboard focus navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(flatResults.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatResults.length) % Math.max(flatResults.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[activeIndex]) {
        handleNavigate(flatResults[activeIndex]);
      }
    }
  };

  const handleNavigate = (item: { typeTag: string; id?: string }) => {
    setIsOpen(false);
    if (item.typeTag === "subject" && item.id) {
      router.push(`/student/subjects/${item.id}`);
    } else if (item.typeTag === "material" && item.id) {
      router.push(`/student/materials/${item.id}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-md flex items-start justify-center p-4 pt-20 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div 
        ref={modalRef}
        onKeyDown={handleKeyDown}
        className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[480px] animate-in zoom-in-95 ease-[cubic-bezier(0.16,1,0.3,1)] duration-300"
      >

        {/* Search header input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface">
          <Search className="h-5 w-5 text-primary/40 shrink-0" />
          <input
            ref={inputRef}
            placeholder="Type subject code, topic name, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-primary placeholder-primary/40 focus:outline-none"
          />
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
          ) : (
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-bg rounded-md text-primary/40 hover:text-primary transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results listing */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {flatResults.length > 0 ? (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest px-3 mb-2 block">
                Found Results ({flatResults.length})
              </span>
              {flatResults.map((item, idx) => {
                const isActive = idx === activeIndex;
                const isSubject = item.typeTag === "subject";
                const subject = item as { branch: string; semester: number };
                const material = item as { type: string; subject: string; branch: string };
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between border cursor-pointer transition-all ${
                      isActive 
                        ? "bg-primary/5 border-primary/20 text-primary" 
                        : "bg-surface border-transparent text-primary/80 hover:bg-bg/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isSubject ? (
                        <BookOpen className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-secondary" : "text-primary/40"}`} />
                      ) : (
                        <FileText className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-secondary" : "text-primary/40"}`} />
                      )}
                      <div className="truncate">
                        <span className="font-bold text-xs block leading-snug truncate">
                          {isSubject ? `${item.id} - ${item.title}` : item.title}
                        </span>
                        <span className="text-[10px] text-primary/45 font-medium mt-0.5 block">
                          {isSubject 
                            ? `${subject.branch}, Semester ${subject.semester}` 
                            : `${material.type} • ${material.subject} • ${material.branch}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary/10 text-secondary border border-secondary/10 shrink-0">
                      {item.typeTag}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : query ? (
            <div className="py-12 text-center text-primary/40 text-xs font-semibold">
              No matching records found.
            </div>
          ) : (
            <div className="py-12 text-center text-primary/35 text-xs font-medium space-y-2">
              <p>Type keywords to query course catalogs.</p>
              <p className="text-[10px] font-semibold text-primary/50">Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-bg border border-border">Ctrl + K</kbd> anywhere to open search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
