import { cefrCode } from "@/lib/cefr";
import { cn } from "@/lib/utils";

/** Small CEFR tag (A1, A2, B1, B2). Renders nothing when the level is unknown. */
export function LevelBadge({ level, className }: { level: string | null | undefined; className?: string }) {
  if (!level) return null;
  return <span className={cn("inline-flex items-center rounded border px-1.5 py-0.5 font-display text-[11px] leading-none text-muted-foreground", className)} title="CEFR">{cefrCode(level)}</span>;
}
