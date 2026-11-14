"use client";

import { PublicShell } from "@/components/layout/public-shell";
import { useI18n } from "@/lib/i18n/provider";
import type { PublicWord } from "@/lib/api/public";

export function GlossaryList({ words }: { words: PublicWord[] }) {
  const { t } = useI18n();
  return (
    <PublicShell>
      <h1 className="mb-3 text-3xl sm:text-4xl">{t("public.glossary")}</h1>
      <p className="mb-8 max-w-prose text-muted-foreground">{t("public.glossaryLead")}</p>
      {words.length === 0 ? (
        <p className="text-muted-foreground">{t("public.glossaryEmpty")}</p>
      ) : (
        <dl className="divide-y border-y">
          {words.map((w) => (
            <div key={w.id} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-8">
              <dt>
                <span className="font-display text-lg">{w.term}</span>
                <span className="block font-display text-xs text-muted-foreground">{w.ipa} · {w.part_of_speech}</span>
              </dt>
              <dd>
                <p>{w.meaning_vi}</p>
                <p className="text-sm text-muted-foreground">{w.definition_en}</p>
                {w.example && <p className="mt-1 text-sm">{w.example.en}</p>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </PublicShell>
  );
}
