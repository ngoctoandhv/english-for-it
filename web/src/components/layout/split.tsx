import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Two-column page layout for wide screens: the main task on the left, supporting content on the right.
 * Below `lg` the columns stack (main first). The aside stays in view while the main column scrolls.
 */
export function Split({ children, aside, sticky = true, wide = false, className }: { children: ReactNode; aside: ReactNode; sticky?: boolean; wide?: boolean; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-x-12 gap-y-10 lg:items-start", wide ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]", className)}>
      <div className="min-w-0 space-y-8">{children}</div>
      <aside className={cn("min-w-0 space-y-8", sticky && "lg:sticky lg:top-24")}>{aside}</aside>
    </div>
  );
}

/** Even columns for lists of cards or sections (stacks on small screens). */
export function Columns({ children, count = 2, className }: { children: ReactNode; count?: 2 | 3; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-x-12 gap-y-10", count === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-2", className)}>{children}</div>;
}
