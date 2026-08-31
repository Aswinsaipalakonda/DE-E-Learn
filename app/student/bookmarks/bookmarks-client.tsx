"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronRight, Trash2, BookOpen, Layers, Sparkles } from "lucide-react";
import { toggleBookmark } from "@/app/student/materials/[id]/actions";

export interface BookmarkMaterialItem {
  id: string;
  title: string;
  type: string;
  subjectTitle: string;
  subjectCode: string;
  facultyName: string;
}

interface BookmarksClientProps {
  initialBookmarks: BookmarkMaterialItem[];
}

export default function BookmarksClient({ initialBookmarks }: BookmarksClientProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkMaterialItem[]>(initialBookmarks);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Synchronize with local storage overrides if user toggled bookmarks on material details page
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("de_user_bookmarks") || "{}");
      setBookmarks((prev) =>
        prev.filter((item) => {
          if (stored[item.id] === false) return false;
          return true;
        })
      );
    } catch {}
  }, []);

  const handleRemove = (materialId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistically remove from state
    setBookmarks((prev) => prev.filter((b) => b.id !== materialId));
    setRemovedIds((prev) => new Set(prev).add(materialId));

    try {
      const stored = JSON.parse(localStorage.getItem("de_user_bookmarks") || "{}");
      stored[materialId] = false;
      localStorage.setItem("de_user_bookmarks", JSON.stringify(stored));
      window.dispatchEvent(new Event("de_bookmark_updated"));
    } catch {}

    startTransition(async () => {
      await toggleBookmark(materialId, true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 sm:space-y-7 w-full pb-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
            <Bookmark className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
            <span>Personal Study Vault • {bookmarks.length} Saved Items</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bookmarked Learning Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Quickly retrieve your saved lecture notes, lab manuals, and exam preparation documents.
          </p>
        </div>

        <Link
          href="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md self-start md:self-auto cursor-pointer"
        >
          <span>Return to Dashboard</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Bookmarks List */}
      {bookmarks.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-slate-100">
          {bookmarks.map((material) => (
            <div
              key={material.id}
              className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/80 transition-all group"
            >
              <Link
                href={`/student/materials/${material.id}`}
                className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 border border-amber-200 group-hover:bg-amber-100 transition-colors">
                  <Bookmark className="h-5 w-5 fill-amber-500 text-amber-600" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                      {material.type}
                    </span>
                    {material.subjectCode && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-600">
                        {material.subjectCode}
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors leading-snug">
                    {material.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-normal flex items-center gap-2">
                    <span>{material.subjectTitle}</span>
                    <span>•</span>
                    <span>{material.facultyName}</span>
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleRemove(material.id, e)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs font-semibold text-slate-600 transition-all cursor-pointer shadow-2xs"
                  title="Remove from bookmarks"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>
                <Link
                  href={`/student/materials/${material.id}`}
                  className="p-2 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-all shadow-2xs cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Bookmark className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Your bookmark vault is empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-sm mx-auto">
              Save important lecture notes, lab manuals, and question banks to quickly access them here.
            </p>
          </div>
          <Link
            href="/student/subjects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>Explore Course Subjects</span>
          </Link>
        </div>
      )}
    </div>
  );
}
