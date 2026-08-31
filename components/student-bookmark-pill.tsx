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
    try {
      const stored = JSON.parse(localStorage.getItem("de_user_bookmarks") || "{}");
      // Default fallback mock IDs: "mock-mat-1", "mock-mat-2", "mock-mat-5"
      const defaultMockIds = ["mock-mat-1", "mock-mat-2", "mock-mat-5"];
      const activeIds = defaultMockIds.filter((id) => stored[id] !== false);
      
      // Also check any added custom bookmarks
      Object.keys(stored).forEach((id) => {
        if (stored[id] === true && !activeIds.includes(id)) {
          activeIds.push(id);
        }
      });

      if (Object.keys(stored).length > 0) {
        setCount(activeIds.length);
      }
    } catch {}
  }, []);

  return (
    <Link
      href="/student/bookmarks"
      className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-xs"
    >
      <Bookmark className="h-4 w-4 text-amber-600 fill-amber-500" />
      <span>Bookmarks ({count})</span>
    </Link>
  );
}

export function StudentBookmarkShortcutCard({ initialCount }: StudentBookmarkPillProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("de_user_bookmarks") || "{}");
      const defaultMockIds = ["mock-mat-1", "mock-mat-2", "mock-mat-5"];
      const activeIds = defaultMockIds.filter((id) => stored[id] !== false);
      
      Object.keys(stored).forEach((id) => {
        if (stored[id] === true && !activeIds.includes(id)) {
          activeIds.push(id);
        }
      });

      if (Object.keys(stored).length > 0) {
        setCount(activeIds.length);
      }
    } catch {}
  }, []);

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
