import Link from "next/link";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-display text-xl tracking-tight ${className}`}>
      English for IT
    </Link>
  );
}
