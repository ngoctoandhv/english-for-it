"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { errorMessage } from "@/lib/api/errors";
import { useI18n } from "@/lib/i18n/provider";
import { getLessons, type LessonSummary } from "@/lib/api/listening";

export function LessonList() {
  const { t } = useI18n();
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLessons().then(setLessons).catch((e) => setError(errorMessage(e, t)));
  }, [t]);

  return (
    <AppShell>
      <h1 className="mb-3 text-3xl sm:text-4xl">{t("listen.title")}</h1>
      <p className="mb-6 text-muted-foreground">{t("listen.sub")}</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {lessons?.length === 0 && <p className="text-muted-foreground">{t("listen.none")}</p>}
      <ul className="divide-y border-y">
        {lessons?.map((l) => (
          <li key={l.id}>
            <Link href={`/listening/${l.id}`} className="flex items-center justify-between gap-3 px-1 py-4 hover:bg-muted/50 sm:px-2">
              <span>
                <span className="block font-display text-base">{l.title}</span>
                <span className="block text-sm text-muted-foreground">{l.description}</span>
              </span>
              <span className="shrink-0 text-right text-sm text-muted-foreground">
                <span className="block font-display text-xs">{t(`level.${l.level}`)}</span>
                {l.best_score !== null && <span className="tnum block font-display text-xs">{t("listen.best", { score: l.best_score, total: l.questions_count })}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
