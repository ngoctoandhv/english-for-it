"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Heatmap } from "@/features/growth/heatmap";
import { RankCard, WeekDots } from "@/features/growth/rank-card";
import { errorMessage } from "@/lib/api/errors";
import { getGrowth, type Growth } from "@/lib/api/growth";
import { useI18n } from "@/lib/i18n/provider";
import { SectionTitle } from "@/components/layout/section-title";
import type { Meta } from "@/lib/api/types";
import { getHistory, getProgress, type HistoryItem, type ProgressSummary } from "@/lib/api/stats";

export function ProgressScreen() {
  const { t } = useI18n();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [growth, setGrowth] = useState<Growth | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGrowth().then(setGrowth).catch(() => undefined);
    getProgress().then(setSummary).catch((e) => setError(errorMessage(e, t)));
  }, [t]);
  useEffect(() => {
    getHistory(page).then((r) => (setHistory(r.data), setMeta(r.meta))).catch((e) => setError(errorMessage(e, t)));
  }, [page, t]);

  const max = Math.max(1, ...(summary?.by_day.map((d) => d.reviews) ?? [1]));
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <AppShell>
      <h1 className="mb-8 text-3xl sm:text-4xl">{t("progress.title")}</h1>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {growth && (
        <section aria-labelledby="growth" className="mb-12 max-w-3xl space-y-6">
          <SectionTitle id="growth">{t("growth.title")}</SectionTitle>
          <RankCard growth={growth} />
          <WeekDots growth={growth} />
          <div>
            <h3 className="mb-2 font-display text-base">{t("growth.calendar")}</h3>
            <Heatmap days={growth.calendar} />
            <p className="mt-3 text-sm text-muted-foreground">{t("growth.total", { n: growth.active_days_total })} · {t("growth.unitsDone")}: {growth.units_completed}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("growth.note")}</p>
          </div>
        </section>
      )}
      {summary && (
        <div className="space-y-12">
          <section aria-labelledby="words" className="max-w-xl">
            <SectionTitle id="words">{t("progress.words")}</SectionTitle>
            <dl className="divide-y border-y">
              <Stat label={t("progress.started")} value={summary.words.started} />
              <Stat label={t("progress.learning")} value={summary.words.learning} />
              <Stat label={t("progress.familiar")} value={summary.words.young} />
              <Stat label={t("progress.known")} value={summary.words.mature} />
              <Stat label={t("progress.reviews")} value={summary.reviews.total} />
              {summary.reviews.accuracy !== null && <Stat label={t("progress.remembered")} value={`${summary.reviews.accuracy}%`} />}
            </dl>
          </section>
          <section aria-label={t("progress.last14")}>
            <SectionTitle>{t("progress.last14")}</SectionTitle>
            <div className="flex h-24 max-w-xl items-end gap-1" role="img" aria-label={t("progress.perDay", { values: summary.by_day.map((d) => d.reviews).join(", ") })}>
              {summary.by_day.map((d) => (
                <div key={d.date} title={`${d.date}: ${d.reviews}`} className="flex-1 bg-primary" style={{ height: `${Math.max(4, (d.reviews / max) * 100)}%`, opacity: d.reviews ? 1 : 0.2 }} />
              ))}
            </div>
          </section>
        </div>
      )}

      <section className="mt-10">
        <SectionTitle>{t("progress.history")}</SectionTitle>
        {history.length === 0 ? (
          <p className="text-muted-foreground">{t("progress.noReviews")}</p>
        ) : (
          <ul className="divide-y border-y">
            {history.map((h) => (
              <li key={h.id} className="flex flex-col gap-0.5 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span><span className="font-medium">{h.word.term}</span> <span className="text-muted-foreground">{h.word.meaning_vi}</span></span>
                <span className="font-display text-xs text-muted-foreground">
                  {h.rating} · {new Date(h.reviewed_at).toLocaleString(undefined, { timeZone: zone, dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
        {meta && meta.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t("common.prev")}</Button>
            <span className="tnum font-display text-xs">{t("common.pageOf", { page: meta.page, total: meta.total_pages })}</span>
            <Button variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>{t("common.next")}</Button>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-baseline justify-between py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tnum font-display">{value}</dd>
    </div>
  );
}
