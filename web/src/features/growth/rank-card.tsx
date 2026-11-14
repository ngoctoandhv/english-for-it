"use client";

import { Progress } from "@/components/ui/progress";
import type { Growth } from "@/lib/api/growth";
import { useI18n } from "@/lib/i18n/provider";

/** Career rank and XP. XP only goes up, so the bar only ever moves forward. */
export function RankCard({ growth }: { growth: Growth }) {
  const { t } = useI18n();
  const next = growth.next_rank;
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-2xl">{t(`rank.${growth.rank.key}`)}</p>
        <p className="tnum font-display text-sm text-muted-foreground">{t("growth.xp", { xp: growth.xp })}</p>
      </div>
      <Progress value={growth.progress_to_next} aria-label={t("growth.rank")} />
      <p className="text-sm text-muted-foreground">
        {next ? t("growth.toNext", { n: next.xp - growth.xp, rank: t(`rank.${next.key}`) }) : t("growth.top")}
      </p>
    </div>
  );
}

/** Seven dots for the current week plus the weekly rhythm goal. */
export function WeekDots({ growth }: { growth: Growth }) {
  const { t } = useI18n();
  const start = new Date(`${growth.week.start}T00:00:00Z`).getTime();
  const active = new Map(growth.calendar.map((d) => [d.date, d.count]));
  const days = Array.from({ length: 7 }, (_, i) => new Date(start + i * 86400000).toISOString().slice(0, 10));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("growth.week")}</span>
        <span className="tnum font-display">{t("growth.weekOf", { n: growth.week.active_days, target: growth.week.target })}</span>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {days.map((d) => (
          <span key={d} className={`h-2 flex-1 rounded-full ${(active.get(d) ?? 0) > 0 ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
    </div>
  );
}
