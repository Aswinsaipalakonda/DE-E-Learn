"use client";

import { useState, useTransition } from "react";
import { toggleBookmark } from "./actions";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  materialId: string;
  initialBookmarked: boolean;
}

export default function BookmarkButton({ materialId, initialBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic UI update
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    startTransition(async () => {
      const result = await toggleBookmark(materialId, isBookmarked);
      if (result.error) {
        // Revert on error
        setIsBookmarked(isBookmarked);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
        isBookmarked
          ? "bg-accent/15 border-accent/25 text-accent hover:bg-accent/20"
          : "bg-surface border-border text-primary/70 hover:bg-bg hover:text-primary"
      }`}
    >
      <Bookmark className={`h-4.5 w-4.5 ${isBookmarked ? "fill-current" : ""}`} />
      <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
    </button>
  );
}
