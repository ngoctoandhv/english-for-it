"use client";

import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/layout/section-title";
import { errorMessage } from "@/lib/api/errors";
import { getMetrics, type Metrics, type Retention } from "@/lib/api/metrics";
import { useI18n } from "@/lib/i18n/provider";

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="tnum font-display text-3xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="tnum text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const rate = (r: Retention) => (r.rate === null ? "–" : `${r.rate}%`);

export function AdminMetrics() {
  const { t } = useI18n();
  const [m, setM] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMetrics().then(setM, (e) => setError(errorMessage(e, t)));
  }, [t]);

  if (error) return <p role="alert" className="text-destructive">{error}</p>;
  if (!m) return <p className="text-muted-foreground">{t("common.loading")}</p>;

  return (
    <section aria-labelledby="metrics" className="mb-12 max-w-3xl space-y-8">
      <SectionTitle id="metrics">{t("metrics.title")}</SectionTitle>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label={t("metrics.users")} value={m.users.total} hint={t("metrics.new7", { n: m.users.new_7d })} />
        <Stat label={t("metrics.activeToday")} value={m.active.today} />
        <Stat label={t("metrics.active7")} value={m.active.last_7d} />
        <Stat label={t("metrics.active30")} value={m.active.last_30d} />
      </div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label={t("metrics.day1")} value={rate(m.retention.day_1)} hint={`${m.retention.day_1.returned}/${m.retention.day_1.cohort}`} />
        <Stat label={t("metrics.day7")} value={rate(m.retention.day_7)} hint={`${m.retention.day_7.returned}/${m.retention.day_7.cohort}`} />
        <Stat label={t("metrics.reviews7")} value={m.learning_7d.reviews} />
        <Stat label={t("metrics.reports")} value={m.reports.open} />
      </div>
      <div>
        <p className="mb-2 text-sm text-muted-foreground">{t("metrics.funnel")}</p>
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["signed_up", "onboarded", "first_review", "first_unit"] as const).map((k) => (
            <li key={k}><Stat label={t(`metrics.f.${k}`)} value={m.funnel[k]} /></li>
          ))}
        </ol>
      </div>
      <p className="text-xs text-muted-foreground">{t("metrics.note")}</p>
    </section>
  );
}
