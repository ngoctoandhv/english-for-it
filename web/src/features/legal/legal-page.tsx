"use client";

import { Split } from "@/components/layout/split";
import { PublicShell } from "@/components/layout/public-shell";
import { PRIVACY, TERMS } from "@/lib/legal/content";
import { useI18n } from "@/lib/i18n/provider";

export function LegalPage({ doc }: { doc: "privacy" | "terms" }) {
  const { lang, t } = useI18n();
  const content = (doc === "privacy" ? PRIVACY : TERMS)[lang];
  return (
    <PublicShell>
      <h1 className="mb-2 text-3xl sm:text-4xl">{content.title}</h1>
      <p className="mb-10 text-sm text-muted-foreground">{t("legal.updated", { date: content.updated })}</p>
      <Split aside={
          <nav aria-label={content.title} className="space-y-2">
            <ul className="divide-y border-y">
              {content.sections.map((s) => (
                <li key={s.heading}><a href={`#${s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block py-2 text-sm text-muted-foreground hover:text-foreground">{s.heading}</a></li>
              ))}
            </ul>
          </nav>
        }>
      <div className="space-y-8">
        {content.sections.map((s) => (
          <section key={s.heading} id={s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24 space-y-2">
            <h2 className="text-lg">{s.heading}</h2>
            {s.body.map((p) => <p key={p} className="max-w-prose text-muted-foreground">{p}</p>)}
          </section>
        ))}
      </div>
      </Split>
    </PublicShell>
  );
}
