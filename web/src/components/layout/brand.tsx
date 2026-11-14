import Link from "next/link";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        E
      </span>
      English for IT
    </Link>
  );
}
