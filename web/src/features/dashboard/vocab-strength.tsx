"use client";

import { SectionTitle } from "@/components/layout/section-title";
import type { VocabularyStrength } from "@/lib/api/stats";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "mastered", label: "vocab.mastered", bar: "bg-primary", dot: "bg-primary" },
  { key: "solid", label: "vocab.solidStage", bar: "bg-primary/70", dot: "bg-primary/70" },
  { key: "familiar", label: "vocab.familiar", bar: "bg-primary/40", dot: "bg-primary/40" },
  { key: "learning", label: "vocab.learning", bar: "bg-primary/20", dot: "bg-primary/20" },
  { key: "unseen", label: "vocab.unseen", bar: "bg-muted", dot: "bg-muted ring-1 ring-border" },
] as const;

/** How many words are really known: a stacked bar from "mastered" down to "not started". */
export function VocabStrength({ vocabulary }: { vocabulary: VocabularyStrength }) {
  const { t } = useI18n();
  const solid = vocabulary.solid + vocabulary.mastered;
  const total = Math.max(vocabulary.total, 1);
  return (
    <section aria-labelledby="vocab" className="space-y-4">
      <SectionTitle id="vocab">{t("vocab.title")}</SectionTitle>
      <div>
        <p className="tnum font-display text-4xl text-primary" data-testid="solid-count">{solid}</p>
        <p className="text-sm text-muted-foreground">
          {t("vocab.solid", { n: solid })} · {t("vocab.of", { total: vocabulary.total })}
        </p>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label={t("vocab.title")}>
        {STAGES.filter((s) => s.key !== "unseen").map((s) => (
          <span key={s.key} className={cn("h-full", s.bar)} style={{ width: `${(vocabulary[s.key] / total) * 100}%` }} />
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {STAGES.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={cn("size-2.5 shrink-0 rounded-full", s.dot)} aria-hidden />
            <span className="flex-1 text-muted-foreground">{t(s.label)}</span>
            <span className="tnum font-display">{vocabulary[s.key]}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        {vocabulary.solid_soon > 0 ? t("vocab.soon", { n: vocabulary.solid_soon }) : vocabulary.total === vocabulary.unseen ? t("vocab.start") : t("vocab.hint")}
      </p>
    </section>
  );
}
