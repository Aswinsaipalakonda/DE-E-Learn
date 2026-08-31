"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";

interface StudentBookmarkPillProps {
  initialCount: number;
}

export function StudentBookmarkHeroPill({ initialCount }: StudentBookmarkPillProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);

    const handleSync = (e: any) => {
      if (e?.detail?.count !== undefined) {
        setCount(e.detail.count);
      }
    };

    window.addEventListener("de_bookmark_updated", handleSync);
    return () => {
      window.removeEventListener("de_bookmark_updated", handleSync);
    };
  }, [initialCount]);

  return (
    <Link
      href="/student/bookmarks"
      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4.5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
    >
      <Bookmark className="h-4 w-4 text-amber-600 fill-amber-500 shrink-0" />
      <span>Bookmarks ({count})</span>
    </Link>
  );
}

export function StudentBookmarkShortcutCard({ initialCount }: StudentBookmarkPillProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);

    const handleSync = (e: any) => {
      if (e?.detail?.count !== undefined) {
        setCount(e.detail.count);
      }
    };

    window.addEventListener("de_bookmark_updated", handleSync);
    return () => {
      window.removeEventListener("de_bookmark_updated", handleSync);
    };
  }, [initialCount]);

  return (
    <Link
      href="/student/bookmarks"
      className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 bg-amber-50/30 hover:bg-amber-50/70 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-800">
          <Bookmark className="h-4 w-4 fill-amber-600 text-amber-700" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
            My Bookmarked Notes
          </h3>
          <p className="text-[11px] text-slate-500 font-normal">
            {count} saved syllabus items
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-all" />
    </Link>
  );
}
