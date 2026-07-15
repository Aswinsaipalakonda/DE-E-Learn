"use client";

import { useRouter } from "next/navigation";

interface SemesterSelectProps {
  selectedSemester: number;
}

export default function SemesterSelect({ selectedSemester }: SemesterSelectProps) {
  const router = useRouter();

  return (
    <div className="max-w-xs">
      <select
        value={selectedSemester}
        onChange={(e) => router.push(`/student?sem=${e.target.value}`)}
        className="w-full px-4 py-2.5 rounded-full border border-border bg-surface text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary cursor-pointer"
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <option key={num} value={num}>
            Semester {num}
          </option>
        ))}
      </select>
    </div>
  );
}
