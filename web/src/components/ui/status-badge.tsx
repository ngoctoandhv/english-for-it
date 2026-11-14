import { cn } from "@/lib/utils";

const STYLE: Record<string, string> = {
  draft: "border-warning/50 text-warning",
  reviewed: "border-info/50 text-info",
  published: "border-success/50 text-success",
};

/** Content status as a small mono tag. The label carries the meaning, color only reinforces it. */
export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={cn("inline-block rounded border px-1.5 py-0.5 font-display text-xs", STYLE[status] ?? "text-muted-foreground")}>{label}</span>;
}
