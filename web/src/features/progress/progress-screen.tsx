"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import type { Meta } from "@/lib/api/types";
import { getHistory, getProgress, type HistoryItem, type ProgressSummary } from "@/lib/api/stats";

export function ProgressScreen() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProgress().then(setSummary).catch((e) => setError(errorMessage(e)));
  }, []);
  useEffect(() => {
    getHistory(page).then((r) => (setHistory(r.data), setMeta(r.meta))).catch((e) => setError(errorMessage(e)));
  }, [page]);

  const max = Math.max(1, ...(summary?.by_day.map((d) => d.reviews) ?? [1]));
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Progress</h1>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {summary && (
        <div className="space-y-10">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat label="Words started" value={summary.words.started} />
            <Stat label="Learning" value={summary.words.learning} />
            <Stat label="Getting familiar" value={summary.words.young} />
            <Stat label="Well known" value={summary.words.mature} />
          </dl>
          <p className="text-sm text-muted-foreground">
            {summary.reviews.total} reviews{summary.reviews.accuracy !== null && ` · ${summary.reviews.accuracy}% remembered`}
          </p>
          <section aria-label="Reviews in the last 14 days">
            <h2 className="mb-3 text-sm font-medium">Last 14 days</h2>
            <div className="flex h-24 items-end gap-1" role="img" aria-label={`Reviews per day: ${summary.by_day.map((d) => d.reviews).join(", ")}`}>
              {summary.by_day.map((d) => (
                <div key={d.date} title={`${d.date}: ${d.reviews}`} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${Math.max(4, (d.reviews / max) * 100)}%`, opacity: d.reviews ? 1 : 0.2 }} />
              ))}
            </div>
          </section>
        </div>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-medium">History</h2>
        {history.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-card shadow-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span><span className="font-medium">{h.word.term}</span> <span className="text-muted-foreground">{h.word.meaning_vi}</span></span>
                <span className="text-muted-foreground">
                  {h.rating} · {new Date(h.reviewed_at).toLocaleString(undefined, { timeZone: zone, dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
        {meta && meta.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span>Page {meta.page} of {meta.total_pages}</span>
            <Button variant="outline" disabled={page >= meta.total_pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
      <dt className="text-sm text-muted-foreground">{label}</dt>
    </div>
  );
}
