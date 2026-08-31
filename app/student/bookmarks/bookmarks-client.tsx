"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronRight, Trash2, BookOpen } from "lucide-react";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemove = (materialId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistically remove from state
    const nextBookmarks = bookmarks.filter((b) => b.id !== materialId);
    setBookmarks(nextBookmarks);

    try {
      window.dispatchEvent(new CustomEvent("de_bookmark_updated", { detail: { count: nextBookmarks.length } }));
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
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {material.type}
                    </span>
                    {material.subjectCode && (
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {material.subjectCode}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                    {material.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-normal truncate">
                    {material.subjectTitle} • {material.facultyName}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleRemove(material.id, e)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Remove from saved bookmarks"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>

                <Link
                  href={`/student/materials/${material.id}`}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="View Material"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white border border-slate-200/90 rounded-3xl p-8 space-y-4 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-inner">
            <Bookmark className="h-7 w-7 fill-amber-400 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Your Study Vault is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
              You haven&apos;t bookmarked any learning materials yet. Click &apos;Save Bookmark&apos; on any lecture notes or lab manuals to keep them here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/student/subjects"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/95 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse Course Subjects</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
