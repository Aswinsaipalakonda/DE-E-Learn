"use client";

import { useState, useTransition } from "react";
import { toggleBookmark } from "./actions";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  materialId: string;
  initialBookmarked: boolean;
}

export default function BookmarkButton({ materialId, initialBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    // Save in local storage so fallback mock items stay synchronized across tabs
    try {
      const stored = JSON.parse(localStorage.getItem("de_user_bookmarks") || "{}");
      stored[materialId] = nextState;
      localStorage.setItem("de_user_bookmarks", JSON.stringify(stored));
      window.dispatchEvent(new Event("de_bookmark_updated"));
    } catch {}

    startTransition(async () => {
      const result = await toggleBookmark(materialId, isBookmarked);
      if (result?.error && !materialId.startsWith("mock-")) {
        // Revert on real DB error
        setIsBookmarked(isBookmarked);
      } else {
        if (result?.count !== undefined) {
          window.dispatchEvent(new CustomEvent("de_bookmark_updated", { detail: { count: result.count } }));
        }
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
        isBookmarked
          ? "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      }`}
      title={isBookmarked ? "Remove from bookmarks" : "Save to bookmarks"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
      ) : (
        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500 text-amber-700" : "text-slate-400"}`} />
      )}
      <span>{isBookmarked ? "Saved in Bookmarks" : "Save Bookmark"}</span>
    </button>
  );
}
