import Link from "next/link";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 font-display text-[17px] tracking-tight ${className}`}>
      <span aria-hidden className="text-primary">&gt;_</span>
      English for IT
    </Link>
  );
}
