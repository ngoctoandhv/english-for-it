/** Circular progress. The number (or children) in the middle carries the meaning; the ring only reinforces it. */
export function ProgressRing({ value, size = 44, stroke = 4, children, label }: { value: number; size?: number; stroke?: number; children?: React.ReactNode; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(pct)}%`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} className="text-primary transition-[stroke-dashoffset] duration-300" />
      </svg>
      <span className="absolute font-display text-xs">{children}</span>
    </span>
  );
}
