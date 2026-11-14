import type { ReactNode } from "react";

/** Section heading with a code-comment marker, e.g. "// This week". */
export function SectionTitle({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-3 flex items-baseline gap-2 text-xl">
      <span aria-hidden className="text-primary">{"//"}</span>
      {children}
    </h2>
  );
}
