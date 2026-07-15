"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Split paths and ignore empty fragments
  const paths = pathname.split("/").filter(Boolean);

  // If we are at the portal dashboard or login, don't show breadcrumbs
  if (paths.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-primary/50 font-semibold mb-6">
      <Link 
        href="/" 
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {paths.map((segment, index) => {
        const url = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;

        // Make segment names user-friendly
        let displayName = decodeURIComponent(segment);
        // Capitalize first letters
        displayName = displayName
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={url} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-primary/30" />
            {isLast ? (
              <span className="text-primary font-bold truncate max-w-[200px]" aria-current="page">
                {displayName}
              </span>
            ) : (
              <Link 
                href={url} 
                className="hover:text-primary transition-colors truncate max-w-[150px]"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
